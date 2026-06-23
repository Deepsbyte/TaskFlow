from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Project, Task, TaskActivity, Comment


class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("username", "email", "role", "is_staff")

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Info", {"fields": ("email", "first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
        ("Extra", {"fields": ("role", "productivity_score")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2"),
        }),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(TaskActivity)
admin.site.register(Comment)