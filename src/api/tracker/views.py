from rest_framework import viewsets, permissions

from api.tracker.serializers import TimeEntrySerializer, EntryCheckSerializer
from tracker.models import TimeEntry


class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    queryset = TimeEntry.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        user = self.request.user
        if user is not None:
            queryset = self.queryset.filter(user=user).order_by('-date')
        else:
            queryset = self.queryset.none()
        return queryset    
    
    
class EntryCheckViewSet(viewsets.ModelViewSet):
    serializer_class = EntryCheckSerializer
    queryset = TimeEntry.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        date = self.request.QUERY_PARAMS.get('date', None)
        user = self.request.QUERY_PARAMS.get('user', None)
        if date is not None and user is not None:
            queryset = self.queryset.filter(date=date, user=user)
        else:
            queryset = self.queryset.none()
        return queryset