'use strict';

angular.module('elixirApp')
.factory('DateRange', function () {
    moment().startOf('isoWeek');

    var noDays,
        firstDayOfWeek,
        firstDayOfMonth,
        startDate,
        endDate;

    var getNoDays = function () {
        return noDays;
    };

    var getStartDate = function () {
        return startDate;
    };

    var getEndDate = function () {
        return endDate;
    };

    var firstDays = function (startDate, noDays) {
        firstDayOfWeek = [];
        firstDayOfMonth = [];
        for(var i = 0; i < noDays; i++) {

            if(startDate.day() === 1) {
                firstDayOfWeek.push(startDate);
            } else {
                firstDayOfWeek.push(0);
            }

            if(startDate.get('date') === 1) {
                firstDayOfMonth.push(startDate);
            } else {
                firstDayOfMonth.push(0);
            }

            startDate = moment(startDate).add(1, 'day');
        }
    };

    var getFirstDayOfWeek = function () {
        return firstDayOfWeek;
    };

    var getFirstDayOfMonth = function () {
        return firstDayOfMonth;
    };

    var resetDates = function (newStartDate, newEndDate) {
        startDate = newStartDate;
        endDate = newEndDate;
        noDays = moment(endDate).diff(startDate, 'days');
        firstDays(startDate, noDays);
    };

    resetDates(startDate, endDate);

    return {
        startDate: startDate,
        endDate: endDate,
        noDays: noDays,
        getNoDays: getNoDays,
        getStartDate: getStartDate,
        getEndDate: getEndDate,
        resetDates: resetDates,
        firstDayOfWeekArray: getFirstDayOfWeek,
        firstDayOfMonthArray: getFirstDayOfMonth
    };
})

.factory('Tasks', function (DateRange, WorkStreamsData, $log) {

    var activeWorkstreams = [],
        startDate = DateRange.getStartDate(),
        endDate = DateRange.getEndDate(),
        tasksInRange = [],
        allTasks = [];

    // Populate the two array of activeWorkstreams and allTasks
    var build = function (workstreamList) {

        for( var i = 0, workstreamlenght = workstreamList.length; i < workstreamlenght; i++ ){
            if(workstreamList[i]==undefined || workstreamList[i].tasks==undefined){
                        continue;
            }
            var taskLength = workstreamList[i].tasks.length;
            if( workstreamList[i].active === true ) {
                var workstream = {};
                workstream.name = workstreamList[i].name;
                workstream.color = workstreamList[i].color;
                activeWorkstreams.push(workstream);
                for( var j = 0; j < taskLength; j++ ) {
                    var task = workstreamList[i].tasks[j];
                    task.color = workstreamList[i].color;
                    task.workstream = workstreamList[i].name;
                    allTasks.push(task);
                }
            }
        }
    };

    var getTasksInRange = function (startDate, endDate) {
        tasksInRange = [];

        //In our date range we want tasks equal and after start date and equal and
        //before start date. Moment.js api isAfter and isBefore, doesn't calculate
        //equal for us, Because of that, we expand our range by 2 days
        startDate = moment(startDate).subtract(2, 'day');
        endDate = moment(endDate).add(2, 'day');

        for( var i = 0, allTasksLenght = allTasks.length; i < allTasksLenght; i++ ){
            var task = allTasks[i];
            if (moment(task.startDate).isAfter(startDate) && moment(task.startDate).isBefore(endDate)) {
                tasksInRange.push(task);
            } else if (moment(task.releaseDate).isAfter(startDate) && moment(task.releaseDate).isBefore(endDate)) {
                tasksInRange.push(task);
            } else if (moment(task.startDate).isBefore(startDate) && moment(task.releaseDate).isAfter(endDate)) {
                tasksInRange.push(task);
            }
        }

        return tasksInRange;
    };

    function logAndRethrow(error) {
      $log.error(error);
      throw error;
    };

    var ready = WorkStreamsData.getWorkStreamsData().then(function(result) {
        build(result);
    }).then(null, logAndRethrow);

    return {
        ready : ready,
        getTasksInRange : getTasksInRange,
        activeWorkstreams : activeWorkstreams
    };
});

angular.module('elixirApp')
.factory('GetTimespan', function () {

    var getFirstLastDaysOfMonth = function (date) {
        return {
                    firstDay: moment(date).startOf('month'),
                    lastDay: moment(date).endOf('month')
                };
    };

    var getFirstLastDaysOfQuarter = function (date) {

        // Fiscal quarter starts on March
        var firstLastDays = {
                                firstDay: moment(date).startOf('quarter'),
                                lastDay: moment(date).endOf('quarter')
                            };

        return firstLastDays;
    };

    var getFirstLastDaysOfFiscalQuarter = function (date) {

        // Fiscal quarter starts on March
        var firstLastDays;

        // Get month number. Starts with 0.
        var month = parseInt(date.get('month'));

        if ( month > 1 &&  month < 5 ) {

            // First fiscal quarter
            firstLastDays = {
                                firstDay: moment(date).month(2).startOf('month'),
                                lastDay: moment(date).month(4).endOf('month')
                            };
        } else if ( month > 4 && month < 8 ) {

            // Second fiscal quarter
            firstLastDays = {
                                firstDay: moment(date).month(5).startOf('month'),
                                lastDay: moment(date).month(7).endOf('month')
                            };
        } else if ( month > 7 && month < 11 ) {

            // Third fiscal quarter
            firstLastDays = {
                                firstDay: moment(date).month(8).startOf('month'),
                                lastDay: moment(date).month(10).endOf('month')
                            };
        } else if ( month === 11 || month < 2 ) {

            // Last fiscal quarter month 0 last fiscal from last year - month 11 last this year
            firstLastDays = {
                                firstDay: moment(date).month(11).startOf('month'),
                                lastDay: moment(date).month(1).endOf('month').add(1, 'years')
                            };
        }

        return firstLastDays;
    };

    var getFirstLastDaysOfFiscalYear = function (date) {

        // Get month number. Starts with 0.
        var firstLastDays;
        var month = date.get('month');

        if ( month > 1 ) {

            firstLastDays = {
                                firstDay: moment(date).month(2).startOf('month'),
                                lastDay: moment(date).month(1).endOf('month').add(1, 'years')
                            };
        } else {
            firstLastDays = {
                                firstDay: moment(date).month(2).startOf('month').subtract(1, 'years'),
                                lastDay: moment(date).month(1).endOf('month')
                            };
        }

        return firstLastDays;
    };

    var getFirstLastDaysOfYear = function (date) {
        return {
                    firstDay: moment(date).startOf('year'),
                    lastDay: moment(date).endOf('year')
                };
    };

    return {
        getFirstLastDaysOfMonth: getFirstLastDaysOfMonth,
        getFirstLastDaysOfQuarter: getFirstLastDaysOfQuarter,
        getFirstLastDaysOfFiscalYear: getFirstLastDaysOfFiscalYear,
        getFirstLastDaysOfFiscalQuarter: getFirstLastDaysOfFiscalQuarter,
        getFirstLastDaysOfYear: getFirstLastDaysOfYear
    };
});

angular.module('elixirApp')
  .factory('WorkStreamsData', ['$http', '$log', '$q', function($http, $log, $q) {
    return {
      getWorkStreamsData : function() {
        var deferred = $q.defer();
        $http.get('/api/workstreams')
          .success(function(result) {
            deferred.resolve(result);
          })
          .error(function(reason){
            deferred.reject(reason);
            $log.error('Request Failed: ', reason);
          });
        return deferred.promise;
      }
    };
  }]);
