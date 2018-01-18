'use strict';

angular.module('elixirApp', [
  'ngSanitize',
  'ngRoute',
  'ngTouch',
  'ngResource',
  'colorpicker.module',
  'ui.bootstrap.datetimepicker'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
