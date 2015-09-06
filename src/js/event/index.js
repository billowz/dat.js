/**!
 * Dat.js Module:./event
 */

const _ = require('lodash'),
  Util = require('../util'),
  {Log} = Util;
class Event {
  constructor(eventTypes, scope) {
    this._listeners = {};
    this._eventTypes = [];
    if (eventTypes) {
      this.eventTypes(eventTypes);
    }
    this._event_scope = scope || this;
  }

  eventTypes() {
    return _.each(arguments, (arg) => {
      if (_.isArray(arg)) {
        this._eventTypes.apply(this, arg);
      } else if (_.isString(arg)) {
        Util.pushIf(this._eventTypes, arg);
      }
    });
    return this._eventTypes;
  }

  on(evt, callback) {
    if (_.isString(evt) && _is.isFunction(callback)) {
      if (_.include(this._eventTypes, evt)) {
        Log.warn('event type is undefined', evt, callback);
      }
      let handlers = this._listeners[evt];
      if (!_.isArray(handlers)) {
        handlers = this._listeners[evt] = [];
      }
      Util.pushIf(handlers, callback);
      return this.un.bind(this, evt, callback);
    } else if (_.isArray(evt) || is.isPlainObject(evt)) {
      return Util.chainedFn(_.map(evt, evt => {
        return this.on(evt.type, evt.handler);
      }), this);
    }
    throw 'Invalid Param';
  }

  un(evtname, callback) {
    let handlers = this._listeners[evtname];
    if (!handlers || handlers.length == 0) return;
    if (arguments.length == 1) {
      this._listeners[evtname] = [];
    } else if (_.isFunction(callback)) {
      _.pull(handlers, callback);
    }
  }

  has(evtname, callback) {
    let handlers = this._listeners[evtname];
    return handlers && _.include(handlers, callback);
  }

  fire(evtname) {
    let handlers = this._listeners[evtname];
    if (handlers && handlers.length > 0) {
      let args = _.slice(arguments, 1);
      _.each(handlers, h => {
        if (_.isFunction(h)) {
          try {
            h.apply(this._event_scope, args);
          } catch (e) {
            Log.err(e);
          }
        }
      });
    }
  }
}
module.exports = Event;
