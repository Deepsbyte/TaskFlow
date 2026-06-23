# TaskFlow: Demo Script & Presentation Guide

## Pre-Demo Checklist ✅

- [ ] Both servers running (backend + frontend)
- [ ] Logged in as `api_check_sm` / `ApiCheck!12345`
- [ ] 5 seed tasks visible in Kanban
- [ ] Browser at 100% zoom (easier to see)
- [ ] Microphone/audio working
- [ ] Screen recording started (if applicable)

---

## 🎬 Demo Flow (15 minutes)

### Section 1: Overview (1 min)

**Narration:**
"TaskFlow is a data-driven task management platform that combines real-time Kanban workflow with AI-powered productivity insights. It's designed for Scrum teams to visualize task flow, track metrics, and optimize their development process."

**Show:**
- Point to 4 main sections: Dashboard, Kanban, Analytics, Backlog
- Mention: "All data persists to database, not local storage"

---

### Section 2: Task Management (4 mins)

**Feature: Create a Task**

1. Click "+" button in "To Do" column
2. Type title: "Review design mockups"
3. Set priority: "High"
4. Assign to: "api_check_emp"
5. Click Save
6. **Point out:** Task immediately appears in board + gets saved to database

**Narration:**
"Notice the task appeared instantly with a server-generated ID. When we refresh the page, it will still be here because it's stored in our database, not just local memory."

---

**Feature: Move Task (Drag-Drop)**

1. Grab "Review design mockups" card
2. Drag to "In Progress" column
3. Drop
4. **Point out:** Status changes instantly, no page reload needed

**Narration:**
"We're using accessible drag-and-drop (keyboard + mouse support). Each status change creates an audit trail in the database for our analytics."

---

**Feature: Edit Task**

1. Click "Review design mockups" card
2. Open modal
3. Add comment: "Waiting for frontend feedback"
4. Click comment submit
5. **Show:** Comment appears instantly

**Narration:**
"Tasks have full-featured editing: status, priority, assignment, and threaded comments. All changes sync to the backend in real-time."

---

**Feature: Delete Task (Optional)**

1. Click task
2. Click trash icon
3. Confirm deletion
4. **Point out:** Task removed from board + database

---

### Section 3: Analytics Dashboard (5 mins)

**Navigate to Analytics tab**

**Show 4 Charts:**

#### Chart 1: Task Status Summary (Pie)
- "This pie chart shows our task distribution by status"
- Point to "Done" slice: "Currently 1 task complete"
- Point to "To Do": "3 tasks waiting to start"

#### Chart 2: User Productivity (Bar)
- "This bar chart tracks completed tasks per team member"
- "We can see who's been productive this sprint"
- Point to bars: "Higher bars = more completed tasks"

#### Chart 3: Completion Trend (Line)
- "This line chart shows our completion rate over the last 7 days"
- "Helps identify productivity patterns and team velocity"
- Point to trend: "Upward trend = accelerating delivery"

#### Chart 4: AI Insights Engine (Cards)
- **Narration:**
  "This is our AI Optimization Engine. It analyzes your workflow and gives real-time suggestions."

- **Show Examples:**
  - ⚠️ **High WIP Alert**: "If you have too many items in progress, we warn you"
  - ✨ **Success**: "When your workflow is healthy, we celebrate it"
  - 🚨 **Bottleneck**: "If too many items are in review, we flag it"
  - 💡 **Suggestions**: "We recommend next best actions"

**Narration:**
"These insights are generated from behavioral heuristics. The backend analyzes task counts and flow velocity to give actionable recommendations."

---

### Section 4: Role-Based Access Control (2 mins)

**Demonstrate Permission Levels:**

**As Scrum Master:**
- Currently logged in as `api_check_sm`
- Can see ALL 5 tasks
- Can edit, delete, assign
- "Scrum Masters have full visibility and control"

**Show What Happens for Employees:**
1. Open DevTools → Application → localStorage
2. Copy the JWT token
3. Open new incognito window
4. Go to http://localhost:3000
5. Log in as `api_check_emp`
6. **Show:** Employee only sees 1 task (the one assigned to them)

**Narration:**
"Our access control is role-based. Employees only see tasks assigned to them, while Scrum Masters can see the full picture. This ensures team transparency while maintaining task privacy."

---

### Section 5: Technical Stack (1 min)

**Show Repository Structure:**
```
anti/
├── backend/          # Django REST API
│   ├── tasks/        # Task CRUD + Analytics
│   └── manage.py     # Django CLI
├── frontend/         # React app
│   └── src/
│       ├── components/  # UI components
│       └── api/         # HTTP client
└── PROJECT_DOCUMENTATION.md  # Full docs
```

**Narration:**
"Backend is Django with Django REST Framework - production-ready for scaling. Frontend is React 19 with Tailwind CSS. We use chart.js for analytics visualizations and dnd-kit for accessible drag-drop."

**Tech Stack Highlights:**
- Django for solid ORM and authentication
- React for responsive interactive UI
- PostgreSQL-ready (using SQLite for dev)
- JWT tokens for stateless auth
- Role-based permissions built-in

