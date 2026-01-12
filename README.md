# A Library

## Environment files

This project uses two separate env files:
- Backend (Django): `.env` at repo root
- Frontend (Vite): `frontend/.env`

Copy the examples and adjust values:
```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Set backend values in `.env`:
- `SECRET_KEY`: any long random string (keep it secret in prod)
- `DEBUG`: `True` for local dev, `False` for prod
- `ALLOWED_HOSTS`: comma-separated hosts (e.g. `localhost,127.0.0.1` for dev, your domain(s) in prod)
- `CSRF_TRUSTED_ORIGINS`: comma-separated scheme+host (e.g. `http://localhost:5173` for dev, `https://your-domain`)
- `DJANGO_SUPERUSER_PASSWORD`: password used by the no-input `createsuperuser` step

Set frontend values in `frontend/.env`:
- `VITE_APP_NAME`: app title shown in the UI
- `VITE_GITHUB_URL`: URL for the GitHub link
- `VITE_PORTFOLIO_URL`: URL for the portfolio link
- `VITE_API_URL`: backend API base (use `http://localhost:8000` for dev, your HTTPS API in prod)

## Local development

### Option 1: Node + Python installed (yarn/npm/pnpm available)

Backend:
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Frontend:
```bash
cd frontend
yarn install   # or npm install / pnpm install
yarn dev       # or npm run dev / pnpm dev
```

The frontend expects the Django API at `http://localhost:8000`.

### Option 2: Docker for backend + Docker for Vite dev server

Run Django in Docker (no image build):
```bash
docker run --rm -it -d --name api \
  -p 8000:8000 \
  -v "$PWD:/app" \
  -w /app \
  --env-file .env \
  python:3.12-slim \
  sh -c "pip install -r requirements.txt && python manage.py migrate && python manage.py createsuperuser --username admin --email '' --noinput || true && python manage.py runserver 0.0.0.0:8000"
```

Note: set `DJANGO_SUPERUSER_PASSWORD` in `.env` for the no-input superuser creation.

Run the frontend dev server in Docker (from repo root):
```bash
docker run --rm -it -d --name frontend \
  -p 5173:5173 \
  -v "$PWD/frontend:/app" \
  -w /app \
  --env-file frontend/.env \
  node:lts-alpine \
  sh -c "yarn install && yarn refresh"
```

## Production (Dockerfile only)

Build with production frontend values:
```bash
docker build \
  --build-arg VITE_API_URL=https://your-api.example \
  --build-arg VITE_APP_NAME=Library \
  --build-arg VITE_PORTFOLIO_URL=https://your-portfolio.example \
  --build-arg VITE_GITHUB_URL=https://github.com/yourname \
  -t library-app:prod .
```

Run with production backend envs:
```bash
docker run --env-file .env -p 8000:8000 library-app:prod
```
