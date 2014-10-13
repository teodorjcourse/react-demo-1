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

app.use(function(req, res, next) {
  var App = require(path.resolve(BUILD, 'app.js'));
  var p = url.parse(req.url).pathname;

  // TODO: Figure out the paths we specifically want to handle by delivering
  // a pre-rendered HTML response
  if(p !== '/favicon.ico') {
    console.log('Pre-rendering HTML for path: ' + p);

    // TODO: Fetch the template once, instead of fetching it every time.
    fs.readFile(path.resolve(BUILD, 'layout.html'), function(err, content) {
      // TODO: Cache template compliation
      res.send(
          content.toString().replace(
            '{%CONTENT%}',
            new App(p)
          )
        );
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
