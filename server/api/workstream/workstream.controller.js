'use strict';

var Workstream = require('./workstream.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    Workstream.all(function (err, workstreams) {
        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(workstreams);
    });
};

exports.create = function (req, res) {
    Workstream.create(req.body, function (err) {

        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(req.body);
    });
};

exports.delete = function (req, res) {
    Workstream.delete(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(workstream);
    });
};

exports.updateWorkstream = function (req, res) {
    Workstream.update(req.params.workstream, req.body, function (err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(workstream);
    });
};

exports.getWorkstream = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(workstream);
    });
};

exports.getWorkstreamTasks = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        return res.status(200).json(workstream.tasks);
    });
};

exports.saveWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        workstream.tasks.push(req.body);
        var task = workstream.tasks[workstream.tasks.length - 1];

        workstream.save(function (err) {
            if (err) {
                return res.status(400).json(err);
            }

            return res.status(200).json(task);
        })
    });
};

exports.updateWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.status(400).json(400);
        }

        var task = workstream.tasks.id(req.params.task);

        if (!task) {
            return res.json(404);
        }

        var updatedTask = Object.assign(task, req.body);

        workstream.save(function (err) {
            if (err) {
                return res.status(400).json(err);
            }

            return res.status(200).json(updatedTask);
        });
    });
};

exports.deleteWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.status(400).json(err);
        }

        var task = workstream.tasks.id(req.params.task);

        if (!task) {
            return res.json(404);
        }

        task.remove();
        workstream.save(function (err) {
            if (err) {
                return res.status(400).json(err);
            }

            return res.json(200);
        });
    });
};

exports.getWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.status(400).json(400);
        }

        var task = workstream.tasks.id(req.params.task);

        if (!task) {
            return res.json(404);
        }

        return res.status(200).json(task);
    });
};
