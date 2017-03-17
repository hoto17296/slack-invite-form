const React = require('react');
const ReactDOM = require('react-dom');
const SlackInviteForm = require('./lib/SlackInviteForm');

window.renderSlackInviteForm = function(elem, api_base) {
  if (!(elem instanceof HTMLElement)) elem = document.getElementById(elem);
  ReactDOM.render(React.createElement(SlackInviteForm, { api_base }), elem);
};
