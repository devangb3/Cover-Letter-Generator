import io
import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from backend.factory import create_app
from backend.storage import local as store
from backend.models.profile import Candidate, normalize_candidate
from backend.services.profile import personal_info
from backend.services.settings import resolve_model
from backend.api_service.model_config import get_default_model, get_models
from backend.api_service import ai_service
from pdf_service.resume_generator import apply_full_resume_draft, render_resume_tex
from reportlab.pdfgen import canvas


class ProfileTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.env = patch.dict(os.environ, {'COVER_LETTER_DATA_DIR': self.tmp.name, 'OPENROUTER_API_KEY': ''})
        self.env.start()
        self.app = create_app({'TESTING': True})
        self.client = self.app.test_client()
        self.candidate = normalize_candidate({'profile': {'name': 'Alex Example'}, 'experience': [{'title': 'Designer', 'organization': 'Example Studio', 'bullets': ['Designed accessible forms.']}]})

    def tearDown(self):
        self.env.stop()
        self.tmp.cleanup()

    def save(self):
        response = self.client.put('/api/profile', json=self.candidate)
        self.assertEqual(response.status_code, 200)

    def test_empty_install_save_reload_and_edit(self):
        self.assertIsNone(self.client.get('/api/profile').json['profile'])
        self.assertEqual(self.client.post('/api/analyze', json={}).status_code, 400)
        self.save()
        self.assertEqual(create_app({'TESTING': True}).test_client().get('/api/profile').json['profile'], self.candidate)
        self.candidate['profile']['name'] = 'Jordan Example'
        self.save()
        self.assertEqual(personal_info()['name'], 'Jordan Example')

    def test_validation_does_not_overwrite_saved_profile(self):
        self.save()
        for payload in ({'profile': {'name': ''}}, {'profile': {'name': 42}}, {'skills': 'bad'}, {'secret': 'bad'}):
            self.assertEqual(self.client.put('/api/profile', json=payload).status_code, 400)
        self.assertEqual(store.get_profile(), self.candidate)

    def test_key_private_and_not_returned_or_exported(self):
        response = self.client.put('/api/settings', json={'apiKey': 'test-secret', 'preferences': {'instructions': 'Be concise.'}})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json['hasApiKey'])
        self.assertNotIn('test-secret', response.get_data(as_text=True))
        self.assertEqual(store.get_api_key(), 'test-secret')
        self.save()
        self.assertNotIn('test-secret', self.client.get('/api/profile').get_data(as_text=True))
        self.assertEqual((Path(self.tmp.name) / 'openrouter-key').stat().st_mode & 0o777, 0o600)

    def test_generation_uses_saved_profile_and_live_key(self):
        self.save()
        store.save_api_key('key-one')
        for secret in ['key-one', 'key-two']:
            store.save_api_key(secret)
            with patch.object(ai_service.httpx, 'post') as post:
                post.return_value.status_code = 200
                post.return_value.json.return_value = {'choices': [{'message': {'content': 'A supported letter.'}}]}
                result = self.client.post('/api/analyze', json={'companyName': 'Example', 'jobDescription': 'Design interfaces', 'personalInfo': {'name': 'Wrong Person'}})
                self.assertEqual(result.status_code, 200)
                self.assertEqual(result.json['personalInfo']['name'], 'Alex Example')
                payload = post.call_args.kwargs
                self.assertNotIn('response_format', payload['json'])
                self.assertEqual(payload['headers']['Authorization'], f'Bearer {secret}')
                prompt = json.dumps(payload['json'])
                self.assertIn('Example Studio', prompt)
                self.assertNotIn('Devang', prompt)
                self.assertNotIn('Wrong Person', prompt)
                self.assertNotIn('file_data', prompt)

    def test_stale_saved_model_falls_back_for_catalog_and_generation(self):
        store.write_value('preferences', {'defaultModel': 'removed/model', 'instructions': ''})
        catalog = self.client.get('/api/models').json
        self.assertEqual(catalog['defaultModel'], get_default_model())
        self.assertIn(catalog['defaultModel'], [model['slug'] for model in catalog['models']])
        self.save()
        store.save_api_key('test-key')
        with patch.object(ai_service.httpx, 'post') as post:
            post.return_value.status_code = 200
            post.return_value.json.return_value = {'choices': [{'message': {'content': 'A supported letter.'}}]}
            result = self.client.post('/api/analyze', json={'companyName': 'Example', 'jobDescription': 'Design interfaces'})
            self.assertEqual(result.status_code, 200)
            self.assertEqual(post.call_args.kwargs['json']['model'], get_default_model())
        self.assertEqual(store.get_preferences()['defaultModel'], 'removed/model')

    def test_valid_saved_and_explicit_models_keep_precedence(self):
        saved_model = get_models()[-1]['slug']
        store.write_value('preferences', {'defaultModel': saved_model, 'instructions': ''})
        self.assertEqual(resolve_model(), saved_model)
        self.assertEqual(resolve_model(get_default_model()), get_default_model())
        # Invalid explicit choices must still reach the caller's validation.
        self.assertEqual(resolve_model('unknown/model'), 'unknown/model')

    def test_extraction_is_a_draft_and_failure_preserves_profile(self):
        self.save()
        store.save_api_key('test-key')
        pdf = io.BytesIO()
        c = canvas.Canvas(pdf)
        c.drawString(50, 750, 'Jamie Example: Teacher with classroom curriculum experience.')
        c.save()
        with patch('backend.services.extraction.call_openrouter_json', return_value=Candidate(profile={'name': 'Jamie Example'})):
            response = self.client.post('/api/profile/extract', data={'resume': (io.BytesIO(pdf.getvalue()), 'resume.pdf')})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['profile']['profile']['name'], 'Jamie Example')
        self.assertEqual(store.get_profile(), self.candidate)
        with patch('backend.services.extraction.call_openrouter_json', side_effect=ValueError('Invalid JSON')):
            response = self.client.post('/api/profile/extract', data={'resume': (io.BytesIO(pdf.getvalue()), 'resume.pdf')})
        self.assertEqual(response.status_code, 502)
        self.assertEqual(store.get_profile(), self.candidate)
        response = self.client.post('/api/profile/extract', data={'resume': (io.BytesIO(b'bad'), 'resume.pdf')})
        self.assertEqual(response.status_code, 400)

    def test_empty_experience_and_projects_render(self):
        candidate = normalize_candidate({'profile': {'name': 'Student Example'}, 'education': [{'degree': 'BA', 'institution': 'Example College'}]})
        output = apply_full_resume_draft(candidate, {'skills': [], 'experience': [], 'projects': []})
        tex = render_resume_tex(output)
        self.assertIn('Example College', tex)
        self.assertNotIn('sectionheading{Experience}', tex)
        self.assertNotIn('sectionheading{Projects}', tex)
        self.assertEqual(candidate, output)

    def test_question_email_and_resume_use_saved_evidence(self):
        self.save()
        store.save_api_key('test-key')
        cases = [
            ('/api/answer-questions', {'answers': [{'question': 'Why?', 'answer': 'I design accessible forms.'}]}),
            ('/api/draft-recruiting-email', {'subject': 'Designer role', 'body': 'I design accessible forms.'}),
        ]
        for route, result in cases:
            with patch.object(ai_service.httpx, 'post') as post:
                post.return_value.status_code = 200
                post.return_value.json.return_value = {'choices': [{'message': {'content': json.dumps(result)}}]}
                response = self.client.post(route, json={'questions': 'Why?', 'companyName': 'Example', 'jobDescription': 'Design'})
                self.assertEqual(response.status_code, 200)
                self.assertIn('Alex Example', json.dumps(post.call_args.kwargs['json']))
                payload = post.call_args.kwargs['json']
                expected_schema = ('JobQuestionAnswerResponse' if route == '/api/answer-questions'
                                   else 'RecruitingEmailDraft')
                self.assertEqual(payload['response_format']['json_schema']['name'], expected_schema)
                self.assertIs(payload['response_format']['json_schema']['strict'], True)
                self.assertNotIn('max_tokens', payload)
                self.assertNotIn('temperature', payload)
        draft = {'skills': [], 'experience': [{'id': self.candidate['experience'][0]['id'], 'bullets': ['Designed accessible forms.']}], 'projects': []}
        with patch('backend.services.resume.shutil.which', return_value='/mock/pdflatex'), patch.object(ai_service.httpx, 'post') as post, patch('backend.services.resume.compile_tex_to_pdf', return_value={'ok': True, 'resumeFile': 'resume.pdf'}) as compile_pdf:
            post.return_value.status_code = 200
            post.return_value.json.return_value = {'choices': [{'message': {'content': json.dumps(draft)}}]}
            response = self.client.post('/api/generate-full-resume', json={'companyName': 'Example', 'jobDescription': 'Design'})
            self.assertEqual(response.status_code, 200)
            tex = compile_pdf.call_args.args[0]
            self.assertIn('Alex Example', tex)
            self.assertIn('Example Studio', tex)
            self.assertNotIn('Devang', tex)
        self.assertEqual(store.get_profile(), self.candidate)

    def test_pdf_download_uses_local_output_and_saved_identity(self):
        from pypdf import PdfReader
        self.save()
        response = self.client.post('/api/generate-pdf', json={'companyName': 'Example', 'personalInfo': {'name': 'Wrong Person'}, 'coverLetter': 'I design accessible forms.'})
        self.assertEqual(response.status_code, 200)
        filename = response.json['coverLetterFile']
        self.assertTrue((store.output_dir() / filename).exists())
        downloaded = self.client.get('/api/download/' + filename)
        self.assertEqual(downloaded.status_code, 200)
        text = PdfReader(io.BytesIO(downloaded.data)).pages[0].extract_text()
        downloaded.close()
        self.assertIn('Alex Example', text)
        self.assertNotIn('Wrong Person', text)

    def test_backup_validation_and_upload_limits_do_not_mutate(self):
        self.save()
        self.assertEqual(self.client.post('/api/profile/validate', json=self.candidate).status_code, 200)
        self.assertEqual(self.client.post('/api/profile/validate', json={'profile': 'invalid'}).status_code, 400)
        response = self.client.post('/api/profile/extract', data=b'x' * (10 * 1024 * 1024 + 1), content_type='application/octet-stream')
        self.assertEqual(response.status_code, 413)
        response.close()
        self.assertEqual(store.get_profile(), self.candidate)

    def test_cross_origin_and_host_rejected(self):
        self.assertEqual(self.client.put('/api/settings', json={'apiKey': 'bad'}, headers={'Origin': 'https://untrusted.example'}).status_code, 403)
        self.assertEqual(self.client.get('/api/profile', headers={'Host': 'untrusted.example'}).status_code, 403)


if __name__ == '__main__':
    unittest.main()
