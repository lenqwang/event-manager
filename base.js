/* eslint-disable no-param-reassign */
import $ from 'jquery';

// convenience for testing
export const ERRORS = {
  namespace_invalid: 'namespace must be provided!',
  selector_invalid: 'selector must be a string!',
  handler_is_function: 'handler must be a function',
  scope_is_jquery_object: 'scope must be a jQuery Object',
  eventName_invalid: 'event param must be provided and it must be a string type'
}

function isInvalid(param) {
  return !param || typeof param !== 'string';
}

function isJqueryInstance(dom) {
  return dom && dom instanceof $ && dom.length > 0;
}

function filter(arr) {
  if (!arr || !Array.isArray(arr)) return []
  return arr.filter(Boolean)
}

// selector-event-namespace
function getEventHandlerName(event, selector, namepsace) {
  if (!selector) {
    return filter([event, namepsace]).join('-');
  }
  if (isJqueryInstance(selector)) {
    return selector;
  }

  return filter([selector, event, namepsace]).join('-');
}

function getNamespace(event, namespace) {
  if (isInvalid(namespace)) {
    throw new Error(ERRORS.namespace_invalid)
  }

  if (isInvalid(event)) {
    return `.${namespace}`;
  }

  return [event, namespace].join('.');
}

const eventInvalidErrorMessage = ERRORS.eventName_invalid

function on({ eventName, handler, selector, scope } = {}) {
  if (isInvalid(eventName)) {
    throw new Error(eventInvalidErrorMessage);
  }

  if (!isJqueryInstance(scope)) {
    throw new Error(ERRORS.scope_is_jquery_object);
  }

  if (typeof handler !== 'function') {
    throw new TypeError(ERRORS.handler_is_function);
  }

  if (selector) {
    if (isInvalid(selector)) {
      throw new TypeError(ERRORS.selector_invalid);
    }
    scope.on(eventName, selector, handler);
  } else {
    scope.on(eventName, handler);
  }
}

function off({ eventName, selector, handler, scope } = {}) {
  if (isInvalid(eventName)) {
    throw new Error(eventInvalidErrorMessage);
  }

  if (!isJqueryInstance(scope)) {
    throw new Error(ERRORS.scope_is_jquery_object);
  }

  if (selector) {
    if (isInvalid(selector)) {
      throw new TypeError(ERRORS.selector_invalid);
    }
    if (typeof handler === 'function') {
      scope.off(eventName, selector, handler);
    } else {
      scope.off(eventName, selector);
    }
  } else {
    scope.off(eventName);
  }
}

function onConsistent(event, selector, handler) {
  if (isInvalid(event)) {
    throw new Error(eventInvalidErrorMessage);
  }

  // selector as handler for event
  if (!handler) {
    handler = selector;
    selector = null;
  }

  const eventHandlerKey = this.getEventHandlerName(event, selector);
  const ns = this.getEventNamespace(event);
  this.$eventHandlers.set(eventHandlerKey, handler);

  return scope => {
    on({ eventName: ns, selector, handler, scope });
  };
}

function offConsistent(event, selector) {
  if (isInvalid(event)) {
    throw new Error(eventInvalidErrorMessage);
  }
  const eventHandlerName = this.getEventHandlerName(event, selector);
  const handler = this.$eventHandlers.get(eventHandlerName);
  const ns = this.getEventNamespace(event);

  return scope => {
    off({ eventName: ns, selector, handler, scope });

    if (handler) {
      this.$eventHandlers.delete(eventHandlerName);
    }
  };
}

export default class EventManager {
  constructor(namespace = '', portals) {
    this.$win = $(window);
    this.$doc = $(document);
    this.$portals = portals ? $(portals) : null;
    this.namespace = typeof namespace === 'string' ? namespace : '';
    this.$eventHandlers = new Map();
    this.$winEventHandlers = new Map();
  }

  getEventNamespace(event) {
    return getNamespace(event, this.namespace);
  }

  getEventHandlerName(event, selector) {
    return getEventHandlerName(event, selector, this.namespace);
  }

  getPortals() {
    return isJqueryInstance(this.$portals) ? this.$portals : this.$doc;
  }

  $setNamespace(namespace) {
    this.namespace = namespace;
  }

  $setPortals(portals) {
    this.$portals = portals ? $(portals) : null;
  }

  $on(event, selector, handler) {
    const onEvent = onConsistent.call(this, event, selector, handler);
    onEvent(this.$doc);
  }

  $onPortals(event, selector, handler) {
    const $dom = this.getPortals();
    const onEvent = onConsistent.call(this, event, selector, handler);
    onEvent($dom);
  }

  $onWin(event, handler) {
    if (isInvalid(event)) {
      throw new Error(ERRORS.eventName_invalid)
    }
    const ns = this.getEventNamespace(event)
    on({ eventName: ns, selector: '', scope: this.$win, handler })
    this.$winEventHandlers.set(this.getEventHandlerName(event), handler);
  }

  $off(event, selector) {
    const offEvent = offConsistent.call(this, event, selector);
    offEvent(this.$doc);
  }

  $offPortals(event, selector) {
    const $dom = this.getPortals();
    const offEvent = offConsistent.call(this, event, selector);
    offEvent($dom);
  }

  $offWin(event) {
    const eventHandlerName = this.getEventHandlerName(event);
    const handler = this.$winEventHandlers.get(eventHandlerName);

    this.$win.off(this.getEventNamespace(event));

    if (handler) {
      this.$winEventHandlers.delete(eventHandlerName);
    }
  }

  $offAll() {
    const ns = this.getEventNamespace();
    this.$win.off(ns);
    this.$doc.off(ns);
    if (isJqueryInstance(this.$portals)) {
      this.$portals.off(ns);
    }
    this.$eventHandlers.clear();
    this.$winEventHandlers.clear();
  }
}
