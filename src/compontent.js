const tpl = require('tpl');

class Compontent {
  constructor(templ, props) {
    this.scope = {
      props: props || {}
    };
  }
}
const compontents = {};
Compontent.register = function register(name, option) {
  if (name in compontents)
    console.warn('Compontent[' + name + '] is defined');

  let compontent;
  if (typeof option == 'function') {
    if (!isCompontent(option))
      throw TypeError('Invalid Compontent constructor ' + option);
    compontent = option;
    compontent.prototype.className = compontent.prototype.className || tpl.hump(name);
  } else if (option && typeof option == 'object') {
    compontent = (function(opt, SuperClass) {
      let userSuperClass = opt[SUPER_CLASS_OPTION];
      if (false && userSuperClass && !isDirective(userSuperClass))
        throw TypeError('Invalid Directive SuperClass ' + userSuperClass);
      SuperClass = userSuperClass || SuperClass;

      let constructor = typeof opt.constructor == 'function' ? opt.constructor : undefined,
        Directive = function DynamicDirective() {
          if (!(this instanceof SuperClass))
            throw new TypeError('Cannot call a class as a function');

          SuperClass.apply(this, arguments);
          if (constructor)
            constructor.apply(this, arguments);
        }

      Directive.prototype = _.create(SuperClass.prototype, {
        constructor: {
          value: Directive,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });

      delete opt.constructor;
      delete opt[SUPER_CLASS_OPTION];

      _.eachObj(opt, (val, key) => {
        Directive.prototype[key] = val;
      });

      _.setPrototypeOf(Directive, SuperClass);
      return Directive;
    })(option, Directive);

    directive.prototype.className = (_.hump(name) + 'Directive');
  } else
    throw TypeError('Invalid Directive Object ' + option);

  name = name.toLowerCase();
  directive.prototype.name = name;

  directives[name] = directive;
  return directive;
};
