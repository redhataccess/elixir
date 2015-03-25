'use strict';

var _ = require('lodash');
var CombinedStream = require('combined-stream');
var request = require("request");
var accum = require('accum');
var q = require('q');

exports.index = function (req, res) {
    console.log('index');
    var combinedStream = CombinedStream.create();


    //to validate the json data before appending, data has to be retrieve 
    //the data from request before sending it to combined-stream.
    //request is async based, hence need to use callbacks. 'q' library provides a
    //standardized way to handle callbacks via promises.
    //And promises can be chained so that after each callback is done, the data can be
    //validated and send to combined-stream. Once that is done next URL can be called and
    //the process can be repeated till all the urls are called.
    //ToDo: make urls and project names configurable
    combinedStream.append('[');
    retrieveData('http://localhost:9000/files/file1.json').then(function (data) {
        validateAndAppend(data, combinedStream, ',', 'workstream1');
        return retrieveData('http://localhost:9000/files/file2.json');
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ',', 'workstream2');
        return retrieveData('http://localhost:9000/files/file3.json');
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ',', 'workstream3');
        return retrieveData('http://localhost:9000/files/file4.json');
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ']', 'workstream4');
        
        combinedStream.pipe(accum.string({encoding: 'utf8'}, function (alldata) {
            console.log(alldata);
            return res.json(200, JSON.parse(alldata));
        }));
        
    }).fail(function (err) {
        console.error(err);
        handleError(res, err);
    }).done();
};

function handleError(res, err) {
    return res.send(500, err);
}

function retrieveData(url) {
    var deferred = q.defer();
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            deferred.resolve(body);

        } else {
            deferred.reject(error);
        }
    });
    return deferred.promise;
}

//this function validates the json data and appends it to existing data
//if json is invalid, the error message is logged on the console along with
//the work stream name
function validateAndAppend(data, combinedStream, appendChar, workStreamName) {
    if (isValidJson(data)) {
        combinedStream.append(data);
        combinedStream.append(appendChar);
    } else {
        //close the json array even if data is not valid
        //and add empty structure so that trailing commas
        //don't make the existing string invalid
        //and other valid data can be parsed
        if (appendChar === ']') {
            combinedStream.append(appendChar);
        } else {
            combinedStream.append('{ },');
        }
        console.log('recieved invalid json for project [' + workStreamName + ']');
    }
}

function isValidJson(data) {
    try {
        JSON.parse(data);
    } catch (e) {
        return false;
    }
    return true;
}