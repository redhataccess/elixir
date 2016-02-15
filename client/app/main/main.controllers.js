'use strict';

angular.module('elixirApp')
.controller('MainCtrl', ['$scope', '$q', '$log', '$location', '$routeParams', 'Tasks', 'DateRange', 'GetTimespan', '$rootScope', function ($scope, $q, $log, $location, $routeParams, Tasks, DateRange, GetTimespan, $rootScope) {

    $scope.timespan = [
        { title: 'Month', value: 'M' },
        //{ title: 'Quarter', value: 'Q' },
        { title: 'Quarter', value: 'FQ' }, // we renamed Fiscal quarter to Quarter
        { title: 'Fiscal year', value: 'FY' },
        { title: 'Calendar year', value: 'y' }

    ];
    $scope.loading = true;
    // Set default timespan to Fiscal Quarter
    $scope.timeScale = 'FQ';

    $scope.tasksInRange = [];


    // Get current Quarter
    var startEndDate = GetTimespan.getFirstLastDaysOfFiscalQuarter(moment());

    $scope.startDate = startEndDate.firstDay;
    $scope.endDate = startEndDate.lastDay;

    $scope.addedWorkstreams = [];

    var reset = function (dontUpdateQueryString) {
        DateRange.resetDates($scope.startDate, $scope.endDate);
        $scope.tasksInRange = Tasks.getTasksInRange($scope.startDate, $scope.endDate);

        $scope.$broadcast('rangeChanged');

        if (!dontUpdateQueryString) {
            $scope.updateQueryStringDates();
        }
    };

    $scope.updateQueryStringDates = function () {
        $location.search('startDate', $scope.startDate);
        $location.search('endDate', $scope.endDate);
    };

    $scope.scaleChanged = function () {

        if( $scope.timeScale === 'M') {
            var firstLastDaysOfMonth = GetTimespan.getFirstLastDaysOfMonth($scope.startDate);
            $scope.startDate = firstLastDaysOfMonth.firstDay;
            $scope.endDate = firstLastDaysOfMonth.lastDay;

        } else if ( $scope.timeScale === 'FQ') {
            var firstLastDaysOfFiscalQuarter = GetTimespan.getFirstLastDaysOfFiscalQuarter($scope.startDate);
            $scope.startDate = firstLastDaysOfFiscalQuarter.firstDay;
            $scope.endDate = firstLastDaysOfFiscalQuarter.lastDay;

        } else if ( $scope.timeScale === 'Q') {
            var firstLastDaysOfQuarter = GetTimespan.getFirstLastDaysOfQuarter($scope.startDate);
            $scope.startDate = firstLastDaysOfQuarter.firstDay;
            $scope.endDate = firstLastDaysOfQuarter.lastDay;

        } else if ( $scope.timeScale === 'FY') {
            var firstLastDaysOfFiscalYear = GetTimespan.getFirstLastDaysOfFiscalYear($scope.endDate);
            $scope.startDate = firstLastDaysOfFiscalYear.firstDay;
            $scope.endDate = firstLastDaysOfFiscalYear.lastDay;

        } else if ( $scope.timeScale === 'y') {
            var firstLastDaysOfYear = GetTimespan.getFirstLastDaysOfYear($scope.startDate);
            $scope.startDate = firstLastDaysOfYear.firstDay;
            $scope.endDate = firstLastDaysOfYear.lastDay;
        }

        $location.search('timeScale', $scope.timeScale);

        reset();
    };

    $scope.shiftBack = function (timeScale, n, dontUpdateQueryString) {
        if (!n) { n = 1; }
        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        if (timeScale === 'FQ') {
            timeScale = 'Q';
        }

        $scope.startDate = moment($scope.startDate).subtract( n , timeScale);
        $scope.endDate = moment($scope.endDate).subtract( n , timeScale);

        reset(dontUpdateQueryString);
    };

    $scope.shiftForward = function (timeScale, n, dontUpdateQueryString) {
        if (!n) { n = 1; }
        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        if (timeScale === 'FQ') {
            timeScale = 'Q';
        }

        $scope.startDate = moment($scope.startDate).add( n , timeScale);
        $scope.endDate = moment($scope.endDate).add( n , timeScale);

        reset(dontUpdateQueryString);
    };

    $scope.zoomOut = function (timeScale) {

        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        if (timeScale === 'FQ') {
            timeScale = 'Q';
        }

        $scope.startDate = moment($scope.startDate).subtract( 1 , timeScale);
        $scope.endDate = moment($scope.endDate).add( 1 , timeScale);

        reset();
    };

    $scope.zoomIn = function (timeScale) {

        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        if (timeScale === 'FQ') {
            timeScale = 'Q';
        }

        var newStart = moment($scope.startDate).add( 1 , timeScale),
            newEnd = moment($scope.endDate).subtract( 1 , timeScale);

        // Make sure start date is before end date
        if (newStart.isBefore(newEnd)) {

            $scope.startDate = moment($scope.startDate).add( 1 , timeScale);
            $scope.endDate = moment($scope.endDate).subtract( 1 , timeScale);

            reset();
        }
    };

    $scope.today = function () {

        var date = moment();
        if( $scope.timeScale === 'M') {
            var firstLastDaysOfMonth = GetTimespan.getFirstLastDaysOfMonth(date);
            $scope.startDate = firstLastDaysOfMonth.firstDay;
            $scope.endDate = firstLastDaysOfMonth.lastDay;

        } else if ( $scope.timeScale === 'FQ') {
            var firstLastDaysOfFiscalQuarter = GetTimespan.getFirstLastDaysOfFiscalQuarter(date);
            $scope.startDate = firstLastDaysOfFiscalQuarter.firstDay;
            $scope.endDate = firstLastDaysOfFiscalQuarter.lastDay;

        } else if ( $scope.timeScale === 'Q') {
            var firstLastDaysOfQuarter = GetTimespan.getFirstLastDaysOfQuarter(date);
            $scope.startDate = firstLastDaysOfQuarter.firstDay;
            $scope.endDate = firstLastDaysOfQuarter.lastDay;

        } else if ( $scope.timeScale === 'FY') {
            var firstLastDaysOfFiscalYear = GetTimespan.getFirstLastDaysOfFiscalYear(date);
            $scope.startDate = firstLastDaysOfFiscalYear.firstDay;
            $scope.endDate = firstLastDaysOfFiscalYear.lastDay;

        } else if ( $scope.timeScale === 'y') {
            var firstLastDaysOfYear = GetTimespan.getFirstLastDaysOfYear(date);
            $scope.startDate = firstLastDaysOfYear.firstDay;
            $scope.endDate = firstLastDaysOfYear.lastDay;
        }

        reset();
    };

    $(window).on('resize', function () {
        $scope.$broadcast('rangeChanged');
    });

    $scope.toggleAll = function (state) {
        $scope.all = state || !$scope.all;
        $scope.addedWorkstreams = ($scope.all) ? $scope.workstreams.map(function (workstream) { return workstream.name; }) : [];

        angular.forEach($scope.workstreams, function (workstream) {
            workstream.selected = $scope.all;
        });
    };

    $scope.filterTaskResult = function (workstream) {
        var i = $scope.addedWorkstreams.indexOf(workstream);

        if (i === -1 ) {
            $scope.addedWorkstreams.push(workstream);
        } else {
            $scope.addedWorkstreams.splice(i, 1);
        }

        if ($scope.addedWorkstreams.length === $scope.workstreams.length) {
            $scope.all = true;
        } else {
            $scope.all = false;
        }
    };

    /*
     * keep an eye on all of the workstreams and update the ws query
     * string parameter to reflect the selected workstreams
     */
    $scope.$watch('addedWorkstreams', function (newValue, oldValue) {
        if (newValue.length > 0) {
            $location.search('ws', newValue.join(','));
        }

        if (newValue.length === 0 && oldValue.length > 0) {
            $location.search('ws', null);
        }
    }, true);

    /*
     * load all of the workstreams then set the state of the application based
     * on the query string parameters. we'll be looking to set the state of the
     * selected workstreams, the timeline and the selected timeline buttons
     */
    var init = function () {
        Tasks.ready.then(function() {
            var selectedWorkstreams = 0;

            $scope.workstreams = Tasks.activeWorkstreams;

            if ($location.search().startDate) {
                $scope.startDate = moment(new Date($location.search().startDate));
            }

            if ($location.search().endDate) {
                $scope.endDate = moment(new Date($location.search().endDate));
            }

            if ($location.search().timeScale) {
                $scope.timeScale = $location.search().timeScale;
            }

            reset();

            // need to call your event handler manually if changing the model programatically
            //https://docs.angularjs.org/api/ng/directive/ngChange states that
            //The ngChange expression is only evaluated when a change in the input value causes a new value to be committed to the model.
            //It will not be evaluated if the model is changed programmatically and not by a change to the input value

            $scope.loading = false;

            if ($location.search().ws) {
                $scope.addedWorkstreams = $location.search().ws.split(',');

                angular.forEach($scope.workstreams, function (workstream) {
                    if ($location.search().ws.indexOf(workstream.name) > -1) {
                        workstream.selected = true;
                        selectedWorkstreams += 1;
                    }
                });

                if (selectedWorkstreams === $scope.workstreams.length) {
                    $scope.all = true;
                }
            } else {
                $scope.toggleAll(true);
            }
        });
    };

    init();

}]);
