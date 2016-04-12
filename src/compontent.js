const tpl = require('tpl'),
  dynamicCompontentOptions = {
    extend: 'extend',
    constructor: 'constructor'
  },
  compontents = {},
  hasOwn = Object.prototype.hasOwnProperty;

class Compontent {
  constructor(props) {
    this.template = {};

    this.scope = {
      props: props || {}
    };
  }
}

tpl.assign(Compontent, {
  getCompontent(name) {
    return compontents[name];
  },
  isCompontent(object) {
    return tpl.isExtendOf(object, Compontent);
  },
  register(name, option) {
    let comp = tpl.createClass(option, Compontent, dynamicCompontentOptions);

    parseCompontentProps(comp);

    if (!comp.className)
      comp.prototype.className = comp.className = (tpl.hump(name) + 'Compontent');

    name = name.toLowerCase();

    if (name in compontents)
      console.warn(`Compontent[${name}] is defined`);
    compontents[name] = comp;
    return comp;
  }
});

function parseCompontentProps(comp) {
  if (comp.__builded_props__)
    return;

  let proto = comp.prototype,
    parent = tpl.prototypeOf(comp),
    props;

  props = hasOwn(proto, 'props') ? proto.props : (proto.props = {});
  if (parent !== Compontent) {
    if (!parent.__builded_props__)
      parseCompontentProps(parent);
    tpl.assignIf(props, parent.prototype.props);
  }
  comp.__builded_props__ = true;
}
module.exports = Compontent;
