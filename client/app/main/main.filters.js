'use strict';

angular.module('elixirApp')
.filter('selectedTags', function () {
    //first arg is input and second is tag array
    return function (tasks, addedWorkstreams) {
        return tasks.filter(function (task) {
            if (addedWorkstreams.indexOf(task.workstream) !== -1) {
                return true;
            }
            
            return false;
        });
    };
});
