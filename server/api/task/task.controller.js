'use strict';

var request = require("request");
var q = require('q');
var config = require('./task.config');
var promises = [];

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

function isValidJson(data) {
    try {
        JSON.parse(data);
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
}

exports.index = function (req, res) {

    config.workstreams.forEach(function(item) {
        promises.push(retrieveData(item.url));
    });

    q.allSettled(promises).then(function(result) {
        var alldata = [];

        //loop through array of promises -> create an array of json data
        result.forEach(function(response) {

            if (response.state === "fulfilled") {

                if (isValidJson(response.value)) {
                    alldata.push(JSON.parse(response.value));
                } else {
                    console.log('recieved invalid json for a workstream:');
                    console.log(response.value);
                }

            }

        });

        // make promises array empty to avoid pillup them after each api request
        promises = [];

        return res.json(200, alldata);

    })
    .done();
};
