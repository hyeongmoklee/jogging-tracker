import json

from django.contrib.auth import authenticate, logout, login
from django.http.response import HttpResponse
from rest_framework import viewsets, permissions, status

from account.models import UserExtend
from api.account.serializers import UserExtendSerializer, \
    UserExtendSimpleSerializer

class IsStaffOrTargetUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # allow user to list all users if logged in user is staff
        return view.action == 'retrieve' or request.user.is_staff
 
    def has_object_permission(self, request, view, obj):
        # allow logged in user to view own details, allows staff to view all records
        return request.user.is_staff or obj == request.user
    

class UserMixin(object):
    queryset = UserExtend.objects.all()
    serializer_class = UserExtendSerializer
    
    def get_permissions(self):
        return (permissions.AllowAny() if self.request.method == 'POST'
                else IsStaffOrTargetUser()),
    
    def get_queryset(self):
        username = self.request.QUERY_PARAMS.get('username', None)
        if username is not None:
            queryset = self.queryset.filter(username=username)
            return queryset
        return self.queryset
    
    def post_save(self, obj, created=False):
        """
        On creation, replace the raw password with a hashed version.
        """
        if created:
            obj.set_password(obj.password)
            obj.save()
    
    
class UserViewSet(UserMixin, viewsets.ModelViewSet):
    pass


class UserSimpleViewSet(viewsets.ModelViewSet):
    queryset = UserExtend.objects.all()
    serializer_class = UserExtendSimpleSerializer
    permission_classes = (permissions.AllowAny,)
    
    def get_queryset(self):
        username = self.request.QUERY_PARAMS.get('username', None)
        if username is not None:
            queryset = self.queryset.filter(username=username)
            return queryset
        email = self.request.QUERY_PARAMS.get('email', None)
        if email is not None:
            queryset = self.queryset.filter(email=email)
            return queryset
        return self.queryset


def login_view(request):
    params = json.loads(request.body)
    username = params['username']
    password = params['password']
    
    if username is not False and password is not False:
        user = authenticate(username=username, password=password)
    else:
        user = None
        
    if user is not None:
        if user.is_active:
            login(request, user)
            response_data = {}
            response_data['id'] = user.pk
            response_data['username'] = user.username
            response_data['full_name'] = user.full_name
            response_data['status'] = 'Authorized'
            
            return HttpResponse(json.dumps(response_data), status=status.HTTP_200_OK)
        else:
            response_data = {}
            response_data['status'] = 'Unauthorized'
            response_data['message'] = 'This account has been disabled.'
            
            return HttpResponse(json.dumps(response_data), status=status.HTTP_401_UNAUTHORIZED)
    else:
        response_data = {}
        response_data['status'] = 'Unauthorized'
        response_data['message'] = 'Username/password combination invalid.'
        
        return HttpResponse(json.dumps(response_data), status=status.HTTP_401_UNAUTHORIZED)
    

def logout_view(request):
    logout(request)
    return HttpResponse({}, status=status.HTTP_204_NO_CONTENT)