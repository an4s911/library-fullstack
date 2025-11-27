# ---------------------------- 
# Stage 1: Build React Frontend 
# ---------------------------- 
FROM node:lts-alpine AS frontend-builder 

# Set working directory for the frontend build 
WORKDIR /app/frontend 

# Copy package files first to leverage Docker cache 
COPY frontend/package.json frontend/yarn.lock ./ 

# Install dependencies 
RUN yarn install --frozen-lockfile 

# Copy the rest of the frontend source code 
COPY frontend/ ./ 

# Build arguments for Vite environment variables 
ARG VITE_API_URL 
ARG VITE_APP_NAME 
ARG VITE_PORTFOLIO_URL 
ARG VITE_GITHUB_URL 

# Build the React app 
RUN yarn run build 

# ---------------------------- 
# Stage 2: Django & Gunicorn 
# ---------------------------- 
FROM python:3.12-slim 

# Set standard environment variables (DEBUG stays as ENV) 
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBUG=False 

WORKDIR /app 

# Install Gunicorn
RUN pip install gunicorn 

# Copy requirements and install Python packages 
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt 

# Copy the Django project code 
COPY . . 

# Setup the entrypoint script
RUN chmod +x entrypoint.sh

# Copy the built React assets from Stage 1 
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist 

# Expose the port gunicorn will listen on 
EXPOSE 8000

# Set the script as the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run Gunicorn 
CMD gunicorn --bind 0.0.0.0:${PORT:-8000} library.wsgi:application
