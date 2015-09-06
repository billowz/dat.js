/*
 * Effect.js
 * t: current time（当前时间）
 * b: beginning value（初始值）
 * c: change in value（变化量）
 * d: duration（持续时间）
*/
module.exports = {
  linear: function(t, b, c, d) {
    return c * t / d + b;
  },
  'quad-in': function(t, b, c, d) {
    return c * (t /= d) * t + b;
  },
  'quad-out': function(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
  },
  'quad-in-out': function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
  },
  'cubic-in': function(t, b, c, d) {
    return c * (t /= d) * t * t + b;
  },
  'cubic-out': function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
  },
  'cubic-in-out': function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
  },
  'quart-in': function(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
  },
  'quart-out': function(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
  },
  'quart-in-out': function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
  },
  'quint-in': function(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  'quint-out': function(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  'quint-in-out': function(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  },
  'sine-in': function(t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
  },
  'sine-out': function(t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
  },
  'sine-in-out': function(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
  },
  'expo-in': function(t, b, c, d) {
    return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
  },
  'expo-out': function(t, b, c, d) {
    return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
  },
  'expo-in-out': function(t, b, c, d) {
    if (t == 0) return b;
    if (t == d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  'circ-in': function(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
  },
  'circ-out': function(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
  },
  'circ-in-out': function(t, b, c, d) {
    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
  },
  'elastic-in': function(t, b, c, d, a, p) {
    var s;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (typeof p == "undefined")
      p = d * .3;
    if (!a || a < Math.abs(c)) {
      s = p / 4;
      a = c;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
  },
  'elastic-out': function(t, b, c, d, a, p) {
    var s;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (typeof p == "undefined")
      p = d * .3;
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
  },
  'elastic-in-out': function(t, b, c, d, a, p) {
    var s;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (typeof p == "undefined")
      p = d * (.3 * 1.5);
    if (!a || a < Math.abs(c)) {
      a = c;
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(c / a);
    }
    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
  },
  'back-in': function(t, b, c, d, s) {
    if (typeof s == "undefined")
      s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
  },
  'back-out': function(t, b, c, d, s) {
    if (typeof s == "undefined")
      s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
  },
  'back-in-out': function(t, b, c, d, s) {
    if (typeof s == "undefined")
      s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
  },
  'bounce-in': function(t, b, c, d) {
    return c - Effect['bounce-out'](d - t, 0, c, d) + b;
  },
  'bounce-out': function(t, b, c, d) {
    if ((t /= d) < (1 / 2.75)) {
      return c * (7.5625 * t * t) + b;
    } else if (t < (2 / 2.75)) {
      return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
    } else if (t < (2.5 / 2.75)) {
      return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
    } else {
      return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
    }
  },
  'bounce-in-out': function(t, b, c, d) {
    if (t < d / 2) {
      return Effect['bounce-in'](t * 2, 0, c, d) * .5 + b;
    } else {
      return Effect['bounce-out'](t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
  }
};
