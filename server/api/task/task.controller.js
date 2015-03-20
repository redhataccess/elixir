'use strict';

var _ = require('lodash');
var CombinedStream = require('combined-stream');
var request = require("request");
var accum = require('accum');

exports.index = function(req, res) {

  var combinedStream = CombinedStream.create();
  combinedStream.append('[');
  combinedStream.append(request('http://localhost:9000/files/file1.json'));
  combinedStream.append(',');
  combinedStream.append(request('http://localhost:9000/files/file2.json'));
  combinedStream.append(',');
  combinedStream.append(request('http://localhost:9000/files/file3.json'));
  combinedStream.append(',');
  combinedStream.append(request('http://localhost:9000/files/file4.json'));
  combinedStream.append(']');

  combinedStream.pipe(accum.string({ encoding: 'utf8'}, function (alldata) {
    return res.json(200, JSON.parse(alldata));
  }));

};

function handleError(res, err) {
  return res.send(500, err);
}
