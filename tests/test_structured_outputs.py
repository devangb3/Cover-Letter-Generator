import json
import unittest
from unittest.mock import patch

from pydantic import ValidationError

from backend.api_service import ai_service
from backend.models.llm_outputs import FullResumeDraft
from backend.models.profile import Candidate


class StructuredOutputTests(unittest.TestCase):
    def test_schemas_require_fields_and_forbid_extras_in_nested_objects(self):
        for model in (Candidate, FullResumeDraft):
            with self.subTest(model=model.__name__):
                original = ai_service.get_pydantic_json_schema(model)
                schema = ai_service.get_strict_json_schema(model)

                def check(node):
                    if isinstance(node, dict):
                        self.assertNotIn('default', node)
                        if node.get('type') == 'object':
                            self.assertIs(node['additionalProperties'], False)
                            self.assertEqual(set(node['required']), set(node['properties']))
                        for child in node.values():
                            check(child)
                    elif isinstance(node, list):
                        for child in node:
                            check(child)

                check(schema)
                self.assertEqual(ai_service.get_pydantic_json_schema(model), original)
                self.assertIn('$ref', json.dumps(schema))

    @patch.object(ai_service, 'get_base_url', return_value='https://openrouter.ai/api/v1')
    @patch.object(ai_service, 'is_allowed_model', return_value=True)
    @patch.object(ai_service, 'get_api_key', return_value='test-key')
    @patch.object(ai_service.httpx, 'post')
    def test_request_sends_strict_schema_and_requires_provider_support(self, post, *_):
        post.return_value.status_code = 200
        content = '{"skills": [], "experience": [], "projects": []}'
        post.return_value.json.return_value = {'choices': [{'message': {'content': content}}]}
        result = ai_service.call_openrouter_json(
            'Return a resume.', 'Candidate facts', 'test-model',
            response_model=FullResumeDraft, max_tokens=4200, temperature=0.75,
            enable_web_search=True,
        )
        self.assertIsInstance(result, FullResumeDraft)
        self.assertEqual(result.model_dump(), json.loads(content))
        payload = post.call_args.kwargs['json']
        self.assertEqual(payload['response_format'], {
            'type': 'json_schema',
            'json_schema': {
                'name': 'FullResumeDraft', 'strict': True,
                'schema': ai_service.get_strict_json_schema(FullResumeDraft),
            },
        })
        self.assertEqual(payload['provider'], {'require_parameters': True})
        self.assertEqual(payload['max_tokens'], 4200)
        self.assertEqual(payload['temperature'], 0.75)
        self.assertEqual(payload['tools'], [ai_service.WEB_SEARCH_TOOL])

        post.return_value.status_code = 400
        with self.assertRaisesRegex(RuntimeError, 'status 400'):
            ai_service.call_openrouter_json(
                'Return a resume.', 'Candidate facts', 'test-model',
                response_model=FullResumeDraft,
            )
        self.assertEqual(post.call_count, 2)  # No fallback to unconstrained output.

    @patch.object(ai_service, 'is_allowed_model', return_value=True)
    @patch.object(ai_service, 'get_api_key', return_value='test-key')
    @patch.object(ai_service.httpx, 'post')
    def test_invalid_output_raises_in_helper(self, post, *_):
        post.return_value.status_code = 200
        for content, error in [('not json', json.JSONDecodeError), ('{"skills": 42}', ValidationError)]:
            with self.subTest(content=content):
                post.return_value.json.return_value = {'choices': [{'message': {'content': content}}]}
                with self.assertRaises(error):
                    ai_service.call_openrouter_json(
                        'Return a resume.', 'Candidate facts', 'test-model',
                        response_model=FullResumeDraft,
                    )

    @patch.object(ai_service, 'build_application_context', return_value='Candidate facts')
    @patch.object(ai_service, 'is_allowed_model', return_value=True)
    @patch.object(ai_service, 'get_api_key', return_value='test-key')
    @patch.object(ai_service.httpx, 'post')
    def test_resume_retries_parse_and_validation_errors(self, post, *_):
        post.return_value.status_code = 200
        draft = {'skills': [], 'experience': [], 'projects': []}
        post.return_value.json.side_effect = [
            {'choices': [{'message': {'content': content}}]}
            for content in ('not json', '{"skills": 42}', json.dumps(draft))
        ]
        result = ai_service.generate_full_resume_draft(
            'Job', 'Company', '', {}, {}, [], model='test-model',
        )
        self.assertEqual(result, draft)
        self.assertEqual(post.call_count, 3)
        retry_prompt = post.call_args.kwargs['json']['messages'][1]['content']
        self.assertIn('Attempt 1 validation error:', retry_prompt)
        self.assertIn('Attempt 2 validation error:', retry_prompt)
