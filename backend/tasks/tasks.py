"""
Celery tasks for TaskFlow async job processing.
"""

from celery import shared_task
from django.db.models import Count
from .models import User, Task


@shared_task
def compute_user_productivity():
    """
    Compute productivity_score for all users based on completed tasks.
    Runs on a schedule (see CELERY_BEAT_SCHEDULE in settings).
    
    Simple heuristic:
      - 5 points per completed task (capped at 100)
      - Can be extended with time-in-status and other metrics
    """
    users = User.objects.all()
    updated_count = 0
    
    for user in users:
        completed_tasks = Task.objects.filter(
            assigned_to=user,
            status=Task.Status.DONE
        ).count()
        
        # Simple heuristic: 5 points per completed task (capped)
        score = min(100, completed_tasks * 5)
        
        if user.productivity_score != score:
            user.productivity_score = score
            user.save(update_fields=['productivity_score'])
            updated_count += 1
    
    return f"Updated productivity scores for {updated_count} users"


@shared_task
def close_stale_activities(max_age_hours=24):
    """
    Close TaskActivity records that have been open for too long
    (e.g., 24+ hours) without a status change, to prevent
    inflated duration metrics.
    
    Useful as a maintenance task to clean up hung activities.
    """
    from django.utils import timezone
    from datetime import timedelta
    from .models import TaskActivity
    
    cutoff_time = timezone.now() - timedelta(hours=max_age_hours)
    stale = TaskActivity.objects.filter(
        end_time__isnull=True,
        start_time__lt=cutoff_time
    )
    
    count = stale.count()
    stale.update(end_time=timezone.now())
    
    return f"Closed {count} stale activity records"
