from django.conf.urls import patterns, url, include
from rest_framework.routers import DefaultRouter

from api.account.views import UserViewSet, UserSimpleViewSet
from api.tracker.views import TimeEntryViewSet, EntryCheckViewSet


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'user_check', UserSimpleViewSet)
router.register(r'time_entries', TimeEntryViewSet)
router.register(r'entry_check', EntryCheckViewSet)

urlpatterns = patterns('',
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
)
    
