# Cover Letter Generator

A web app that generates personalized cover letters from job descriptions and user details, then renders the output into a downloadable PDF.

The app now uses **OpenRouter only** for LLM generation, with the allowed model list defined in YAML and surfaced in the UI dropdown.

## Features

- OpenRouter-powered cover letter generation
- Job application question answering using the same resume/projects context
- Recruiting-team outreach email drafting using the same resume/projects context
- Full resume generation from structured `resume.yaml`
- YAML-driven model allowlist (`config/model.yaml`)
- Backend model validation (rejects unknown slugs)
- React frontend with model dropdown fetched from backend
- PDF generation and download
- Containerized deployment using Docker

## Architecture

- `frontend/`: React app
- `backend/`: Flask app serving APIs + frontend build
- `backend/api_service/`: Prompt construction, model config loading, OpenRouter calls
- `backend/models/`: Pydantic schemas for structured LLM outputs
- `pdf_service/`: ReportLab PDF generation
- `resume.yaml`: Structured resume source used for tailored resume generation
- `config/`: YAML model configuration
- `static/`: Resume and static assets

## Prerequisites

- Python 3.9+
- Node.js 18+
- OpenRouter API key

## Setup

### 1. Install backend dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 3. Configure environment variables

Create `.env`:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
# Optional attribution headers:
# OPENROUTER_HTTP_REFERER=https://your-app-domain.com
# OPENROUTER_APP_TITLE=Cover Letter Generator
```

### 4. Configure model catalog

Edit `config/model.yaml`:

```yaml
openrouter:
  base_url: https://openrouter.ai/api/v1
  default_model: openai/gpt-4.1-mini
  models:
    - label: GPT-4.1 Mini
      slug: openai/gpt-4.1-mini
```

### 5. Add resume context

Place your resume PDF at `static/resume.pdf` for cover-letter, question-answer, and recruiting-email context.
Edit `resume.yaml` for generated resume content; the backend renders full resume PDFs from this YAML file.

## Running

### Quick start

```bash
chmod +x run.sh
./run.sh
```

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:5000`

### Manual

```bash
source .venv/bin/activate
python backend/app.py
```

In another terminal:

```bash
cd frontend
PORT=3002 npm start
```

### Docker

```bash
docker build -t cover-letter-generator .
docker run -p 8080:8080 -e OPENROUTER_API_KEY=your_key_here cover-letter-generator
```

## API Endpoints

- `GET /api/models`: Returns configured model list and default model
- `POST /api/analyze`: Generates cover letter text using selected model slug (or default)
- `POST /api/answer-questions`: Generates answers for pasted application questions using the same candidate context
- `POST /api/draft-recruiting-email`: Drafts a subject and email body for the target company's recruiting team
- `POST /api/generate-full-resume`: Generates a full resume PDF from `resume.yaml`
- `POST /api/generate-pdf`: Builds PDF from generated text
- `GET /api/download/<filename>`: Downloads generated PDF

## Notes

- Backend enforces model allowlist from `config/model.yaml`.
- Backend loads YAML at startup and fails fast if invalid.
- `POST /api/analyze` returns `400` for unknown model slugs.
