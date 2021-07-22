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
  'event param must be provided and it must be a string';

export default class EventManager {
  constructor(namespace = '') {
    this.$win = $(window);
    this.$dom = $(document);
    this.namespace = typeof namespace === 'string' ? namespace : '';
    this.$eventHandlers = new Map();
  }

  getEventNamespace(event) {
    return getNamespace(event, this.namespace);
  }

  getEventHandlerName(event, selector) {
    return getEventHandlerName(event, selector, this.namespace);
  }

  $setNameSpace(namespace) {
    this.namespace = namespace;
  }

  $on(event, selector, handler) {
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
        this.$dom.on(ns, selector, handler);
      } else {
        this.$dom.on(ns, handler);
      }
    }
  }

  $onWin(event, handler) {
    this.$eventHandlers.set(this.getEventHandlerName(event), handler);
    this.$win.on(this.getEventNamespace(event), handler);
  }

  $off(event, selector) {
    if (isInvalid(event)) {
      throw new Error(eventInvalidErrorMessage);
    }
    const eventHandlerName = this.getEventHandlerName(event, selector);
    const handler = this.$eventHandlers.get(eventHandlerName);
    const ns = this.getEventNamespace(event);

    if (selector && typeof selector === 'string') {
      if (handler) {
        this.$dom.off(ns, selector, handler);
        this.$eventHandlers.delete(eventHandlerName);
      } else {
        this.$dom.off(ns, selector);
      }
    } else {
      this.$dom.off(ns);
    }
  }

  $offWin(event) {
    const eventHandlerName = this.getEventHandlerName(event);
    const handler = this.$eventHandlers.get(eventHandlerName);

    this.$win.off(this.getEventNamespace(event));

    if (handler) {
      this.$eventHandlers.delete(eventHandlerName);
    }
  }

  $offAll() {
    const ns = this.getEventNamespace();
    this.$win.off(ns);
    this.$dom.off(ns);
    this.$eventHandlers.clear();
  }
}
