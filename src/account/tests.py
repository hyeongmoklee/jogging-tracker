import json

from django.test.client import Client
from django.test.testcases import LiveServerTestCase
from requests.models import json_dumps


class AccountTest(LiveServerTestCase):
    
    fixtures = ['user_davidlee', 'user_freemoky',]
    
    def setUp(self):
        super(AccountTest, self).setUp()
        self.client = Client()
        
    def test_should_user_signin(self):
        postdata = {'username': 'davidlee', 'password': 'ahfmsek'}
        response = self.client.post('/login/', json_dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 200, 'Signing in user')
        data = json.loads(response.content)
        self.assertEquals(data['status'], 'Authorized')
        self.assertEquals(data['id'], 2)
        self.assertEquals(data['full_name'], 'David Lee')
        print('Logged in successfully')
        
    def test_should_user_signout(self):
        postdata = {'username': 'davidlee', 'password': 'ahfmsek'}
        response = self.client.post('/login/', json_dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 200, 'Signing in user')
        data = json.loads(response.content)
        self.assertEquals(data['status'], 'Authorized')
        self.assertEquals(data['id'], 2)
        self.assertEquals(data['full_name'], 'David Lee')
        response = self.client.post('/logout')
        self.assertEquals(response.status_code, 301, 'No content')
        print('Logged out successfully')
        
    def test_should_check_user_id_exists(self):
        response = self.client.get('/api/user_check/?username=davidlee')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEquals(data['count'], 1)
        self.assertEquals(data['results'][0]['exists'], True)
        print('User checked successfully')
        
    def test_should_check_email_exists(self):
        response = self.client.get('/api/user_check/?email=freemoky@gmail.com')
        self.assertEquals(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEquals(data['count'], 1)
        self.assertEquals(data['results'][0]['exists'], True)
        print('Email checked successfully')
        
    def test_should_prevent_user_from_accessing_others(self):
        postdata = {'username': 'davidlee', 'password': 'ahfmsek'}
        response = self.client.post('/login/', json_dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 200, 'Signing in user')
        data = json.loads(response.content)
        self.assertEquals(data['status'], 'Authorized')
        self.assertEquals(data['id'], 2)
        self.assertEquals(data['full_name'], 'David Lee')
        response = self.client.get('/api/users/3/')
        self.assertEquals(response.status_code, 403, 'Trying to access the detail of another user')
        print('An account of another user is secured')
        
        