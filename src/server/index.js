var express = require('express');
var griddle = require('griddle');
var path = require('path');
var q = require('q');
var fs = require('fs');
var url = require('url');
var React = require('react');

const CLIENT = path.resolve(__dirname, '../client');
const CLIENT_SRC = path.resolve(__dirname, '../client/src');
const BUILD = path.resolve(__dirname, '../../build');
const DEFAULT_PORT = 4000;

var app = express();
app.use(griddle(CLIENT, CLIENT_SRC));
app.use(express.static(BUILD));

const PATTERN_ANSWER_PATH = /^\/answer\/([^\/]+)\/?$/;

app.use(function(req, res, next) {
  var Application = require(path.resolve(BUILD, 'app.js'));
  var AnswerStore = require(path.resolve(BUILD, 'answer-store.js'));
  var pathname = url.parse(req.url).pathname;
  var defaultData = '';

  // TODO: Figure out the paths we specifically want to handle by delivering
  // a pre-rendered HTML response
  if(pathname !== '/favicon.ico') {
    console.log('Pre-rendering HTML for path: ' + pathname);

    // TODO: Fetch the template once, instead of fetching it every time.
    fs.readFile(path.resolve(BUILD, 'layout.html'), function(err, content) {

      // TODO: This is a little dirty at the moment but would be easy to cleanup
      var render = function() {
        m = React.renderComponentToString(Application({ path: pathname }));
        res.send(content.toString().replace('{%DEFAULT_DATA%}', defaultData)
          .replace('{%CONTENT%}', m));
      };

      // TODO: This path matching should not be shared between client and
      // server
      var matches = PATTERN_ANSWER_PATH.exec(pathname);
      var question = matches && matches.pop();
      if(question) {
        console.log('Asking question: ' + question);
        // If we have a question to ask, ask the question
        AnswerStore.fetchAnswer(question, function(err) {
          // Now export it such that it can be consumed on the client (instead of requeried)
          // TODO: This is admittedly a little gross...I'm sure there's a better way!
          defaultData = AnswerStore.exportData();
          render();
        });
      } else {
        render();
      }
    });
  } else {
    next();
  }
});

var server;

module.exports = {
  start: function(port) {
    var listening = q.defer();
    if(typeof port !== 'number') {
      port = DEFAULT_PORT;
    }
    try {
      server = app.listen(port, function() {
        listening.resolve('HTTP Server Listening on ' + port);
      });
    } catch(e) {
      listening.reject(e);
    }
    return listening.promise;
  },
  stop: function() {
    var stopped = q.defer();
    if(server) {
      try {
        server.close(function() {
          stopped.resolve();
        });
      } catch(e) {
        stopped.reject(e);
      }
    }
    return stopped.promise;
  },
  restart: function(port) {
    return this.stop().then(function() {
      return this.start(port);
    });
  }
};
