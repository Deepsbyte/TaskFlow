"""
TaskFlow – Behavior Driven Task Management System
models.py

Defines the core domain models:
  - User         : Custom user extending AbstractUser (role, productivity_score)
  - Project      : Workspace grouping tasks with members
  - Task         : Core task entity with priority/status lifecycle
  - TaskActivity : Immutable audit trail for status transitions and edits
  - Comment      : Task-scoped user comments
"""

from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class User(AbstractUser):
    """
    Custom user model for TaskFlow.

    Extends Django's AbstractUser with a role field that controls permissions
    at the application layer, and an optional productivity_score that can be
    computed by the behaviour engine.
    """

    class Role(models.TextChoices):
        SCRUM_MASTER = "scrum_master", "Scrum Master"
        EMPLOYEE     = "employee",     "Employee"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE,
        db_index=True,
    )

    productivity_score = models.FloatField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0.0),
            MaxValueValidator(100.0),
        ],
        help_text="Score between 0–100, updated by the behaviour engine.",
    )

    class Meta:
        verbose_name        = "User"
        verbose_name_plural = "Users"
        ordering            = ["username"]

    def __str__(self) -> str:
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    @property
    def is_scrum_master(self) -> bool:
        return self.role == self.Role.SCRUM_MASTER

    @property
    def is_employee(self) -> bool:
        return self.role == self.Role.EMPLOYEE


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------

class Project(models.Model):
    """
    A project groups related tasks and defines team membership.

    The ``created_by`` field is nullable-on-delete (SET_NULL) so that projects
    survive the departure of their original creator.
    """

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_projects",
        help_text="User who originally created this project.",
    )

    members = models.ManyToManyField(
        User,
        related_name="projects",
        blank=True,
        help_text="Users with access to this project.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Project"
        verbose_name_plural = "Projects"
        ordering            = ["-created_at"]

    def __str__(self) -> str:
        return self.name


# ---------------------------------------------------------------------------
# Task
# ---------------------------------------------------------------------------

class Task(models.Model):
    """
    The central entity in TaskFlow.

    Every status transition should be recorded in a companion ``TaskActivity``
    record (handled in views/signals, not here) to keep models lean.
    """

    class Priority(models.TextChoices):
        LOW    = "low",    "Low"
        MEDIUM = "medium", "Medium"
        HIGH   = "high",   "High"

    class Status(models.TextChoices):
        TODO        = "todo",        "To Do"
        IN_PROGRESS = "in_progress", "In Progress"
        REVIEW      = "review",      "Review"
        DONE        = "done",        "Done"

    # Core fields
    title       = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        db_index=True,
    )

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.TODO,
        db_index=True,
    )

    deadline = models.DateField(
        null=True,
        blank=True,
        help_text="Optional target completion date.",
    )

    # Relationships
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_tasks",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Task"
        verbose_name_plural = "Tasks"
        ordering            = ["-created_at"]
        indexes = [
            # Common compound query: tasks by project + status
            models.Index(fields=["project", "status"], name="task_project_status_idx"),
            # Tasks by assignee + status (personal board view)
            models.Index(fields=["assigned_to", "status"], name="task_assignee_status_idx"),
        ]

    def __str__(self) -> str:
        return f"[{self.get_priority_display()}] {self.title} – {self.get_status_display()}"

    # ------------------------------------------------------------------
    # Convenience helpers
    # ------------------------------------------------------------------

    @property
    def is_overdue(self) -> bool:
        """True when the task has a deadline that has already passed and is not done."""
        if not self.deadline:
            return False
        return self.status != self.Status.DONE and self.deadline < timezone.now().date()


# ---------------------------------------------------------------------------
# TaskActivity
# ---------------------------------------------------------------------------

class TaskActivity(models.Model):
    """
    Immutable audit log for a task's lifecycle.

    Each record captures a single status period: from ``start_time`` to
    ``end_time``.  Duration is stored explicitly so that historical reports
    remain accurate even if start/end fields are later extended.

    ``edit_count`` tracks how many times the task body (title / description /
    priority) was modified *during* this status window, complementing the
    status-based duration metric.
    """

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="activities",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="task_activities",
        help_text="User who triggered this activity entry.",
    )

    # Status snapshot – captures the transition
    previous_status = models.CharField(
        max_length=15,
        choices=Task.Status.choices,
        blank=True,
        default="",
        help_text="Status before this activity window began.",
    )

    current_status = models.CharField(
        max_length=15,
        choices=Task.Status.choices,
        help_text="Status during this activity window.",
    )

    # Time tracking
    start_time = models.DateTimeField(default=timezone.now)
    end_time   = models.DateTimeField(null=True, blank=True)

    # Duration in seconds; auto-populated when end_time is set
    duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Time spent in this status (seconds).",
    )

    edit_count = models.PositiveIntegerField(
        default=0,
        help_text="Number of field edits made while the task held this status.",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = "Task Activity"
        verbose_name_plural = "Task Activities"
        ordering            = ["-start_time"]

    def __str__(self) -> str:
        return (
            f"Task #{self.task_id} | "
            f"{self.get_previous_status_display() or '—'} → "
            f"{self.get_current_status_display()} | "
            f"by {self.user}"
        )

    # ------------------------------------------------------------------
    # Duration auto-calculation
    # ------------------------------------------------------------------

    def save(self, *args, **kwargs) -> None:
        """
        Auto-calculate duration in seconds whenever end_time is provided.
        Preserves any manually set duration if end_time is absent.
        """
        if self.start_time and self.end_time:
            delta = self.end_time - self.start_time
            self.duration = max(0, int(delta.total_seconds()))
        super().save(*args, **kwargs)

    @property
    def duration_display(self) -> str:
        """Human-readable duration string (e.g. '2h 15m')."""
        if self.duration is None:
            return "In progress"
        hours, remainder = divmod(self.duration, 3600)
        minutes = remainder // 60
        if hours:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"


# ---------------------------------------------------------------------------
# Comment
# ---------------------------------------------------------------------------

class Comment(models.Model):
    """
    A user comment attached to a task.

    Comments are append-heavy; an ``updated_at`` field is included to support
    edit history in a future iteration without a schema change.
    """

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = "Comment"
        verbose_name_plural = "Comments"
        ordering            = ["created_at"]

    def __str__(self) -> str:
        snippet = self.content[:60].replace("\n", " ")
        return f'{self.user.username} on Task #{self.task_id}: "{snippet}..."'
