# Cover Letter Generator

A web app that generates personalized cover letters from job descriptions and user details, then renders the output into a downloadable PDF.

The app now uses **OpenRouter only** for LLM generation, with the allowed model list defined in YAML and surfaced in the UI dropdown.

## Features

- OpenRouter-powered cover letter generation
- YAML-driven model allowlist (`config/model.yaml`)
- Backend model validation (rejects unknown slugs)
- React frontend with model dropdown fetched from backend
- PDF generation and download
- Dockerized deployment

## Architecture

- `frontend/`: React app
- `backend/`: Flask app serving APIs + frontend build
- `api_service/`: Prompt construction, model config loading, OpenRouter calls
- `pdf_service/`: ReportLab PDF generation
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

### 5. Add resume

Place your resume at `static/resume.pdf`.

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
- `POST /api/generate-pdf`: Builds PDF from generated text
- `GET /api/download/<filename>`: Downloads generated PDF

## Notes

- Backend enforces model allowlist from `config/model.yaml`.
- Backend loads YAML at startup and fails fast if invalid.
- `POST /api/analyze` returns `400` for unknown model slugs.
