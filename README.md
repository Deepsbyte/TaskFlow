# 🚀 TaskFlow — AI-Powered Task Management Platform

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-AI%20Task%20Management-6366f1?style=for-the-badge&logo=task&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-taskflow--frontwnd.onrender.com-22c55e?style=for-the-badge)](https://taskflow-frontwnd.onrender.com)
[![Backend API](https://img.shields.io/badge/⚡%20Backend%20API-Live-3b82f6?style=for-the-badge)](https://taskflow-backend-s986.onrender.com/api/v1/)
[![GitHub](https://img.shields.io/badge/GitHub-Deepsbyte%2FTaskFlow-181717?style=for-the-badge&logo=github)](https://github.com/Deepsbyte/TaskFlow)

![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-336791?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=flat-square&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Overview

**TaskFlow** is a production-ready, full-stack task management platform built for agile development teams. It features a real-time Kanban board, role-based access control, an AI-powered optimization engine, and a rich analytics dashboard — all backed by a Django REST API and deployed on Render with Docker.

> **Built to showcase full-stack engineering:** from JWT authentication and custom Django permissions through to drag-and-drop UI, Chart.js analytics, and containerized cloud deployment.

---

## 🌐 Live Application

| Service | URL |
|:--------|:----|
| 🖥️ Frontend (React) | https://taskflow-frontwnd.onrender.com |
| ⚡ Backend API (Django) | https://taskflow-backend-s986.onrender.com/api/v1/ |

### 🔐 Demo Credentials

| Username | Password | Role | Access |
|:---------|:---------|:-----|:-------|
| `api_check_sm` | `ApiCheck!12345` | Scrum Master | Full access — all tasks & analytics |
| `api_check_emp` | `ApiCheck!12345` | Employee | Limited — only assigned tasks |

> **Note:** The app runs on Render's free tier. The first request after inactivity may take ~30 seconds to wake up.

---

## ✨ Features

### 🎯 Core Features
- **Kanban Board** — Drag-and-drop task management across To Do, In Progress, Review, and Done columns
- **Role-Based Access Control** — Scrum Masters see all tasks; Employees see only assigned tasks
- **Task CRUD** — Full create, read, update, delete with priority levels and deadlines
- **Real-time DB Sync** — All changes persist to PostgreSQL instantly
- **Comment Threads** — Leave comments on individual tasks

### 📊 Analytics & AI
- **Analytics Dashboard** — Interactive Chart.js charts showing task distribution, velocity, and burndown
- **AI Optimization Engine** — Rule-based insight engine that surfaces productivity bottlenecks and actionable recommendations
- **Productivity Scoring** — Per-user productivity scores updated via background Celery tasks
- **Executive Summary View** — High-level project health overview for Scrum Masters

### 🔐 Security
- **JWT Authentication** — Access + refresh token pair with automatic rotation and blacklisting
- **Email or Username Login** — Flexible login via either identifier
- **Token Blacklisting** — Invalidates refresh tokens on logout for security
- **CORS Protection** — Configured per-environment (strict in production)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **Django 4.2** | Web framework |
| **Django REST Framework** | RESTful API |
| **PostgreSQL** | Production database |
| **SimpleJWT** | JWT authentication |
| **Celery + Redis** | Async background tasks |
| **Gunicorn** | Production WSGI server |
| **Docker** | Containerization |

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework |
| **@dnd-kit** | Drag-and-drop Kanban board |
| **Chart.js + react-chartjs-2** | Analytics charts |
| **Axios** | HTTP client with interceptors |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |

### DevOps & Deployment
| Technology | Purpose |
|:-----------|:--------|
| **Render** | Cloud hosting |
| **Docker** | Containerized backend |
| **Render Static Sites** | Frontend CDN |
| **GitHub Actions** | CI/CD pipeline |
| **GitHub Auto-Deploy** | Automatic redeploys on push |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│         Render Static Site · CDN-delivered               │
│   Kanban Board · Analytics · AI Insights · Auth UI       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS + JWT Bearer Token
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Django + DRF)                  │
│           Docker · Gunicorn · Render Web Service         │
│   REST API · JWT Auth · RBAC · Analytics Engine          │
└──────────────┬──────────────────────────┬───────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────┐
│  PostgreSQL Database │    │   Redis (Celery Broker)      │
│  Render Managed DB   │    │   Async Task Queue           │
└──────────────────────┘    └─────────────────────────────┘
```

---

## 🚀 Local Development Setup

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Deepsbyte/TaskFlow.git
cd TaskFlow
```

### 2. Backend Setup
```powershell
# Create and activate virtual environment
cd backend
python -m venv venv
.\venv\Scripts\Activate   # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r ../requirements.txt

# Run migrations
python manage.py migrate

# Seed database with demo data and users
python seed_all.py

# Start the backend server
python manage.py runserver
```
✅ Backend running at **http://127.0.0.1:8000**

### 3. Frontend Setup
```bash
# In a new terminal
cd frontend
npm install
npm start
```
✅ Frontend running at **http://localhost:3000**

### 4. Environment Variables
Create `backend/.env` based on `.env.example`:
```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOW_ALL_ORIGINS=True
```

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1/`

### Authentication
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/auth/register/` | Register a new user |
| `POST` | `/auth/login/` | Login with email or username |
| `GET` | `/auth/me/` | Get current user profile |
| `POST` | `/auth/token/refresh/` | Refresh access token |
| `POST` | `/auth/logout/` | Blacklist refresh token |

### Tasks
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/tasks/` | List tasks (filtered by role) |
| `POST` | `/tasks/` | Create a new task |
| `GET` | `/tasks/{id}/` | Retrieve a task |
| `PATCH` | `/tasks/{id}/` | Update a task |
| `DELETE` | `/tasks/{id}/` | Delete a task |

### Analytics
| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/analytics/summary/` | Project health summary |
| `GET` | `/analytics/insights/` | AI optimization suggestions |
| `GET` | `/analytics/productivity/` | Per-user productivity scores |

---

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend
python manage.py test

# API smoke tests (requires running backend)
python smoke_test.py

# Frontend tests
cd frontend
npm test
```

---

## 🐳 Docker Deployment

```bash
# Build and run all services with Docker Compose
docker-compose up --build
```

This spins up:
- Django web server (port 8000)
- PostgreSQL database (port 5432)
- Redis broker (port 6379)
- Celery worker
- Celery beat scheduler
- React frontend (port 3000)

---

## 📁 Project Structure

```
TaskFlow/
├── backend/
│   ├── backend/          # Django project settings, URLs, Celery config
│   ├── tasks/            # Core app: models, views, serializers, auth
│   │   ├── models.py     # User, Project, Task, TaskActivity models
│   │   ├── views.py      # DRF ViewSets with RBAC
│   │   ├── serializers.py
│   │   ├── analytics.py  # AI insight engine
│   │   ├── auth.py       # Custom JWT serializer (email/username login)
│   │   └── permissions.py# Custom permission classes
│   ├── manage.py
│   ├── seed_all.py       # DB seeding script
│   └── entrypoint.sh     # Production startup script
├── frontend/
│   └── src/
│       ├── components/   # Kanban, Analytics, Layout components
│       ├── pages/        # Login, Dashboard pages
│       ├── api.js        # Axios instance with JWT interceptors
│       └── hooks/        # Custom React hooks
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 👨‍💻 Author

**Deepsbyte**
- GitHub: [@Deepsbyte](https://github.com/Deepsbyte)
- Live Project: [taskflow-frontwnd.onrender.com](https://taskflow-frontwnd.onrender.com)

---

<div align="center">

⭐ **If you found this project interesting, please consider starring the repository!** ⭐

</div>
