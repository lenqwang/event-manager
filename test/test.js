import test from 'ava'
import $ from 'jquery'
import Chance from 'chance'
import sinon from 'sinon'
import Base, { ERRORS } from '../base.js'

const chance = new Chance()
const noop = () => {}
const getNamespace = () => chance.string({ length: 6, alpha: true, casing: 'lower', numeric: false }) 
const getEventLen = (target, eventName) => {
  const eventMap = $._data(target, 'events')

  if (!eventName) {
    return Object.keys(eventMap).length
  }

  return eventMap?.[eventName]?.length ?? 0
}

function beforeTest (html = '', namespace, portals) {
  $(document.body).html(html)
  const ns = namespace || getNamespace()
  return new Base(ns, portals)
}

function afterTest (base) {
  $(document.body).empty()
  base.$offAll()
}

test('# namespace param', t => {
  const namespace = 'test:namespace'
  const base = new Base(namespace)
  t.is(base.namespace, namespace)
})

test('# namaspace is not a string', t => {
  const namespace = 123
  const base = new Base(namespace)
  t.is(base.namespace, '')
  t.not(base.namespace, namespace)
})

test('# $setNamespace', t => {
  const namespace = chance.string({ length: 10 })
  const base = new Base()
  base.$setNamespace(namespace)
  t.is(base.namespace, namespace)
})

test('# portals param', t => {
  const selector = '.selector'
  const base = new Base('', selector)
  t.true(base.$portals instanceof $)
})

test('# portals jquery object param', t => {
  const $portals = $('.selector')
  const base = new Base('', $portals)
  t.true(base.$portals instanceof $)
})

test('# portals empty', t => {
  const base = new Base()
  t.is(base.$portals, null)
})

test('# $setPortals', t => {
  const selector = '.selector'
  const base = new Base()
  const base2 = new Base()
  base.$setPortals(selector)
  base2.$setPortals()

  t.true(base.$portals instanceof $)
  t.is(base2.$portals, null)
})

test('# getEventNamespace without namespace', t => {
  const base = new Base()
  const error = t.throws(() => {
    return base.getEventNamespace()
  })

  t.is(error.message, ERRORS.namespace_invalid)
})

test('# getEventNamespace without event', t => {
  const ns = chance.string({ length: 5 })
  const base = new Base(ns)
  t.notThrows(() => base.getEventNamespace())
  t.is(base.getEventNamespace(), `.${ns}`)
})

test('# getEventHandlerName', t => {
  const ns = getNamespace()
  const base = beforeTest('', ns)
  t.is(base.getEventHandlerName(), ns)
  t.is(base.getEventHandlerName('click'), `click-${ns}`)
  t.is(base.getEventHandlerName('click', '.btn'), `.btn-click-${ns}`)
})

// ------------- $on ---------------

test('# $on event is empty', t => {
  const base = beforeTest()
  const error = t.throws(() => base.$on(''))
  t.is(error.message, ERRORS.eventName_invalid)
})

test('# $on event is not a string', t => {
  const base = beforeTest()
  const error = t.throws(() => base.$on({}))
  t.is(error.message, ERRORS.eventName_invalid)
})

test('# $on selector & handler is not provided', t => {
  const base = beforeTest()
  const error = t.throws(() => base.$on('click'))
  t.is(error.message, ERRORS.handler_is_function)
})

test('# $on selector is not s string', t => {
  const base = beforeTest()
  const error = t.throws(() => base.$on('click', {}, noop))
  t.is(error.message, ERRORS.selector_invalid)
})

test('# $on selector should not a jquery instance', t => {
  const base = beforeTest()
  const $btn = $('.btn')
  const error = t.throws(() => base.$on('click', $btn, noop))
  t.is(error.message, ERRORS.selector_invalid)
})

test('# $on trigger on document & calc events length', t => {
  const base = beforeTest()
  const doc = document
  const eventName = 'click'

  base.$on(eventName, () => {
    console.log(eventName, ' triggered!')
    t.pass()
  })
  $(doc).trigger(eventName)
  t.is(getEventLen(doc, eventName), 1)
  afterTest(base)
})

test('# $on delegate on a selector & trigger by selector', t => {
  const html = `<button class="btn">click</button>`
  const base = beforeTest(html)

  base.$on('click', '.btn', () => {
    console.log('btn click triggered!')
    t.pass()
  })

  $('.btn').trigger('click')
  t.is(getEventLen(base.$doc.get(0), 'click'), 1)
  afterTest(base)
})

test('# $on multiple events', t => {
  const html = `<button class="btn">click</button`
  const base = beforeTest(html)
  const events = ['click', 'dblclick', 'mouseenter', 'mousemove']

  events.forEach(eventName => {
    base.$on(eventName, '.btn', () => {
      t.pass()
    })
  })

  events.forEach(eventName => {
    $('.btn').trigger(eventName)
  })

  // events.forEach(eventName => {
  //   const real = getEventLen(base.$doc.get(0), eventName)
  //   t.is(real, 1)
  // })

  t.is(getEventLen(base.$doc.get(0)), events.length)

  afterTest(base)
})

test('# $onPortals base', t => {
  const html = `
    <section id="root">
      <button class="btn">click</button>
    </section>
  `
  const base = beforeTest(html, null, '#root')
  
  base.$onPortals('click', '.btn', () => {
    console.log('# $onPortals: btn click triggered!')
    t.pass()
  })

  $('.btn', '#root').trigger('click')
  t.is(getEventLen(base.$portals.get(0), 'click'), 1)
  t.is(getEventLen(base.$doc.get(0), 'click'), 0)
  afterTest(base)
})

