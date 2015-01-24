'use strict';

var authentication = require('../src/api/authentication');
var index = {};

index.get = function(req, res){
    res.sendStatus(200);
};

function login(req, res){
    authentication.login(req, {
        username: req.body.username,
        password: req.body.password
    }, function(err){
        if(err){
            res.status(401);
            return res.send(err.message);
        }

        res.sendStatus(200);
    });
}

module.exports = function(router){
    router
        .get('/', index.get)
        .post('/login', login);
};
