'use strict';

var apiRequest = require('./apiRequest');

function getQuestions(data, callback){
    apiRequest.makeRequest({
        method: 'get',
        url: '/questions'
    }, callback);
}

function editQuestion(id, data, callback){
    apiRequest.makeRequest({
        method: 'put',
        url: '/questions/' + id,
        form: {
            detail: data.detail,
            enabled: data.enabled
        }
    }, callback);
}

function createQuestion(data, callback){
    apiRequest.makeRequest({
        method: 'post',
        url: '/questions/',
        form: {
            detail: data.detail
        }
    }, callback);
}

exports.getQuestions = getQuestions;
exports.editQuestion = editQuestion;
exports.createQuestion = createQuestion;
