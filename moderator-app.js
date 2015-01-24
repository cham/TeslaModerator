'use strict';

var express = require('express');
var routemaster = require('routemaster');
var http = require('http');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redisclient = require('./src/redisclient');
var bodyParser = require('body-parser');

var port = 3030;
var app = express();
var server = http.createServer(app);

redisclient.ready(function(){
    app.use(session({
        name: 'tesla-moderator-session',
        store: new RedisStore({
            host: 'localhost',
            port: 6379,
            db: 2
        }),
        secret: 'LyOxKll{g0GHmh',
        reapInterval: 60 * 60 * 1000,
        resave: true,
        saveUninitialized: true
    }));

    app.use(bodyParser.urlencoded({extended: false}));

    app.use(routemaster({
        directory: './routes',
        Router: express.Router
    }));

    server.listen(port);
    console.log('moderator-app listening on port', port);
});
