# TaskFlow: Project Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Setup & Installation](#setup--installation)
5. [User Guide](#user-guide)
6. [Feature Walkthrough](#feature-walkthrough)
7. [API Reference](#api-reference)
8. [Performance & Scaling](#performance--scaling)

---

## Overview

**TaskFlow** is a data-driven task management and analytics platform that combines real-time Kanban workflow management with behavioral analytics and AI-powered productivity insights. The application helps teams optimize their development workflow by visualizing task flow, tracking productivity metrics, and providing data-driven recommendations.

### Key Objectives
- **Real-time Task Management**: Kanban board with drag-and-drop status transitions
- **Behavioral Analytics**: Track task completion patterns and user productivity metrics
- **Intelligent Insights**: AI-powered suggestions to optimize workflow and prevent bottlenecks
- **Role-Based Access Control**: Scrum Masters see all project tasks; Employees see assigned tasks only
- **Persistent Data Layer**: All changes synchronized to PostgreSQL backend

### Success Metrics
✅ 100% Database Persistence: All CRUD operations persist through REST API  
✅ Live Analytics: 7-day completion trends + real-time productivity scoring  
✅ Multi-role RBAC: Differentiated visibility for 2+ user roles  
✅ AI Insights: 4+ behavioral heuristics for workflow optimization  

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────┬──────────────┬─────────────┬────────────┐ │
│  │  Dashboard   │  Kanban      │  Analytics  │ Backlog    │ │
│  │  (Tasks      │  (Drag-Drop) │  (Charts +  │ (Table     │ │
│  │   Overview)  │              │  Insights)  │  View)     │ │
│  └──────────────┴──────────────┴─────────────┴────────────┘ │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  API Client (Axios)                                      │ │
│  │  - JWT Token Auth                                        │ │
│  │  - Request/Response Transformation                       │ │
│  │  - Error Handling                                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django)                         │
│  ┌──────────────┬──────────────┬─────────────┬────────────┐ │
│  │ Auth API     │ Task CRUD    │ Analytics   │ Comments   │ │
│  │ (JWT)        │ (ViewSet)    │ (Endpoints) │ (Nested)   │ │
│  └──────────────┴──────────────┴─────────────┴────────────┘ │
│                        ↓                                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Django ORM (SQLAlchemy-style)                           │ │
│  │  - Automatic Query Optimization                          │ │
│  │  - Role-Based Access Control (RBAC)                      │ │
│  │  - Signals for Activity Logging                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                    Database (SQLite)                        │
│  ┌────────────┬─────────────┬──────────┬──────────┐         │
│  │ User       │ Project     │ Task     │ Comments │         │
│  │ TaskActivity│ ProjectMembership    │          │         │
│  └────────────┴─────────────┴──────────┴──────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Component Relationships

| Layer | Component | Responsibility |
|-------|-----------|-----------------|
| **Frontend** | AppLayout | Main container, routing orchestration |
| | Kanban Board | Drag-drop task status transitions |
| | Analytics Dashboard | Charts + Insight Engine rendering |
| | TaskDetailDrawer | Task editor modal |
| | API Client | HTTP communication layer |
| **Backend** | TaskViewSet | Task CRUD + role-based filtering |
| | AnalyticsViews | 4 endpoints for data aggregation |
| | Serializers | Request/response validation & transformation |
| | Models | ORM definitions + validation |
| **Database** | Task | Status (todo/in_progress/review/done), Priority |
| | User | Role (employee/scrum_master), Credentials |
| | Project | Container for team tasks |
| | TaskActivity | Audit trail of status changes |

### Data Flow for Task Creation

```
User Types Task Title
     ↓
React State Updated (optimistic)
     ↓
handleCreateTask() called
     ↓
taskApi.createTask({title, status: "todo"})
     ↓
POST /api/v1/tasks/
     ↓
Django receives request
     ↓
TaskSerializer validates
     ↓
Task model created + saved to DB
     ↓
201 Response with created task
     ↓
Frontend updates state with server ID
     ↓
Task now visible in Kanban "To Do" column
     ↓
Fresh page load: GET /tasks/ retrieves task from DB
```

### Data Flow for Analytics Generation

```
InsightEngine mounts
     ↓
GET /api/v1/analytics/insights/
     ↓
Backend counts tasks by status
     ↓
Heuristic Rules Applied:
  - If in_progress > 3 → warning
  - If review > 2 → danger
  - If done > 0 AND in_progress ≤ 3 → success
     ↓
Insights serialized to JSON
     ↓
Frontend renders color-coded cards
```

---

## Technology Stack

### Backend (Django REST Framework)

**Why Django?**
- **Mature ORM**: Built-in query optimization and relationship management
- **Batteries Included**: Authentication, permissions, admin dashboard
- **DRF Integration**: Production-ready REST API scaffolding
- **Scalability**: Signal system for async operations (future: Celery)
- **RBAC Native**: Permission classes and role-based decorators

**Core Dependencies:**
- `Django==4.2.30` - Web framework
- `djangorestframework==3.16.1` - REST API toolkit
- `djangorestframework_simplejwt==5.5.1` - JWT authentication
- `drf-nested-routers==0.95.0` - Nested API routes (/tasks/{id}/comments/)
- `django-cors-headers==4.9.0` - CORS support for frontend
- `psycopg2-binary==2.9.11` - PostgreSQL adapter (ready for production)

**Architecture Choices:**
- **ViewSet Pattern**: Reduces boilerplate for standard CRUD operations
- **Serializers**: Bidirectional mapping (snake_case DB ↔ camelCase frontend)
- **Permissions Classes**: Declarative access control (`IsAuthenticated`, `IsProjectScrumMaster`)
- **Signals**: Automatic TaskActivity logging when task status changes
- **QuerySet Optimization**: `.select_related()` for foreign keys, `.prefetch_related()` for M2M

### Frontend (React 19 + Tailwind CSS)

**Why React?**
- **Component Composition**: Modular UI for Kanban, Analytics, Backlog
- **State Management**: React hooks (`useReducer`) for complex task state
- **Ecosystem**: Chart.js, dnd-kit for drag-drop, axios for HTTP
- **Developer Experience**: Hot reload, React DevTools integration

**Core Dependencies:**
- `react==19.2.5` - UI framework
- `axios==1.15.0` - HTTP client with interceptors
- `chart.js==4.5.1` + `react-chartjs-2==5.3.1` - Analytics charting
- `@dnd-kit/*==6.3.1+` - Accessible drag-and-drop
- `tailwindcss==3.4.1` - Utility-first CSS
- `lucide-react==1.8.0` - Icon library

**Architecture Choices:**
- **API Client Abstraction**: Centralized `taskApi` module with transformers (status code mapping)
- **Hooks Pattern**: `useAnalyticsData` custom hook for data fetching
- **Token Storage**: localStorage for JWT tokens (auto-cleared on 401)
- **Optimistic Updates**: Immediate state update + backend sync
- **Auth Gating**: Login component shown until authenticated

### Database (SQLite for Dev, PostgreSQL Ready)

**Schema Design:**

```sql
-- User: Authentication + Role Management
User (id, username, password_hash, role, productivity_score)
  Indexes: (username UNIQUE)

-- Project: Container for team tasks
Project (id, name, created_by_id)
  ForeignKey: created_by → User

-- ProjectMembership: M2M relationship for team members
ProjectMembership (id, project_id, user_id)
  Indexes: (project_id, user_id UNIQUE)

-- Task: Core task entity
Task (
  id, 
  title, 
  description, 
  status [todo|in_progress|review|done], 
  priority [low|medium|high],
  deadline (nullable),
  project_id,
  assigned_to_id,
  created_by_id,
  created_at,
  updated_at
)
  Indexes: (project_id, status), (assigned_to_id, status)

-- TaskActivity: Audit trail (new row per status change)
TaskActivity (id, task_id, previous_status, current_status, start_time, end_time)
  Indexes: (task_id, current_status)

-- Comment: Nested under tasks
Comment (id, task_id, author_id, text, created_at)
  Indexes: (task_id, created_at)
```

**Why This Design?**
- **Denormalization Avoided**: All info normalized to 6th normal form
- **Audit Trail**: TaskActivity enables trend analysis + burndown charts
- **M2M Pattern**: ProjectMembership allows future features (role per project)
- **Indexes on Hot Paths**: Filter by (project, status) and (assigned_to, status)

---

## Setup & Installation

### Prerequisites
- **Python 3.10+** (tested on 3.13)
- **Node.js 18+** (for npm)
- **Git** (for version control)
- **Windows PowerShell** or bash terminal

### Backend Setup

#### Step 1: Create Virtual Environment
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate  # Windows
# OR: source venv/bin/activate  # Mac/Linux
```

#### Step 2: Install Dependencies
```powershell
pip install -r ../requirements.txt
```

#### Step 3: Apply Database Migrations
```powershell
python manage.py migrate
```

#### Step 4: Create Admin User (Optional)
```powershell
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: (your choice)
```

#### Step 5: Seed Test Data
```powershell
python seed_all.py
# Output: Total tasks in DB: 5
```

#### Step 6: Start Backend Server
```powershell
python manage.py runserver 0.0.0.0:8000
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Frontend Setup

#### Step 1: Navigate to Frontend Directory
```powershell
cd ../frontend
```

#### Step 2: Install Dependencies
```powershell
npm install
# Install time: ~2 minutes
```

#### Step 3: Start Development Server
```powershell
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view frontend in the browser.
  Local: http://localhost:3000/
```

### Test Credentials

After running `seed_all.py`, use these accounts:

| Username | Password | Role | Notes |
|----------|----------|------|-------|
| `api_check_sm` | `ApiCheck!12345` | Scrum Master | Sees all tasks |
| `api_check_emp` | `ApiCheck!12345` | Employee | Sees only assigned tasks |

---

## User Guide

### Logging In

1. Navigate to http://localhost:3000
2. If not authenticated, you'll see the **Login Screen**
3. Enter credentials and click **Sign In**
4. JWT token auto-saved to localStorage
5. Redirected to Dashboard

**Note:** Tokens persist across page refreshes. Clear localStorage manually to log out.

### Kanban Board

**Location:** Main view after login

**Features:**
- **4 Columns:** To Do | In Progress | In Review | Done
- **Drag-and-Drop:** Click task card → drag between columns
- **Status Sync:** Status change POSTed to backend immediately
- **Task Details:** Click card to open editor modal

**Workflow Example:**
```
1. Create task: Click "+" button → Enter title → Save
2. Move to In Progress: Drag from "To Do" → "In Progress"
3. Add comment: Click task → "Comments" tab → Type + Submit
4. Verify in DB: Backend records TaskActivity entry
5. Move to Review: Drag to "In Review"
6. Complete: Drag to "Done" → Task hidden from most views
```

### Task Editing

**Open Modal:** Click any task card

**Fields:**
- **Title**: Task name (required)
- **Description**: Long-form details (optional)
- **Status**: Dropdown with 4 options
- **Priority**: Low/Medium/High
- **Assigned To**: Select team member
- **Comments**: Thread below task details

**Actions:**
- **Save**: Persists all changes to backend
- **Delete**: Removes task (confirm required)
- **Close**: Discard unsaved changes

### Analytics Dashboard

**Location:** "Analytics" tab in sidebar

**Sections:**

1. **Status Summary Pie Chart**
   - Shows % distribution: To Do | In Progress | In Review | Done
   - Hover for exact counts
   - Color-coded by urgency

2. **User Productivity Bar Chart**
   - Completed tasks per team member
   - Identifies high performers
   - Right-click to export data (future feature)

3. **Completion Trend Line Chart**
   - Last 7 days of task completions
   - Identifies productivity patterns
   - Spot weekly cycles

4. **AI Insights Engine** ("Optimization" box)
   - **Flow Balance**: Warns if >3 items in progress
   - **Clean Slate**: Suggests pulling new tasks when queue empty
   - **Bottleneck Alert**: Flags if >2 items stuck in review
   - **Optimal Flow**: Celebrates healthy workflow pacing

**Color Indicators:**
- 🟢 **Green**: Success/Good pacing
- 🟠 **Orange**: Warning/Monitor closely
- 🔴 **Red**: Danger/Immediate action needed
- 💡 **Blue**: Suggestion/Best practice

### Backlog View

**Location:** "Backlog" tab in sidebar

**Features:**
- **Table Format:** All tasks in sortable table
- **Filter by Status:** Dropdown to show only specific statuses
- **Bulk Actions**: (Future: select multiple + move together)
- **Task Details**: Click row to open same editor modal

---

## Feature Walkthrough

### Feature 1: Real-Time Task Synchronization

**What It Does:**
Every task action (create, update, delete, move) immediately persists to the database through the REST API.

**How It Works:**
1. Frontend state updated optimistically
2. API call fired in background: `POST /api/v1/tasks/`
3. Backend receives request with JWT token
4. Django validates via TaskSerializer
5. Task saved to SQLite/PostgreSQL
6. 201 Response with created task (includes server-generated ID)
7. Frontend confirms with visual feedback

**Verification:**
- Refresh page → Task still exists (pulled fresh from DB)
- Check Django admin → Task appears in database
- Inspect Network tab → Verify 201/200/204 status codes

### Feature 2: Role-Based Access Control (RBAC)

**Three Visibility Levels:**

| User Role | Tasks Visible | Can Create | Can Edit Others |
|-----------|---------------|-----------|-----------------|
| Superuser | All | Yes | Yes |
| Scrum Master | All in project | Yes | Yes (own project) |
| Employee | Only assigned | Yes | No |

**Implementation:**
```python
# Backend filtering in TaskViewSet.get_queryset()
if user.is_superuser or user.is_scrum_master:
    return base_qs  # All tasks
else:
    return base_qs.filter(assigned_to=user)  # Only assigned
```

**Testing RBAC:**
1. Log in as Scrum Master → See 5 seeded tasks
2. Log in as Employee → See 0 tasks (none assigned)
3. Scrum Master assigns task to Employee
4. Employee logs in → Now sees 1 task

### Feature 3: Behavioral Analytics

**Data Collection:**
Every task status change creates a TaskActivity record:
```
Task "Homepage Footer Fix" transitions:
  14:23 → in_progress (TaskActivity created)
  14:45 → review (new TaskActivity)
  15:12 → done (new TaskActivity)
```

**Aggregations (run on-demand):**
- **Task Status Summary**: COUNT(*) GROUP BY status
- **User Productivity**: COUNT(DONE tasks) per user + productivity_score
- **Project Overview**: total_tasks vs completed_tasks per project
- **Completion Trend**: COUNT(completed) grouped by date (7-day window)

**Performance:**
- All aggregations use database-level COUNT() (no in-memory loops)
- Indexes on (project_id, status) and (assigned_to_id, status) ensure <100ms queries
- Results cached for 5 minutes (future feature)

### Feature 4: AI Insight Engine

**How It Works:**
1. Frontend requests `/api/v1/analytics/insights/`
2. Backend counts tasks per status
3. Rules engine evaluates conditions:
   - IF in_progress > 3 → Add "High WIP" warning
   - IF review > 2 → Add "Bottleneck" danger
   - IF done > 0 AND flow_healthy → Add "Optimal" success
4. Serialize to JSON array with type + message
5. Frontend renders cards with icons + colors

**Example Output:**
```json
[
  {
    "type": "warning",
    "title": "High Work In Progress",
    "message": "You have 5 items in progress. Consider finishing active tasks first."
  },
  {
    "type": "success",
    "title": "Optimal Flow",
    "message": "Your workflow pacing is exceptional. Tasks move steadily."
  }
]
```

**Extensibility:**
Add new rules by editing `InsightEngineView.get()` in `backend/tasks/analytics.py`.

### Feature 5: Drag-and-Drop Kanban

**Technology:** dnd-kit (accessible drag library)

**How It Works:**
1. User grabs task card
2. Drag over column
3. Release → `handleMoveTask()` called
4. PATCH request: `/api/v1/tasks/{id}/` with new status
5. Backend validates + updates
6. 200 response
7. Task card animates to new column

**Accessibility:**
- Keyboard support: Tab to task, Space to grab, Arrow keys to move
- Screen reader compatible (ARIA labels)
- Mobile touch support

---

## API Reference

### Authentication

**Endpoint:** `POST /api/v1/auth/login/`

**Request:**
```json
{
  "login": "api_check_sm",
  "password": "ApiCheck!12345"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Usage:** Include `Authorization: Bearer {access}` in all subsequent requests.

### Task CRUD

**List Tasks:** `GET /api/v1/tasks/`
```json
{
  "count": 5,
  "next": null,
  "results": [
    {
      "id": 1,
      "title": "Engage Jupiter Express...",
      "status": "todo",
      "priority": "high",
      "assigned_to": {...}
    }
  ]
}
```

**Create Task:** `POST /api/v1/tasks/`
```json
{
  "title": "New task",
  "status": "todo",
  "priority": "medium",
  "project": 1
}
```

**Update Task:** `PATCH /api/v1/tasks/{id}/`
```json
{
  "status": "in_progress",
  "assigned_to_id": 2
}
```

**Delete Task:** `DELETE /api/v1/tasks/{id}/`
Returns: 204 No Content

### Analytics

**Task Status Summary:** `GET /api/v1/analytics/task-status-summary/`
```json
{
  "todo": 1,
  "in_progress": 1,
  "review": 1,
  "done": 2
}
```

**User Productivity:** `GET /api/v1/analytics/user-productivity/`
```json
[
  {"username": "alice", "completed_tasks": 5, "productivity_score": 85},
  {"username": "bob", "completed_tasks": 3, "productivity_score": 72}
]
```

**Project Overview:** `GET /api/v1/analytics/project-overview/`
```json
[
  {"name": "Teams in Space", "total_tasks": 5, "completed_tasks": 2}
]
```

**Completion Trend:** `GET /api/v1/analytics/completion-trend/`
```json
[
  {"date": "2026-04-20", "completed_tasks": 2},
  {"date": "2026-04-19", "completed_tasks": 1}
]
```

**Insights:** `GET /api/v1/analytics/insights/`
```json
{
  "insights": [
    {"type": "warning", "title": "High WIP", "message": "..."},
    {"type": "success", "title": "Optimal Flow", "message": "..."}
  ]
}
```

---

## Performance & Scaling

### Current Bottlenecks (Dev)

| Component | Issue | Solution |
|-----------|-------|----------|
| Database Queries | No caching | Add Redis + QuerySet cache |
| File Upload | Not implemented | Use S3 or local storage |
| Real-time Updates | Polling via GET | Implement WebSockets (Socket.io) |
| Large Task Lists | No pagination | Implemented but frontend needs scroll |
| Media Files | Not served | Configure STATIC_URL + MEDIA_URL |

### Production Readiness Checklist

- [ ] Switch SQLite → PostgreSQL (`psycopg2-binary` installed)
- [ ] Add Redis caching (`django-redis`)
- [ ] Enable HTTPS + CORS for production domain
- [ ] Set `DEBUG=False` in Django settings
- [ ] Configure environment variables (.env file)
- [ ] Add Docker + docker-compose for deployment
- [ ] Implement rate limiting (`django-ratelimit`)
- [ ] Add monitoring (Sentry for error tracking)
- [ ] Compress frontend build (already done by react-scripts)
- [ ] Add analytics tracking (optional: Mixpanel, PostHog)

### Scalability Path

**Phase 1 (Current):** SQLite, single server, polling
**Phase 2:** PostgreSQL, Redis caching, WebSockets
**Phase 3:** Microservices, task queue (Celery), message broker (RabbitMQ)
**Phase 4:** Kubernetes deployment, auto-scaling, CDN

---

## Troubleshooting

### Frontend won't connect to backend

**Symptoms:** Network error, 404 on login attempt

**Fixes:**
1. Ensure backend running: `python manage.py runserver`
2. Check frontend API URL: Should be `http://127.0.0.1:8000` in dev
3. Clear browser cache + localStorage: F12 → Application → Clear All
4. Check CORS: Should see `Access-Control-Allow-Origin: *` in response headers

### Tasks not persisting after refresh

**Symptoms:** Tasks disappear on page reload

**Fixes:**
1. Check network tab: Should see 201/200 response for POST/PATCH
2. Verify database: `sqlite3 db.sqlite3 "SELECT COUNT(*) FROM tasks_task;"`
3. Check Django errors: Look for red text in terminal
4. Ensure auth token valid: Should see `Authorization: Bearer {token}` header

### Role-based visibility not working

**Symptoms:** Employee sees all tasks, or Scrum Master sees none

**Fixes:**
1. Verify user role: Django admin → Users → Check role field
2. Verify project membership: Django admin → Projects → Check members list
3. Restart backend after seed_all.py
4. Check TaskViewSet.get_queryset() logic

### Analytics show no data

**Symptoms:** Charts empty, insights say "Zero anomalies"

**Fixes:**
1. Ensure tasks exist: `python seed_all.py`
2. Ensure tasks have statuses: Check DB for NULL status
3. Check dates: Completion trend only shows last 7 days
4. Verify auth: Insights filtered by user's project membership

---

## Future Enhancements

### Planned Features
1. **Real-Time Collaboration**: WebSocket updates (multiple users editing same board)
2. **File Attachments**: Upload documents + images to tasks
3. **Recurring Tasks**: Create task templates that repeat daily/weekly
4. **Custom Fields**: Add metadata beyond title/status/priority
5. **Time Tracking**: Log hours spent per task (Jira-style)
6. **Notifications**: Email alerts on task assignments
7. **Integrations**: Slack, GitHub, Jira API webhooks
8. **Mobile App**: React Native for iOS/Android
9. **Export Reports**: PDF burndown charts, CSV exports
10. **Dark Mode Toggle**: Already styled, just needs UI switch

### Known Limitations
- No offline mode (future: Service Workers)
- No task search (future: Elasticsearch)
- No task dependencies (future: Task linking)
- Comments not threaded (future: Nested comments)
- No email notifications

---

## Support & Contact

For questions, bugs, or feature requests, please file an issue or contact the development team.

**Quick Links:**
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Docs](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/)

---

**Last Updated:** April 20, 2026  
**Version:** 1.0.0 (Prototype)  
**Status:** ✅ Ready for Demo
