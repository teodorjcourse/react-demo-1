/** @jsx React.DOM */
var React = require('react');

var Locations = require('react-router-component').Locations;
var Location = require('react-router-component').Location;

var Counter = require('./counter');
var Home = require('./home');

var Application = React.createClass({
  render: function() {
    return (
      <div>
        <h1>React Demo Application</h1>
        <Locations path={this.props.path}>
          <Location name="home" path="/" handler={Home} />
          <Location name="counter" path="/counter" handler={Counter} />
        </Locations>
      </div>
    );
  }
});

module.exports = Application;
