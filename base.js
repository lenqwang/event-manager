/* eslint-disable no-param-reassign */
import $ from 'jquery';
// selector-event-namespace
function getEventHandlerName(event, selector, namepsace) {
  if (!selector || typeof selector !== 'string') {
    return [event, namepsace].join('-');
  }
  return [selector, event, namepsace].join('-');
}

function isInvalid(param) {
  return !param || typeof param !== 'string';
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
    return this.$portals instanceof $ && this.$portals.length > 0
      ? this.$portals
      : this.$doc;
  }

  $setNamespace(namespace) {
    this.namespace = namespace;
  }

  $on(event, selector, handler) {
    const $dom = this.getPortals();

    if (isInvalid(event)) {
      throw new Error(eventInvalidErrorMessage);
    }

    if (!handler) {
      handler = selector;
      selector = null;
    }

    if (!handler) {
      throw new Error('please provide event handler!');
    } else {
      const eventName = this.getEventHandlerName(event, selector);
      const ns = this.getEventNamespace(event);
      this.$eventHandlers.set(eventName, handler);

      if (selector) {
        $dom.on(ns, selector, handler);
      } else {
        $dom.on(ns, handler);
      }
    }
  }

  $onWin(event, handler) {
    this.$winEventHandlers.set(this.getEventHandlerName(event), handler);
    this.$win.on(this.getEventNamespace(event), handler);
  }

  $off(event, selector) {
    const $dom = this.getPortals();
    if (isInvalid(event)) {
      throw new Error(eventInvalidErrorMessage);
    }
    const eventHandlerName = this.getEventHandlerName(event, selector);
    const handler = this.$eventHandlers.get(eventHandlerName);
    const ns = this.getEventNamespace(event);

    if (selector && typeof selector === 'string') {
      if (handler) {
        $dom.off(ns, selector, handler);
        this.$eventHandlers.delete(eventHandlerName);
      } else {
        $dom.off(ns, selector);
      }
    } else {
      $dom.off(ns);
    }
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
    if (this.$portals instanceof $ && this.$portals.length > 0) {
      this.$portals.off(ns);
    }
    this.$eventHandlers.clear();
    this.$winEventHandlers.clear();
  }

  // eslint-disable-next-line class-methods-use-this
  prepareTransition($el, callback, endCallback) {
    function removeClass() {
      $el.removeClass('is-transitioning');
      $el.off('transitionend', removeClass);

      if (endCallback) {
        endCallback();
      }
    }
    $el.on('transitionend', removeClass);
    $el.addClass('is-transitioning');
    $el.width();

    if (typeof callback === 'function') {
      callback();
    }
  }
}
