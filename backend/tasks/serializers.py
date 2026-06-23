"""
TaskFlow – Behavior Driven Task Management System
serializers.py

Serializer hierarchy:
  UserMinimalSerializer   – lightweight embed (id, username, full_name, role)
  UserSerializer          – full user profile (registration / profile update)
  ProjectSerializer       – project CRUD with nested member list
  TaskSerializer          – task CRUD with nested assignee / creator embeds
  TaskActivitySerializer  – read-only audit log records
  CommentSerializer       – task comment CRUD
"""

from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import Comment, Project, Task, TaskActivity, User


# ---------------------------------------------------------------------------
# User serializers
# ---------------------------------------------------------------------------

class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Lightweight read-only embed used wherever a user reference appears
    inside another serializer (assignee, creator, comment author, etc.).
    Avoids over-fetching sensitive fields.
    """

    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ["id", "username", "full_name", "role"]
        read_only_fields = fields

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name() or obj.username


class UserSerializer(serializers.ModelSerializer):
    """
    Full user serializer used for:
      - POST /auth/register/   → create a new user account
      - GET  /auth/me/         → retrieve own profile
      - PATCH /auth/me/        → update own profile

    ``password`` is write-only and validated against Django's AUTH_PASSWORD_VALIDATORS.
    ``productivity_score`` is read-only; it is managed by the behaviour engine, not clients.
    ``role`` defaults to 'employee' and is only writable by Scrum Masters (enforced in the view).
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )

    # Human-readable label exposed alongside the raw value
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model  = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "productivity_score",
            "password",
            "date_joined",
        ]
        read_only_fields = ["id", "productivity_score", "date_joined", "role_display"]
        extra_kwargs = {
            "email": {"required": True},
        }

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate_password(self, value: str) -> str:
        """Delegate to Django's built-in password validators."""
        validate_password(value)
        return value

    def validate_email(self, value: str) -> str:
        """Ensure email is unique at the serializer level for clearer error messages."""
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_role(self, value: str) -> str:
        """Prevent self-promotion: only valid choices allowed (view enforces who can set it)."""
        if value not in User.Role.values:
            raise serializers.ValidationError(f"'{value}' is not a valid role.")
        return value

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance: User, validated_data: dict) -> User:
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


# ---------------------------------------------------------------------------
# Project serializer
# ---------------------------------------------------------------------------

