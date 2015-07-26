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

function checkResponse(err, apiresponse, json, callback){
    if(err){
        return callback(err);
    }

    if(apiresponse && errorCodes.indexOf(apiresponse.statusCode) > -1){
        var apiErrorMessage = apiresponse.body || errorCodeToTextMap[apiresponse.statusCode];
        if(json.error && json.error.message){
            apiErrorMessage = json.error.message;
        }
        callback(new Error(apiErrorMessage));
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
        if(!checkResponse(err, response, json, callback)){
            return;
        }

        if(typeof json === 'string'){
            return parseJson(json, function(data){
                if(callback){
                    callback(null, data);
                }
            });
        }
        callback(null, json);
    });
}

function sendEmail(email, message, callback){
    request({
        method: 'post',
        url: 'http://localhost:3025',
        form: {
            message: message,
            email: email
        }
    }, function(err, response){
        if(response.statusCode === 200){
            return callback();
        }

        return callback(new Error('Could not send password reminder email'));
    });
}

exports.makeRequest = makeRequest;
exports.sendEmail = sendEmail;
