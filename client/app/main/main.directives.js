'use strict';

angular.module('elixirApp')
.directive('tasksList', ['$window', 'DateRange' ,function ($window, DateRange) {
    return {
        restrict: 'A',
        scope: {
            task: '=info'
        },
        template:
        '<div class="task-container">' +
            '<div class="task-track">' +
                '<div class="task-wrapper">' +
                    '<div class="task-title-wrapper noselect">' +
                        '<span>{{task.title}}</span>' +
                    '</div>' +
                    '<div class="end-dev-to-release-line"></div>' +
                    '<div class="start-dev-point"></div>' +
                    '<div class="end-dev-point"></div>' +
                    '<div class="release-point"></div>' +
                '</div>' +
            '</div>' +
        '</div>',
        link: function (scope, element) {
            var startDevPointElem,
                endDevPointElem,
                releasePointElem,
                taskTitleElem,
                taskLineElem,
                taskWrapper,
                startDevPointLeftPosition,
                endDevPointLeftPosition,
                releasePointLeftPosition,
                color,
                taskWidth,
                lineWidth;

            startDevPointElem = element[0].querySelector('.start-dev-point');
            endDevPointElem = element[0].querySelector('.end-dev-point');
            releasePointElem = element[0].querySelector('.release-point');
            taskTitleElem = element[0].querySelector('.task-title-wrapper');
            taskLineElem = element[0].querySelector('.end-dev-to-release-line');
            taskWrapper = element[0].querySelector('.task-wrapper');

            var positionTaskTextBox = function (taskWidth, left) {
                $(taskTitleElem).css({
                    'left': left + 'px',
                    'background-color': color,
                    'width': taskWidth + 'px'
                });
            };

            var positionTaskLine = function (lineWidth, left) {
                $(taskLineElem).css({
                    'left': left + 'px',
                    'background-color': color,
                    'width': lineWidth + 'px'
                });
            };

            var positionStartPoint = function (startDevPointLeftPosition) {
                $(startDevPointElem).css({
                    'border-color': color,
                    'left': startDevPointLeftPosition + 'px'
                });
            };

            var positionEndPoint = function (endDevPointLeftPosition) {
                $(endDevPointElem).css({
                    'border-color': color,
                    'left': endDevPointLeftPosition + 'px'
                });
            };

            var positionReleasePoint = function (releasePointLeftPosition) {
                $(releasePointElem).css({
                    'border-color': color,
                    'background-color': color,
                    'left': releasePointLeftPosition + 'px'
                });
            };

            var refresh = function () {

                var noDays = DateRange.getNoDays();
                var columnWidth = $window.innerWidth / noDays;
                var startDate = DateRange.getStartDate();
                var wrapper = $(element[0].querySelector('.task-title-wrapper'));
                var span = $(element[0].querySelector('span'));
                var buffer = 10;

                startDevPointLeftPosition = moment(scope.task.startDate).diff(startDate, 'days') * columnWidth;
                endDevPointLeftPosition = moment(scope.task.endDevDate).diff(startDate, 'days') * columnWidth;
                releasePointLeftPosition = moment(scope.task.releaseDate).diff(startDate, 'days') * columnWidth;
                color = scope.task.color;

                taskWidth = parseInt(moment(scope.task.endDevDate).diff(scope.task.startDate, 'days')) * columnWidth;
                lineWidth = parseInt(moment(scope.task.releaseDate).diff(scope.task.endDevDate, 'days')) * columnWidth;

                positionTaskTextBox(taskWidth, startDevPointLeftPosition);
                positionTaskLine(lineWidth, endDevPointLeftPosition);
                positionStartPoint(startDevPointLeftPosition);
                positionEndPoint(endDevPointLeftPosition);
                positionReleasePoint(releasePointLeftPosition);

                if (wrapper.offset().left > 0) {
                    span.offset({
                        left: 'auto'
                    });
                } else {
                    if (wrapper.offset().left + wrapper.width() < span.width()) {
                        span.offset({
                            left: wrapper.offset().left + wrapper.width() - span.width() + buffer
                        });
                    } else {
                        span.offset({
                            left: buffer
                        });
                    }
                }
            };

            taskWrapper.addEventListener('mouseenter', function (event) {
                scope.$emit('showHint', {
                    element: this,
                    xPos: event.clientX,
                    yPos: event.clientY
                });
            });

            taskWrapper.addEventListener('mouseleave', function () {
                scope.$emit('hideHint');
            });

            refresh();

            scope.$on('rangeChanged', refresh);
        }
    };
}])
.directive('taskInfo', function () {
    return {
        restrict: 'E',
        template:
            '<div class="task-info hidden">' +
                '<div class="task-info-arrow" ng-class="direction"></div>' +
                '<div class="task-info-inner ng-binding">' +
                    '<h5>{{task.title}}</h5>' +
                    '<b>Start:</b> {{task.startDate | date:"yyyy-MM-dd" }}<br><b>Finish:</b> {{task.endDevDate | date:"yyyy-MM-dd"}}<br><b>Release:</b> {{task.releaseDate | date:"yyyy-MM-dd"}}' +
                    '<br>{{task.description}}' +
                '</div>' +
            '</div>',
        replace: true,
        controller: function ($scope) {
            $scope.$on('showHint', function (event) {
                $scope.$apply(function () {
                    $scope.task = event.targetScope.task;
                });
            });
        },
        link: function (scope, element) {
            scope.$on('showHint', function (event, data) {
                var $taskWrapper = $(angular.element(data.element)),

                    $infoArrow = $(element[0].querySelector('.task-info-arrow')),
                    left = data.xPos,
                    buffer = 15,
                    top = $taskWrapper.offset().top + buffer - window.scrollY;

                $(element[0]).removeClass('hidden');

                if (top + $(element[0]).height() > $(window).height()) {
                    top = $taskWrapper.offset().top - $(element[0]).outerHeight(true) - buffer - window.scrollY;
                    scope.direction = 'bottom';
                    $infoArrow.css('top', $(element[0]).outerHeight(true) - buffer);
                } else {
                    scope.direction = 'top';
                    $infoArrow.css('top', 0);
                }

                $(element[0]).css({
                    'left': left,
                    'top': top
                });

                scope.$apply();
            });

            scope.$on('hideHint', function () {
                $(element[0]).addClass('hidden');
            });
        }
    };
})
.directive('timelineHeader', ['$window', 'DateRange' ,function ($window, DateRange) {
    return {
        restrict: 'A',
        template:
            '<div class="month"></div>',
        link: function (scope, element) {

            var refresh = function () {
                var noDays = DateRange.getNoDays();
                var columnWidth = $window.innerWidth / noDays;
                var inHTML = '';
                var firstDayOfMonthArray = DateRange.firstDayOfMonthArray();

                for (var i = 0, len = noDays; i < len; i++) {
                    if( firstDayOfMonthArray[i] ) {
                        inHTML = inHTML + '<div style="width: ' + columnWidth + 'px;left: ' + columnWidth * i  + 'px;border-color: #000;">' + moment(firstDayOfMonthArray[i]).format('MMM YYYY') + '</div>';
                    }
                }

                element[0].querySelector('.month').innerHTML = inHTML;
            };

            scope.$on('rangeChanged', refresh);
        }
    };
}])
.directive('timelineGrid', ['$window', 'DateRange' ,function ($window, DateRange) {
    return {
        restrict: 'A',
        link: function (scope, element) {

            var refresh = function () {
                var noDays = DateRange.getNoDays();
                var columnWidth = $window.innerWidth / noDays;
                var inHTML = '';
                var firstDayOfWeekArray = DateRange.firstDayOfWeekArray();

                for (var i = 0, len = noDays; i < len; i++) {
                    if(firstDayOfWeekArray[i]) {
                        inHTML = inHTML + '<div style="width: ' + columnWidth + 'px;left: ' + columnWidth * i  + 'px;border-color: grey;"></div>';
                    } else {
                        inHTML = inHTML + '<div style="width: ' + columnWidth + 'px;left: ' + columnWidth * i  + 'px;"></div>';
                    }
                }
                element[0].innerHTML = inHTML;

            };

            scope.$on('rangeChanged', refresh);
        }
    };
}])
.directive('today', [ '$window', 'DateRange',function ($window, DateRange) {
    return {
        restrict: 'A',
        link: function (scope, element) {

            var refresh = function () {
                var today = moment(),
                    startDate  = DateRange.getStartDate(),
                    endDate = DateRange.getEndDate(),
                    inHTML = '';

                if( today.isAfter(startDate) && today.isBefore(endDate) ) {

                    var noDays = DateRange.getNoDays(),
                        columnWidth = $window.innerWidth / noDays,
                        i = moment(today).diff(startDate, 'days');

                    inHTML = '<div class="today" style="left: ' + columnWidth * i  + 'px;"></div>';

                } else {
                    inHTML = '';
                }
                element[0].innerHTML = inHTML;
            };

            scope.$on('rangeChanged', refresh);
        }
    };
}])

/*
 * handle the drag of the timeline which will call shiftBack
 * and shiftForward to update the date range of the timeline.
 *
 * one interesting note, we pass true as the third parameter
 * (dontUpdateQueryString) in shiftBack and shiftForward in the
 * move callback so we don't continually update the query string
 * params for startDate and endDate. when the user is done
 * dragging, we'll then update the query string start and end dates.
 */
.directive('headerDrag', ['$swipe' ,function ($swipe) {
    return {
        restrict: 'A',
        link: function (scope, ele) {
            var start;
            $swipe.bind (ele, {
                'start': function (coords) {
                    start = coords.x;
                },
                'move': function (coords) {
                    if (start < coords.x) {
                        scope.shiftBack('day', null, true);
                        scope.$apply();
                    } else {
                        scope.shiftForward('day', null, true);
                        scope.$apply();
                    }
                },
                'end': function () {
                    scope.updateQueryStringDates();
                    scope.$apply();
                }
            });
        }
    };
}]);
