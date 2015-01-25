'use strict';

var apiRequest = require('./apiRequest');

function requiredChangePasswordOptions(options){
    if(!options.username){
        throw new Error('username is required');
    }
    if(!options.password){
        throw new Error('password is required');
    }
}

function changePassword(options, callback){
    requiredChangePasswordOptions(options || {});

    var urlname = encodeURIComponent(options.username.toLowerCase());

    apiRequest.makeRequest({
        form: {
            password: options.password
        },
        method: 'put',
        url: '/user/' + urlname + '/resetpassword'
    }, callback);
}

exports.changePassword = changePassword;
