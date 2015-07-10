'use strict';

var app = angular.module('joggingTracker',
		['ngCookies', 'ngRoute', 'ngResource'],
		function($interpolateProvider, $httpProvider) {
	
	$interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
    
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
	
});

app.config(function($routeProvider) {
	$routeProvider
		.when('/', {
			templateUrl: 'static/js/app/views/tracker/list.html'
		})
		.when('/entry/list', {
			templateUrl: 'static/js/app/views/tracker/list.html'
		})
		.when('/entry/edit', {
			templateUrl: 'static/js/app/views/tracker/edit.html'
		})
		.when('/entry/report', {
			templateUrl: 'static/js/app/views/tracker/report.html'
		})
		.when('/account/signup', {
			templateUrl: 'static/js/app/views/account/signup.html'
		})
		.when('/account/signin', {
			templateUrl: 'static/js/app/views/account/signin.html'
		})
		.otherwise({redirectTo: '/'});
});

app.run(['$rootScope', 'Authentication', 'Signout', function($rootScope, Authentication, Signout) {
	$rootScope.$on('$routeChangeStart', function(event, newUrl, oldUrl) {
		$rootScope.invalidLogin = false;	// Clean up validation result when changing route
	});
	var auth = new Authentication();
	$rootScope.isAuthenticated = auth.isAuthenticated();
	if ($rootScope.isAuthenticated) {
		$rootScope.username = auth.getAuthenticatedAccount().full_name;
	}
	$rootScope.signout = function() {
		new Signout().signout();
	};
	$rootScope.$on('authenticated', function(event, data) {
		$rootScope.isAuthenticated = auth.isAuthenticated();
		$rootScope.username = auth.getAuthenticatedAccount().full_name;
	});
	$rootScope.$on('unauthenticated', function(event, data) {
		$rootScope.isAuthenticated = false;
		$rootScope.username = '';
	});
	$rootScope.$on('invalidLogin', function(event, isInvalid) {
		$rootScope.invalidLogin = isInvalid;
	});
	$rootScope.editEntryId = null;
}]);

app.filter('range', function() {
	return function(input, min, max) {
		min = parseInt(min);
		max = parseInt(max);
		for (var i = min; i < max; i++)
			input.push(i);
		return input;
	};
});

app.directive('passwordMatch', [ function() {
	return {
		restrict : 'A',
		scope : true,
		require : 'ngModel',
		link : function(scope, elem, attrs, control) {
			var checker = function() {
				var e1 = scope.$eval(attrs.ngModel);
				var e2 = scope.$eval(attrs.passwordMatch);
				return e1 == e2;
			};
			scope.$watch(checker, function(n) {
				control.$setValidity("unique", n);
			});
		}
	};
}]);

app.directive('ensureUnique', ['$http', '$rootScope', 'Authentication', 
                               function($http, $rootScope, Authentication) {
	return {
		require : 'ngModel',
		link : function(scope, ele, attrs, c) {
			scope.$watch(attrs.ngModel, function() {
				if (scope.$eval(attrs.ensureUnique) === undefined) {
					return;
				}
				if (attrs.name == 'username' || attrs.name == 'email') {
					var url = '/api/user_check/?' +  attrs.name + '=' + scope.$eval(attrs.ensureUnique);
				} else if (attrs.name == 'date') {
					var auth = new Authentication(),
						authenticatedAccountId = auth.getAuthenticatedAccount().id;
					var url = '/api/entry_check/?' +  attrs.name + '=' + scope.$eval(attrs.ensureUnique)
							+ '&user=' + authenticatedAccountId;
				}
				$http({
					method : 'GET',
					url : url
				}).success(function(data, status, headers, cfg) {
					if (data.count > 0) {
						if (attrs.name == 'date') {
							var results = data.results,
								id = results[0].id;
							if (id == $rootScope.editEntryId) {
								c.$setValidity('unique', true);
							} else {
								c.$setValidity('unique', false);
							}
						} else {
							c.$setValidity('unique', false);
						}
					} else {
						c.$setValidity('unique', true);
					}
				}).error(function(data, status, headers, cfg) {
					c.$setValidity('unique', false);
				});
			});
		}
	};
}]);

app.filter("myDateFilter", ['dateFilter', function(dateFilter) {
	return function(items, from, to) {
		var dateFrom = dateFilter(from, 'yyyy-MM-dd'),
			dateTo = dateFilter(to, 'yyyy-MM-dd');
		
		var state = 0;
		if (!!dateFrom) {
			state += 1;
		}
		if (!!dateTo) {
			state += 2;
		}
		if (state === 0) {
			return items;
		}
		
		var result = [];
		for (var i = 0; i < items.length; i++) {
			var date = dateFilter(items[i].date, 'yyyy-MM-dd');
			if (state === 1 && dateFrom <= date) {
				result.push(items[i]);
			}
			if (state === 2 && dateTo >= date) {
				result.push(items[i]);
			}
			if (state === 3 && dateFrom <= date && dateTo >= date) {
				result.push(items[i]);
			}
		}
		return result;
	};
}]);

