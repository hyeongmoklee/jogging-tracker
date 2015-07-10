from django.db import models
from account.models import UserExtend

class TimeEntry(models.Model):
    distance = models.FloatField(null=False, blank=False) # Mile
    time = models.IntegerField(max_length=10, null=False, blank=False) # Second
    date = models.DateField(auto_now_add=False, null=False)
    user = models.ForeignKey(UserExtend)
