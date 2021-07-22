// Import stylesheets
import './style.css';
import $ from 'jquery';
import Base from './base';

window.jQuery = $;

// Write Javascript code!
const appDiv = document.getElementById('app');
const html = `
<main>
  <form id="form">
    <fieldset>
      <legend><h1>Event Manager</h1></legend>
      <blockquote>open devtools to show the events print logs</blockquote>
      <p>
        <button type="button" class="js-button">Click ME</button>
        <button type="button" class="js-button2">Click ME2</button>
      </p>
      <p>
        <button type="button" class="js-off-button">Off Click ME</button>
        <button type="button" class="js-off-button2">Off Click ME</button>
      </p>
      <p>
        <button type="button" class="js-hash-change">Change Hash</button>
      </p>
      <footer>
        <button type="button" class="js-off-all">Off All</button>
        <button type="button" class="js-off-resize">Off Window Resize</button>
        <button type="button" class="js-off-win">Off Window</button>
      </footer>
    </fieldset>
  </form>
</main>
`;

$(appDiv).append(html);

const base = new Base('demo', '#form');
// console.log(base.getPortals());
const handlers = {
  bindEvent: () => {
    console.log('test');
  },
  bindEvent2: () => {
    console.log('test2');
  },
  offButton: () => {
    console.log('off button');
    base.$off('click', '.js-button');
  },
  offButton2: () => {
    console.log('off button2');
    base.$off('click', '.js-button2');
  },
  offAll: () => {
    console.log('off all');
    base.$offAll();
  },
  resizeWin: e => {
    console.log(e.target.innerWidth, e.target.innerHeight);
  },
  haschangeWin: e => {
    console.log('hashChanged: ', e.target.location.hash);
    // console.log(e.target);
  },
  changeHash: () => {
    chagneUrlHash(Date.now());
  },
  offResize: () => {
    base.$offWin('resize');
  },
  offWin: () => {
    base.$offWin();
  }
};

base.$on('click', '.js-button', handlers.bindEvent);
base.$on('click', '.js-button2', handlers.bindEvent2);
base.$on('click', '.js-off-button', handlers.offButton);
base.$on('click', '.js-off-button2', handlers.offButton2);
base.$on('click', '.js-off-all', handlers.offAll);
base.$on('click', '.js-off-win', handlers.offWin);
base.$on('click', '.js-off-resize', handlers.offResize);
base.$on('click', '.js-hash-change', handlers.changeHash);
base.$onWin('resize', handlers.resizeWin);
base.$onWin('hashchange', handlers.haschangeWin);

function chagneUrlHash(hash = '') {
  const url = new URL(location.href);
  url.hash = hash;
  location.href = url.toString();
}
