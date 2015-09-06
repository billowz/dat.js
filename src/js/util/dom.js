const _ = require('lodash'),
  $ = require('jquery'),
  proxies = ['on', {
    require: 'off',
    bind: 'un'
  }, 'addClass', 'removeClass', 'css'];
let Dom = {};
_.each(proxies, name => {
  let bindName, reqName;
  bindName = reqName = name;
  if (_.isPlainObject(name)) {
    bindName = name.bind;
    reqName = name.require;
  }
  Dom[bindName] = function(el) {
    el = $(el);
    return el[reqName].apply(el, _.slice(arguments, 1));
  }
});
Dom.innerCss = function(el, attr) {
  if (_.isString(attr)) {
    return el.style[attr];
  } else if (_.isArray(attr)) {
    if (attr.length == 1) {
      return el.style[attr[0]];
    } else {
      let ret = {};
      _.each(attr, att => {
        ret[att] = el.style[att];
      });
      return ret;
    }
  }
}
module.exports = Dom;
