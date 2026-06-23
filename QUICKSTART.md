# TaskFlow: Quick Start Guide

Get TaskFlow running in 5 minutes.

## 🚀 Quick Start (5 minutes)

### Terminal 1: Backend
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate
pip install -r ../requirements.txt
python manage.py migrate
python seed_all.py
python manage.py runserver
```
✅ Backend running at http://127.0.0.1:8000

### Terminal 2: Frontend
```powershell
cd frontend
npm install
npm start
```
✅ Frontend running at http://localhost:3000

## 🔐 Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `api_check_sm` | `ApiCheck!12345` | Scrum Master (sees all) |
| `api_check_emp` | `ApiCheck!12345` | Employee (sees assigned) |

## 🎯 What to Try

1. **Create a task**: Click "+" in To Do column
2. **Drag-drop**: Move task between columns
3. **Edit task**: Click card → Edit modal
4. **View analytics**: Click "Analytics" tab → See charts
5. **Check insights**: Scroll to "AI Optimization Engine" → Read suggestions

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| 404 error on login | Backend not running → `python manage.py runserver` |
| No tasks appear | Run `python seed_all.py` in backend |
| Tasks don't persist | Check Network tab → Should see 201/200 status |
| Port 3000 in use | Kill process: `npx kill-port 3000` |
| Port 8000 in use | Use different port: `python manage.py runserver 8001` |

## 📚 Next Steps

- Read [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for full details
- Check [backend/tasks/models.py](backend/tasks/models.py) to understand data schema
- Explore [frontend/src/components/board/KanbanBoard.js](frontend/src/components/board/KanbanBoard.js) for drag-drop logic
- Review [backend/tasks/analytics.py](backend/tasks/analytics.py) for insight rules

## 💾 Database

- **Dev**: SQLite at `backend/db.sqlite3`
- **Prod-ready**: Change to PostgreSQL (psycopg2 already installed)

## 🔄 API Base URL

All requests go to: `http://127.0.0.1:8000/api/v1`

Example: `GET /api/v1/tasks/` → List all tasks

## 📊 Key Features Implemented

✅ Task CRUD (Create, Read, Update, Delete)  
✅ Kanban drag-drop board  
✅ Real-time database sync  
✅ Role-based access control  
✅ Analytics dashboard with charts  
✅ AI insights engine  
✅ Comment threads  
✅ Productivity scoring  

---

**Ready to demo?** Accounts logged in → navigate to http://localhost:3000
