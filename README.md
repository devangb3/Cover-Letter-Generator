# Cover Letter Generator

A local application for creating cover letters, screening-question answers, recruiting emails, and tailored resume PDFs from your saved background and a job description.

Bring your own **OpenRouter API key**. On first launch, upload a resume for AI-assisted extraction or enter your information manually. Review and save your profile once; subsequent launches open the application workspace directly. **My Profile** lets you edit your information whenever it changes.

## Clone and launch

Requirements: Python 3.9+, Node.js with npm, and an OpenRouter account with credits. These commands use Bash (Linux/macOS, or WSL on Windows).

```bash
git clone https://github.com/devangb3/Cover-Letter-Generator.git
cd Cover-Letter-Generator
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
npm --prefix frontend ci
bash run.sh
```

Open **http://127.0.0.1:5000**. The launcher builds React and starts one local Flask process serving both the interface and API. Stop it with Ctrl+C. Set `PORT=5001 bash run.sh` to use a different port.

The launcher does not create or modify `.env`. Configure your key in the setup screen. An existing `OPENROUTER_API_KEY` environment variable is also supported; a saved key takes precedence.

Tailored resume PDFs additionally require `pdflatex` with the packages used by the template (including enumitem, titlesec, and hyperref), or Tectonic. On Debian/Ubuntu these are available through `texlive-latex-base`, `texlive-latex-recommended`, `texlive-latex-extra`, and `texlive-fonts-recommended`. Cover letters and their PDFs, question answers, and emails work without LaTeX.

## First-time setup

1. Save your OpenRouter key and choose a default model. Saving stores the key; the first AI request checks it with the provider.
2. Upload a **text-based PDF**, up to 10 MB and 20 pages. The app extracts its text locally, then asks your selected model to structure it. Scanned/image-only and encrypted PDFs require a different PDF or manual entry.
3. Review imported sections and apply the ones you want. Correct any extraction mistakes and add supporting achievements or projects.
4. Save your profile. Only your name is required; experience, projects, education, skills, and contact fields are optional.
5. Enter the company, job description, application questions, and instructions for the current job. Generate and edit the outputs.

The profile contains shared facts. Settings contain the default model and writing instructions. The application workspace contains job-specific inputs. Application inputs and generated text currently live in the browser session; they are not an application-history database.

## Editing and backups

Use **Edit profile** to update saved information. Edits take effect after **Save profile**; **Cancel** discards them. Importing another resume produces a separate draft and never overwrites your saved profile automatically. Apply sections individually, preserving manually added sections where needed.

**Export saved profile** downloads a JSON backup without your API key. **Import profile backup** opens that information for review before saving. Settings lets you replace the key or change writing defaults. Generation reads the saved profile and never modifies it.

## Local data and privacy

Runtime files are stored in gitignored directories at the project root:

- `data/`: profile and preferences (`profile.sqlite3`), saved API key (`openrouter-key`), and generated PDFs (`output/`).
- `logs/backend.log`: application logs, also written to the console.

Set `COVER_LETTER_DATA_DIR` to choose another data location; logs still go to `logs/`. The API key is stored in plaintext with owner-only permissions on POSIX. Keep these directories private and back up `data/` before deleting or replacing the checkout. Paths are resolved from the project root, independent of the working directory.


The interface and storage are local, but **AI requests send resume text/profile context to OpenRouter and the selected provider**, using your credits. Uploaded PDFs are processed in memory and are not retained. The server binds to loopback and expects same-origin access; this is a single-user local application, not a hosted multi-user service.

The legacy `resume.yaml`, `static/resume.pdf`, and `static/projects.json` are not loaded by the application. Existing personal source files are retained, but new installations start with no profile. Import your resume through setup to migrate your background.

## Development and verification

```bash
source .venv/bin/activate
python -m unittest discover -s tests -v
npm --prefix frontend test -- --watchAll=false --runInBand
npm --prefix frontend run build
```

`config/model.yaml` defines the allowed models. The default frontend uses relative `/api` URLs, so it never falls back to a hosted backend. Rebuild after frontend changes. The local launcher serves the built frontend rather than running a separate development server.

API additions: `GET/PUT /api/profile`, `POST /api/profile/extract`, `POST /api/profile/validate`, `GET/PUT /api/settings`. Generation endpoints resolve identity and evidence from the saved profile; request-provided identity cannot substitute another candidate.

## Backend structure

- `backend/app.py`: WSGI entry point and local launcher.
- `backend/factory.py`: `create_app(config)` constructs Flask and registers the routes and request handlers. Tests create applications with `TESTING=True` without starting a server.
- `backend/http.py`: local-origin/profile guards and shared HTTP error translation.
- `backend/routes/`: thin Flask blueprints for generation, profiles, settings/models, document access, and frontend assets.
- `backend/services/`: generation workflows, resume retries, resume extraction, settings validation, and candidate views. These modules do not depend on Flask.
- `backend/models/`: candidate validation schemas and structured LLM output schemas.
- `backend/storage/local.py`: SQLite persistence, credential files, and local data paths.
- `backend/api_service/`: existing OpenRouter integration, prompt construction, and model configuration.
- `pdf_service/`: PDF rendering and compilation used by the workflow services.

HTTP routes translate requests and responses; services own workflow decisions; storage owns persistence. New workflows should follow that direction rather than adding logic to the entry point. API URLs and the `backend.app:app` entry point remain unchanged.
