"""
TaskFlow – Behavior Driven Task Management System
urls.py  (tasks app)

URL layout:
  /auth/register/                              → RegisterView
  /auth/login/                                 → LoginView  (JWT obtain)
  /auth/token/refresh/                         → TokenRefreshView
  /auth/me/                                    → MeView

  /projects/                                   → ProjectViewSet (list, create)
  /projects/{pk}/                              → ProjectViewSet (retrieve, update, destroy)
  /projects/{pk}/members/add/                  → ProjectViewSet.add_member
  /projects/{pk}/members/remove/               → ProjectViewSet.remove_member

  /tasks/                                      → TaskViewSet (list, create)
  /tasks/{pk}/                                 → TaskViewSet (retrieve, update, destroy)
  /tasks/{task_pk}/activities/                 → TaskActivityViewSet (list, retrieve)
  /tasks/{task_pk}/comments/                   → CommentViewSet (list, create)
  /tasks/{task_pk}/comments/{pk}/              → CommentViewSet (retrieve, update, destroy)
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from rest_framework_simplejwt.views import TokenRefreshView

from .auth import EmailOrUsernameTokenSerializer
from .views import (
    CommentViewSet,
    MeView,
    ProjectViewSet,
    RegisterView,
    TaskActivityViewSet,
    TaskViewSet,
)

# Import SimpleJWT's TokenObtainPairView and bind our custom serializer to it
from rest_framework_simplejwt.views import TokenObtainPairView

class LoginView(TokenObtainPairView):
    """
    POST /auth/login/

    Accepts { "login": "<email or username>", "password": "<password>" }.
    Returns { "access": "...", "refresh": "...", "user": { id, username, email, role } }.
    """
    serializer_class = EmailOrUsernameTokenSerializer


from .analytics import TaskStatusSummaryView, UserProductivityView, ProjectOverviewView, CompletionTrendView, InsightEngineView

# ---------------------------------------------------------------------------
# Root router – top-level resources
# ---------------------------------------------------------------------------
router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")
router.register(r"tasks",    TaskViewSet,    basename="task")

# ---------------------------------------------------------------------------
# Nested router – resources living under /tasks/{task_pk}/
# ---------------------------------------------------------------------------
tasks_router = nested_routers.NestedDefaultRouter(router, r"tasks", lookup="task")
tasks_router.register(r"activities", TaskActivityViewSet, basename="task-activity")
tasks_router.register(r"comments",   CommentViewSet,      basename="task-comment")

# ---------------------------------------------------------------------------
# URL patterns
# ---------------------------------------------------------------------------
urlpatterns = [
    # ── Auth endpoints ────────────────────────────────────────────────────
    path("auth/register/",     RegisterView.as_view(),  name="auth-register"),
    path("auth/login/",        LoginView.as_view(),     name="auth-login"),
    path("auth/token/refresh/",TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("auth/me/",           MeView.as_view(),        name="auth-me"),

    # ── Analytics endpoints ───────────────────────────────────────────────
    path("analytics/task-status-summary/", TaskStatusSummaryView.as_view(), name="analytics-task-status"),
    path("analytics/user-productivity/",   UserProductivityView.as_view(),  name="analytics-user-productivity"),
    path("analytics/project-overview/",    ProjectOverviewView.as_view(),   name="analytics-project-overview"),
    path("analytics/completion-trend/",    CompletionTrendView.as_view(),   name="analytics-completion-trend"),
    path("analytics/insights/",            InsightEngineView.as_view(),     name="analytics-insights"),

    # ── Resource endpoints ────────────────────────────────────────────────
    path("", include(router.urls)),
    path("", include(tasks_router.urls)),
]

