var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');
var xhr = require('xhr');

var config = require('./config');

var answers = {};

function qid(question) {
  var hash = 0, i, chr, len;
  if(question.length == 0) return hash;
  for(i = 0, len = question.length; i < len; i++) {
    chr   = question.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function getSelectedAnswerFromResponse(response) {
  var selected;
  if(response && response.success && Array.isArray(response.success.answers) &&
      response.success.answers.length > 0
  ) {
    response.success.answers.sort(function(a, b) {
      return b.confidence - a.confidence;
    });
    selected = response.success.answers[0].text;
    response.success.expanded.expansions.every(function(e) {
      if(e.key === selected) {
        selected += " " + e.answer;
        return false;
      }
      return true;
    });
  }
  return selected;
}

function fetchAnswer(question, cb) {
  // TODO: Use either the xhr or request lib depending upon our context (server or client)
  // This is pretty hacky and would be cleaned up long-term
  var fn = typeof window !== 'undefined' ? xhr : request;

  fn({
      method: 'POST',
      url: config.API_URL,
      timeout: 10000,
      json: {
        config: { ari: { handler: { tf: { solvers: [ "inference" ] } } } },
        question: { text: decodeURIComponent(question) }
      }
    }, function(err, resp, body) {
      var response = body && body.response;
      if(response && response.failure) {
        cb(response.failure);
      } else {
        var selected = getSelectedAnswerFromResponse(response);
        if(selected) {
          // Store the answer so that it can be retrieved again with an XHR
          // request.
          answers[qid(question)] = selected;
          cb(false, selected);
        } else {
          cb('No selected answer');
        }
      }
    }.bind(this));
}

function AnswerStore() {
  answers = this.getAnswersFetchedByServer();
};
util.inherits(AnswerStore, EventEmitter);

AnswerStore.prototype.answer = function(question) {
  question = decodeURIComponent(question);
  return answers[qid(question)];
};

AnswerStore.prototype.getAnswersFetchedByServer = function() {
  var a;
  if(typeof window !== 'undefined' && window.answers) {
    a = JSON.parse(window.answers);
    delete window.answers;
  }
  return a || {};
};

AnswerStore.prototype.exportData = function() {
  return '<script>window.answers = \'' + JSON.stringify(answers) + '\';</script>';
};

AnswerStore.prototype.fetchAnswer = function(question, cb) {
  question = decodeURIComponent(question);
  if(answers.hasOwnProperty(question)) {
    cb(false, answers[qid(question)]);
  } else {
    fetchAnswer(question, function(err, answer) {
      if(!err) {
        this.emit(AnswerStore.Event.ANSWERED, question, answer);
        cb(false, answer);
      } else {
        cb(err);
      }
    }.bind(this));
  }
  return this;
};

AnswerStore.Event = {
  ANSWERED: 'answered'
};

module.exports = new AnswerStore();
