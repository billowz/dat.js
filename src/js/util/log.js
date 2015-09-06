const _ = require('lodash');

function callconsole(fn, args) {
  if (console && console[fn]) {
    return console[fn].apply(console, args);
  }
}
module.exports = {
  debug() {
    callconsole('debug', ['[debug]'].concat(_.slice(arguments)));
  },
  log() {
    callconsole('log', ['[info]'].concat(_.slice(arguments)));
  },
  warn() {
    callconsole('warn', ['[warn]'].concat(_.slice(arguments)));
  },
  err() {
    callconsole('error', ['[error]'].concat(_.slice(arguments)));
  },
  group(callback) {
    let args = _.slice(arguments, 1);
    callconsole('group', args);
    callback();
    callconsole('groupEnd', args);
  },
  time(callback) {
    let args = _.slice(arguments, 1);
    callconsole('time', args);
    callback();
    callconsole('timeEnd', args);
  }
}
