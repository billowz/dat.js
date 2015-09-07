(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("dat"), require("_"), require("jquery"), require("rivets"));
	else if(typeof define === 'function' && define.amd)
		define(["dat", "_", "jquery", "rivets"], factory);
	else if(typeof exports === 'object')
		exports["dat"] = factory(require("dat"), require("_"), require("jquery"), require("rivets"));
	else
		root["dat"] = factory(root["dat"], root["_"], root["jQuery"], root["rivets"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__) {
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
	'use strict';
	
	var dat = __webpack_require__(1),
	    _ = __webpack_require__(2),
	    $ = __webpack_require__(3),
	    rivets = __webpack_require__(4);
	var Doc = {},
	    Compontents = {
	  Animate: {
	    demos: {
	      Demo: {
	        compontent: __webpack_require__(5),
	        code: ''
	      }
	    },
	    readmes: {}
	  }
	};
	Doc.Compontents = Compontents;
	dat.Doc = Doc;
	$(document).ready(function () {
	  var data = { auction: {
	      product: {
	        name: 'test'
	      },
	      timeLeft: 80
	    } },
	      view = rivets.bind($(__webpack_require__(6)), data);
	  window.view = view;
	  window.data = data;
	  function setTime() {
	    data.auction.timeLeft++;
	    setTimeout(setTime, 1000);
	  }
	  setTime();
	  $(document.body).append(view.els);
	  console.log(view);
	});
	module.exports = dat;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = '<section id="auction"><h3>{ auction.product.name }</h3><p>Current bid: { auction.currentBid | money }</p><aside rv-if="auction.timeLeft | lt 120" attr="{auction.timeLeft}">Hurry up! There is { auction.timeLeft | time } left.</aside></section>';

/***/ }
/******/ ])
});
;
//# sourceMappingURL=dat.doc.js.map