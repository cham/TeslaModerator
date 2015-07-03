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

    questions.editQuestion(body.id, {
        detail: body.detail,
        enabled: !!body.enabled
    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        res.redirect('/questions');
    });
};

questionRouteHandlers.newQuestion = function newQuestion(req, res){
    var body = req.body;

    questions.createQuestion({
        detail: body.detail
    }, function(err){
        if(err){
            return res.sendStatus(400);
        }
        res.redirect('/questions');
    });
};

module.exports = function(router){
    router
        .get('/questions', requireAuthentication, questionRouteHandlers.renderQuestions)
        .post('/editquestion', requireAuthentication, questionRouteHandlers.editQuestion)
        .post('/questions', requireAuthentication, questionRouteHandlers.newQuestion);
};
