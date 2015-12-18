'use strict';

var Workstream = require('./workstream.model');

function handleError(res, err) {
    return res.send(500, err);
}

exports.index = function (req, res) {
    Workstream.all(function (err, workstreams) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, workstreams);
    });
};

exports.create = function (req, res) {
    Workstream.create(req.body, function (err, thing) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, req.body);
    });
};

exports.delete = function (req, res) {
    Workstream.delete(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, workstream);
    });
}

exports.updateWorkstream = function (req, res) {
    Workstream.update(req.params.workstream, req.body, function (err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, workstream);
    });
};

exports.getWorkstream = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, workstream);
    });
};

exports.getWorkstreamTasks = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        return res.json(200, workstream.tasks);
    });
};

exports.saveWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function(err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        workstream.tasks.push(req.body);
        var task = workstream.tasks[workstream.tasks.length - 1];

        workstream.save(function (err) {
            if (err) {
                return res.json(400, err);
            }

            return res.json(200, task);
        })
    });
};

exports.updateWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        var task = workstream.tasks.id(req.params.task);

        if (!task) {
            return res.json(404);
        }

        var updatedTask = Object.assign(task, req.body);

        workstream.save(function (err) {
            if (err) {
                return res.json(400, err);
            }

            return res.json(200, updatedTask);
        });
    });
}

exports.deleteWorkstreamTask = function (req, res) {
    Workstream.findById(req.params.workstream, function (err, workstream) {
        if (err) {
            return res.json(400, err);
        }

        var task = workstream.tasks.id(req.params.task);

        if (!task) {
            return res.json(404);
        }

        task.remove();
        workstream.save(function (err) {
            if (err) {
                return res.json(400, err);
            }

            return res.json(200);
        });
    });
};
