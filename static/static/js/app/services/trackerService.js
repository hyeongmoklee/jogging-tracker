app.factory('TrackerService', function($http, $q) {
	
	return {
		
		get: function() {
			var defer = $q.defer(),
				url = '/api/time_entries/';
			
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
				url = '/api/time_entries/';
			
			$http.post(url, data)
				.success(function(data, status, headers, config) {
					defer.resolve(data);
				}).error(function(data, status, headers, config) {
					defer.reject(status);
				});
			
			return defer.promise;
		},
		
		put: function(data) {
			if (!data) {
				console.log('Entry data is required');
				return;
			}
			
			var defer = $q.defer(),
				url = '/api/time_entries/' + data.id;
			
			$http.put(url, data)
				.success(function(data, status, headers, config) {
					defer.resolve(data);
				})
				.error(function(data, status, headers, config) {
					defer.reject(status);
				});
			
			return defer.promise;
		},
		
		delete: function(id) {
			if (!id) {
				console.log('Entry ID is required');
				return;
			}
			
			var defer = $q.defer(),
				url = '/api/time_entries/' + id + '/';
				
			$http.delete(url)
				.success(function(data, status, headers, config) {
					defer.resolve(data);
				})
				.error(function(data, status, headers, config) {
					defer.reject(status);
				});
			
			return defer.promise;
		},
		
	};
	
});


app.factory('Tracker', ['TrackerService',
		function(TrackerService) {
	
	function Tracker() {
		if (Tracker.prototype.instance) {
			return Tracker.prototype.instance;
		}
		Tracker.prototype.instance = this;
	}
	
	Tracker.prototype = {
		
		entryList: null,
		
		editEntry: null,
		
		deleteEntryId: null,
		
		weeklyReportEntryList: null,
		
		convertSecondsToReadableTime: function(time) {
			var hour = parseInt(time / (60 * 60), 10),
				minute = parseInt((time % (60 * 60)) / 60, 10),
				second = (time % (60 * 60)) % 60;
			
			hour = (hour < 10) ? '0' + hour : hour;
			minute = (minute < 10) ? '0' + minute : minute;
			second = (second < 10) ? '0' + second : second;
			
			return {
				'hour': hour,
				'minute': minute,
				'second': second 
			};
		},
		
		getAverageSpeed: function(distance, time) {
			var meterPerMile = 1609.34;
			var averageSpeed = (meterPerMile * distance) / time;
			averageSpeed = averageSpeed * 2.23693629;
			return averageSpeed.toFixed(2);
		},
		
		setEntryList: function(list) {
			var entryList = [];
			for (var i = 0; i < list.length; i++) {
				var entry = list[i],
					distance = parseFloat(entry.distance).toFixed(2),
					time = parseInt(entry.time, 10);
				entry.averageSpeed = this.getAverageSpeed(distance, time);
				entry.distance = distance;
				entry.time = this.convertSecondsToReadableTime(entry.time);
				entryList.push(entry);
			}
			this.entryList = entryList;
		},
		
		getEntryList: function() {
			return this.entryList;
		},
		
		getEditEntry: function() {
			return this.editEntry;
		},
		
		setEditEntry: function(id) {
			if (this.entryList === null) {
				return;
			}
			if (id === null) {
				this.editEntry = null;
				return;
			}
			for (var i = 0; i < this.entryList.length; i++) {
				var entry = this.entryList[i];
				if (id == entry.id) {
					this.editEntry = entry;
					break;
				}
			}
		},
		
		getDeleteEntryId: function() {
			return this.deleteEntryId;
		},
		
		setDeleteEntryId: function(id) {
			this.deleteEntryId = id;
		},
		
		getWeeklyReportEntryList: function() {
			return !!this.weeklyReportEntryList ? this.weeklyReportEntryList : [];
		},
		
		setWeeklyReportEntryList: function(list) {
			if (!list || list.length == 0) {
				return;
			} 
			var reportEntryList = [];
			for (var i = 0; i < list.length; i++) {
				var entry = list[i],
					date = entry.date,
					distance = entry.distance,
					time = entry.time;
				var dateSplit = date.split('-');
				var	year = parseInt(dateSplit[0], 10), month = parseInt(dateSplit[1], 10),
					day = parseInt(dateSplit[2], 10);
				var week = this.getWeekOfDay(new Date(year, month-1, day));
				var existingEntryIndex = this.weekExists(reportEntryList, week); 
				if (existingEntryIndex === false) {
					var reportEntry = {
						'week': week,
						'distance': distance,
						'time': time
					};
					reportEntry['averageSpeed'] = parseFloat(this.getAverageSpeed(reportEntry.distance, reportEntry.time)).toFixed(2);
					reportEntryList.push(reportEntry);
				} else {
					var reportEntry = reportEntryList[existingEntryIndex];
					reportEntry['distance'] = reportEntry['distance'] + distance;
					reportEntry['time'] = reportEntry['time'] + time;
					reportEntry['averageSpeed'] = parseFloat(this.getAverageSpeed(reportEntry['distance'], reportEntry['time'])).toFixed(2);
				}
			}
			
			for (var i = 0; i < reportEntryList.length; i++) {
				reportEntryList[i]['distance'] = parseFloat(reportEntryList[i]['distance']).toFixed(2); 
			}
			this.weeklyReportEntryList = reportEntryList;
		},
		
		weekExists: function(list, week) {
			if (!list || list.length == 0 || !week) {
				return false;
			}
			for (var i = 0; i < list.length; i++) {
				var entry = list[i];
				if (entry.week == week) {
					return i;
				}
			}
			return false;
		},
		
		getWeekOfDay: function(date) {
			var firstDay = new Date(date.getFullYear(), 0, 1);
		    firstDay.setDate(firstDay.getDate() + (7 - firstDay.getDay()));
		    var delta = Math.floor((date - firstDay) / (7 * 24 * 60 * 60 * 1000));
		    
		    return delta < 0 ? delta + 52 : delta;
		}
			
	};
	
	return Tracker;
	
}]);