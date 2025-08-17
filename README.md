# Cover Letter Generator

A modern web application that generates personalized cover letters using AI based on job descriptions and user information. Built with React frontend and Python backend, featuring Google Gemini AI integration.

## Features

- **AI-Powered Cover Letter Generation**: Uses Google Gemini AI to create personalized cover letters
- **Personal Information Management**: Collect and store personal details for consistent formatting
- **PDF Generation**: Automatically generate professional PDF cover letters
- **Modern Web Interface**: Clean, responsive React frontend
- **Docker Support**: Containerized deployment ready
- **Cloud Deployment**: Configured for Google Cloud Run deployment

## Project Architecture

The application follows a microservices architecture with the following components:

- **Frontend** (`frontend/`): React application with modern UI
- **Backend** (`backend/`): Flask server handling API requests and serving the frontend
- **AI Service** (`api_service/`): Google Gemini AI integration for cover letter generation
- **PDF Service** (`pdf_service/`): PDF generation using ReportLab
- **Static Assets** (`static/`): Resume storage and static files

## Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- Google Gemini API key
- Virtual environment (recommended)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Cover-Letter-Generator.git
cd Cover-Letter-Generator
```

### 2. Set Up Python Environment
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

### 3. Set Up Frontend
```bash
cd frontend
npm install
cd ..
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
# Required: Your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Frontend API URL (defaults to production URL)
REACT_APP_API_URL=http://localhost:5000
```

### 5. Add Your Resume
Place your resume PDF file at `static/resume.pdf` (the application will use this as a reference for generating cover letters).

## Running the Application

### Option 1: Quick Start (Recommended)
Use the provided script to start all services:
```bash
chmod +x run.sh
./run.sh
```

This will start:
- Frontend on http://localhost:3002
- Backend on http://localhost:5000

### Option 2: Manual Start

#### Start Backend
```bash
# Activate virtual environment
source venv/bin/activate

# Start Flask backend
python backend/app.py
```

#### Start Frontend (in a new terminal)
```bash
cd frontend
PORT=3002 npm start
```

### Option 3: Docker Deployment
```bash
# Build the Docker image
docker build -t cover-letter-generator .

# Run the container
docker run -p 8080:8080 -e GEMINI_API_KEY=your_key_here cover-letter-generator
```

## Usage

1. **Open the Application**: Navigate to http://localhost:3002
2. **Fill Personal Information**: Enter your name, email, phone, and other details
3. **Add Job Details**: 
   - Enter the company name
   - Paste the job description
   - Add any custom instructions (optional)
4. **Generate Cover Letter**: Click "Analyze & Generate" to create your personalized cover letter
5. **Download PDF**: Review the generated content and download the professional PDF

## API Endpoints

- `POST /api/analyze`: Generate cover letter content using AI
- `POST /api/generate-pdf`: Create PDF from cover letter content
- `GET /api/download/<filename>`: Download generated PDF files

## Technology Stack

### Backend
- **Flask**: Web framework
- **Google Generative AI**: AI-powered content generation
- **ReportLab**: PDF generation
- **PyPDF**: PDF processing
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React 18**: Modern UI framework
- **React Scripts**: Build and development tools

### Infrastructure
- **Docker**: Containerization
- **Gunicorn**: Production WSGI server
- **Google Cloud Run**: Cloud deployment platform

## Development

### Project Structure
```
Cover-Letter-Generator/
├── backend/                 # Flask backend server
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # Source code
│   ├── public/            # Public assets
│   └── package.json       # Node.js dependencies
├── api_service/           # AI service integration
│   ├── ai_service.py      # Gemini AI integration
│   └── system_instruction.txt  # AI prompt instructions
├── pdf_service/           # PDF generation service
│   └── pdf_generator.py   # PDF creation logic
├── static/                # Static files and resume storage
├── terraform/             # Infrastructure as code (if applicable)
├── Dockerfile             # Docker configuration
├── run.sh                 # Development startup script
└── README.md              # This file
```

### Environment Variables
- `GEMINI_API_KEY`: Required Google Gemini API key
- `REACT_APP_API_URL`: Frontend API endpoint (defaults to production)

## Deployment

The application is configured for deployment on Google Cloud Run. The Dockerfile includes:
- Multi-stage build for optimized production image
- Gunicorn WSGI server for production
- Static file serving for the React frontend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.