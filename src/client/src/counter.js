/** @jsx React.DOM */
var React = require('react');

var Counter = React.createClass({

  getInitialState: function() {
    return { count: 0 };
  },

  incrementCount: function() {
    this.setState({ count: this.state.count + 1 });
  },

  render: function() {
    var count = this.state.count;
    return (
      <div>
        <input type="number" readOnly value={count} />
        &nbsp;&nbsp;<button onClick={this.incrementCount}>Add 1</button>
      </div>
    );
  }
});

module.exports = Counter;
