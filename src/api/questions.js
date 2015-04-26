'use strict';

var apiRequest = require('./apiRequest');

function getQuestions(data, callback){
    console.log('getQuestions', data);
    callback(null, []);
    // apiRequest.makeRequest({
    //     method: 'get',
    //     url: '/users',
    //     qs: queryString
    // }, callback);
}

function editQuestion(id, data, callback){
    console.log('editQuestion', id, data);
    callback(null, {});
}

function createQuestion(data, callback){
    console.log('createQuestion', data);
    callback(null, {});
}

exports.getQuestions = getQuestions;
exports.editQuestion = editQuestion;
exports.createQuestion = createQuestion;
