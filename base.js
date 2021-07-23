/* eslint-disable no-param-reassign */
import $ from 'jquery';

function isInvalid(param) {
  return !param || typeof param !== 'string';
}

function isJqueryInstance(dom) {
  return dom && dom instanceof $ && dom.length > 0;
}
// selector-event-namespace
function getEventHandlerName(event, selector, namepsace) {
  if (!selector) {
    return [event, namepsace].join('-');
  }
  if (isJqueryInstance(selector)) {
    return selector;
  }

  return [selector, event, namepsace].join('-');
}

function getNamespace(event, namespace) {
  if (isInvalid(event) && isInvalid(namespace)) {
    throw new Error('one of these two parameters must be provided!');
  }

  if (isInvalid(event)) {
    return `.${namespace}`;
  }

  return [event, namespace].join('.');
}

const eventInvalidErrorMessage =
  'event param must be provided and it must be a string type';

function on({ eventName, handler, selector, scope } = {}) {
  if (isInvalid(eventName)) {
    throw new Error(eventInvalidErrorMessage);
  }

  if (!isJqueryInstance(scope)) {
    throw new Error('scope must be a jQuery Object');
  }

  if (typeof handler !== 'function') {
    throw new TypeError('handler must be a function');
  }

  if (selector) {
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
    throw new Error('scope must be a jQuery Object');
  }

  if (selector) {
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
    this.$winEventHandlers.set(this.getEventHandlerName(event), handler);
    this.$win.on(this.getEventNamespace(event), handler);
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
