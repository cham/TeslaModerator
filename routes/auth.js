'use strict';

var authentication = require('../src/api/authentication');

function login(req, res){
    authentication.login(req, {
        username: req.body.username,
        password: req.body.password
    }, function(err){
        if(err){
            res.status(401);
            return res.send(err.message);
        }

        res.redirect('/');
    });
}

function logout(req, res){
    authentication.logout(req);
    res.redirect('/');
}

module.exports = function(router){
    router
        .post('/login', login)
        .post('/logout', logout);
};
