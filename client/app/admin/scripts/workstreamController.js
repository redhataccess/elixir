'use strict';

angular.module('elixirApp')
.controller('WorkstreamIndexController', ['$scope', 'Workstream', 'Task', function($scope, Workstream, Task) {

    // add workstream form init
    $scope.showNewWorkstreamLink = true;
    $scope.workstream = {};
    $scope.workstream.color = 'red';
    $scope.workstreamNameView = true;

    $scope.modalTitle = 'Add Task';
    $scope.modalEditTaskBtn = false;
    $scope.modalAddTaskBtn = false;

    $scope.setCurrentWorkstreamId = function(id) {
        $scope.currentWorkstreamId = id;
    };

    $scope.modalCustomization = function(str, id) {
        if (str === 'add') {
            $scope.modalTitle='Add Task';
            $scope.modalAddTaskBtn = true;
            $scope.setCurrentWorkstreamId(id);

        } else if (str === 'edit') {
            $scope.modalTitle='Edit Task';
            $scope.modalEditTaskBtn = true;
            $scope.setCurrentWorkstreamId(id);
        }
    };

    // get all workstreams from the server
    $scope.items = Workstream.query();

    $scope.workstreamUpdate = function(item) {
        Workstream.update({ workstreamId: item._id }, item);
    };

    // update workstream color after colorpicker is closed
    $scope.$on('colorpicker-closed', function(event, colorObject) {
        var item = Workstream.get({ workstreamId: $scope.currentWorkstreamId}).$promise.then(function(response) {
            response.color = colorObject.value;
            $scope.workstreamUpdate(response);
        });
    });

    // workstream delete
    $scope.destroy = function(index) {

        // tell the server to remove the object
        Workstream.remove({workstreamId: $scope.items[index]._id}, function() {

            // if successful, remove the workstream from our collection
            $scope.items.splice(index, 1);
        });
    };

    // task delete
    $scope.destroyTask = function(wId, tId) {

        Task.remove({workstreamId: wId, taskId: tId}, function() {

            // if successful, remove the task from our collection
            $scope.items = Workstream.query();

        }, function(response) {
            console.log(response.data.errors);
        });
    };

    // add new workstream
    $scope.save = function() {

        // create the workstream object to send to the back-end
        var workstream = new Workstream($scope.workstream);

        // save the workstream object
        workstream.$save(function() {

            // rest form to pristine
            $scope.workstreamForm.$setPristine();

            // set the default values
            $scope.items = Workstream.query();
            $scope.workstream.color = 'red';
            $scope.workstream.name = '';
            $scope.workstream.active = 'true';

        }, function(response) {
            console.log(response.data.errors);
        });
    };

    $scope.setEditTaskOnModalWindow = function(wId, tId){

        Task.get({ workstreamId: wId , taskId: tId}).$promise.then(function(item) {

            $scope.title = item.title;
            $scope.description = item.description;
            $scope.startDate = item.startDate;
            $scope.endDevDate = item.endDevDate;
            $scope.releaseDate = item.releaseDate;
            $scope.order = item.order;
            $scope.currentWorkstreamId = wId;
            $scope.currentTaskId = tId;
        });
    };

    $scope.resetTaskForm = function() {

        // reset form
        $scope.items = Workstream.query();
        $scope.title = '';
        $scope.description = '';
        $scope.startDate = '';
        $scope.endDevDate = '';
        $scope.releaseDate = '';
        $scope.order = '';

        // reset buttons
        $scope.modalEditTaskBtn = false;
        $scope.modalAddTaskBtn = false;
    };

    var closeModalWindow = function () {
        // close modal form
        $('#addEdditTaskModal').modal('hide');

        // reset buttons
        $scope.modalEditTaskBtn = false;
        $scope.modalAddTaskBtn = false;
    };

    // update task
    $scope.updateTask = function() {

        closeModalWindow();

        // create the task object to be sent to the server
        var task = {
            title: $scope.title,
            description: $scope.description,
            startDate: $scope.startDate,
            endDevDate: $scope.endDevDate,
            releaseDate: $scope.releaseDate,
            order: $scope.order
        };

        Task.update({ workstreamId: $scope.currentWorkstreamId,  taskId: $scope.currentTaskId }, task , function() {
            $scope.items = Workstream.query();
        }, function(response) {
            console.log(response.data.errors);
        });
    };

    // add new task
    $scope.saveTask = function() {

        closeModalWindow();

        // create the task object to be sent to the server
        var task = new Task({
            title: $scope.title,
            description: $scope.description,
            startDate: $scope.startDate,
            endDevDate: $scope.endDevDate,
            releaseDate: $scope.releaseDate,
            order: $scope.order
        });

        task.$save({ workstreamId: $scope.currentWorkstreamId}, function(response) {

            $scope.items = Workstream.query();

            $scope.taskForm.$setPristine();

            // reset form
            $scope.resetTaskForm();

        }, function(response) {
            console.log(response.data.errors);
        });
    };
}]);
