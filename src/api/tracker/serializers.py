from rest_framework import serializers

from tracker.models import TimeEntry


class TimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = ('id', 'distance', 'time', 'date', 'user')
        
    def get_validation_exclusions(self, *args, **kwargs):
        exclusions = super(TimeEntrySerializer, self).get_validation_exclusions()

        return exclusions + ['user']
    
    
class EntryCheckSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeEntry
        fields = ('id', 'user',)
        