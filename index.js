// Import stylesheets
import './style.css';
import $ from 'jquery';
import Base from './base';

window.jQuery = $;
const base = new Base('demo');

// Write Javascript code!
const appDiv = document.getElementById('app');
const html = `
<h1>JS Starter</h1>
<button type="button" class="js-button">Click ME</button>
<button type="button" class="js-off-selector">Off Selector</button>
<button type="button" class="js-off-all">Off All</button>
`;

const handlers = {
  bindEvent: () => {
    console.log('test');
  },
  offSelector: () => {
    base.$off('click', '.js-button');
  },
  offAll: () => {
    console.log('off all');
    base.$offAll();
  }
};

base.$on('click', '.js-button', handlers.bindEvent);
base.$on('click', '.js-off-selector', handlers.offSelector);
base.$on('click', '.js-off-all', handlers.offAll);

$(appDiv).append(html);
// .on('click.test', '.js-button', handlers.test)
// .on('click.test2', '.js-button', handlers.test2)
// .on('click', '.js-off', () => {
//   $(appDiv).off('click', '.js-button');
// });
