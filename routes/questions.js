'use strict';

var authentication = require('../src/api/authentication');
var questions = require('../src/api/questions');
var questionRouteHandlers = {};

function requireAuthentication(req, res, next){
    if(authentication.isAuthenticated(req)){
        return next();
    }
    res.render('login');
}

questionRouteHandlers.renderQuestions = function renderQuestions(req, res){
    questions.getQuestions(req.query || {}, function(err, json){
        if(err){
            return res.sendStatus(400);
        }
        res.render('questions', json);
    });
};

questionRouteHandlers.editQuestion = function editQuestion(req, res){
    var body = req.body;

    questions.editQuestion(body.questionid, {

    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        res.redirect('/questions?highlightid=' + body.questionid);
    });
};

questionRouteHandlers.newQuestion = function newQuestion(req, res){
    var body = req.body;

    questions.createQuestion({

    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        res.redirect('/questions?highlightid=' + body.questionid);
    });
};

module.exports = function(router){
    router
        .get('/questions', requireAuthentication, questionRouteHandlers.renderQuestions)
        .put('/questions', requireAuthentication, questionRouteHandlers.editQuestion)
        .post('/questions', requireAuthentication, questionRouteHandlers.newQuestion);
};
