'use strict';

var _ = require('lodash');
var CombinedStream = require('combined-stream');
var request = require("request");
var accum = require('accum');
var q = require('q');
var fs = require('fs');
exports.index = function (req, res) {
    console.log('index');
    //read config file
    var config = require('./task.config');
    var combinedStream = CombinedStream.create();


    //to validate the json data before appending, data has to be retrieve 
    //the data from request before sending it to combined-stream.
    //request is async based, hence need to use callbacks. 'q' library provides a
    //standardized way to handle callbacks via promises.
    //And promises can be chained so that after each callback is done, the data can be
    //validated and send to combined-stream. Once that is done next URL can be called and
    //the process can be repeated till all the urls are called.
    
    //The project name and the corresponding url is read from task.config.json. The name
    //needs to be read from config file because if the retrieve JSON is invalid, reading the
    //workstream name from it may not be correct or in readable form. 
    //Note: workstram name is only used for logging when the received JSON is invalid.
    combinedStream.append('[');
    retrieveData(config.workstreams[0].url).then(function (data) {
        validateAndAppend(data, combinedStream, ',', config.workstreams[0].name);
        return retrieveData(config.workstreams[1].url);
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ',', config.workstreams[1].name);
        return retrieveData(config.workstreams[2].url);
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ',', config.workstreams[2].name);
        return retrieveData(config.workstreams[3].url);
    }).then(function (data) {
        validateAndAppend(data, combinedStream, ']', config.workstreams[3].name);

        combinedStream.pipe(accum.string({encoding: 'utf8'}, function (alldata) {
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
//data - JSON string to be validated
//combinedStream - CombinedStream instance
//appendChar- the character to be used when valid JSON is appended to existing data
//workStreamName - name of the workstream whose JSON data is being validated. Only used when JSON is invalid, to log the name 
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
            combinedStream.append('{}' + appendChar);
        } else {
            combinedStream.append('{ },');
        }
        console.log('recieved invalid json for workstream [' + workStreamName + ']');
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