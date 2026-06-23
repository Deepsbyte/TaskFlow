"""
TaskFlow – Behavior Driven Task Management System
views.py

ViewSet / APIView inventory:
  RegisterView          – POST /auth/register/
  MeView                – GET|PATCH /auth/me/
  ProjectViewSet        – full CRUD  /projects/
  TaskViewSet           – full CRUD  /tasks/
  TaskActivityViewSet   – read-only  /tasks/{task_pk}/activities/
  CommentViewSet        – CRUD       /tasks/{task_pk}/comments/
"""

from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction

from .models import Comment, Project, Task, TaskActivity, User
from .permissions import IsCommentOwner, IsProjectMember, IsProjectScrumMaster
from .serializers import (
    CommentSerializer,
    ProjectSerializer,
    TaskActivitySerializer,
    TaskSerializer,
    UserSerializer,
)


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

class RegisterView(CreateAPIView):
    """
    POST /auth/register/

    Open endpoint — no authentication required.
    New users are always created with the default role (Employee).
    Role assignment is a Scrum Master action done separately.
    """

    queryset         = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class MeView(RetrieveUpdateAPIView):
    """
    GET   /auth/me/  → return current user profile
    PATCH /auth/me/  → update own profile (name, email, password)

    Only Scrum Masters can change the ``role`` field; the field is silently
    stripped from the payload for Employees before validation.
    """

    serializer_class   = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names  = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user

    def partial_update(self, request, *args, **kwargs):
        # Strip 'role' changes from non-Scrum Master users
        data = request.data.copy()
        if not request.user.is_scrum_master:
            data.pop("role", None)

        serializer = self.get_serializer(
            request.user, data=data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Project ViewSet
# ---------------------------------------------------------------------------

class ProjectViewSet(viewsets.ModelViewSet):
    """
    /projects/           – list (GET), create (POST)
    /projects/{pk}/      – retrieve (GET), update (PATCH), delete (DELETE)
    /projects/{pk}/members/ – custom action to list / manage members

    Visibility  : only projects the requesting user is a member of.
    Write access: only Scrum Masters who are project members.
    """

    serializer_class   = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectScrumMaster]

    def get_queryset(self):
        """Return only projects the current user is a member of, annotated with task count."""
        return (
            Project.objects.filter(members=self.request.user)
            .annotate(task_count=Count("tasks"))
            .select_related("created_by")
            .prefetch_related("members")
            .order_by("-created_at")
        )

    def get_permissions(self):
        """
        List / retrieve are open to all authenticated members.
        Create / update / delete are restricted to Scrum Masters.
        """
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated(), IsProjectMember()]
        return [IsAuthenticated(), IsProjectScrumMaster()]

    def perform_create(self, serializer):
        """Auto-set created_by and add the creator as a member."""
        project = serializer.save(created_by=self.request.user)
        project.members.add(self.request.user)

    # ------------------------------------------------------------------
    # Custom action: member management
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="members/add")
    def add_member(self, request, pk=None):
        """
        POST /projects/{pk}/members/add/
        Body: { "user_id": <int> }

        Scrum Master only. Adds a user to the project's member list.
        """
        self._assert_scrum_master(request)
        project = self.get_object()
        user_id = request.data.get("user_id")

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        project.members.add(user)
        return Response({"detail": f"{user.username} added to project."})

    @action(detail=True, methods=["post"], url_path="members/remove")
    def remove_member(self, request, pk=None):
        """
        POST /projects/{pk}/members/remove/
        Body: { "user_id": <int> }

        Scrum Master only. Removes a user from the project.
        Cannot remove the project creator.
        """
        self._assert_scrum_master(request)
        project = self.get_object()
        user_id = request.data.get("user_id")

        if str(user_id) == str(project.created_by_id):
            return Response(
                {"detail": "Cannot remove the project creator."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        project.members.remove(user)
        return Response({"detail": f"{user.username} removed from project."})

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _assert_scrum_master(request):
        if not request.user.is_scrum_master:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only Scrum Masters can manage project members.")


# ---------------------------------------------------------------------------
# Task ViewSet
# ---------------------------------------------------------------------------

class TaskViewSet(viewsets.ModelViewSet):
    """
    /tasks/          – list (GET), create (POST)
    /tasks/{pk}/     – retrieve (GET), update (PATCH), delete (DELETE)

    Visibility rules:
      - Scrum Master → all tasks across their projects
      - Employee     → only tasks assigned to them

    Write rules:
      - Only Scrum Masters (project members) can create / update / delete tasks.
    """

    serializer_class   = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = (
            Task.objects
            .select_related("project", "assigned_to", "created_by")
            .order_by("-created_at")
        )

        # Superusers keep full visibility
        if user.is_superuser:
            return base_qs

        # Scrum Masters see tasks in projects they belong to only
        if user.is_scrum_master:
            return base_qs.filter(project__members=user).distinct()

        # Employee sees only tasks assigned to them
        return base_qs.filter(assigned_to=user)

    def get_permissions(self):
        """Employees can list/retrieve. Only Scrum Masters can write."""
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsProjectScrumMaster()]

    def perform_create(self, serializer):
        """Auto-inject created_by from the request user."""
        # Create the task and open an initial TaskActivity window
        with transaction.atomic():
            task = serializer.save(created_by=self.request.user)
            # Open a TaskActivity for the current status
            TaskActivity.objects.create(
                task=task,
                user=self.request.user,
                previous_status="",
                current_status=task.status,
            )

    def perform_update(self, serializer):
        """
        Record a TaskActivity when the status changes.
        The previous status is read from the DB before the update is saved.
        """
        old_instance = self.get_object()
        old_status = old_instance.status

        # perform update and activity handling atomically
        with transaction.atomic():
            task = serializer.save()

            new_status = task.status

            # If non-status editable fields were changed while a status window
            # is open, increment edit_count on the open activity.
            editable_fields = ("title", "description", "priority")
            changed = any(getattr(old_instance, f) != getattr(task, f) for f in editable_fields)
            if changed:
                open_activity = TaskActivity.objects.filter(task=task, end_time__isnull=True).first()
                if open_activity:
                    open_activity.edit_count = (open_activity.edit_count or 0) + 1
                    open_activity.save()

            # Handle status transition: close previous open activity and open a new one
            if old_status != new_status:
                from django.utils import timezone as tz
                open_activity = TaskActivity.objects.filter(task=task, end_time__isnull=True).first()
                if open_activity:
                    open_activity.end_time = tz.now()
                    open_activity.save()   # model.save() auto-calculates duration

                TaskActivity.objects.create(
                    task=task,
                    user=self.request.user,
                    previous_status=old_status,
                    current_status=new_status,
                )

    # ------------------------------------------------------------------
    # Filters via query params
    # ------------------------------------------------------------------

    def filter_queryset(self, queryset):
        """
        Supported query parameters:
          ?project=<id>   filter by project
          ?status=<val>   filter by status  (todo|in_progress|review|done)
          ?priority=<val> filter by priority (low|medium|high)
          ?assignee=<id>  filter by assignee (Scrum Master only)
          ?overdue=true   only tasks past their deadline and not done
        """
        qs     = super().filter_queryset(queryset)
        params = self.request.query_params

        if project_id := params.get("project"):
            qs = qs.filter(project_id=project_id)

        if task_status := params.get("status"):
            qs = qs.filter(status=task_status)

        if priority := params.get("priority"):
            qs = qs.filter(priority=priority)

        if assignee_id := params.get("assignee"):
            if self.request.user.is_scrum_master:
                qs = qs.filter(assigned_to_id=assignee_id)

        if params.get("overdue", "").lower() == "true":
            from django.utils import timezone as tz
            qs = qs.filter(
                deadline__lt=tz.now().date()
            ).exclude(status=Task.Status.DONE)

        return qs


# ---------------------------------------------------------------------------
# TaskActivity ViewSet (read-only, nested under tasks)
# ---------------------------------------------------------------------------

class TaskActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /tasks/{task_pk}/activities/       – list all activity records for a task
    GET /tasks/{task_pk}/activities/{pk}/  – retrieve a single record

    Access: any authenticated user who can see the parent task.
    """

    serializer_class   = TaskActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_pk = self.kwargs.get("task_pk")
        user    = self.request.user

        # Verify the requesting user can access the parent task
        task_qs = Task.objects.filter(pk=task_pk)
        if user.is_scrum_master:
            task_qs = task_qs.filter(project__members=user)
        else:
            task_qs = task_qs.filter(assigned_to=user)

        if not task_qs.exists():
            return TaskActivity.objects.none()

        return (
            TaskActivity.objects
            .filter(task_id=task_pk)
            .select_related("user")
            .order_by("-start_time")
        )


# ---------------------------------------------------------------------------
# Comment ViewSet (nested under tasks)
# ---------------------------------------------------------------------------

class CommentViewSet(viewsets.ModelViewSet):
    """
    GET    /tasks/{task_pk}/comments/       – list comments for a task
    POST   /tasks/{task_pk}/comments/       – add a comment
    PATCH  /tasks/{task_pk}/comments/{pk}/  – edit own comment
    DELETE /tasks/{task_pk}/comments/{pk}/  – delete own comment

    Any authenticated project member can read and create comments.
    Only the comment's author can edit or delete it.
    """

    serializer_class   = CommentSerializer
    permission_classes = [IsAuthenticated, IsCommentOwner]
    http_method_names  = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        task_pk = self.kwargs.get("task_pk")
        user    = self.request.user

        # Gate: user must be able to access the parent task
        task_qs = Task.objects.filter(pk=task_pk)
        if user.is_scrum_master:
            task_qs = task_qs.filter(project__members=user)
        else:
            task_qs = task_qs.filter(assigned_to=user)

        if not task_qs.exists():
            return Comment.objects.none()

        return (
            Comment.objects
            .filter(task_id=task_pk)
            .select_related("user")
            .order_by("created_at")
        )

    def get_permissions(self):
        """Read + create open to any task-visible user; edit/delete owner-only."""
        if self.action in ("list", "retrieve", "create"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsCommentOwner()]

    def perform_create(self, serializer):
        """
        Inject user and task from the request context.
        The ``task`` PK comes from the URL kwarg, not the request body.
        """
        task_pk = self.kwargs.get("task_pk")
        try:
            task = Task.objects.get(pk=task_pk)
        except Task.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound("Task not found.")

        serializer.save(user=self.request.user, task=task)
