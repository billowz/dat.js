
/**!
 * Dat.js Module:./util
 */

const _ = require('lodash'),
  Q = require('q'),
  Log = require('./log'),
  IteratorMsgTempl = _.template('Invalid Type ${obj} need ${type}.');

class ArrayIterator {
  constructor(array, point) {
    this.array = array;
    this.index = point || 0;
  }
  next(pred, invalidType, alwaysToNext, msg, type) {
    if (this.index >= this.array.length) {
      return undefined;
    }
    let currentElement = this.array[this.index];
    if (!pred || pred(currentElement)) {
      this.index++;
      return currentElement;
    } else if (pred && invalidType) {
      if (!msg) {
        msg = IteratorMsgTempl({
          obj: currentElement,
          type: type
        });
      }
      switch (invalidType) {
        case 'throw':
          throw new TypeError(msg);
        case 'debug':
        case 'log':
        case 'warn':
        case 'error':
          Log[invalidType](msg, ' ', currentElement, ' ', this.array, ' ', pred.name, ' ', pred);
          break;
      }
      if (alwaysToNext) {
        this.index++;
        return currentElement;
      }
    }
    return undefined;
  }
  nextString(invalidType, alwaysToNext, msg) {
    return this.next(_.isString, invalidType, alwaysToNext, msg, 'String');
  }
  nextNumber(invalidType, alwaysToNext, msg) {
    return this.next(_.isNumber, invalidType, alwaysToNext, msg, 'Number');
  }
  nextBool(invalidType, alwaysToNext, msg) {
    return this.next(_.isBoolean, invalidType, alwaysToNext, msg, 'Boolean');
  }
  nextObject(invalidType, alwaysToNext, msg) {
    return this.next(_.isObject, invalidType, alwaysToNext, msg, 'Object');
  }
  nextPlainObject(invalidType, alwaysToNext, msg) {
    return this.next(_.isPlainObject, invalidType, alwaysToNext, msg, 'PlainObject');
  }
  nextFunction(invalidType, alwaysToNext, msg) {
    return this.next(_.isFunction, invalidType, alwaysToNext, msg, 'Function');
  }
  nextRegExp(invalidType, alwaysToNext, msg) {
    return this.next(_.isRegExp, invalidType, alwaysToNext, msg, 'RegExp');
  }
  nextArray(invalidType, alwaysToNext, msg) {
    return this.next(_.isArray, invalidType, alwaysToNext, msg, 'Array');
  }
  nextElement(invalidType, alwaysToNext, msg) {
    return this.next(_.isElement, invalidType, alwaysToNext, msg, 'HTMLElement');
  }
  nextDate(invalidType, alwaysToNext, msg) {
    return this.next(_.isDate, invalidType, alwaysToNext, msg, 'Date');
  }
}

const Util = {
  ArrayIterator: ArrayIterator,
  arrayIterator(array, point) {
    return new ArrayIterator(array, point);
  },
  promise(c) {
    let def = Q.defer();
    c(def);
    return def.promise;
  },
  promiseAll(promises) {
    if (!_.isArray(promises)) {
      promises = _.slice(arguments);
    }
    return Q.promise.all(promises);
  },

  assignIf: _.partialRight(_.assign, function(value, newVal, attr, obj) {
    return _.has(obj, attr) ? value : newVal;
  }),

  assignBy(includes, excludes) {
    let args = _.slice(arguments, 2);
    includes = Util.array(includes);
    excludes = Util.array(excludes);
    if (includes.length > 0 || excludes.length > 0) {
      return _.partialRight(_.assign, function(value, newVal, attr, obj) {
        if ((excludes.length > 0 && _.include(excludes, attr))
          || (includes.length > 0 && !_.include(includes, attr))) {
          return value;
        }
        return newVal;
      }).apply(null, args);
    }
    return _.assign.apply(null, args);
  },

  assignWith(includes) {
    let args = _.slice(arguments);
    args.splice(1, 0, []);
    return Util.assignBy.apply(null, args);
  },

  assignWithout(excludes) {
    let args = _.slice(arguments);
    args.splice(0, 0, []);
    return Util.assignBy.apply(null, args);
  },

  array(array, itemTypes) {
    if (_.isUndefined(array)) {
      array = [];
    } else if (!_.isArray(array)) {
      array = [array];
    }
    if (itemTypes) {
      if (!_.isArray(itemTypes)) {
        itemTypes = [itemTypes];
      }
      array = _.filter(array, item => {
        return _.findIndex(itemTypes, (type) => type(item)) != -1;
      });
    }
    return array;
  },

  pushIf(array) {
    _.chain(arguments)
      .slice(1)
      .each(arg => {
        if (!_.include(array, arg)) {
          array.push(arg);
        }
      });
  },

  chainedFn(funcs, scope) {
    return _.chain(funcs)
      .filter(f => _.isFunction(f))
      .reduce((acc, f) => {
        if (acc === null) {
          return f;
        }
        return function chainedFunction() {
          acc.apply(scope, arguments);
          f.apply(scope, arguments);
        };
      }, null)
      .value();
  },

  transition(duration, onStep, onEnd) {
    let start = new Date(),
      reqid,
      step = 0;
    function end(state, err) {
      reqid = null;
      onEnd(state, err);
    }
    function calc() {
      if (!reqid) return;
      if ((step = new Date() - start) < duration) {
        try {
          onStep(step)
          reqid = window.requestAnimationFrame(calc);
        } catch (e) {
          end('error', e.message);
        }
      } else {
        end('finish');
      }
    }
    reqid = window.requestAnimationFrame(calc);
    return function() {
      if (reqid) {
        window.cancelAnimationFrame(reqid);
        end('cancel');
      }
    };
  },

  Dom: require('./dom'),
  Log: Log
};
module.exports = Util;