test('# $onPortals on root', t => {
  const html = `
    <section id="root">
      <button class="btn">click</button>
    </section>
  `
  const base = beforeTest(html, null, '#root')

  base.$onPortals('click', () => {
    console.log('# $onPortals: #root click triggered!')
    t.pass()
  })

  $('#root').trigger('click')
  t.is(getEventLen(base.$portals.get(0), 'click'), 1)
  t.is(getEventLen(base.$doc.get(0), 'click'), 0)
  afterTest(base)
})

test('# $onWin without namespace', t => {
  const base = new Base()
  const error = t.throws(() => base.$onWin())

  t.is(error.message, ERRORS.eventName_invalid)
})

test('# $onWin without eventName', t => {
  const ns = getNamespace()
  const base = new Base(ns)
  const error = t.throws(() => base.$onWin())

  t.is(error.message, ERRORS.eventName_invalid)
})

test('# $onWin without handler', t => {
  const ns = getNamespace()
  const base = new Base(ns)
  const error = t.throws(() => base.$onWin('click'))

  t.is(error.message, ERRORS.handler_is_function)
})

test('# $onWin resize event', t => {
  const base = beforeTest()
  const resize_width = chance.integer({ min: 0, max: 1920 })
  base.$onWin('resize', (e) => {
    const width = e.target.innerWidth
    console.log('window resize triggered! ', width)

    t.is(width, resize_width)
  })

  window.innerWidth = resize_width
  // window.dispatchEvent(new Event('resize'))
  base.$win.trigger('resize')
  t.is(getEventLen(base.$win.get(0), 'resize'), 1)

  afterTest(base)
})

test('# $off', t => {
  const callback = sinon.spy()
  const callback2 = sinon.stub()
  const html = `
    <button class="btn2">click one</button>
    <button class="btn">click two</button>
  `
  const base = beforeTest(html)
  
  base.$on('click', '.btn', callback)
  base.$on('click', '.btn2', callback2)
  t.is(base.$eventHandlers.size, 2)

  base.$off('click', '.btn')

  $('.btn').trigger('click')
  $('.btn2').trigger('click')

  t.is(callback.callCount, 0)
  t.falsy(callback.called)
  
  t.is(callback2.callCount, 1)
  
  $('.btn2').trigger('click')
  t.is(callback2.callCount, 2)
  t.is(base.$eventHandlers.size, 1)

  callback2.resetHistory()
  
  base.$off('click', '.btn2')

  $('.btn2').trigger('click')
  t.is(callback2.callCount, 0)
  t.falsy(callback2.called)
  t.is(base.$eventHandlers.size, 0)

  afterTest(base)
})

test('# $offPortals', t => {
  const callback = sinon.spy()
  const html = `
    <section id="root">
      <button class="btn">click</button>
    </section>
  `
  const base = beforeTest(html)

  base.$onPortals('click', '.btn', callback)
  base.$offPortals('click', '.btn')

  t.is(callback.callCount, 0)
  t.falsy(callback.called)
  afterTest(base)
})

test('# $offWin', t => {
  const base = beforeTest()
  const callback = sinon.stub()
  const resize_width = chance.integer({ min: 0, max: 1920 })
  base.$onWin('resize', callback)

  window.innerWidth = resize_width
  base.$win.trigger('resize')
  t.is(getEventLen(base.$win.get(0), 'resize'), 1)
  t.is(base.$winEventHandlers.size, 1)
  t.truthy(callback.called)
  t.is(callback.callCount, 1)

  callback.resetHistory()

  base.$offWin('resize')

  base.$win.trigger('resize')
  t.is(base.$winEventHandlers.size, 0)
  t.falsy(callback.called)
  t.is(callback.callCount, 0)

  afterTest(base)
})

test('# $offAll', t => {
  const clickHandler = sinon.stub()
  const clickPortalsHandler = sinon.stub()
  const winResizeHandler = sinon.stub()
  const resize_width = chance.integer({ min: 0, max: 1920 })
  const html = `
    <section id="root">
      <button class="btn">click</button>
    </section>
  `
  const base = beforeTest(html)
  base.$setPortals('#root')
  
  base.$on('click', '.btn', clickHandler)

  $('.btn').trigger('click')
  t.truthy(clickHandler.called)
  t.is(clickHandler.callCount, 1)
  t.is(base.$eventHandlers.size, 1)

  base.$onPortals('click', '.btn', clickPortalsHandler)

  $('.btn').trigger('click')
  t.truthy(clickHandler.called)
  t.is(clickHandler.callCount, 2)
  t.truthy(clickPortalsHandler.called)
  t.is(clickPortalsHandler.callCount, 1)
  // TODO: How to store two handlers into map object
  t.is(base.$eventHandlers.size, 1)

  base.$onWin('resize', winResizeHandler)

  window.innerWidth = resize_width
  base.$win.trigger('resize')

  t.truthy(winResizeHandler.called)
  t.is(winResizeHandler.callCount, 1)
  t.is(base.$winEventHandlers.size, 1)

  base.$offAll()
  clickHandler.resetHistory()
  clickPortalsHandler.resetHistory()
  winResizeHandler.resetHistory()

  $('.btn').trigger('click')
  base.$win.trigger('resize')

  t.falsy(clickHandler.called)
  t.is(clickHandler.callCount, 0)
  t.falsy(clickPortalsHandler.called)
  t.is(clickPortalsHandler.callCount, 0)
  t.falsy(winResizeHandler.called)
  t.is(winResizeHandler.callCount, 0)
  
  t.is(base.$eventHandlers.size, 0)
  t.is(base.$winEventHandlers.size, 0)

  afterTest(base)
})