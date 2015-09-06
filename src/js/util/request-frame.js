let lastTime = 0;
const _ = require('lodash'),
  prefixes = 'webkit moz ms o'.split(' '),
  getFrame = function getFrame(prop, defaultVal) {
    return window[prop] ||
      prefixes.find((prefix) => {
        return window[prefixes + _.capitalize(prop)];
      }) ||
      defaultVal;
  },
  request = getFrame('requestAnimationFrame', function requestAnimationFrame(callback) {
    let currTime = new Date().getTime(),
      timeToCall = Math.max(0, 16 - (currTime - lastTime)),
      reqId = setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
    lastTime = currTime + timeToCall;
    return reqId;
  }).bind(window),
  cancel = getFrame('cancelAnimationFrame', function cancelAnimationFrame(reqId) {
    clearTimeout(reqId);
  }).bind(window),
  duration = function duration(duration, onStep, onEnd) {
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
          reqid = request(calc);
        } catch (e) {
          end('error', e.message);
        }
      } else {
        end('finish');
      }
    }
    reqid = request(calc);
    return function() {
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
