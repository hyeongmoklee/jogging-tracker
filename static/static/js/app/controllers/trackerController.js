app.controller('TrackerController', ['$scope', '$location', '$http', 'Authentication', 'dateFilter', 'TrackerService', 'Tracker', '$filter', '$rootScope',
                                     function($scope, $location, $http, Authentication, dateFilter, TrackerService, Tracker, $filter, $rootScope) {
	
	var failureCallback = function(status) {
        console.log(status);
    };
    
    var auth = new Authentication();
    
    activate();
    
	function activate() {
		if (!auth.isAuthenticated()) {
			$location.url('/account/signin');
		}
	}
	
	var tracker = new Tracker();
	
	$scope.go2 = function(path) {
		$location.path('/entry/' + path);
	};
	
	if ($location.path() == '/' || $location.path() == '/entry/list') {
		$scope.entryList = [];
		var loadEntryList = function() {
			TrackerService.get().then(function(response) {
				var count = parseInt(response.count, 10);
				if (count >= 0) {
					tracker.setEntryList(response.results);
				}
				$scope.entryList = tracker.getEntryList();
			}, failureCallback);
		};
		
		loadEntryList();
		
		$scope.moveToEditView = function() {
			tracker.setEditEntry(null);
			$scope.go2('edit');
		};
		
		$scope.editEntry = function(id) {
			$rootScope.editEntryId = id;
			tracker.setEditEntry(id);
			$scope.go2('edit');
		};
		
		$scope.setDeleteEntry = function(id) {
			tracker.setDeleteEntryId(id);
		};
		
		$scope.deleteEntry = function() {
			var deleteEntryId = tracker.getDeleteEntryId();
			TrackerService.delete(deleteEntryId).then(function(response) {
				loadEntryList();
			}, failureCallback);
		};
	} else if ($location.path() == '/entry/edit') {
		var editEntry = tracker.getEditEntry(); 
		if (!!editEntry) {
			$scope.title = 'Edit';
			$scope.date = $filter("date")(editEntry.date, 'yyyy-MM-dd');
			$scope.distance = editEntry.distance;
			$scope.hour = parseInt(editEntry.time.hour, 10);
			$scope.minute = parseInt(editEntry.time.minute, 10);
			$scope.second = parseInt(editEntry.time.second, 10);
			$scope.addEntry = function() {
				var time = (parseInt($scope.hour, 10) * 60 * 60)
						+ (parseInt($scope.minute, 10) * 60)
						+ parseInt($scope.second, 10);
				
				var data = {
					'id': editEntry.id,
					'date': dateFilter($scope.date, 'yyyy-MM-dd'),
					'distance': $scope.distance,
					'time': time,
					'user': auth.getAuthenticatedAccount().id
				};
				
				TrackerService.put(data).then(function(response) {
					$scope.go2('list');
				}, failureCallback);
			};
		} else {
			$scope.title = 'Add';
			$scope.addEntry = function() {
				var time = (parseInt($scope.hour, 10) * 60 * 60)
						+ (parseInt($scope.minute, 10) * 60)
						+ parseInt($scope.second, 10);
				
				var data = {
					'date': dateFilter($scope.date, 'yyyy-MM-dd'),
					'distance': $scope.distance,
					'time': time,
					'user': auth.getAuthenticatedAccount().id
				};
				
				TrackerService.post(data).then(function(response) {
					$scope.go2('list');
				}, failureCallback);
			};
		}
	} else if ($location.path() == '/entry/report') {
		$scope.entryList = [];
		TrackerService.get().then(function(response) {
			var count = parseInt(response.count, 10),
				results = response.results;
			if (count >= 0) {
				tracker.setWeeklyReportEntryList(results);
			}
			$scope.entryList = tracker.getWeeklyReportEntryList();
		}, failureCallback);
	}
    
}]);