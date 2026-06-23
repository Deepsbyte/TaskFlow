import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tasks.models import Task, User, Project

# Give everyone a SCRUM_MASTER role so they can see all project tasks
for u in User.objects.all():
    u.role = User.Role.SCRUM_MASTER
    u.save()

# Get or create our main Project
project = Project.objects.filter(name='Teams in Space').first()
if not project:
    # Just grab first user as creator
    creator = User.objects.first()
    project = Project.objects.create(name='Teams in Space', created_by=creator)

# Add EVERY single user to the project members so they all see the project tasks
for u in User.objects.all():
    project.members.add(u)

# Ensure tasks exist
tasks = [
    {"title": "Engage Jupiter Express for outer solar system travel", "status": "todo", "priority": "high", "project": project},
    {"title": "Create 90 day plans for Mars Office", "status": "todo", "priority": "medium", "project": project},
    {"title": "Engage Saturn Shuttle Lines for group tours", "status": "in_progress", "priority": "low", "project": project},
    {"title": "Register with the Mars Ministry of Revenue", "status": "review", "priority": "high", "project": project},
    {"title": "Homepage footer requires inline CSS fix", "status": "done", "priority": "low", "project": project},
]

# Only create if the db is completely empty
if Task.objects.count() == 0:
    for t in tasks:
        Task.objects.create(**t)

print(f"Total tasks in DB: {Task.objects.count()}")
