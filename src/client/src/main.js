/** @jsx React.DOM */
var React = require('react');

var Application = require('./app.js');

Application.getDataForPath(location.pathname, function() {
  React.renderComponent(<Application path={location.pathname} />,
      document.getElementById('main'));
});
