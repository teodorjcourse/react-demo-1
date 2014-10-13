/** @jsx React.DOM */
var React = require('react');

var Link = require('react-router-component').Link;

var Home = React.createClass({
  render: function() {
    return (
      <div>
        <Link href="/counter">Counter</Link>
      </div>
    );
  }
});

module.exports = Home;
