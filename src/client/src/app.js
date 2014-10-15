/** @jsx React.DOM */
var React = require('react');

// TODO: This router isn't a great solution and should be replaced
var Router = require('react-router-component');
var Locations = Router.Locations;
var Location = Router.Location;

var QuestionForm = require('./question-form');
var QuestionAnswer = require('./question-answer');
var AnswerStore = require('./answer-store');

var Application = React.createClass({

  getInitialState: function() {
    return { asking: false, error: false };
  },

  askQuestion: function(question) {
    var path = '/answer/' + encodeURIComponent(question);
    this.setState({ asking: true });
    AnswerStore.fetchAnswer(question, function(err, answer) {
      if(!err) {
        this.setState({ asking: false });

        // TODO: again, kind of a weird pattern here (for now).  Really we
        // should express the intent to get an answer by updating the route.
        // This would dispatch an action "ASK_QUESTION" and delay rendering
        // until the answer was delivered (client AND server)
        this.refs.router.navigate(path);
      } else {
        this.setState({ asking: false, error: true });
      }
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        <h1>Aristo &#8212; React
          { this.state.asking ? ' ...Asking' : '' }
          { this.state.error ? ' Doh!' : '' }
        </h1>
        <Locations path={this.props.path} ref="router">
          <Location path="/" handler={QuestionForm}
              onSubmit={this.askQuestion} />
          <Location path="/answer/:question" handler={QuestionAnswer} />
        </Locations>
        <footer>
          Made using ReactJS
        </footer>
      </div>
    );
  }
});

module.exports = Application;
