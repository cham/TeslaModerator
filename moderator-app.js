'use strict';

var express = require('express');
var routemaster = require('routemaster');
var http = require('http');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redisclient = require('./src/redisclient');
var bodyParser = require('body-parser');
var path = require('path');

var port = 3030;
var app = express();
var server = http.createServer(app);

redisclient.ready(function(){
    app.set('view engine', 'template');
    app.engine('template', require('hogan-express'));

    app.use(session({
        name: 'tesla-moderator-session',
        store: new RedisStore({
            host: process.env.REDIS_HOST || 'localhost',
            port: 6379,
            db: 2
        }),
        secret: 'LyOxKll{g0GHmh',
        reapInterval: 60 * 60 * 1000,
        resave: true,
        saveUninitialized: true
    }));

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(bodyParser.urlencoded({extended: false}));

    try{
        app.use(routemaster({
            directory: './routes',
            Router: express.Router
        }));
    }catch(e){
        console.error(e);
    }

    server.listen(port);
    console.log('moderator-app listening on port', port);
});
