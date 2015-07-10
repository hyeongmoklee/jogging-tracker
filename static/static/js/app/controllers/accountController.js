app.controller('AccountController', ['$scope', '$location', '$http', 'AccountService', 'Authentication',
                                     function($scope, $location, $http, AccountService, Authentication) {
	
	var failureCallback = function(status) {
        console.log(status);
    };
    
    var auth = new Authentication();
    
    activate();
    
	function activate() {
		if (auth.isAuthenticated()) {
			$location.url('/');
		}
	}
    
	$scope.signup = function() {
		var data = {
			'username': $scope.username,
			'password': $scope.password,
			'full_name': $scope.full_name,
			'email': $scope.email,
		};
		AccountService.post(data).then(function(response) {
			if (!!response) {
				auth.signin($scope.username, $scope.password);
			}
 		}, failureCallback);
	};
	
	$scope.signin = function() {
		auth.signin($scope.username, $scope.password);
	};

}]);