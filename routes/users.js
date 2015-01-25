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
        res.sendStatus(200);
    });
};

userRouteHandlers.getUsers = function(req, res){
    users.getUsers(req.query || {}, null, function(err, json){
        if(err){
            return res.sendStatus(400);
        }
        res.render('users', json);
    });
};

userRouteHandlers.editUser = function(req, res){
    var body = req.body;

    users.editUser(body.username, {
        email: body.email,
        points: body.points,
        banned: body.banned === 'on'
    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        res.redirect('/users?startswith=' + body.username);
    });
};

module.exports = function(router){
    router
        .get('/change-password', requireAuthentication, userRouteHandlers.renderChangePassword)
        .post('/change-password', requireAuthentication, userRouteHandlers.changePassword)
        .get('/users', requireAuthentication, userRouteHandlers.getUsers)
        .post('/user', requireAuthentication, userRouteHandlers.editUser);
};
