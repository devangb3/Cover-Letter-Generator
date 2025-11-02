#!/bin/bash

if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Starting backend server..."
python backend/app.py &
BACKEND_PID=$!

echo "Starting frontend on port 3002..."
cd frontend
# Set the API URL to point to local backend for development
export REACT_APP_API_URL="http://localhost:5000"
PORT=3002 npm start &
FRONTEND_PID=$!

# Wait for user to stop the services
echo "All services are running."
echo "- Frontend: http://localhost:3002"
echo "- Backend: http://localhost:5000"
echo "- API Service: http://localhost:5001"
echo "Press Ctrl+C to stop all services."
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT
wait