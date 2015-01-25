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

function getUsers(query, sort, callback){
    var queryString = {};
    var queryOptions = query || {};
    
    Object.keys(queryOptions).forEach(function(key){
        queryString[key] = queryOptions[key];
    });

    if(sort){
        queryString.sortBy = sort;
    }

    apiRequest.makeRequest({
        method: 'get',
        url: '/users',
        qs: queryString
    }, callback);
}

exports.changePassword = changePassword;
exports.getUsers = getUsers;
