app.factory('AccountService', function($http, $q) {
	
	return {
		
		get: function() {
			var defer = $q.defer(),
				url = '/api/users/';
			
			$http.get(url)
				.success(function(data, status, headers, config) {
					defer.resolve(data);
				})
				.error(function(data, status, headers, config) {
					defer.reject(status);
				});
			
			return defer.promise;
		},
		
		post: function(data) {
			var defer = $q.defer(),
				url = '/api/users/';
			
			$http.post(url, data)
				.success(function(data, status, headers, config) {
					defer.resolve(data);
				}).error(function(data, status, headers, config) {
					defer.reject(status);
				});
			
			return defer.promise;
		}
		
	};
	
});

app.factory('Authentication', ['$cookies', '$location', '$http', '$rootScope', function($cookies, $location, $http, $rootScope) {
	
	var that = null;
	
	function Authentication() {
		if (Authentication.prototype.instance) {
			return Authentication.prototype.instance;
		}
		Authentication.prototype.instance = this;
		that = this;
	};
	
	Authentication.prototype = {
		signin: function(user, pass) {
			return $http.post('/login/', {
				'username': user,
 				'password': pass
			}).then(this.signinSuccess, this.signinError);
		},
		
		signinSuccess: function(data, status, headers, config) {
			that.setAuthenticatedAccount(data.data);
			$rootScope.$broadcast('authenticated', true);
			$location.path('/');
		},
		
		signinError: function(data, status, headers, config) {
			$rootScope.$broadcast('invalidLogin', true);
			console.error('signin failure!');
		},
		
		getAuthenticatedAccount: function() {
			if (!$cookies.authenticatedAccount) {
				return;
			}
			return JSON.parse($cookies.authenticatedAccount);
		},
		
		isAuthenticated: function() {
			return !!$cookies.authenticatedAccount;
		},
		
		setAuthenticatedAccount: function(account) {
			$cookies.authenticatedAccount = JSON.stringify(account);
		},
		
		unauthenticate: function() {
			delete $cookies.authenticatedAccount;
		}
	};
	
	return Authentication;
	
}]);

app.factory('Signout', ['$cookies', '$location', '$http', 'Authentication', '$rootScope', 
                        function($cookies, $location, $http, Authentication, $rootScope) {
	
	function Signout() {
		if (Signout.prototype.instance) {
			return Signout.prototype.instance;
		}
		Signout.prototype.instance = this;
	}
	
	Signout.prototype = {
		signout: function() {
			return $http.post('/logout/')
		    	.then(this.signoutSuccess, this.signoutError);
		},
		
		signoutSuccess: function() {
			var auth = new Authentication();
			auth.unauthenticate();
			$rootScope.$broadcast('unauthenticated', true);
			$location.path('/account/signin');
		},
		
		signoutError: function() {
			console.error('signout failure!');
		}
	};
	
	return Signout;
	
}]);