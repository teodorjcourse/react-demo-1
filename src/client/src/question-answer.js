/** @jsx React.DOM */
var React = require('react');
var Link = require('react-router-component').Link;

var AnswerStore = require('./answer-store');

var QuestionAnswer = React.createClass({
  getInitialState: function() {
    return { answer: AnswerStore.answer(this.props.question) };
  },
  render: function() {
    return (
      <div>
        <span ref="answer">{this.state.answer}</span>
        <p><Link href="/">Back</Link></p>
      </div>
    );
  }
});

module.exports = QuestionAnswer;
