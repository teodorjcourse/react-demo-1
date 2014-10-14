/** @jsx React.DOM */
var React = require('react');

var Link = require('react-router-component').Link;

var xhr = require('xhr');

var QuestionForm = React.createClass({

  getInitialState: function() {
    return { question: 'Which part of a plant produces the seeds? \n\t(A) flower\n\t(B) leaves\n\t(C) stem\n\t(D) roots' };
  },

  setRouter: function(r) {
    this.router = r;
  },

  onSubmit: function(e) {
    e.preventDefault();
    if(typeof this.props.onSubmit === 'function') {
      this.props.onSubmit(this.state.question);
    }
  },

  onQuestionChanged: function(e) {
    this.setState({ question: e.target.value });
  },

  render: function() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <p>
            <textarea name="q" onChange={this.onQuestionChanged}
                defaultValue={this.state.question}
                placeholder="Ask Aristo Anything" />
          </p>
          <input type="submit" value="Ask" />
        </form>
      </div>
    );
  }

});

module.exports = QuestionForm;
