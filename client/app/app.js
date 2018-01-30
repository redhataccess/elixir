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
    .when('/', {
      templateUrl: 'app/main/main.html',
      controller: 'MainCtrl',
      reloadOnSearch: false
    })
    .when('/admin', {
          templateUrl: 'app/admin/views/index.html',
          controller: 'WorkstreamIndexController',
          reloadOnSearch: false
    })
    .otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
