'use strict';

var request = require('request').defaults({
    encoding: 'utf8',
    json: true,
    gzip: true
});

var errorCodes = [500, 401, 403, 404];
var errorCodeToTextMap = {
    401: 'Unauthorised',
    403: 'Forbidden',
    404: 'Route not found',
    500: 'API error'
};

function checkResponse(err, apiresponse, callback){
    if(err){
        return callback(err);
    }

    if(apiresponse && errorCodes.indexOf(apiresponse.statusCode) > -1){
        callback(new Error(apiresponse.body || errorCodeToTextMap[apiresponse.statusCode]));
        return false;
    }

    return true;
}

function parseJson(json, callback){
    try{
        json = JSON.parse(json);
    }catch(e){
        console.log(e, json);
        return callback({});
    }
    callback(json);
}

function requiredOptions(options){
    if(!options.method){
        throw new Error('method is required');
    }
    if(!options.url){
        throw new Error('url is required');
    }
}

function makeRequest(options, callback){
    requiredOptions(options || {});

    options.url = 'http://localhost:3100' + options.url;

    request(options, function(err, response, json){
        if(!checkResponse(err, response, callback)){
            return;
        }

        parseJson(json, function(data){
            if(callback){
                callback(null, data);
            }
        });
    });
}

exports.makeRequest = makeRequest;
