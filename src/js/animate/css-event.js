const _ = require('lodash'),
	{Dom} = require('../util'),
  EVENT_NAME_MAP = {
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
  },
  endEvents = (function detectEvents(window, document) {
    let testEl = document.createElement('div'),
      style = testEl.style,
      endEvents = [];
    if (!('AnimationEvent' in window)) {
      delete EVENT_NAME_MAP.animationend.animation;
    }
    if (!('TransitionEvent' in window)) {
      delete EVENT_NAME_MAP.transitionend.transition;
    }
    _.each(EVENT_NAME_MAP, (baseEvents, baseEventName)=>{
    	_.each(baseEvents, (evt, evtName)=>{
    		if(evtName in style){
    			endEvents.push(evt);
    		}
    	});
    });
    return endEvents;
  })(window, document);

var AnimateEvents = {
  onEnd(el, eventListener) {
    if (endEvents.length == 0) {
      setTimeout(eventListener, 0);
    } else {
      endEvents.forEach(function(endEvent) {
        Dom.on(el, endEvent, eventListener);
      });
    }
  },
  unEnd(el, eventListener) {
    if (endEvents.length >= 0) {
      endEvents.forEach(function(endEvent) {
        Dom.un(el, endEvent, eventListener);
      });
    }
  },
  endEvents: endEvents,
  isSupport() {
    return endEvents.length > 0;
  }
};

module.exports = AnimateEvents;
