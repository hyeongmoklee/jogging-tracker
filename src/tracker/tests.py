import json

from django.test.client import Client
from django.test.testcases import LiveServerTestCase
from requests.models import json_dumps


class TrackerTest(LiveServerTestCase):
    
    fixtures = ['user_davidlee', 'user_freemoky',]
    
    def setUp(self):
        super(TrackerTest, self).setUp()
        self.client = Client()
        logged_in = self.client.login(username='davidlee', password='ahfmsek')
        self.assertEquals(logged_in, True)
        print('User logged in')
        
    def tearDown(self):
        super(TrackerTest, self).tearDown()
        logged_out = self.client.logout()
        self.assertEquals(logged_out, None)
        print('User logged out')
        
    def test_should_add_entry(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation');
        data = json.loads(response.content)
        print('An entry added: %s' % data)
        
    def test_should_return_403_when_add_entry_without_credentials(self):
        logged_out = self.client.logout()
        self.assertEquals(logged_out, None)
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 403, 'Tried to create an entry without credentials');
        print('time_entries post API is secured')
        
    def test_should_update_entry(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        putdata = {'distance': 50, 'time': 43200, 'date': '2014-12-22', 'user': 2}
        response = self.client.put('/api/time_entries/%s/' % data['id'], json_dumps(putdata), content_type='application/json')
        self.assertEquals(response.status_code, 200, 'Time entry udpate')
        data = json.loads(response.content)
        self.assertEquals(data['time'], 43200)
        self.assertEquals(data['distance'], 50)
        print('An entry updated: %s' % data)
        
    def test_should_return_403_when_update_entry_without_credentials(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        
        logged_out = self.client.logout()
        self.assertEquals(logged_out, None)
        
        putdata = {'distance': 50, 'time': 43200, 'date': '2014-12-22', 'user': 2}
        response = self.client.put('/api/time_entries/%s/' % data['id'], json_dumps(putdata), content_type='application/json')
        self.assertEquals(response.status_code, 403, 'Time entry udpate')
        print('time_entries put API is secured')
        
    def test_should_delete_entry(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        response = self.client.delete('/api/time_entries/%s/' % data['id'])
        self.assertEquals(response.status_code, 204)
        print('An entry deleted')
        
    def test_should_return_403_when_delete_entry_without_credentials(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        
        logged_out = self.client.logout()
        self.assertEquals(logged_out, None)
        
        response = self.client.delete('/api/time_entries/%s/' % data['id'])
        self.assertEquals(response.status_code, 403)
        
        print('time_entries delete API is secured')
        
    def test_should_check_entry_exists(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        entry_id = data['id']
        user = data['user']
        response = self.client.get('/api/entry_check/?date=%s&user=%s' % (data['date'], user))
        self.assertEquals(response.status_code, 200, 'Checking if entry exists')
        data = json.loads(response.content)
        self.assertEquals(data['count'], 1, 'Checking the count of the existing entry')
        result = data['results'][0]
        self.assertEquals(result['id'], entry_id, 'Checking the entry ID fetched from server')
        self.assertEquals(result['user'], user, 'Checking the User ID fetched from server')
        
    def test_should_return_403_entry_check_without_credentials(self):
        postdata = {'distance': 100, 'time': 86400, 'date': '2014-12-22', 'user': 2}
        response = self.client.post('/api/time_entries/', json.dumps(postdata), content_type='application/json')
        self.assertEquals(response.status_code, 201, 'A time entry creation')
        data = json.loads(response.content)
        user = data['user']
        
        logged_out = self.client.logout()
        self.assertEquals(logged_out, None)
        
        response = self.client.get('/api/entry_check/?date=%s&user=%s' % (data['date'], user))
        self.assertEquals(response.status_code, 403, 'Checking the possibility of api use without credentials')
        print('entry_check API is secured')
        
    def test_should_return_404_when_trying_to_see_records_of_others(self):
        response = self.client.get('/api/time_entries/3/')  # An entry registered by another user
        self.assertEquals(response.status_code, 404, 'Trying to access a record added by another user')
        print('A record of another user is secured')
        
