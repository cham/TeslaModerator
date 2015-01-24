'use strict';

var authentication = require('../src/api/authentication');
var index = {};

function requireAuthentication(req, res, next){
    if(authentication.isAuthenticated(req)){
        return next();
    }
    res.render('login');
}

index.get = function(req, res){
    res.render('index');
};

module.exports = function(router){
    router
        .get('/', requireAuthentication, index.get);
};
