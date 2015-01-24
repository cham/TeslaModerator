'use strict';

var index = {};

index.get = function(req, res){
    res.sendStatus(200);
};

module.exports = function(router){
    router.get('/', index.get);
};
