/** @jsx React.DOM */
var React = require('react');

// TODO: This component is very broken.  We'd nee dto implement our own routing
// mechanism.
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
    Application.getDataForPath(path, function(err) {
      if(!err) {
        this.setState({ asking: false });

        // TODO: again, kind of a weird pattern here (for now).  Really we
        // should express the intent to get an answer by updating the route
        // wait for the answer and then render.
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

// TODO: This should really be baked into resolution of a route but that'd
// require development of a routing mechanism (react-router-component isn't that
// great an ultimately kind of an anti-pattern).
Application.Route = {
  '/': {
    name: 'home',
    // Home has no data
    resolver: undefined
  },
  '/answer/:question': {
    name: 'answer',
    // TODO: really we could have several resolvers...but for now to make it
    // simple let's just do wone.  Furthermore the dispatcher pattern has a solution
    // for this with waitFor()
    resolver: AnswerStore.fetchAnswer.bind(AnswerStore)
  }
};

var routes = Object.keys(Application.Route).map(function(r) {
  return {
    route: Application.Route[r],
    exp: new RegExp('^' + r.replace(/\//g, '\\/').replace(/:[^/]*/, '([^/]*)') + '$')
  };
});

Application.getDataForPath = function(path, cb) {
  var resolver;
  var matches
  routes.every(function(cr) {
    if(matches = cr.exp.exec(path)) {
      resolver = cr.route.resolver;
      return false;
    }
    return true;
  });
  if(typeof resolver === 'function') {
    resolver.apply(undefined, [ matches.slice(1) ].concat(cb));
  } else {
    cb();
  }
};

module.exports = Application;
