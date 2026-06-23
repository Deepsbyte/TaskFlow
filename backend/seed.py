import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from tasks.models import Task, User, Project

smoketest_user = User.objects.filter(username='smoketest_user').first()
if not smoketest_user:
    smoketest_user = User.objects.create_user(username='smoketest_user', password='Str0ng!Pass#99', role='sm')

project = Project.objects.filter(name='Teams in Space').first()
if not project:
    project = Project.objects.create(name='Teams in Space', created_by=smoketest_user)
    project.members.add(smoketest_user)

Task.objects.all().delete()

tasks = [
    {"title": "Engage Jupiter Express for outer solar system travel", "status": "todo", "priority": "high", "project": project, "assigned_to": smoketest_user},
    {"title": "Create 90 day plans for Mars Office", "status": "todo", "priority": "medium", "project": project, "assigned_to": smoketest_user},
    {"title": "Engage Saturn Shuttle Lines for group tours", "status": "in_progress", "priority": "low", "project": project, "assigned_to": smoketest_user},
    {"title": "Register with the Mars Ministry of Revenue", "status": "review", "priority": "high", "project": project, "assigned_to": smoketest_user},
    {"title": "Homepage footer requires inline CSS fix", "status": "done", "priority": "low", "project": project, "assigned_to": smoketest_user},
]

for t in tasks:
    Task.objects.create(**t)

print("Tasks created successfully!")
