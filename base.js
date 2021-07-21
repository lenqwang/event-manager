import $ from 'jquery';

function getEventHandlerName(event, selector) {
  if (!selector || typeof selector !== 'string') {
    return event;
  }
  return `${event}-${selector}`;
}

const eventInvalidErrorMessage =
  'event must be provided and it must be a string';

export default class Base {
  constructor(namespace = '') {
    this.$win = $(window);
    this.$dom = $(document);
    this.namespace = typeof namespace === 'string' ? namespace : '';
    this.$eventHandlers = new Map();
  }

  $setNameSpace(namespace) {
    this.namespace = namespace;
  }

  $on(event, selector, handler) {
    if (!event || typeof event !== 'string') {
      throw new Error(eventInvalidErrorMessage);
    }

    if (!handler) {
      handler = selector;
      selector = null;
    }

    if (!handler) {
      throw new Error('please provide handler');
    } else {
      const eventName = getEventHandlerName(event, selector);
      this.$eventHandlers.set(eventName, handler);

      if (selector) {
        this.$dom.on(`${event}.${this.namespace}`, selector, handler);
      } else {
        this.$dom.on(`${event}.${this.namespace}`, handler);
      }
    }
  }

  $onWin(event, handler) {
    this.$win.on(`${event}.${this.namespace}`, handler);
  }

  $off(event, selector) {
    if (!event || typeof event !== 'string') {
      throw new Error(eventInvalidErrorMessage);
    }
    const eventHandlerName = getEventHandlerName(event, selector);
    const handler = this.$eventHandlers.get(eventHandlerName);

    if (selector && typeof selector === 'string') {
      if (handler) {
        this.$dom.off(`${event}.${this.namespace}`, selector, handler);
        this.$eventHandlers.delete(eventHandlerName);
      } else {
        this.$dom.off(`${event}.${this.namespace}`, selector);
      }
    } else {
      this.$dom.off(`${event}.${this.namespace}`);
    }
  }

  $offAll() {
    this.$win.off(`.${this.namespace}`);
    this.$dom.off(`.${this.namespace}`);
    this.$eventHandlers.clear();
  }
}
