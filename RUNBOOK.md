Runbook — development & deployment
=================================

Quick commands
--------------

- Start local Django dev server:

```powershell
cd backend
python manage.py runserver
```

- Run smoke tests (requires dev server running):

```powershell
python backend/smoke_test.py
```

- Run backend tests:

```powershell
python manage.py test
```

- Build frontend (production):

```bash
npm ci --prefix frontend
npm run build --prefix frontend
```

- Docker compose (prod-like):

```bash
docker-compose up --build
```

CI

- GitHub Actions workflow is at `.github/workflows/ci.yml` — runs backend migrations/tests and frontend tests/build on push/PR.

Deployment notes
----------------
- The repository includes `Dockerfile` and `docker-compose.yml` for containerized deployment. Set production secrets via environment variables (e.g., `DJANGO_SECRET_KEY`, DB credentials).

Heroku (container) / DigitalOcean App Platform
---------------------------------------------

- Using the included `Dockerfile` you can deploy to Heroku's container registry or DigitalOcean App Platform.

- Heroku example (build & release):

```bash
# Login and push image (Heroku CLI configured)
heroku container:login
heroku create your-app-name
heroku container:push web --app your-app-name
heroku container:release web --app your-app-name
heroku run python backend/manage.py migrate --app your-app-name
```

- DigitalOcean: create an App and point it to this repo; App Platform will detect the `Dockerfile` and build the container. Ensure env vars are set in the App settings.

