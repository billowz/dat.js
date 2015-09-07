(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("_"), require("q"), require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["_", "q", "jquery"], factory);
	else if(typeof exports === 'object')
		exports["dat"] = factory(require("_"), require("q"), require("jquery"));
	else
		root["dat"] = factory(root["_"], root["Q"], root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_65__, __WEBPACK_EXTERNAL_MODULE_67__, __WEBPACK_EXTERNAL_MODULE_69__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*@MODULE_GENERATOR@*/
	
	/**!
	 * Dat.js
	 *
	 *
	 * @copyright 2015 tao.zeng
	 * @license MIT
	 */
	
	'use strict';
	
	module.exports = {
	  Animate: __webpack_require__(1),
	  Event: __webpack_require__(73),
	  Util: __webpack_require__(66)
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**!
	 * Dat.js Module:./animate
	 */
	
	'use strict';
	
	var _classCallCheck = __webpack_require__(2)['default'];
	
	var _inherits = __webpack_require__(3)['default'];
	
	var _Map = __webpack_require__(18)['default'];
	
	var CssEvent = __webpack_require__(64);
	var Util = __webpack_require__(66);
	var Effects = __webpack_require__(72);
	var Dom = Util.Dom;
	var RequestFrame = Util.RequestFrame;
	
	var AnimateProcessor = (function () {
	  function AnimateProcessor(option) {
	    _classCallCheck(this, AnimateProcessor);
	
	    Util.assignWithout(['run', 'stop'], this, option);
	    if (!_.isElement(this.el)) {
	      throw 'Invalid Element';
	    }
	  }
	
	  AnimateProcessor.prototype.run = function run() {
	    throw 'Abstract Method run';
	  };
	
	  AnimateProcessor.prototype.stop = function stop() {
	    throw 'Abstract Method stop';
	  };
	
	  return AnimateProcessor;
	})();
	
	var transitionDefines = [],
	    transitionProcessorDefined = [];
	function registerAnimate(processor, parseTransition, option) {
	  if (_.isArray(processor)) {
	    _.each(processor, registerAnimate);
	  } else if (_.isPlainObject(processor)) {
	    registerAnimate(processor.processor, processor.parseTransition, processor.option);
	  } else if (AnimateProcessor.isPrototypeOf(processor) && _.isFunction(parseTransition)) {
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
	    throw 'Invalid Param';
	  }
	}
	
	var Animate = (function () {
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
	
	  function Animate(el, transition) {
	    _classCallCheck(this, Animate);
	
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
	    var processors = [];
	    _.each(transition, function (transitionItem) {
	      var trans = [];
	      _.each(transitionDefines, function (define) {
	        var tran = undefined,
	            Processor = define.processor,
	            option = define.option || {};
	        if (tran = define.parseTransition.call(define, transitionItem)) {
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
	
	  Animate.prototype.run = function run() {
	    return Util.promiseAll(_.map(this.animateProcessors, function (pro) {
	      return pro.run();
	    }));
	  };
	
	  Animate.prototype.stop = function stop() {
	    _.each(this.animateProcessors, function (pro) {
	      pro.stop();
	    });
	  };
	
	  return Animate;
	})();
	
	var AbstractCssAnimateProcessor = (function (_AnimateProcessor) {
	  _inherits(AbstractCssAnimateProcessor, _AnimateProcessor);
	
	  function AbstractCssAnimateProcessor(option) {
	    _classCallCheck(this, AbstractCssAnimateProcessor);
	
	    _AnimateProcessor.call(this, option);
	    this.el.__transition = this.el.__transition || new _Map();
	  }
	
	  AbstractCssAnimateProcessor.prototype.run = function run() {
	    var _this = this;
	
	    this.stop();
	    return Util.promise(function (def) {
	      if (!CssEvent.isSupport()) {
	        setTimeout(def.reject.bind(def, _this, 'CSS Transition is Not Supported'), 0);
	      } else {
	        (function () {
	          var listen = (function (e) {
	            if (e && e.target !== this.el) {
	              return;
	            }
	            if (listen._timeout) {
	              clearTimeout(listen._timeout);
	            }
	            this._endTransition();
	            def.resolve(this);
	          }).bind(_this);
	
	          listen._timeout = setTimeout((function () {
	            this._endTransition();
	            def.reject(this, 'CSS Transition Timeout');
	          }).bind(_this), 5000);
	
	          _this._setEndListen(listen);
	          CssEvent.onEnd(_this.el, listen);
	          _this._start();
	        })();
	      }
	    });
	  };
	
	  AbstractCssAnimateProcessor.prototype.stop = function stop() {
	    var listen = undefined;
	    if (listen = this._getEndListen()) {
	      listen();
	    }
	  };
	
	  AbstractCssAnimateProcessor.prototype._setEndListen = function _setEndListen(listen) {
	    this.el.__transition.set(this.transition, listen);
	  };
	
	  AbstractCssAnimateProcessor.prototype._getEndListen = function _getEndListen() {
	    return this.el.__transition.get(this.transition);
	  };
	
	  AbstractCssAnimateProcessor.prototype._endTransition = function _endTransition() {
	    var listen = this._getEndListen();
	    if (listen) {
	      CssEvent.unEnd(this.el, listen);
	      this._setEndListen(undefined);
	    }
	    this._end();
	  };
	
	  AbstractCssAnimateProcessor.prototype._start = function _start() {
	    throw 'Abstract Method start';
	  };
	
	  AbstractCssAnimateProcessor.prototype._end = function _end() {
	    throw 'Abstract Method end';
	  };
	
	  return AbstractCssAnimateProcessor;
	})(AnimateProcessor);
	
	var ClassNameAnimateProcessor = (function (_AbstractCssAnimateProcessor) {
	  _inherits(ClassNameAnimateProcessor, _AbstractCssAnimateProcessor);
	
	  function ClassNameAnimateProcessor(option) {
	    _classCallCheck(this, ClassNameAnimateProcessor);
	
	    _AbstractCssAnimateProcessor.call(this, option);
	  }
	
	  ClassNameAnimateProcessor.prototype._start = function _start() {
	    Dom.addClass(this.el, this.transition);
	  };
	
	  ClassNameAnimateProcessor.prototype._end = function _end() {
	    Dom.removeClass(this.el, this.transition);
	  };
	
	  return ClassNameAnimateProcessor;
	})(AbstractCssAnimateProcessor);
	
	var StyleAnimateProcessor = (function (_AbstractCssAnimateProcessor2) {
	  _inherits(StyleAnimateProcessor, _AbstractCssAnimateProcessor2);
	
	  function StyleAnimateProcessor(option) {
	    _classCallCheck(this, StyleAnimateProcessor);
	
	    _AbstractCssAnimateProcessor2.call(this, option);
	    this._cssNames = _.keys(this.transition);
	  }
	
	  StyleAnimateProcessor.prototype._start = function _start() {
	    this._oldCss = Dom.innerCss(this.el, this._cssNames);
	    Dom.css(this.el, this.transition);
	  };
	
	  StyleAnimateProcessor.prototype._end = function _end() {
	    Dom.css(this.el, this._oldCss);
	  };
	
	  return StyleAnimateProcessor;
	})(AbstractCssAnimateProcessor);
	
	var TweenFrameProcessor = (function (_AnimateProcessor2) {
	  _inherits(TweenFrameProcessor, _AnimateProcessor2);
	
	  function TweenFrameProcessor(option) {
	    _classCallCheck(this, TweenFrameProcessor);
	
	    _AnimateProcessor2.call(this, option);
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
	
	  TweenFrameProcessor.prototype.run = function run() {
	    var _this2 = this;
	
	    this.stop();
	    return Util.promise(function (def) {
	      _this2._beforeTransition();
	      _this2._animate = RequestFrame.duration(_this2.duration, _this2._calStyles.bind(_this2), function (err) {
	        _this2._animate = null;
	        _this2._endTransition();
	        if (err) {
	          def.reject(err);
	        } else {
	          def.resolve();
	        }
	      });
	    });
	  };
	
	  TweenFrameProcessor.prototype.stop = function stop() {
	    if (this._animate) {
	      this._animate();
	    }
	  };
	
	  TweenFrameProcessor.prototype._calStyles = function _calStyles(step) {
	    var _this3 = this;
	
	    _.each(this._animateObj, function (ani, name) {
	      Dom.css(_this3.el, name, _this3.effect(step, ani.from, ani.variation, _this3.duration) + ani.unit);
	    });
	  };
	
	  TweenFrameProcessor.prototype._beforeTransition = function _beforeTransition() {
	    var _this4 = this;
	
	    var fromCss = undefined,
	        targetCss = undefined;
	    this._oldCss = Dom.innerCss(this.el, this._cssNames);
	    Dom.css(this.el, this.target);
	    targetCss = Dom.css(this.el, this._targetCssNames);
	    Dom.css(this.el, _.assign({}, this._oldCss, this.from || {}));
	    fromCss = Dom.css(this.el, this._targetCssNames);
	
	    this._animateObj = {};
	    _.each(this._targetCssNames, function (name) {
	      var from = parseFloat(fromCss[name]),
	          to = parseFloat(targetCss[name]),
	          unit = name === 'opacity' ? '' : 'px',
	          variation = to - from;
	      _this4._animateObj[name] = {
	        from: from,
	        end: to,
	        variation: variation,
	        unit: unit
	      };
	    });
	  };
	
	  TweenFrameProcessor.prototype._endTransition = function _endTransition() {
	    this.promise = null;
	    if (!this.keepTarget) {
	      Dom.css(this.el, this._oldCss);
	    }
	    this._oldCss = null;
	  };
	
	  return TweenFrameProcessor;
	})(AnimateProcessor);
	
	registerAnimate([{
	  processor: ClassNameAnimateProcessor,
	  parseTransition: function parseTransition(tran) {
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
	  parseTransition: function parseTransition(tran) {
	    if (_.isPlainObject(tran) && _.isPlainObject(tran['css'])) {
	      return tran['css'];
	    }
	  }
	}, {
	  processor: TweenFrameProcessor,
	  parseTransition: function parseTransition(tran) {
	    if (_.isPlainObject(tran) && _.isPlainObject(tran['tween'])) {
	      return tran['tween'];
	    }
	  }
	}]);
	
	_.assign(Animate, {
	  CssEvent: __webpack_require__(64),
	  Effects: __webpack_require__(72),
	  registerAnimate: registerAnimate,
	  AnimateProcessor: AnimateProcessor,
	  AbstractCssAnimateProcessor: AbstractCssAnimateProcessor,
	  ClassNameAnimateProcessor: ClassNameAnimateProcessor,
	  StyleAnimateProcessor: StyleAnimateProcessor,
	  TweenFrameProcessor: TweenFrameProcessor
	});
	module.exports = Animate;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$create = __webpack_require__(4)["default"];
	
	var _Object$setPrototypeOf = __webpack_require__(7)["default"];
	
	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }
	
	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};
	
	exports.__esModule = true;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { "default": __webpack_require__(5), __esModule: true };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var $ = __webpack_require__(6);
	module.exports = function create(P, D) {
	  return $.create(P, D);
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	
	var $Object = Object;
	module.exports = {
	  create: $Object.create,
	  getProto: $Object.getPrototypeOf,
	  isEnum: ({}).propertyIsEnumerable,
	  getDesc: $Object.getOwnPropertyDescriptor,
	  setDesc: $Object.defineProperty,
	  setDescs: $Object.defineProperties,
	  getKeys: $Object.keys,
	  getNames: $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each: [].forEach
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { "default": __webpack_require__(8), __esModule: true };

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(9);
	module.exports = __webpack_require__(12).Object.setPrototypeOf;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	'use strict';
	
	var $def = __webpack_require__(10);
	$def($def.S, 'Object', { setPrototypeOf: __webpack_require__(13).set });

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var global = __webpack_require__(11),
	    core = __webpack_require__(12),
	    PROTOTYPE = 'prototype';
	var ctx = function ctx(fn, that) {
	  return function () {
	    return fn.apply(that, arguments);
	  };
	};
	var $def = function $def(type, name, source) {
	  var key,
	      own,
	      out,
	      exp,
	      isGlobal = type & $def.G,
	      isProto = type & $def.P,
	      target = isGlobal ? global : type & $def.S ? global[name] : (global[name] || {})[PROTOTYPE],
	      exports = isGlobal ? core : core[name] || (core[name] = {});
	  if (isGlobal) source = name;
	  for (key in source) {
	    // contains in native
	    own = !(type & $def.F) && target && key in target;
	    if (own && key in exports) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    if (isGlobal && typeof target[key] != 'function') exp = source[key];
	    // bind timers to global for call from export context
	    else if (type & $def.B && own) exp = ctx(out, global);
	      // wrap global constructors for prevent change them in library
	      else if (type & $def.W && target[key] == out) !(function (C) {
	          exp = function (param) {
	            return this instanceof C ? new C(param) : C(param);
	          };
	          exp[PROTOTYPE] = C[PROTOTYPE];
	        })(out);else exp = isProto && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export
	    exports[key] = exp;
	    if (isProto) (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$def.F = 1; // forced
	$def.G = 2; // global
	$def.S = 4; // static
	$def.P = 8; // proto
	$def.B = 16; // bind
	$def.W = 32; // wrap
	module.exports = $def;

/***/ },
/* 11 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	'use strict';
	
	var UNDEFINED = 'undefined';
	var global = module.exports = typeof window != UNDEFINED && window.Math == Math ? window : typeof self != UNDEFINED && self.Math == Math ? self : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	var core = module.exports = {};
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	'use strict';
	
	var _Object$setPrototypeOf = __webpack_require__(7)['default'];
	
	var getDesc = __webpack_require__(6).getDesc,
	    isObject = __webpack_require__(14),
	    anObject = __webpack_require__(15);
	var check = function check(O, proto) {
	  anObject(O);
	  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: _Object$setPrototypeOf || ('__proto__' in {} // eslint-disable-line
	  ? (function (buggy, set) {
	    try {
	      set = __webpack_require__(16)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	      set({}, []);
	    } catch (e) {
	      buggy = true;
	    }
	    return function setPrototypeOf(O, proto) {
	      check(O, proto);
	      if (buggy) O.__proto__ = proto;else set(O, proto);
	      return O;
	    };
	  })() : undefined),
	  check: check
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	// http://jsperf.com/core-js-isobject
	'use strict';
	
	module.exports = function (it) {
	  return it !== null && (typeof it == 'object' || typeof it == 'function');
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var isObject = __webpack_require__(14);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	'use strict';
	
	var aFunction = __webpack_require__(17);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1:
	      return function (a) {
	        return fn.call(that, a);
	      };
	    case 2:
	      return function (a, b) {
	        return fn.call(that, a, b);
	      };
	    case 3:
	      return function (a, b, c) {
	        return fn.call(that, a, b, c);
	      };
	  }return function () /* ...args */{
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { "default": __webpack_require__(19), __esModule: true };

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(20);
	__webpack_require__(21);
	__webpack_require__(39);
	__webpack_require__(46);
	__webpack_require__(62);
	module.exports = __webpack_require__(12).Map;

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at = __webpack_require__(22)(true);
	
	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(25)(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0; // next index
	  // 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t,
	      index = this._i,
	      point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// true  -> String#at
	// false -> String#codePointAt
	'use strict';
	
	var toInteger = __webpack_require__(23),
	    defined = __webpack_require__(24);
	module.exports = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(defined(that)),
	        i = toInteger(pos),
	        l = s.length,
	        a,
	        b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	"use strict";
	
	var ceil = Math.ceil,
	    floor = Math.floor;
	module.exports = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 24 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	"use strict";
	
	module.exports = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY = __webpack_require__(26),
	    $def = __webpack_require__(10),
	    $redef = __webpack_require__(27),
	    hide = __webpack_require__(28),
	    has = __webpack_require__(32),
	    SYMBOL_ITERATOR = __webpack_require__(33)('iterator'),
	    Iterators = __webpack_require__(36),
	    BUGGY = !([].keys && 'next' in [].keys()),
	    // Safari has buggy iterators w/o `next`
	FF_ITERATOR = '@@iterator',
	    KEYS = 'keys',
	    VALUES = 'values';
	var returnThis = function returnThis() {
	  return this;
	};
	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE) {
	  __webpack_require__(37)(Constructor, NAME, next);
	  var createMethod = function createMethod(kind) {
	    switch (kind) {
	      case KEYS:
	        return function keys() {
	          return new Constructor(this, kind);
	        };
	      case VALUES:
	        return function values() {
	          return new Constructor(this, kind);
	        };
	    }return function entries() {
	      return new Constructor(this, kind);
	    };
	  };
	  var TAG = NAME + ' Iterator',
	      proto = Base.prototype,
	      _native = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
	      _default = _native || createMethod(DEFAULT),
	      methods,
	      key;
	  // Fix native
	  if (_native) {
	    var IteratorPrototype = __webpack_require__(6).getProto(_default.call(new Base()));
	    // Set @@toStringTag to native iterators
	    __webpack_require__(38)(IteratorPrototype, TAG, true);
	    // FF fix
	    if (!LIBRARY && has(proto, FF_ITERATOR)) hide(IteratorPrototype, SYMBOL_ITERATOR, returnThis);
	  }
	  // Define iterator
	  if (!LIBRARY || FORCE) hide(proto, SYMBOL_ITERATOR, _default);
	  // Plug for library
	  Iterators[NAME] = _default;
	  Iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      keys: IS_SET ? _default : createMethod(KEYS),
	      values: DEFAULT == VALUES ? _default : createMethod(VALUES),
	      entries: DEFAULT != VALUES ? _default : createMethod('entries')
	    };
	    if (FORCE) for (key in methods) {
	      if (!(key in proto)) $redef(proto, key, methods[key]);
	    } else $def($def.P + $def.F * BUGGY, NAME, methods);
	  }
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = true;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(28);

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var $ = __webpack_require__(6),
	    createDesc = __webpack_require__(29);
	module.exports = __webpack_require__(30) ? function (object, key, value) {
	  return $.setDesc(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	'use strict';
	
	module.exports = !__webpack_require__(31)(function () {
	  return Object.defineProperty({}, 'a', { get: function get() {
	      return 7;
	    } }).a != 7;
	});

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	"use strict";
	
	var hasOwnProperty = ({}).hasOwnProperty;
	module.exports = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var store = __webpack_require__(34)('wks'),
	    Symbol = __webpack_require__(11).Symbol;
	module.exports = function (name) {
	  return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || __webpack_require__(35))('Symbol.' + name));
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var global = __webpack_require__(11),
	    SHARED = '__core-js_shared__',
	    store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';
	
	var id = 0,
	    px = Math.random();
	module.exports = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = {};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $ = __webpack_require__(6),
	    IteratorPrototype = {};
	
	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(28)(IteratorPrototype, __webpack_require__(33)('iterator'), function () {
	  return this;
	});
	
	module.exports = function (Constructor, NAME, next) {
	  Constructor.prototype = $.create(IteratorPrototype, { next: __webpack_require__(29)(1, next) });
	  __webpack_require__(38)(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var has = __webpack_require__(32),
	    hide = __webpack_require__(28),
	    TAG = __webpack_require__(33)('toStringTag');
	
	module.exports = function (it, tag, stat) {
	  if (it && !has(it = stat ? it : it.prototype, TAG)) hide(it, TAG, tag);
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(40);
	var Iterators = __webpack_require__(36);
	Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var setUnscope = __webpack_require__(41),
	    step = __webpack_require__(42),
	    Iterators = __webpack_require__(36),
	    toIObject = __webpack_require__(43);
	
	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	__webpack_require__(25)(Array, 'Array', function (iterated, kind) {
	  this._t = toIObject(iterated); // target
	  this._i = 0; // next index
	  this._k = kind; // kind
	  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t,
	      kind = this._k,
	      index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return step(1);
	  }
	  if (kind == 'keys') return step(0, index);
	  if (kind == 'values') return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');
	
	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;
	
	setUnscope('keys');
	setUnscope('values');
	setUnscope('entries');

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function () {/* empty */};

/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (done, value) {
	  return { value: value, done: !!done };
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	'use strict';
	
	var IObject = __webpack_require__(44),
	    defined = __webpack_require__(24);
	module.exports = function (it) {
	  return IObject(defined(it));
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// indexed object, fallback for non-array-like ES3 strings
	'use strict';
	
	var cof = __webpack_require__(45);
	module.exports = 0 in Object('z') ? Object : function (it) {
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	"use strict";
	
	var toString = ({}).toString;
	
	module.exports = function (it) {
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(47);
	
	// 23.1 Map Objects
	__webpack_require__(61)('Map', function (get) {
	  return function Map() {
	    return get(this, arguments[0]);
	  };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key) {
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value) {
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Object$isExtensible = __webpack_require__(48)['default'];
	
	var $ = __webpack_require__(6),
	    hide = __webpack_require__(28),
	    ctx = __webpack_require__(16),
	    species = __webpack_require__(52),
	    strictNew = __webpack_require__(53),
	    defined = __webpack_require__(24),
	    forOf = __webpack_require__(54),
	    step = __webpack_require__(42),
	    ID = __webpack_require__(35)('id'),
	    $has = __webpack_require__(32),
	    isObject = __webpack_require__(14),
	    isExtensible = _Object$isExtensible || isObject,
	    SUPPORT_DESC = __webpack_require__(30),
	    SIZE = SUPPORT_DESC ? '_s' : 'size',
	    id = 0;
	
	var fastKey = function fastKey(it, create) {
	  // return primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!$has(it, ID)) {
	    // can't set id to frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add id
	    if (!create) return 'E';
	    // add missing object id
	    hide(it, ID, ++id);
	    // return object id with prefix
	  }return 'O' + it[ID];
	};
	
	var getEntry = function getEntry(that, key) {
	  // fast case
	  var index = fastKey(key),
	      entry;
	  if (index !== 'F') return that._i[index];
	  // frozen object case
	  for (entry = that._f; entry; entry = entry.n) {
	    if (entry.k == key) return entry;
	  }
	};
	
	module.exports = {
	  getConstructor: function getConstructor(wrapper, NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      strictNew(that, C, NAME);
	      that._i = $.create(null); // index
	      that._f = undefined; // first entry
	      that._l = undefined; // last entry
	      that[SIZE] = 0; // size
	      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    __webpack_require__(60)(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        for (var that = this, data = that._i, entry = that._f; entry; entry = entry.n) {
	          entry.r = true;
	          if (entry.p) entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function _delete(key) {
	        var that = this,
	            entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.n,
	              prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if (prev) prev.n = next;
	          if (next) next.p = prev;
	          if (that._f == entry) that._f = next;
	          if (that._l == entry) that._l = prev;
	          that[SIZE]--;
	        }return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */) {
	        var f = ctx(callbackfn, arguments[1], 3),
	            entry;
	        while (entry = entry ? entry.n : this._f) {
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while (entry && entry.r) entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });
	    if (SUPPORT_DESC) $.setDesc(C.prototype, 'size', {
	      get: function get() {
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function def(that, key, value) {
	    var entry = getEntry(that, key),
	        prev,
	        index;
	    // change existing entry
	    if (entry) {
	      entry.v = value;
	      // create new entry
	    } else {
	        that._l = entry = {
	          i: index = fastKey(key, true), // <- index
	          k: key, // <- key
	          v: value, // <- value
	          p: prev = that._l, // <- previous entry
	          n: undefined, // <- next entry
	          r: false // <- removed
	        };
	        if (!that._f) that._f = entry;
	        if (prev) prev.n = entry;
	        that[SIZE]++;
	        // add to index
	        if (index !== 'F') that._i[index] = entry;
	      }return that;
	  },
	  getEntry: getEntry,
	  setStrong: function setStrong(C, NAME, IS_MAP) {
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    __webpack_require__(25)(C, NAME, function (iterated, kind) {
	      this._t = iterated; // target
	      this._k = kind; // kind
	      this._l = undefined; // previous
	    }, function () {
	      var that = this,
	          kind = that._k,
	          entry = that._l;
	      // revert to the last existing entry
	      while (entry && entry.r) entry = entry.p;
	      // get next entry
	      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if (kind == 'keys') return step(0, entry.k);
	      if (kind == 'values') return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);
	
	    // add [@@species], 23.1.2.2, 23.2.2.2
	    species(C);
	    species(__webpack_require__(12)[NAME]); // for wrapper
	  }
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	module.exports = { "default": __webpack_require__(49), __esModule: true };

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	__webpack_require__(50);
	module.exports = __webpack_require__(12).Object.isExtensible;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.11 Object.isExtensible(O)
	'use strict';
	
	var isObject = __webpack_require__(14);
	
	__webpack_require__(51)('isExtensible', function ($isExtensible) {
	  return function isExtensible(it) {
	    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
	  };
	});

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	'use strict';
	
	module.exports = function (KEY, exec) {
	  var $def = __webpack_require__(10),
	      fn = (__webpack_require__(12).Object || {})[KEY] || Object[KEY],
	      exp = {};
	  exp[KEY] = exec(fn);
	  $def($def.S + $def.F * __webpack_require__(31)(function () {
	    fn(1);
	  }), 'Object', exp);
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $ = __webpack_require__(6),
	    SPECIES = __webpack_require__(33)('species');
	module.exports = function (C) {
	  if (__webpack_require__(30) && !(SPECIES in C)) $.setDesc(C, SPECIES, {
	    configurable: true,
	    get: function get() {
	      return this;
	    }
	  });
	};

/***/ },
/* 53 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) throw TypeError(name + ": use the 'new' operator!");
	  return it;
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var ctx = __webpack_require__(16),
	    call = __webpack_require__(55),
	    isArrayIter = __webpack_require__(56),
	    anObject = __webpack_require__(15),
	    toLength = __webpack_require__(57),
	    getIterFn = __webpack_require__(58);
	module.exports = function (iterable, entries, fn, that) {
	  var iterFn = getIterFn(iterable),
	      f = ctx(fn, that, entries ? 2 : 1),
	      index = 0,
	      length,
	      step,
	      iterator;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
	    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    call(iterator, f, step.value, entries);
	  }
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	'use strict';
	
	var anObject = __webpack_require__(15);
	module.exports = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	    // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	'use strict';
	
	var Iterators = __webpack_require__(36),
	    ITERATOR = __webpack_require__(33)('iterator');
	module.exports = function (it) {
	  return (Iterators.Array || Array.prototype[ITERATOR]) === it;
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	'use strict';
	
	var toInteger = __webpack_require__(23),
	    min = Math.min;
	module.exports = function (it) {
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var classof = __webpack_require__(59),
	    ITERATOR = __webpack_require__(33)('iterator'),
	    Iterators = __webpack_require__(36);
	module.exports = __webpack_require__(12).getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	'use strict';
	
	var cof = __webpack_require__(45),
	    TAG = __webpack_require__(33)('toStringTag'),
	
	// ES3 wrong here
	ARG = cof((function () {
	  return arguments;
	})()) == 'Arguments';
	
	module.exports = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	  // @@toStringTag case
	  : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
	  // builtinTag case
	  : ARG ? cof(O)
	  // ES3 arguments fallback
	  : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var $redef = __webpack_require__(27);
	module.exports = function (target, src) {
	  for (var key in src) $redef(target, key, src[key]);
	  return target;
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $ = __webpack_require__(6),
	    $def = __webpack_require__(10),
	    hide = __webpack_require__(28),
	    forOf = __webpack_require__(54),
	    strictNew = __webpack_require__(53);
	
	module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
	  var Base = __webpack_require__(11)[NAME],
	      C = Base,
	      ADDER = IS_MAP ? 'set' : 'add',
	      proto = C && C.prototype,
	      O = {};
	  if (!__webpack_require__(30) || typeof C != 'function' || !(IS_WEAK || proto.forEach && !__webpack_require__(31)(function () {
	    new C().entries().next();
	  }))) {
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    __webpack_require__(60)(C.prototype, methods);
	  } else {
	    C = wrapper(function (target, iterable) {
	      strictNew(target, C, NAME);
	      target._c = new Base();
	      if (iterable != undefined) forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','), function (KEY) {
	      var chain = KEY == 'add' || KEY == 'set';
	      if (KEY in proto && !(IS_WEAK && KEY == 'clear')) hide(C.prototype, KEY, function (a, b) {
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return chain ? this : result;
	      });
	    });
	    if ('size' in proto) $.setDesc(C.prototype, 'size', {
	      get: function get() {
	        return this._c.size;
	      }
	    });
	  }
	
	  __webpack_require__(38)(C, NAME);
	
	  O[NAME] = C;
	  $def($def.G + $def.W + $def.F, O);
	
	  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);
	
	  return C;
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	'use strict';
	
	var $def = __webpack_require__(10);
	
	$def($def.P, 'Map', { toJSON: __webpack_require__(63)('Map') });

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	'use strict';
	
	var forOf = __webpack_require__(54),
	    classof = __webpack_require__(59);
	module.exports = function (NAME) {
	  return function toJSON() {
	    if (classof(this) != NAME) throw TypeError(NAME + "#toJSON isn't generic");
	    var arr = [];
	    forOf(this, false, arr.push, arr);
	    return arr;
	  };
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(65);
	
	var _require = __webpack_require__(66);
	
	var Dom = _require.Dom;
	var EVENT_NAME_MAP = {
	  transitionend: {
	    transition: 'transitionend',
	    WebkitTransition: 'webkitTransitionEnd',
	    MozTransition: 'mozTransitionEnd',
	    OTransition: 'oTransitionEnd',
	    msTransition: 'MSTransitionEnd'
	  },
	
	  animationend: {
	    animation: 'animationend',
	    WebkitAnimation: 'webkitAnimationEnd',
	    MozAnimation: 'mozAnimationEnd',
	    OAnimation: 'oAnimationEnd',
	    msAnimation: 'MSAnimationEnd'
	  }
	};
	var endEvents = (function detectEvents(window, document) {
	  var testEl = document.createElement('div'),
	      style = testEl.style,
	      endEvents = [];
	  if (!('AnimationEvent' in window)) {
	    delete EVENT_NAME_MAP.animationend.animation;
	  }
	  if (!('TransitionEvent' in window)) {
	    delete EVENT_NAME_MAP.transitionend.transition;
	  }
	  _.each(EVENT_NAME_MAP, function (baseEvents, baseEventName) {
	    _.each(baseEvents, function (evt, evtName) {
	      if (evtName in style) {
	        endEvents.push(evt);
	      }
	    });
	  });
	  return endEvents;
	})(window, document);
	
	var AnimateEvents = {
	  onEnd: function onEnd(el, eventListener) {
	    if (endEvents.length == 0) {
	      setTimeout(eventListener, 0);
	    } else {
	      endEvents.forEach(function (endEvent) {
	        Dom.on(el, endEvent, eventListener);
	      });
	    }
	  },
	  unEnd: function unEnd(el, eventListener) {
	    if (endEvents.length >= 0) {
	      endEvents.forEach(function (endEvent) {
	        Dom.un(el, endEvent, eventListener);
	      });
	    }
	  },
	  endEvents: endEvents,
	  isSupport: function isSupport() {
	    return endEvents.length > 0;
	  }
	};
	
	module.exports = AnimateEvents;

/***/ },
/* 65 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_65__;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	
	/**!
	 * Dat.js Module:./util
	 */
	
	'use strict';
	
	var _ = __webpack_require__(65),
	    Q = __webpack_require__(67);
	
	var Util = {
	  promise: function promise(c) {
	    var def = Q.defer();
	    c(def);
	    return def.promise;
	  },
	  promiseAll: function promiseAll(promises) {
	    if (!_.isArray(promises)) {
	      promises = _.slice(arguments);
	    }
	    return Q.promise.all(promises);
	  },
	
	  assignIf: _.partialRight(_.assign, function (value, newVal, attr, obj) {
	    return _.has(obj, attr) ? value : newVal;
	  }),
	
	  assignBy: function assignBy(includes, excludes) {
	    var args = _.slice(arguments, 2);
	    includes = Util.array(includes);
	    excludes = Util.array(excludes);
	    if (includes.length > 0 || excludes.length > 0) {
	      return _.partialRight(_.assign, function (value, newVal, attr, obj) {
	        if (excludes.length > 0 && _.include(excludes, attr) || includes.length > 0 && !_.include(includes, attr)) {
	          return value;
	        }
	        return newVal;
	      }).apply(null, args);
	    }
	    return _.assign.apply(null, args);
	  },
	
	  assignWith: function assignWith(includes) {
	    var args = _.slice(arguments);
	    args.splice(1, 0, []);
	    return Util.assignBy.apply(null, args);
	  },
	
	  assignWithout: function assignWithout(excludes) {
	    var args = _.slice(arguments);
	    args.splice(0, 0, []);
	    return Util.assignBy.apply(null, args);
	  },
	
	  array: function array(_array, itemTypes) {
	    if (_.isUndefined(_array)) {
	      _array = [];
	    } else if (!_.isArray(_array)) {
	      _array = [_array];
	    }
	    if (itemTypes) {
	      if (!_.isArray(itemTypes)) {
	        itemTypes = [itemTypes];
	      }
	      _array = _.filter(_array, function (item) {
	        return _.findIndex(itemTypes, function (type) {
	          return type(item);
	        }) != -1;
	      });
	    }
	    return _array;
	  },
	
	  pushIf: function pushIf(array) {
	    _.chain(arguments).slice(1).each(function (arg) {
	      if (!_.include(array, arg)) {
	        array.push(arg);
	      }
	    });
	  },
	
	  chainedFn: function chainedFn(funcs, scope) {
	    return _.chain(funcs).filter(function (f) {
	      return _.isFunction(f);
	    }).reduce(function (acc, f) {
	      if (acc === null) {
	        return f;
	      }
	      return function chainedFunction() {
	        acc.apply(scope, arguments);
	        f.apply(scope, arguments);
	      };
	    }, null).value();
	  },
	
	  Dom: __webpack_require__(68),
	  RequestFrame: __webpack_require__(70),
	  Log: __webpack_require__(71)
	};
	module.exports = Util;

/***/ },
/* 67 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_67__;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(65),
	    $ = __webpack_require__(69),
	    proxies = ['on', {
	  require: 'off',
	  bind: 'un'
	}, 'addClass', 'removeClass', 'css'];
	var Dom = {};
	_.each(proxies, function (name) {
	  var bindName = undefined,
	      reqName = undefined;
	  bindName = reqName = name;
	  if (_.isPlainObject(name)) {
	    bindName = name.bind;
	    reqName = name.require;
	  }
	  Dom[bindName] = function (el) {
	    el = $(el);
	    return el[reqName].apply(el, _.slice(arguments, 1));
	  };
	});
	Dom.innerCss = function (el, attr) {
	  if (_.isString(attr)) {
	    return el.style[attr];
	  } else if (_.isArray(attr)) {
	    if (attr.length == 1) {
	      return el.style[attr[0]];
	    } else {
	      var _ret = (function () {
	        var ret = {};
	        _.each(attr, function (att) {
	          ret[att] = el.style[att];
	        });
	        return {
	          v: ret
	        };
	      })();
	
	      if (typeof _ret === 'object') return _ret.v;
	    }
	  }
	};
	module.exports = Dom;

/***/ },
/* 69 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_69__;

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var lastTime = 0;
	var _ = __webpack_require__(65),
	    prefixes = 'webkit moz ms o'.split(' '),
	    getFrame = function getFrame(prop, defaultVal) {
	  return window[prop] || prefixes.find(function (prefix) {
	    return window[prefixes + _.capitalize(prop)];
	  }) || defaultVal;
	},
	    request = getFrame('requestAnimationFrame', function requestAnimationFrame(callback) {
	  var currTime = new Date().getTime(),
	      timeToCall = Math.max(0, 16 - (currTime - lastTime)),
	      reqId = setTimeout(function () {
	    callback(currTime + timeToCall);
	  }, timeToCall);
	  lastTime = currTime + timeToCall;
	  return reqId;
	}).bind(window),
	    cancel = getFrame('cancelAnimationFrame', function cancelAnimationFrame(reqId) {
	  clearTimeout(reqId);
	}).bind(window),
	    duration = function duration(duration, onStep, onEnd) {
	  var start = new Date(),
	      reqid = undefined,
	      step = 0;
	  function end(state, err) {
	    reqid = null;
	    onEnd(state, err);
	  }
	  function calc() {
	    if (!reqid) return;
	    if ((step = new Date() - start) < duration) {
	      try {
	        onStep(step);
	        reqid = request(calc);
	      } catch (e) {
	        end('error', e.message);
	      }
	    } else {
	      end('finish');
	    }
	  }
	  reqid = request(calc);
	  return function () {
	    if (reqid) {
	      cancel(reqid);
	      end('cancel');
	    }
	  };
	};
	module.exports = {
	  request: request,
	  cancel: cancel,
	  duration: duration
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _ = __webpack_require__(65);
	
	function callconsole(fn, args) {
	  if (console && console[fn]) {
	    return console[fn].apply(console, args);
	  }
	}
	module.exports = {
	  debug: function debug() {
	    callconsole('debug', ['[debug]'].concat(_.slice(arguments)));
	  },
	  log: function log() {
	    callconsole('log', ['[info]'].concat(_.slice(arguments)));
	  },
	  warn: function warn() {
	    callconsole('warn', ['[warn]'].concat(_.slice(arguments)));
	  },
	  err: function err() {
	    callconsole('error', ['[error]'].concat(_.slice(arguments)));
	  },
	  group: function group(callback) {
	    var args = _.slice(arguments, 1);
	    callconsole('group', args);
	    callback();
	    callconsole('groupEnd', args);
	  },
	  time: function time(callback) {
	    var args = _.slice(arguments, 1);
	    callconsole('time', args);
	    callback();
	    callconsole('timeEnd', args);
	  }
	};

/***/ },
/* 72 */
/***/ function(module, exports) {

	/*
	 * Effect.js
	 * t: current time（当前时间）
	 * b: beginning value（初始值）
	 * c: change in value（变化量）
	 * d: duration（持续时间）
	*/
	'use strict';
	
	module.exports = {
	  linear: function linear(t, b, c, d) {
	    return c * t / d + b;
	  },
	  'quad-in': function quadIn(t, b, c, d) {
	    return c * (t /= d) * t + b;
	  },
	  'quad-out': function quadOut(t, b, c, d) {
	    return -c * (t /= d) * (t - 2) + b;
	  },
	  'quad-in-out': function quadInOut(t, b, c, d) {
	    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
	    return -c / 2 * (--t * (t - 2) - 1) + b;
	  },
	  'cubic-in': function cubicIn(t, b, c, d) {
	    return c * (t /= d) * t * t + b;
	  },
	  'cubic-out': function cubicOut(t, b, c, d) {
	    return c * ((t = t / d - 1) * t * t + 1) + b;
	  },
	  'cubic-in-out': function cubicInOut(t, b, c, d) {
	    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
	    return c / 2 * ((t -= 2) * t * t + 2) + b;
	  },
	  'quart-in': function quartIn(t, b, c, d) {
	    return c * (t /= d) * t * t * t + b;
	  },
	  'quart-out': function quartOut(t, b, c, d) {
	    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	  },
	  'quart-in-out': function quartInOut(t, b, c, d) {
	    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
	    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	  },
	  'quint-in': function quintIn(t, b, c, d) {
	    return c * (t /= d) * t * t * t * t + b;
	  },
	  'quint-out': function quintOut(t, b, c, d) {
	    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
	  },
	  'quint-in-out': function quintInOut(t, b, c, d) {
	    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
	    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
	  },
	  'sine-in': function sineIn(t, b, c, d) {
	    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
	  },
	  'sine-out': function sineOut(t, b, c, d) {
	    return c * Math.sin(t / d * (Math.PI / 2)) + b;
	  },
	  'sine-in-out': function sineInOut(t, b, c, d) {
	    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
	  },
	  'expo-in': function expoIn(t, b, c, d) {
	    return t == 0 ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
	  },
	  'expo-out': function expoOut(t, b, c, d) {
	    return t == d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
	  },
	  'expo-in-out': function expoInOut(t, b, c, d) {
	    if (t == 0) return b;
	    if (t == d) return b + c;
	    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
	    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
	  },
	  'circ-in': function circIn(t, b, c, d) {
	    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
	  },
	  'circ-out': function circOut(t, b, c, d) {
	    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
	  },
	  'circ-in-out': function circInOut(t, b, c, d) {
	    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
	    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
	  },
	  'elastic-in': function elasticIn(t, b, c, d, a, p) {
	    var s;
	    if (t == 0) return b;
	    if ((t /= d) == 1) return b + c;
	    if (typeof p == "undefined") p = d * .3;
	    if (!a || a < Math.abs(c)) {
	      s = p / 4;
	      a = c;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	  },
	  'elastic-out': function elasticOut(t, b, c, d, a, p) {
	    var s;
	    if (t == 0) return b;
	    if ((t /= d) == 1) return b + c;
	    if (typeof p == "undefined") p = d * .3;
	    if (!a || a < Math.abs(c)) {
	      a = c;
	      s = p / 4;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	  },
	  'elastic-in-out': function elasticInOut(t, b, c, d, a, p) {
	    var s;
	    if (t == 0) return b;
	    if ((t /= d / 2) == 2) return b + c;
	    if (typeof p == "undefined") p = d * (.3 * 1.5);
	    if (!a || a < Math.abs(c)) {
	      a = c;
	      s = p / 4;
	    } else {
	      s = p / (2 * Math.PI) * Math.asin(c / a);
	    }
	    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
	  },
	  'back-in': function backIn(t, b, c, d, s) {
	    if (typeof s == "undefined") s = 1.70158;
	    return c * (t /= d) * t * ((s + 1) * t - s) + b;
	  },
	  'back-out': function backOut(t, b, c, d, s) {
	    if (typeof s == "undefined") s = 1.70158;
	    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	  },
	  'back-in-out': function backInOut(t, b, c, d, s) {
	    if (typeof s == "undefined") s = 1.70158;
	    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
	    return c / 2 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
	  },
	  'bounce-in': function bounceIn(t, b, c, d) {
	    return c - Effect['bounce-out'](d - t, 0, c, d) + b;
	  },
	  'bounce-out': function bounceOut(t, b, c, d) {
	    if ((t /= d) < 1 / 2.75) {
	      return c * (7.5625 * t * t) + b;
	    } else if (t < 2 / 2.75) {
	      return c * (7.5625 * (t -= 1.5 / 2.75) * t + .75) + b;
	    } else if (t < 2.5 / 2.75) {
	      return c * (7.5625 * (t -= 2.25 / 2.75) * t + .9375) + b;
	    } else {
	      return c * (7.5625 * (t -= 2.625 / 2.75) * t + .984375) + b;
	    }
	  },
	  'bounce-in-out': function bounceInOut(t, b, c, d) {
	    if (t < d / 2) {
	      return Effect['bounce-in'](t * 2, 0, c, d) * .5 + b;
	    } else {
	      return Effect['bounce-out'](t * 2 - d, 0, c, d) * .5 + c * .5 + b;
	    }
	  }
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	/**!
	 * Dat.js Module:./event
	 */
	
	'use strict';
	
	var _classCallCheck = __webpack_require__(2)['default'];
	
	var _ = __webpack_require__(65);
	var Util = __webpack_require__(66);
	var Log = Util.Log;
	
	var Event = (function () {
	  function Event(eventTypes, scope) {
	    _classCallCheck(this, Event);
	
	    this._listeners = {};
	    this._eventTypes = [];
	    if (eventTypes) {
	      this.eventTypes(eventTypes);
	    }
	    this._event_scope = scope || this;
	  }
	
	  Event.prototype.eventTypes = function eventTypes() {
	    var _this = this;
	
	    return _.each(arguments, function (arg) {
	      if (_.isArray(arg)) {
	        _this._eventTypes.apply(_this, arg);
	      } else if (_.isString(arg)) {
	        Util.pushIf(_this._eventTypes, arg);
	      }
	    });
	    return this._eventTypes;
	  };
	
	  Event.prototype.on = function on(evt, callback) {
	    var _this2 = this;
	
	    if (_.isString(evt) && _is.isFunction(callback)) {
	      if (_.include(this._eventTypes, evt)) {
	        Log.warn('event type is undefined', evt, callback);
	      }
	      var handlers = this._listeners[evt];
	      if (!_.isArray(handlers)) {
	        handlers = this._listeners[evt] = [];
	      }
	      Util.pushIf(handlers, callback);
	      return this.un.bind(this, evt, callback);
	    } else if (_.isArray(evt) || is.isPlainObject(evt)) {
	      return Util.chainedFn(_.map(evt, function (evt) {
	        return _this2.on(evt.type, evt.handler);
	      }), this);
	    }
	    throw 'Invalid Param';
	  };
	
	  Event.prototype.un = function un(evtname, callback) {
	    var handlers = this._listeners[evtname];
	    if (!handlers || handlers.length == 0) return;
	    if (arguments.length == 1) {
	      this._listeners[evtname] = [];
	    } else if (_.isFunction(callback)) {
	      _.pull(handlers, callback);
	    }
	  };
	
	  Event.prototype.has = function has(evtname, callback) {
	    var handlers = this._listeners[evtname];
	    return handlers && _.include(handlers, callback);
	  };
	
	  Event.prototype.fire = function fire(evtname) {
	    var _arguments = arguments,
	        _this3 = this;
	
	    var handlers = this._listeners[evtname];
	    if (handlers && handlers.length > 0) {
	      (function () {
	        var args = _.slice(_arguments, 1);
	        _.each(handlers, function (h) {
	          if (_.isFunction(h)) {
	            try {
	              h.apply(_this3._event_scope, args);
	            } catch (e) {
	              Log.err(e);
	            }
	          }
	        });
	      })();
	    }
	  };
	
	  return Event;
	})();
	
	module.exports = Event;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=dat.js.map