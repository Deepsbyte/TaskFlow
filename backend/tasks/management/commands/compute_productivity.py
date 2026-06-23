from django.core.management.base import BaseCommand
from django.db.models import Count
from tasks.models import User, Task


class Command(BaseCommand):
    help = "Compute a simple productivity score for each user and store it on the User.productivity_score field."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Don't persist changes, just print computed scores.")

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)

        users = User.objects.all()
        for user in users:
            completed_tasks = Task.objects.filter(assigned_to=user, status=Task.Status.DONE).count()

            # Very simple heuristic: 5 points per completed task (capped)
            score = min(100, completed_tasks * 5)

            if dry_run:
                self.stdout.write(f"User {user.username}: completed={completed_tasks} -> score={score}")
            else:
                user.productivity_score = score
                user.save(update_fields=["productivity_score"])
                self.stdout.write(f"Saved {user.username}: {score}")
