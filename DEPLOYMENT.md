# TaskFlow Deployment Guide

## Overview

TaskFlow is a full-stack task management platform with:
- **Backend:** Django + DRF with Celery async tasks
- **Frontend:** React + Tailwind
- **Database:** PostgreSQL
- **Cache/Queue:** Redis
- **Task Queue:** Celery with Beat scheduler

## Quick Start with Docker Compose

### Prerequisites

- Docker & Docker Compose installed
- A `.env` file configured (see below)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd anti
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `DJANGO_SECRET_KEY`: Run `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` to generate one
   - `POSTGRES_PASSWORD`: A secure password
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL (e.g., `http://localhost:3000`)

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This will spin up:
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Django web server (port 8000)
   - Celery worker
   - Celery beat scheduler
   - React frontend (port 3000)

4. **Verify services**
   ```bash
   docker-compose ps
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api/v1/
   - Django Admin: http://localhost:8000/admin/ (create superuser below)

### Create a Superuser

```bash
docker-compose exec web python manage.py createsuperuser
```

### Run Migrations (if not auto-run)

```bash
docker-compose exec web python manage.py migrate
```

### Compute Initial Productivity Scores

```bash
docker-compose exec web python manage.py compute_productivity
```

## Production Deployment

### Environment Variables (Critical)

Create a production `.env` file with:

```env
DJANGO_SECRET_KEY=<generate-a-secure-key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
POSTGRES_DB=taskflow_prod
POSTGRES_USER=taskflow
POSTGRES_PASSWORD=<secure-postgres-password>
POSTGRES_HOST=db.yourdomain.com
POSTGRES_PORT=5432
CELERY_BROKER_URL=redis://redis.yourdomain.com:6379/0
CELERY_RESULT_BACKEND=redis://redis.yourdomain.com:6379/1
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Deployment Platforms

#### AWS (ECS + RDS + ElastiCache)

1. Push Docker images to ECR:
   ```bash
   docker build -t taskflow-backend .
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag taskflow-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/taskflow-backend:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/taskflow-backend:latest
   ```

2. Create RDS PostgreSQL instance
3. Create ElastiCache Redis cluster
4. Create ECS task definitions and services
5. Configure ALB/NLB for routing
6. Set environment variables in ECS task definition

#### Heroku

```bash
heroku create taskflow-app
heroku addons:create heroku-postgresql:standard-0
heroku addons:create heroku-redis:premium-0
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

#### Railway / Render

Use their Docker deployment templates and connect to managed PostgreSQL/Redis.

### Health Checks

Monitor the application:

- **Web server health:** `GET /api/v1/auth/me/` (requires auth)
- **DB health:** `python manage.py dbshell` and run `SELECT 1;`
- **Redis health:** `redis-cli ping` should return `PONG`
- **Celery health:** Check logs from worker/beat containers

### Scaling

For production workloads:

1. **Horizontal scaling:** Run multiple `worker` containers (increase replicas in K8s or ECS)
2. **Database:** Use RDS with multi-AZ and read replicas
3. **Cache:** Use ElastiCache (Redis) for analytics caching
4. **CDN:** Place frontend build behind CloudFront or similar
5. **Load balancer:** ALB/NLB in front of multiple web instances

### Monitoring

Integrate with:
- **Logging:** CloudWatch, Datadog, or ELK stack
- **Metrics:** Prometheus + Grafana
- **Alerts:** PagerDuty or Opsgenie
- **APM:** New Relic, Datadog, or Sentry

### Backup & Recovery

1. **Database:** Enable automated RDS backups (daily)
2. **Redis:** Use cluster snapshots
3. **Code:** Keep git history and tag releases
4. **S3:** Store media uploads to S3 (configure in Django)

## Troubleshooting

### Celery tasks not running

1. Check beat scheduler is running:
   ```bash
   docker-compose logs beat
   ```

2. Check worker has tasks registered:
   ```bash
   docker-compose exec worker celery -A backend inspect active
   ```

3. Verify Redis connection:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

### PostgreSQL connection errors

- Verify `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD` in `.env`
- Check Docker network: `docker network inspect anti_default`
- Test connection: `docker-compose exec web python -c "import psycopg2; psycopg2.connect(...)"`

### Frontend can't reach API

- Ensure `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check frontend `REACT_APP_API_URL` environment variable
- Verify CORS middleware is enabled in Django

### Slow analytics queries

- Enable query logging: `LOGGING` in Django settings
- Add database indexes on frequently filtered fields
- Cache analytics responses in Redis (already configured)

## Maintenance

### Regular Tasks

- **Weekly:** Check logs for errors
- **Monthly:** Review slow query logs, update dependencies
- **Quarterly:** Database optimization (VACUUM, ANALYZE in PostgreSQL)
- **Annually:** Security audits, dependency updates

### Database Maintenance

```bash
# Inside the web container
python manage.py dbshell

-- Inside PostgreSQL shell
VACUUM ANALYZE;
```

### Celery Task Cleanup

```bash
# Remove expired task results (older than 24 hours)
docker-compose exec web python manage.py celery_cleanup
```

## Support

For issues or questions:
- Check logs: `docker-compose logs <service-name>`
- Review Django debug output: Ensure `DJANGO_DEBUG=False` in production
- File GitHub issues with detailed error messages and logs
