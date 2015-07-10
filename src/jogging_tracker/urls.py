from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'tracker.views.main', name='main'),
    url(r'^api/', include('api.urls', namespace='api')),
    url(r'^login/', 'api.account.views.login_view', name='login'),
    url(r'^logout/', 'api.account.views.logout_view', name='logout'),
)
