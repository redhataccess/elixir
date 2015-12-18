'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Schema = mongoose.Schema;
var workstreamSchema = new Schema({
    name: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    color: { type: String, required: true },
    tasks: [{
        title: { type: String, required: true },
        description: String,
        startDate: String,
        endDevDate: String,
        releaseDate: String,
        order: Number
    }]
});
var Workstream = mongoose.model('Workstream', workstreamSchema);

exports.all = function (cb) {
    Workstream.find(cb);
};

exports.create = function (data, cb) {
    var workstream = new Workstream(data);
    workstream.save(cb);
};

exports.update = function (id, data, cb) {
    Workstream.findByIdAndUpdate(id, data, { new: true }, cb);
};

exports.delete = function (id, cb) {
    Workstream.findByIdAndRemove(id, cb);
}

exports.findById = function (id, cb) {
    Workstream.findById(id, cb);
}
