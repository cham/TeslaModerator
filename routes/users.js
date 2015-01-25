'use strict';

var authentication = require('../src/api/authentication');
var users = require('../src/api/users');
var userRouteHandlers = {};

function requireAuthentication(req, res, next){
    if(authentication.isAuthenticated(req)){
        return next();
    }
    res.render('login');
}

userRouteHandlers.renderChangePassword = function(req, res){
    res.render('change-password');
};

userRouteHandlers.changePassword = function(req, res){
    users.changePassword({
        username: req.body.username,
        password: req.body.password
    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        return res.sendStatus(200);
    });
};

module.exports = function(router){
    router
        .get('/change-password', requireAuthentication, userRouteHandlers.renderChangePassword)
        .post('/change-password', requireAuthentication, userRouteHandlers.changePassword);
};
