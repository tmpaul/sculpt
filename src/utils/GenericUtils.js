import merge from "deepmerge";

export function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  let last, deferTimer;
  return function() {
    let context = scope || this;
    let now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  let timeout;
  return function(...args) {
    let later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(null, args);
      }
    };
    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(null, args);
    }
  };
};

class ObjectUtilsConstructor {

  constructor() {
    this.NOOP = function() {};
  }

  isObject(target) {
    // Exclude dates, null, arrays
    return (target !== undefined) && (target !== null) && (typeof target === "object") && (Object.prototype.toString.call(target) === "[object Object]");
  }

  toArray(object) {
    let arr = [];
    if (!this.isObject(object)) {
      return arr;
    } else {
      Object.keys(object).map(function(key) {
        arr.push(object[key]);
      });
      return arr;
    }
  }

  extend(object, ...overrides) {
    return merge.all([ object ].concat(overrides).filter(Boolean), {
      clone: true
    });
  }

  /**
   * Returns diff of keys from obj1 -> obj2. i.e All keys present in obj1
   * and not in obj2.
   * @param  {Object} obj1 [description]
   * @param  {Object} obj2 [description]
   * @return {Array}      Array of keys present in 1 and not in 2.
   */
  diff(obj1, obj2) {
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    let result = [];
    keys1.forEach(function(key1) {
      if (keys2.indexOf(key1) === -1) {
        result.push(key1);
      }
    });
    return result;
  }

  without(obj, keys) {
    let result = {};
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key) && keys.indexOf(key) === -1) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  isEmpty(obj) {
    if (obj === undefined || obj === null) {
      return true;
    }
    if (this.isObject(obj)) {
      return Object.keys(obj).length === 0;
    }
    return false;
  }

  nonStrictIndexOf(array, object) {
    let index = -1;
    let keys = Object.keys(object);
    if (keys.length > 0) {
      array.forEach((arr, i) => {
        let bool = true;
        keys.forEach((key) => {
          if (object[key] != arr[key]) {
            bool = false;
          }
        });
        if (bool) {
          index = i;
        }
      });
    }

    return index;
  }
};

export const ObjectUtils = new ObjectUtilsConstructor();

export const StyleUtils = {
  merge: ObjectUtils.extend
};

// Originally from the material-ui project
class _DomEvents {

  once(el, type, callback) {
    let typeArray = type.split(" ");
    let recursiveFunction = function(e) {
      e.target.removeEventListener(e.type, recursiveFunction);
      return callback(e);
    };

    for(let i = typeArray.length - 1; i >= 0; i--) {
      this.on(el, typeArray[i], recursiveFunction);
    }
  }

  // IE8+ Support
  on(el, type, callback) {
    if(el.addEventListener) {
      el.addEventListener(type, callback);
    } else {
      el.attachEvent("on" + type, function() {
        callback.call(el);
      });
    }
  }

  // IE8+ Support
  off(el, type, callback) {
    if(el.removeEventListener) {
      el.removeEventListener(type, callback);
    } else {
      el.detachEvent("on" + type, callback);
    }
  }

  // Needed for preventing text selection during drag.
  pauseEvent(e) {
    if(e.stopPropagation) {
      e.stopPropagation();
    }
    if(e.preventDefault) {
      e.preventDefault();
    }
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
  }
}

export const DomEvents = new _DomEvents();

