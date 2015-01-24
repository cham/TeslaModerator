'use strict';

var express = require('express');
var routemaster = require('routemaster');
var http = require('http');
var redis = require('redis');

var port = 3030;
var app = express();
var server = http.createServer(app);
var client = redis.createClient();

client.on('error', function(err){
    console.error('redis client error: ' + err);
});

client.once('ready', function(){
    console.log('redis connected');

    app.use(routemaster({
        directory: 'routes',
        Router: express.Router
    }));

    server.listen(port);
    console.log('moderator-app listening on port', port);
});
