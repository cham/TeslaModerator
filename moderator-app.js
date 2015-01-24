'use strict';

var express = require('express');
var routemaster = require('routemaster');
var http = require('http');

var port = 3030;
var app = express();
var server = http.createServer(app);

app.use(routemaster({
    directory: 'routes',
    Router: express.Router
}));

server.listen(port);
console.log('moderator-app listening on port', port);