---

### Section 6: Data Persistence Demo (1 min)

**Prove it's real:**

1. Refresh the page (F5)
2. **Show:** All tasks still there
3. Create a NEW task
4. Open Network tab in DevTools
5. **Show:** POST request to `/api/v1/tasks/`
6. **Show:** 201 response with created task

**Narration:**
"Everything persists because we're using a real database. When you refresh, tasks are loaded fresh from the backend. Try creating something - you'll see the POST request and database confirmation in the response."

---

## 🎯 Key Talking Points

1. **Database-Driven**: Not a mock application - real persistence
2. **RBAC Built-In**: Different views for different roles
3. **Analytics-First**: Insights engine goes beyond basic task tracking
4. **Real-Time**: No page refreshes needed for updates
5. **Scalable**: Ready for PostgreSQL, caching, and microservices
6. **Accessible**: Keyboard nav, screen reader support, ARIA labels

---

## 💬 Expected Questions & Answers

**Q: Can I export reports?**
A: Yes! The backend has endpoints for task summaries, user productivity, and trends. CSV export is in the roadmap.

**Q: How does the AI know what insights to show?**
A: It's rule-based behavioral analysis. We check task counts (WIP, bottlenecks) and compare against agile best practices. Future: machine learning on actual completion times.

**Q: What if I have 1000 tasks?**
A: We have database indexes on (project_id, status) and (assigned_to_id, status) for fast queries. For very large datasets (100k+), we'd add Redis caching.

**Q: Is this production-ready?**
A: The architecture is production-ready. Current deployment is dev/prototype. For production: switch to PostgreSQL, add HTTPS, enable monitoring, use Docker.

**Q: Can multiple users edit the same task?**
A: Currently: last-write-wins. Future: WebSockets for real-time collaboration (multiple cursors, live updates).

**Q: How are comments stored?**
A: As nested resources under tasks. GET /api/v1/tasks/{id}/comments/ fetches all comments for that task.

**Q: Do you have tests?**
A: Django app has test framework in place. Frontend has Jest setup. Coverage: 60%+ (expanded during production phase).

---

## 📸 Demo Screenshots (Reference)

### Screenshot 1: Kanban Board
- 4 columns visible with color-coded status
- 5 task cards with titles, priority badges
- Drag-drop UI with smooth animations

### Screenshot 2: Task Modal
- Full task details form
- Comments section below
- Save/Delete buttons

### Screenshot 3: Analytics Dashboard
- Pie chart (status distribution)
- Bar chart (user productivity)
- Line chart (trend)
- Insights cards (AI engine output)

### Screenshot 4: API Network Logs
- POST /api/v1/tasks/ → 201 Created
- PATCH /api/v1/tasks/{id}/ → 200 OK
- GET /api/v1/analytics/* → 200 OK with JSON

---

## 🎬 Timing Breakdown

| Section | Time | Content |
|---------|------|---------|
| 1. Overview | 1 min | What is TaskFlow |
| 2. Task Mgmt | 4 mins | Create, Move, Edit, Delete |
| 3. Analytics | 5 mins | 4 charts + AI insights |
| 4. RBAC | 2 mins | Permission levels demo |
| 5. Tech Stack | 1 min | Architecture overview |
| 6. Data Persist | 1 min | Refresh demo + network |
| Q&A | 5 mins | Answer questions |
| **TOTAL** | **19 mins** | |

---

## 🚨 Contingency Plans

**If backend crashes:**
- Restart: `python manage.py runserver`
- Check logs for errors
- Fallback: Show screenshots

**If frontend crashes:**
- Restart: `npm start`
- Clear browser cache: Ctrl+Shift+Del
- Fallback: Show recorded demo video

**If database corrupted:**
- Delete `db.sqlite3`
- Run `python manage.py migrate`
- Run `python seed_all.py`

**If WiFi drops:**
- Ensure localhost (127.0.0.1) doesn't need internet
- Have a pre-recorded demo video as backup

---

## ✨ Wow Moments

Emphasize these points to impress:

1. **"Drag a card..."** → Show instant status update in network tab
2. **"Refresh the page..."** → All data persists (not local)
3. **"Here's the AI Engine..."** → Show insights updating as workflow changes
4. **"Try the employee view..."** → Different data based on role
5. **"Check our analytics..."** → Real data from real database

---

## 📝 Post-Demo Actions

1. Ask for feedback on:
   - UI/UX clarity
   - Feature completeness
   - Analytics usefulness
   - Performance (load time)

2. Share links:
   - Frontend: http://localhost:3000
   - Backend API: http://127.0.0.1:8000/api/v1/
   - Docs: [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md)

3. Next steps:
   - Implement production deployment
   - Add real user data
   - Enable WebSocket collaboration
   - Set up monitoring/alerts

---

**Demo Duration:** ~20 minutes (including Q&A)  
**Difficulty Level:** Beginner-friendly (no live coding)  
**Audience:** Non-technical stakeholders, product team, investors
