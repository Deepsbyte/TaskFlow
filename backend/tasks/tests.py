from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse

from .models import User, Project, Task, TaskActivity


class TaskActivityBehaviorTests(TestCase):
	def setUp(self):
		# Users
		self.scrum = User.objects.create_user(username="scrum", email="scrum@test", password="pass", role=User.Role.SCRUM_MASTER)
		self.emp = User.objects.create_user(username="employee", email="emp@test", password="pass", role=User.Role.EMPLOYEE)

		# Project and membership
		self.project = Project.objects.create(name="P1", created_by=self.scrum)
		self.project.members.add(self.scrum)
		self.project.members.add(self.emp)

		self.client = APIClient()
		self.client.force_authenticate(self.scrum)

	def test_task_create_opens_activity(self):
		url = reverse('task-list')
		payload = {
			"title": "New Task",
			"description": "Do work",
			"project": self.project.id,
			"assigned_to_id": self.emp.id,
		}
		resp = self.client.post(url, payload, format='json')
		self.assertEqual(resp.status_code, 201)
		task_id = resp.data['id']

		activities = TaskActivity.objects.filter(task_id=task_id)
		self.assertTrue(activities.exists())
		open_activity = activities.filter(end_time__isnull=True).first()
		self.assertIsNotNone(open_activity)
		self.assertEqual(open_activity.current_status, resp.data['status'])

	def test_edit_increments_edit_count_and_status_transitions(self):
		# create task
		url = reverse('task-list')
		payload = {
			"title": "T1",
			"description": "desc",
			"project": self.project.id,
			"assigned_to_id": self.emp.id,
		}
		resp = self.client.post(url, payload, format='json')
		self.assertEqual(resp.status_code, 201)
		task_id = resp.data['id']

		# Edit title -> should increment edit_count on open activity
		detail = reverse('task-detail', args=[task_id])
		resp2 = self.client.patch(detail, {"title": "T1 updated"}, format='json')
		self.assertEqual(resp2.status_code, 200)
		open_activity = TaskActivity.objects.filter(task_id=task_id, end_time__isnull=True).first()
		self.assertIsNotNone(open_activity)
		self.assertGreaterEqual(open_activity.edit_count, 1)

		# Change status -> should close previous activity and open a new one
		old_activity = open_activity
		resp3 = self.client.patch(detail, {"status": "in_progress"}, format='json')
		self.assertEqual(resp3.status_code, 200)

		old_activity.refresh_from_db()
		self.assertIsNotNone(old_activity.end_time)
		new_activity = TaskActivity.objects.filter(task_id=task_id, end_time__isnull=True).first()
		self.assertIsNotNone(new_activity)
		self.assertEqual(new_activity.previous_status, old_activity.current_status)
