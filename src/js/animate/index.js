/**!
 * Dat.js Module:./animate
 */

const CssEvent = require('./css-event'),
  Util = require('../util'),
  Effects = require('./effects'),
  {Dom, RequestFrame} = Util;

class AnimateProcessor {
  constructor(option) {
    Util.assignWithout(['run', 'stop'], this, option);
    if (!_.isElement(this.el)) {
      throw 'Invalid Element';
    }
  }
  run() {
    throw 'Abstract Method run';
  }
  stop() {
    throw 'Abstract Method stop';
  }
}


let transitionDefines = [],
  transitionProcessorDefined = [];
function registerAnimate(processor, parseTransition, option) {
  if (_.isArray(processor)) {
    _.each(processor, registerAnimate);
  } else if (_.isPlainObject(processor)) {
    registerAnimate(processor.processor, processor.parseTransition, processor.option);
  } else if ((AnimateProcessor.isPrototypeOf(processor)) && _.isFunction(parseTransition)) {
    if (_.include(transitionProcessorDefined, processor)) {
      throw 'Animate is Registered ' + processor;
    }
    transitionDefines.push({
      processor: processor,
      parseTransition: parseTransition,
      option: option
    });
    transitionProcessorDefined.push(processor);
  } else {
    throw 'Invalid Param'
  }
}

class Animate {
  /**
   * Animate Constructor
   * @param  {[Element]}   el         element
   * @param  {[Object]}   transition
   *         transition description
   *         transition = {
   *           class:'transitionClass',
   *           css:{
   *             color:'red'
   *           }
   *         }
   * @param  {Function} callback   callback on Animate End
   * @return {[Animate]}              Animate
   */
  constructor(el, transition) {
    if (!_.isElement(el)) {
      throw 'Invalid Element';
    }
    if (!transition) {
      throw 'Invalid Transition';
    }
    if (!_.isArray(transition)) {
      transition = [transition];
    }
    this.el = el;
    this.transition = transition;
    let processors = [];
    _.each(transition, transitionItem => {
      let trans = [];
      _.each(transitionDefines, define => {
        let tran,
          Processor = define.processor,
          option = define.option || {};
        if ( (tran = define.parseTransition.call(define, transitionItem)) ) {
          option = _.assign({}, option, {
            transition: tran,
            el: el
          });
          trans.push(new Processor(option));
        }
      });
      processors.push.apply(processors, trans);
    });
    if (processors.length == 0) {
      throw 'Invalid Transition';
    }
    this.animateProcessors = processors;
  }
  run() {
    return Util.promiseAll(_.map(this.animateProcessors, (pro) => {
      return pro.run();
    }));
  }
  stop() {
    _.each(this.animateProcessors, pro => {
      pro.stop();
    });
  }
}


class AbstractCssAnimateProcessor extends AnimateProcessor {
  constructor(option) {
    super(option);
    this.el.__transition = this.el.__transition || new Map();
  }
  run() {
    this.stop();
    return Util.promise(def => {
      if (!CssEvent.isSupport()) {
        setTimeout(def.reject.bind(def, this, 'CSS Transition is Not Supported'), 0);
      } else {
        let listen = function(e) {
          if (e && e.target !== this.el) {
            return;
          }
          if (listen._timeout) {
            clearTimeout(listen._timeout);
          }
          this._endTransition();
          def.resolve(this);
        }.bind(this);

        listen._timeout = setTimeout(function() {
          this._endTransition();
          def.reject(this, 'CSS Transition Timeout');
        }.bind(this), 5000);

        this._setEndListen(listen);
        CssEvent.onEnd(this.el, listen);
        this._start();
      }
    });
  }
  stop() {
    let listen;
    if ( (listen = this._getEndListen()) ) {
      listen();
    }
  }
  _setEndListen(listen) {
    this.el.__transition.set(this.transition, listen);
  }
  _getEndListen() {
    return this.el.__transition.get(this.transition);
  }
  _endTransition() {
    let listen = this._getEndListen();
    if (listen) {
      CssEvent.unEnd(this.el, listen);
      this._setEndListen(undefined);
    }
    this._end();
  }
  _start() {
    throw 'Abstract Method start';
  }
  _end() {
    throw 'Abstract Method end';
  }
}

