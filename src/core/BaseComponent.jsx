import React from "react";
import { DomEvents, ObjectUtils } from "sculpt/utils/GenericUtils";

function nonCoreMethods(method) {
  // If a method is a core method, then do not bind it again.
  let whiteList = [
    "constructor",
    "render",
    "componentWillMount",
    "componentDidMount",
    "componentWillReceiveProps",
    "componentWillUpdate",
    "shouldComponentUpdate",
    "componentWillUnmount"
  ];
  return whiteList.indexOf(method) < 0;
}

class BaseComponent extends React.Component {

  constructor(...args) {
    let bind = false;
    for (let arg of args) {
      if (ObjectUtils.isObject(arg)) {
        if (arg.bind !== undefined) {
          bind = arg.bind;
        }
      }
    }
    super(...args);
    this.windowListeners = {};
    if (bind === true) {
      this.autoBind();
    }
  }

  // Bind all methods to class instance
  autoBind(proto) {
    let methods = Object.getOwnPropertyNames(proto || this.constructor.prototype)
        .filter(prop => typeof this[prop] === "function");

    methods.filter(nonCoreMethods).forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    let listeners = this.windowListeners;

    for (let eventName in listeners) {
      let callbackName = listeners[eventName];
      DomEvents.on(window, eventName, this[callbackName]);
    }
  }

  componentWillUnmount() {
    let listeners = this.windowListeners;

    for (let eventName in listeners) {
      let callbackName = listeners[eventName];
      DomEvents.off(window, eventName, this[callbackName]);
    }
  }
}

BaseComponent.NOOP = function() {};
export default BaseComponent;
