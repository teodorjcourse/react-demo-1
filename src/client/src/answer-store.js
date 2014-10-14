var EventEmitter = require('events').EventEmitter;
var util = require('util');
var request = require('request');
var xhr = require('xhr');

var answers = {};

function getSelectedAnswerFromResponse(response) {
  var selected;
  if(response && response.success && Array.isArray(response.success.answers) &&
      response.success.answers.length > 0
  ) {
    response.success.answers.sort(function(a, b) {
      return a.confidence < b.confidence;
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
      url: 'http://ari.dev.allenai.org:8080/ask',
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
          // TODO: More advanced implementations may have some concept of freshness here.
          // IE, on S2 when would the query-cache be invalidated...etc
          answers[question] = selected;
          cb(false, selected);
        } else {
          cb('No selected answer');
        }
      }
    }.bind(this));
}

function AnswerStore() {}
util.inherits(AnswerStore, EventEmitter);

AnswerStore.prototype.answer = function(question) {
  return answers[question];
};

AnswerStore.prototype.fetchAnswer = function(question, cb) {
  if(answers.hasOwnProperty(question)) {
    cb(false, answers[question]);
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
