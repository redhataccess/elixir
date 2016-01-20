'use strict';

angular.module('elixirApp')
  .factory('Workstream', ['$resource', function($resource) {
      return $resource('/api/workstreams/:workstreamId',
              { workstreamId: '@workstream'},
              { get: { method: 'GET'},
                query: { method: 'GET', isArray: true },
                update: { method:'POST' }
              }
            );
  }])
  .factory('Task', ['$resource', function($resource) {
      return $resource('/api/workstreams/:workstreamId/tasks/:taskId',
              { workstreamId: '@workstream', taskId: '@task' },
              { update: { method:'POST' } }
            );
  }]);
