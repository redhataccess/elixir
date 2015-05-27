'use strict';

angular.module('elixirApp', [
  'ngCookies',
  'ngSanitize',
  'ngRoute',
  'ngTouch'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
