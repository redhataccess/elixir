'use strict';

angular.module('elixirApp')
.controller('MainCtrl', function ($scope, $q, $log, Tasks, DateRange, GetTimespan, $rootScope, WorkStreamsData) {

    $scope.timespan = [
        { title: 'Month', value: 'M' },
        { title: 'Quarter', value: 'Q' },
        { title: 'Fiscal year', value: 'FY' },
        { title: 'Calendar year', value: 'y' }
    ];
    $scope.loading = true;
    // Set default timespan to Quarter
    $scope.timeScale = 'Q';

    $scope.tasksInRange = [];


    // Get current Quarter
    var startEndDate = GetTimespan.getFirstLastDaysOfQuarter(moment());
    $scope.startDate = startEndDate.firstDay;
    $scope.endDate = startEndDate.lastDay;

    $scope.addedWorkstreams = [];

    var reset = function () {
        DateRange.resetDates($scope.startDate, $scope.endDate);
        $scope.tasksInRange = Tasks.getTasksInRange($scope.startDate, $scope.endDate);

        $scope.$broadcast('rangeChanged');
    };

    $scope.scaleChanged = function () {

        if( $scope.timeScale === 'M') {
            $scope.startDate = GetTimespan.getFirstLastDaysOfMonth($scope.startDate).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfMonth($scope.startDate).lastDay;

        } else if ( $scope.timeScale === 'Q') {
            $scope.startDate = GetTimespan.getFirstLastDaysOfQuarter($scope.startDate).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfQuarter($scope.startDate).lastDay;

        } else if ( $scope.timeScale === 'FY') {
            $scope.startDate = GetTimespan.getFirstLastDaysOfFiscalYear($scope.endDate).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfFiscalYear($scope.endDate).lastDay;

        } else {
            $scope.startDate = GetTimespan.getFirstLastDaysOfYear($scope.startDate).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfYear($scope.startDate).lastDay;
        }

        DateRange.resetDates($scope.startDate, $scope.endDate);
        $scope.tasksInRange = Tasks.getTasksInRange($scope.startDate, $scope.endDate);

        $rootScope.$broadcast('rangeChanged');
    };

    $scope.shiftBack = function (timeScale, n) {
        if (!n) { n = 1; }
        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        $scope.startDate = moment($scope.startDate).subtract( n , timeScale);
        $scope.endDate = moment($scope.endDate).subtract( n , timeScale);

        reset();
    };

    $scope.shiftForward = function (timeScale, n) {
        if (!n) { n = 1; }
        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        $scope.startDate = moment($scope.startDate).add( n , timeScale);
        $scope.endDate = moment($scope.endDate).add( n , timeScale);

        reset();
    };

    $scope.zoomOut = function (timeScale) {

        if (timeScale === 'FY') {
            timeScale = 'y';
        }

        $scope.startDate = moment($scope.startDate).subtract( 1 , timeScale);
        $scope.endDate = moment($scope.endDate).add( 1 , timeScale);

        reset();
    };

    $scope.zoomIn = function (timeScale) {

        if (timeScale === 'FY') {
            timeScale = 'y';
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
            $scope.startDate = GetTimespan.getFirstLastDaysOfMonth(date).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfMonth(date).lastDay;

        } else if ( $scope.timeScale === 'Q') {
            $scope.startDate = GetTimespan.getFirstLastDaysOfQuarter(date).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfQuarter(date).lastDay;

        } else if ( $scope.timeScale === 'FY') {
            $scope.startDate = GetTimespan.getFirstLastDaysOfFiscalYear(date).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfFiscalYear(date).lastDay;

        } else {
            $scope.startDate = GetTimespan.getFirstLastDaysOfYear(date).firstDay;
            $scope.endDate = GetTimespan.getFirstLastDaysOfYear(date).lastDay;
        }

        reset();
    };

    $(window).on('resize', function () {
        $scope.$broadcast('rangeChanged');
    });

    $scope.showAll = function () {
        $scope.all = true;
        $scope.addedWorkstreams = [];
        angular.forEach($scope.workstreams, function (workstream) {
            workstream.selected = false;
        });
    };

    $scope.toggleAll = function (state) {
        $scope.all = state || !$scope.all;
        $scope.addedWorkstreams = ($scope.all) ? $scope.workstreams.map(function (workstream) { return workstream.name; }) : [];

        angular.forEach($scope.workstreams, function (workstream) {
            workstream.selected = $scope.all;
        });
    };

    // As all tasks are listed whem user open the page, we make
    // all button selected
    //$scope.all = true;

    $scope.filterTaskResult = function (workstream) {
        var i = $scope.addedWorkstreams.indexOf(workstream);

        if (i === -1 ) {
            $scope.all = false;
            $scope.addedWorkstreams.push(workstream);
        } else {
            $scope.addedWorkstreams.splice(i, 1);
        }

        if($scope.addedWorkstreams.length === 0) {
            $scope.all = true;
        }
    };

    var init = function () {

        DateRange.resetDates($scope.startDate, $scope.endDate);

            Tasks.ready.then(function() {
                $scope.workstreams = Tasks.activeWorkstreams;
                $scope.tasksInRange = Tasks.getTasksInRange(DateRange.startDate, DateRange.endDate);
                $scope.$broadcast('rangeChanged');

                // need to call your event handler manually if changing the model programatically
                //https://docs.angularjs.org/api/ng/directive/ngChange states that
                //The ngChange expression is only evaluated when a change in the input value causes a new value to be committed to the model.
                //It will not be evaluated if the model is changed programmatically and not by a change to the input value

                //calling it here as we are sure that workstream and task data has been retrieved
                $scope.scaleChanged();
                $scope.loading = false;

                $scope.toggleAll(true);
            });
    };

    init();

});
