'use strict';

var Q = require('q');
var redis = require('redis');
var client = redis.createClient(
    6379,
    process.env.REDIS_HOST || 'localhost'
);
var deferred = Q.defer();

client.once('error', function(err){
    console.error('redis connection error: ' + err);
    deferred.reject();
});

client.once('ready', function(){
    console.log('redis connected');
    deferred.resolve();
});

exports.getClient = function(callback){
    deferred.promise.then(function(){
        callback(client);
    });
};
exports.ready = function(callback){
    deferred.promise.then(callback);
};
