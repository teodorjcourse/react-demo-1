/** @jsx React.DOM */
var React = require('react');

var Application = require('./app.js');

React.renderComponent(<Application path={location.pathname} />,
    document.getElementById('main'));
