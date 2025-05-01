#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo "Activating virtual environment..."
source vevn/bin/activate

# Start all services
echo "Starting API service..."
cd api_service
python api.py &
API_PID=$!

echo "Starting PDF service..."
cd ../pdf_service
python pdf_generator.py &
PDF_PID=$!

echo "Starting backend server..."
cd ../backend
python app.py &
BACKEND_PID=$!

echo "Starting frontend on port 3002..."
cd ../frontend
PORT=3002 npm start &
FRONTEND_PID=$!

# Wait for user to stop the services
echo "All services are running."
echo "- Frontend: http://localhost:3002"
echo "- Backend: http://localhost:5000"
echo "- API Service: http://localhost:5001"
echo "- PDF Service: http://localhost:5002"
echo "Press Ctrl+C to stop all services."
trap "kill $API_PID $PDF_PID $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait