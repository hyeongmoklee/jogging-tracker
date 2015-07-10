from rest_framework import serializers
from rest_framework.fields import Field

from account.models import UserExtend


class UserExtendSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserExtend
        fields = ('id', 'username', 'password', 'full_name', 'email', 'date_joined')
        
        
class UserExtendSimpleSerializer(serializers.ModelSerializer):
    exists = Field(source='user_exists')
    class Meta:
        model = UserExtend
        fields = ('exists',)