class ProjectSerializer(serializers.ModelSerializer):
    """
    Used for project CRUD.

    - ``created_by`` is auto-set to request.user in the view; read-only here.
    - ``members`` accepts a list of user PKs on write; returns minimal embeds on read.
    - ``task_count`` is a computed annotation expected from the queryset
      (added via ``annotate(task_count=Count('tasks'))`` in the view).
    """

    # Read: nested minimal objects  |  Write: list of PKs
    members = UserMinimalSerializer(many=True, read_only=True)
    member_ids = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source="members",
        required=False,
    )

    created_by = UserMinimalSerializer(read_only=True)

    # Annotated in the view queryset; falls back gracefully if absent
    task_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model  = Project
        fields = [
            "id",
            "name",
            "description",
            "created_by",
            "members",
            "member_ids",
            "task_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate_name(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Project name cannot be blank.")
        return value.strip()

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------

    def create(self, validated_data: dict) -> Project:
        # members is already resolved to User instances by PrimaryKeyRelatedField
        members = validated_data.pop("members", [])
        project = Project.objects.create(**validated_data)
        project.members.set(members)
        return project

    def update(self, instance: Project, validated_data: dict) -> Project:
        members = validated_data.pop("members", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if members is not None:
            instance.members.set(members)
        return instance


# ---------------------------------------------------------------------------
# Task serializer
# ---------------------------------------------------------------------------

class TaskSerializer(serializers.ModelSerializer):
    """
    Used for task CRUD.

    Read representation nests minimal user objects for ``assigned_to`` and
    ``created_by``; writes accept plain PKs for efficiency.

    ``is_overdue`` surfaces the model's @property so clients don't have to
    re-implement deadline logic.
    """

    # Read: nested  |  Write: PK
    assigned_to        = UserMinimalSerializer(read_only=True)
    assigned_to_id     = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source="assigned_to",
        write_only=True,
        required=False,
        allow_null=True,
    )

    created_by         = UserMinimalSerializer(read_only=True)

    # Human-readable choice labels
    priority_display   = serializers.CharField(source="get_priority_display", read_only=True)
    status_display     = serializers.CharField(source="get_status_display",   read_only=True)

    # Computed property from the model
    is_overdue         = serializers.BooleanField(read_only=True)

    # project is write-only PK on create; read representation uses project_id
    project            = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
    )

    class Meta:
        model  = Task
        fields = [
            "id",
            "title",
            "description",
            "priority",
            "priority_display",
            "status",
            "status_display",
            "deadline",
            "project",
            "assigned_to",
            "assigned_to_id",
            "created_by",
            "is_overdue",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "priority_display",
            "status_display",
            "is_overdue",
            "created_at",
            "updated_at",
        ]

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate_title(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Task title cannot be blank.")
        return value.strip()

    def validate_deadline(self, value):
        """Deadline must be today or in the future (only validated on create)."""
        if value and not self.instance and value < timezone.now().date():
            raise serializers.ValidationError("Deadline cannot be set in the past.")
        return value

    def validate(self, attrs: dict) -> dict:
        """Cross-field: assigned user must be a member of the project."""
        project     = attrs.get("project", getattr(self.instance, "project", None))
        assigned_to = attrs.get("assigned_to", getattr(self.instance, "assigned_to", None))

        if assigned_to and project:
            if not project.members.filter(pk=assigned_to.pk).exists():
                raise serializers.ValidationError(
                    {"assigned_to_id": "Assigned user must be a member of the project."}
                )
        return attrs

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------

    def create(self, validated_data: dict) -> Task:
        # created_by is injected by the view (perform_create)
        return Task.objects.create(**validated_data)

    def update(self, instance: Task, validated_data: dict) -> Task:
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ---------------------------------------------------------------------------
# TaskActivity serializer
# ---------------------------------------------------------------------------

class TaskActivitySerializer(serializers.ModelSerializer):
    """
    Read-only serializer for the audit log.

    ``TaskActivity`` records are created by the backend (signals / views) and
    should never be mutated by API clients — all fields are read-only.

    ``duration_display`` exposes the model's human-readable property (e.g. '2h 15m').
    """

    user             = UserMinimalSerializer(read_only=True)
    duration_display = serializers.CharField(read_only=True)

    # Human-readable labels for the status snapshot
    previous_status_display = serializers.CharField(
        source="get_previous_status_display", read_only=True
    )
    current_status_display  = serializers.CharField(
        source="get_current_status_display", read_only=True
    )

    class Meta:
        model  = TaskActivity
        fields = [
            "id",
            "task",
            "user",
            "previous_status",
            "previous_status_display",
            "current_status",
            "current_status_display",
            "start_time",
            "end_time",
            "duration",
            "duration_display",
            "edit_count",
            "created_at",
        ]
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Comment serializer
# ---------------------------------------------------------------------------

class CommentSerializer(serializers.ModelSerializer):
    """
    Used for comment CRUD on a task.

    - ``user`` is auto-set to request.user in the view; nested on read.
    - ``task`` is injected from the URL kwarg in the view; hidden from the
      request body using ``write_only=True`` to avoid redundancy.
    - Owners can edit/delete their own comments (enforced at the view/permission level).
    """

    user = UserMinimalSerializer(read_only=True)

    # Accepted on write but not echoed in the response body
    task = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(),
        write_only=True,
    )

    class Meta:
        model  = Comment
        fields = [
            "id",
            "task",
            "user",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    def validate_content(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Comment content cannot be empty.")
        return value.strip()

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------

    def create(self, validated_data: dict) -> Comment:
        # user is injected by the view (perform_create)
        return Comment.objects.create(**validated_data)

    def update(self, instance: Comment, validated_data: dict) -> Comment:
        # Only ``content`` is updatable; task and user are immutable after creation
        instance.content = validated_data.get("content", instance.content)
        instance.save()
        return instance
