const React = require('react');
const ReactDOM = require('react-dom');
const SlackInviteForm = require('./lib/SlackInviteForm');

window.renderSlackInviteForm = function(elem) {
  if (!(elem instanceof HTMLElement)) elem = document.getElementById(elem);
  ReactDOM.render(React.createElement(SlackInviteForm), elem);
};
