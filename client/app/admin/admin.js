'use strict';

angular.module('elixirApp')
.config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/admin', {
            templateUrl: 'app/admin/views/index.html',
            controller: 'WorkstreamIndexController',
            reloadOnSearch: false
        });
    }
]);

