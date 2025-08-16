# Stage 1: Build the React frontend
FROM node:18 as build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Set up the Python backend
FROM python:3.9-slim
WORKDIR /app
COPY --from=build /app/frontend/build ./frontend/build
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["gunicorn", "-b", "0.0.0.0:8080", "backend.app:app"]