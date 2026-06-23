from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Task, User, Project, TaskActivity
from .analytics_serializers import (
    TaskStatusSummarySerializer,
    UserProductivitySerializer,
    ProjectOverviewSerializer,
    TimeAggregationSerializer
)

class TaskStatusSummaryView(APIView):
    """
    Returns total task counts grouped by status.
    /api/v1/analytics/task-status-summary/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Task.objects.all()
        
        # Enforce RBAC
        if user.is_scrum_master:
            qs = qs.filter(project__members=user)
        else:
            qs = qs.filter(assigned_to=user)

        # Optimize DB Query: aggregate counts in DB
        counts = qs.values('status').annotate(count=Count('id'))
        
        # Format as { "todo": 5, "in_progress": 2 }
        data = {item['status']: item['count'] for item in counts}
        
        # Ensure all statuses exist even if count is 0
        for choice in Task.Status.choices:
            status_key = choice[0]
            if status_key not in data:
                data[status_key] = 0
                
        serializer = TaskStatusSummarySerializer(instance=data)
        return Response(serializer.data)


class UserProductivityView(APIView):
    """
    Returns users' productivity scores and completed tasks count.
    /api/v1/analytics/user-productivity/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.is_scrum_master:
            users_qs = User.objects.filter(projects__members=user).distinct()
        else:
            users_qs = User.objects.filter(id=user.id)
            
        data = users_qs.annotate(
            completed_tasks=Count('assigned_tasks', filter=Q(assigned_tasks__status=Task.Status.DONE))
        ).values('id', 'username', 'productivity_score', 'completed_tasks')

        serializer = UserProductivitySerializer(instance=list(data), many=True)
        return Response(serializer.data)


class ProjectOverviewView(APIView):
    """
    Returns project completion statistics.
    /api/v1/analytics/project-overview/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        projects = Project.objects.filter(members=user).annotate(
            total_tasks=Count('tasks'),
            completed_tasks=Count('tasks', filter=Q(tasks__status=Task.Status.DONE))
        ).values('id', 'name', 'total_tasks', 'completed_tasks')
        
        serializer = ProjectOverviewSerializer(instance=list(projects), many=True)
        return Response(serializer.data)

class CompletionTrendView(APIView):
    """
    Returns time-based aggregations (tasks completed per day)
    /api/v1/analytics/completion-trend/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        days_ago = timezone.now() - timedelta(days=7)
        
        # Base query for TaskActivity moving TO Done status
        qs = TaskActivity.objects.filter(
            current_status=Task.Status.DONE,
            start_time__gte=days_ago
        )
        
        # Enforce RBAC
        if user.is_scrum_master:
            qs = qs.filter(task__project__members=user)
        else:
            qs = qs.filter(task__assigned_to=user)

        # TruncDate uses DB native truncation for group by date
        trend_data = (qs
            .annotate(date=TruncDate('start_time'))
            .values('date')
            .annotate(completed_tasks=Count('id'))
            .order_by('date')
        )
        
        serializer = TimeAggregationSerializer(instance=list(trend_data), many=True)
        return Response(serializer.data)

class InsightEngineView(APIView):
    """
    Returns behavioral heuristics and productivity advice based on Task flow.
    /api/v1/analytics/insights/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        insights = []

        if user.is_scrum_master:
            qs = Task.objects.filter(project__members=user)
        else:
            qs = Task.objects.filter(assigned_to=user)
            
        todo_count = qs.filter(status=Task.Status.TODO).count()
        inprogress_count = qs.filter(status=Task.Status.IN_PROGRESS).count()
        review_count = qs.filter(status=Task.Status.REVIEW).count()
        done_count = qs.filter(status=Task.Status.DONE).count()
        
        # Strategy 1: Flow balancing
        if inprogress_count > 3:
            insights.append({
                "type": "warning", 
                "title": "High Work In Progress",
                "message": f"You currently have {inprogress_count} items in progress. Agile principles suggest finishing active tasks before pulling new ones to minimize cognitive context switching."
            })
        elif inprogress_count == 0 and todo_count > 0:
            insights.append({
                "type": "success", 
                "title": "Clean Slate",
                "message": "Your active queue is clear. It is an optimal time to pull a new high-priority issue from the TO DO column."
            })
            
        # Strategy 2: Bottleneck Detection
        if review_count > 2:
            insights.append({
                "type": "danger", 
                "title": "Review Bottleneck",
                "message": f"There are {review_count} tickets bottlenecking in CODE REVIEW. Consider pairing with a team member to unblock the pipeline."
            })
            
        # Strategy 3: Behavioral Pacing
        if done_count > 0 and inprogress_count <= 3 and review_count <= 2:
            insights.append({
                "type": "info", 
                "title": "Optimal Flow",
                "message": "Your current workflow pacing is exceptional. Tasks are moving steadily without piling up."
            })

        if not insights:
            insights.append({
                "type": "info", 
                "title": "Data Gathering",
                "message": "Keep interacting with the board! The Insight Engine is currently analyzing your behavioral patterns to provide optimizations."
            })

        return Response({"insights": insights})
