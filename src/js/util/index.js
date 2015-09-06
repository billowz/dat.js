
/**!
 * Dat.js Module:./util
 */

const _ = require('lodash'),
  Q = require('q');

const Util = {
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

  Dom: require('./dom'),
  RequestFrame: require('./request-frame'),
  Log: require('./log')
};
module.exports = Util;
