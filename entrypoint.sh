#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "--> Collecting static files..."
python manage.py collectstatic --noinput

echo "--> Applying database migrations..."
python manage.py migrate --noinput

echo "--> Creating superuser..."
# The '|| true' ensures this doesn't fail if the user already exists from a previous run
python manage.py createsuperuser --username admin --email '' --noinput || true

echo "--> Starting Gunicorn..."
# Execute the CMD passed from the Dockerfile (which is gunicorn)
exec "$@"
