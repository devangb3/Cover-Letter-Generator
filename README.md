# Resume PDF Maker

A web application that tailors resumes and generates cover letters based on job descriptions using AI.

## Features

- Upload and analyze your resume
- Input job descriptions and custom instructions
- AI-powered recommendations for tailoring your resume
- Generate customized cover letters
- Download tailored resume and cover letter as PDFs

## Project Structure

- `backend/`: Flask backend server
- `frontend/`: React frontend application
- `api_service/`: Gemini API integration service
- `pdf_service/`: PDF generation service
- `static/`: Static files and resume storage

## Prerequisites

- Python 3.8+
- Node.js and npm
- Google Gemini API key

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/Resume-PDF-Maker.git
   cd Resume-PDF-Maker
   ```

2. Set up environment:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file and add your Gemini API key.

3. Add your resume:
   - Place your resume PDF file at `static/resume.pdf`

4. Install backend dependencies:
   ```
   python -m pip install flask python-dotenv google-generativeai pypdf reportlab requests cors flask-cors
   ```

5. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Running the Application

1. Start all services at once:
   ```
   ./run.sh
   ```

   This will start:
   - Frontend on http://localhost:3002
   - Backend on http://localhost:5000
   - API Service on http://localhost:5001
   - PDF Service on http://localhost:5002

2. Or start services individually:

   ```
   # Backend server
   cd backend
   python app.py
   
   # API service
   cd api_service
   python api.py
   
   # PDF service
   cd pdf_service
   python pdf_generator.py
   
   # Frontend (on port 3002)
   cd frontend
   PORT=3002 npm start
   ```

3. Open your browser and navigate to `http://localhost:3002`

## Usage

1. Input the job description in the text area
2. Add any custom instructions (optional)
3. Click "Analyze & Generate"
4. Review the AI-generated recommendations and content
5. Download the tailored resume and cover letter PDFs