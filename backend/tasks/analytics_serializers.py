from rest_framework import serializers

class TaskStatusSummarySerializer(serializers.Serializer):
    """
    Read-only serializer for task status aggregations.
    """
    todo = serializers.IntegerField(read_only=True, default=0)
    in_progress = serializers.IntegerField(read_only=True, default=0)
    review = serializers.IntegerField(read_only=True, default=0)
    done = serializers.IntegerField(read_only=True, default=0)

class UserProductivitySerializer(serializers.Serializer):
    """
    Read-only serializer for user productivity metrics.
    """
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, read_only=True)
    productivity_score = serializers.FloatField(read_only=True, allow_null=True)
    completed_tasks = serializers.IntegerField(read_only=True)

class ProjectOverviewSerializer(serializers.Serializer):
    """
    Read-only serializer for project level aggregations.
    """
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255, read_only=True)
    total_tasks = serializers.IntegerField(read_only=True)
    completed_tasks = serializers.IntegerField(read_only=True)

class TimeAggregationSerializer(serializers.Serializer):
    """
    Read-only serializer for time-based completion trends (e.g. daily charts).
    """
    date = serializers.DateField(read_only=True)
    completed_tasks = serializers.IntegerField(read_only=True)
