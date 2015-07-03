'use strict';

var async = require('async');
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

    var urlname = encodeURIComponent(options.username);

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

function editUser(username, details, callback){
    var urlname = encodeURIComponent(username.toLowerCase());
    var callsToMake = [];

    callsToMake.push(function(done){
        apiRequest.makeRequest({
            form: {
                email: details.email
            },
            method: 'put',
            url: '/user/' + urlname + '/changeemail'
        }, function(err){
            done(err);
        });
    });

    callsToMake.push(function(done){
        apiRequest.makeRequest({
            method: 'put',
            url: '/user/' + urlname + '/' + (details.banned ? 'ban' : 'unban')
        }, function(err){
            done(err);
        });
    });

    callsToMake.push(function(done){
        apiRequest.makeRequest({
            form: {
                points: details.points
            },
            method: 'put',
            url: '/user/' + urlname + '/points'
        }, function(err){
            done(err);
        });
    });

    async.parallel(callsToMake, callback);
}

function getPendingUsers(query, callback){
    apiRequest.makeRequest({
        method: 'get',
        url: '/pendingusers'
    }, callback);
}

function approveRegistration(userId, callback){
    apiRequest.makeRequest({
        method: 'get',
        url: '/pendingusers/' + userId
    }, function(err, userData){
        if(err){
            return callback(err);
        }

        apiRequest.makeRequest({
            method: 'post',
            url: '/user',
            form: {
                username: userData.username,
                password: userData.password,
                email: userData.email,
                ip: userData.ip
            }
        }, function(err){
            if(err){
                return callback(err);
            }

            apiRequest.makeRequest({
                method: 'delete',
                url: '/pendingusers/' + userId
            }, callback);
        });
    });
}

function denyRegistration(userId, callback){
    apiRequest.makeRequest({
        method: 'delete',
        url: '/pendingusers/' + userId
    }, callback);
}

exports.denyRegistration = denyRegistration;
exports.approveRegistration = approveRegistration;
exports.getPendingUsers = getPendingUsers;
exports.changePassword = changePassword;
exports.getUsers = getUsers;
exports.editUser = editUser;
