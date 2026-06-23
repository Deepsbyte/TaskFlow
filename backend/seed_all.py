import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tasks.models import Task, User, Project

# Create or retrieve Scrum Master user
sm_user = User.objects.filter(username='api_check_sm').first()
if not sm_user:
    sm_user = User.objects.create_user(
        username='api_check_sm',
        email='api_check_sm@example.com',
        password='ApiCheck!12345',
        role=User.Role.SCRUM_MASTER
    )
else:
    sm_user.role = User.Role.SCRUM_MASTER
    sm_user.save()

# Create or retrieve Employee user
emp_user = User.objects.filter(username='api_check_emp').first()
if not emp_user:
    emp_user = User.objects.create_user(
        username='api_check_emp',
        email='api_check_emp@example.com',
        password='ApiCheck!12345',
        role=User.Role.EMPLOYEE
    )
else:
    emp_user.role = User.Role.EMPLOYEE
    emp_user.save()

# Give everyone else a SCRUM_MASTER role so they can see all project tasks
for u in User.objects.exclude(username='api_check_emp'):
    u.role = User.Role.SCRUM_MASTER
    u.save()

# Get or create our main Project
project = Project.objects.filter(name='Teams in Space').first()
if not project:
    project = Project.objects.create(name='Teams in Space', created_by=sm_user)

# Add all users to project
for u in User.objects.all():
    project.members.add(u)

# Ensure tasks exist
tasks = [
    {"title": "Engage Jupiter Express for outer solar system travel", "status": "todo", "priority": "high", "project": project, "assigned_to": emp_user},
    {"title": "Create 90 day plans for Mars Office", "status": "todo", "priority": "medium", "project": project, "assigned_to": emp_user},
    {"title": "Engage Saturn Shuttle Lines for group tours", "status": "in_progress", "priority": "low", "project": project, "assigned_to": sm_user},
    {"title": "Register with the Mars Ministry of Revenue", "status": "review", "priority": "high", "project": project, "assigned_to": emp_user},
    {"title": "Homepage footer requires inline CSS fix", "status": "done", "priority": "low", "project": project, "assigned_to": sm_user},
]

# Only create if the db has no tasks
if Task.objects.count() == 0:
    for t in tasks:
        Task.objects.create(**t)

print(f"Total tasks in DB: {Task.objects.count()}")
print("Seeding completed successfully!")

