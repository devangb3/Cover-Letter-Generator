#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f .venv/bin/activate ]]; then
  echo "Create the environment first: python3 -m venv .venv"
  echo "Then: source .venv/bin/activate && pip install -r backend/requirements.txt"
  exit 1
fi
source .venv/bin/activate
if [[ ! -d frontend/node_modules ]]; then
  echo "Install frontend dependencies first: npm --prefix frontend ci"
  exit 1
fi
# Build a same-origin frontend; never use a previously configured hosted API URL.
REACT_APP_API_URL='' npm --prefix frontend run build
if ! command -v pdflatex >/dev/null && ! command -v tectonic >/dev/null; then
  echo "Note: tailored resume PDFs require pdflatex or tectonic. Other features are available."
fi
echo "Open http://127.0.0.1:${PORT:-5000} — press Ctrl+C to stop."
exec python -m backend.app
