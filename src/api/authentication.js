'use strict';

var apiRequest = require('./apiRequest');
var argv = require('yargs').argv;
var whitelistedUsers = (argv.moderators || '').split(',');

if(!whitelistedUsers){
    throw new Error('moderators command line option is required');
}

function isAuthenticated(req){
    if(!req || !req.session || typeof req.session !== 'object'){
        return false;
    }
    return req.session.authenticated === true;
}

function requiredLoginOptions(options){
    if(!options.username){
        throw new Error('username is required');
    }
    if(!options.password){
        throw new Error('password is required');
    }
    if(whitelistedUsers.indexOf(options.username) === -1){
        throw new Error('user is not in the moderator whitelist');
    }
}

function login(req, options, callback){
    requiredLoginOptions(options || {});

    apiRequest.makeRequest({
        form: {
            username: options.username,
            password: options.password
        },
        method: 'post',
        url: '/login'
    }, function(err){
        if(err){
            req.session.authenticated = false;
            return callback(err);
        }

        req.session.authenticated = true;
        callback();
    });
}

function logout(req){
    req.session.authenticated = false;
}

exports.isAuthenticated = isAuthenticated;
exports.logout = logout;
exports.login = login;
