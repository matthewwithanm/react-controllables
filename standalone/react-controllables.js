!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ControllablesMixin=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var ControllablesMixin, capFirst, getControllableValue, invariant;

invariant = _dereq_('react/lib/invariant');

getControllableValue = function(name, state, props) {
  var _ref;
  return (_ref = props[name]) != null ? _ref : state[name];
};

capFirst = function(str) {
  return "" + (str.charAt(0).toUpperCase()) + str.slice(1);
};

ControllablesMixin = {
  getInitialState: function() {
    var defaultValue, name, state, _i, _len, _ref;
    invariant(!!this.controllables, 'Components that use ControllablesMixin must define a controllables array');
    state = {};
    _ref = this.controllables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      defaultValue = this.props["default" + (capFirst(name))];
      if (defaultValue != null) {
        state[name] = defaultValue;
      }
    }
    return state;
  },
  getControllableValue: function(name) {
    return getControllableValue(name, this.state, this.props);
  },
  componentDidUpdate: function(prevProps, prevState) {
    var cb, name, newValue, oldValue, _base, _i, _len, _ref;
    _ref = this.controllables;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      name = _ref[_i];
      newValue = this.state[name];
      oldValue = getControllableValue(name, prevState, prevProps);
      if (newValue !== oldValue) {
        cb = "on" + (capFirst(name)) + "Change";
        if (typeof (_base = this.props)[cb] === "function") {
          _base[cb](newValue, oldValue);
        }
      }
    }
  }
};

module.exports = ControllablesMixin;

},{"react/lib/invariant":3}],2:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(_dereq_,module,exports){
(function (process){
/**
 * Copyright 2013-2014 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition) {
  if (!condition) {
    var error = new Error(
      'Minified exception occured; use the non-minified dev environment for ' +
      'the full error message and additional helpful warnings.'
    );
    error.framesToPop = 1;
    throw error;
  }
};

if ("production" !== process.env.NODE_ENV) {
  invariant = function(condition, format, a, b, c, d, e, f) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }

    if (!condition) {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      var error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.framesToPop = 1; // we don't care about invariant's own frame
      throw error;
    }
  };
}

module.exports = invariant;

}).call(this,_dereq_("/Users/mjt/Code/projects/react-controllables/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Users/mjt/Code/projects/react-controllables/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":2}]},{},[1])
(1)
});