class ClassNameAnimateProcessor extends AbstractCssAnimateProcessor {
  constructor(option) {
    super(option);
  }
  _start() {
    Dom.addClass(this.el, this.transition);
  }
  _end() {
    Dom.removeClass(this.el, this.transition);
  }
}

class StyleAnimateProcessor extends AbstractCssAnimateProcessor {
  constructor(option) {
    super(option);
    this._cssNames = _.keys(this.transition);
  }
  _start() {
    this._oldCss = Dom.innerCss(this.el, this._cssNames);
    Dom.css(this.el, this.transition);
  }
  _end() {
    Dom.css(this.el, this._oldCss);
  }
}

class TweenFrameProcessor extends AnimateProcessor {
  constructor(option) {
    super(option);
    this.effect = this.transition.effect || 'linear';
    if (_.isString(this.effect)) {
      this.effect = Effects[this.effect];
    }
    if (!is.fn(this.effect)) {
      throw 'Invalid effect ' + this.transition.effect;
    }
    this.duration = this.transition.duration || 500;
    if (!is.number(this.duration)) {
      throw 'Invalid duration ' + this.transition.duration;
    }
    this.from = this.transition.from || {};
    this.keepTarget = this.transition.keepTarget === true;
    this.target = this.transition.target || Util.assignWithout({}, ['effect', 'duration', 'from'], this.transition);
    this._targetCssNames = _.keys(this.target);
    this._fromCssNames = _.keys(this.from);
    this._cssNames = array.uniquePush.apply(null, [[]].concat(this._targetCssNames).concat(this._fromCssNames));
  }
  run() {
    this.stop();
    return Util.promise((def) => {
      this._beforeTransition();
      this._animate = RequestFrame.duration(this.duration,
        this._calStyles.bind(this), (err) => {
          this._animate = null;
          this._endTransition();
          if (err) {
            def.reject(err);
          } else {
            def.resolve();
          }
        });
    });
  }
  stop() {
    if (this._animate) {
      this._animate();
    }
  }
  _calStyles(step) {
    _.each(this._animateObj, (ani, name) => {
      Dom.css(this.el, name, this.effect(step, ani.from, ani.variation, this.duration) + ani.unit);
    });
  }
  _beforeTransition() {
    let fromCss, targetCss;
    this._oldCss = Dom.innerCss(this.el, this._cssNames);
    Dom.css(this.el, this.target);
    targetCss = Dom.css(this.el, this._targetCssNames);
    Dom.css(this.el, _.assign({}, this._oldCss, this.from || {}));
    fromCss = Dom.css(this.el, this._targetCssNames);

    this._animateObj = {};
    _.each(this._targetCssNames, name => {
      let from = parseFloat(fromCss[name]),
        to = parseFloat(targetCss[name]),
        unit = name === 'opacity' ? '' : 'px',
        variation = to - from;
      this._animateObj[name] = {
        from: from,
        end: to,
        variation: variation,
        unit: unit
      }
    });
  }
  _endTransition() {
    this.promise = null;
    if (!this.keepTarget) {
      Dom.css(this.el, this._oldCss);
    }
    this._oldCss = null;
  }
}

registerAnimate([{
  processor: ClassNameAnimateProcessor,
  parseTransition(tran) {
    if (_.isString(tran)) {
      return tran;
    } else if (_.isArray(tran) && tran.length > 0) {
      return tran.join(' ');
    } else if (_.isPlainObject(tran) && tran['class']) {
      return this.parseTransition(tran['class']);
    }
    return false;
  }
}, {
  processor: StyleAnimateProcessor,
  parseTransition(tran) {
    if (_.isPlainObject(tran) && _.isPlainObject(tran['css'])) {
      return tran['css'];
    }
  }
}, {
  processor: TweenFrameProcessor,
  parseTransition(tran) {
    if (_.isPlainObject(tran) && _.isPlainObject(tran['tween'])) {
      return tran['tween'];
    }
  }
}]);

_.assign(Animate, {
  CssEvent: require('./css-event'),
  Effects: require('./effects'),
  registerAnimate: registerAnimate,
  AnimateProcessor: AnimateProcessor,
  AbstractCssAnimateProcessor: AbstractCssAnimateProcessor,
  ClassNameAnimateProcessor: ClassNameAnimateProcessor,
  StyleAnimateProcessor: StyleAnimateProcessor,
  TweenFrameProcessor: TweenFrameProcessor
});
module.exports = Animate;

