"""
TaskFlow – Behavior Driven Task Management System
permissions.py

Custom DRF permission classes:
  IsScrumMaster         – request.user.role == 'scrum_master'
  IsProjectMember       – user is in project.members
  IsProjectScrumMaster  – user is scrum_master AND a member of the project
  IsCommentOwner        – comment.user == request.user
"""

from rest_framework.permissions import BasePermission, IsAuthenticated, SAFE_METHODS

from .models import Project, User


class IsScrumMaster(BasePermission):
    """
    Allows access only to users with the Scrum Master role.
    Safe methods (GET, HEAD, OPTIONS) are also allowed for authenticated users.
    """

    message = "Only Scrum Masters can perform this action."

    def has_permission(self, request, view) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == User.Role.SCRUM_MASTER


class IsProjectMember(BasePermission):
    """
    Object-level: allows access only if the request user is a member of the
    project associated with the object (Project or Task).
    """

    message = "You must be a member of this project to access it."

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        # obj can be a Project or a Task
        project = obj if isinstance(obj, Project) else getattr(obj, "project", None)
        if project is None:
            return False

        return project.members.filter(pk=request.user.pk).exists()


class IsProjectScrumMaster(BasePermission):
    """
    Object-level: allows write access only if the user is a Scrum Master AND
    a member of the related project.  Read access is granted to all project members.
    """

    message = "Only the project's Scrum Master can modify this resource."

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user or not request.user.is_authenticated:
            return False

        project = obj if isinstance(obj, Project) else getattr(obj, "project", None)
        if project is None:
            return False

        is_member = project.members.filter(pk=request.user.pk).exists()

        if request.method in SAFE_METHODS:
            return is_member

        return is_member and request.user.role == User.Role.SCRUM_MASTER


class IsCommentOwner(BasePermission):
    """
    Object-level: only the user who created a comment can edit or delete it.
    Read access is open to any authenticated project member (enforced upstream).
    """

    message = "You can only edit or delete your own comments."

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True
        return obj.user == request.user
