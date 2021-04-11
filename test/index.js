const {document, window, MutationObserver} = require('linkedom').parseHTML('<!doctype html><html>');

global.window = window;
global.document = document;
global.MutationObserver = MutationObserver;

window.HTMLButtonElement = window.HTMLButtonElement;
window.SVGElement = window.SVGElement;

const {HTML, SVG, upgrade, downgrade} = require('../cjs');


class MyButton extends HTML.Button {
  static get observedAttributes() { return ['test']; }
  upgradedCallback() {
    console.log(this, 'upgraded super');
  }
  downgradedCallback() {
    console.log(this, 'downgraded super');
  }
  attributeChangedCallback(...args) {
    console.log(args);
  }
  constructor(textContent = '') {
    super();
    this.addEventListener('click', this);
    this.textContent = textContent;
  }
}

class OverButton extends MyButton {
  upgradedCallback() {
    super.upgradedCallback();
    console.log(this, 'upgraded');
  }
  log(message) {
    console.log(this, message);
  }
  handleEvent(e) {
    this['on' + e.type](e);
  }
  onclick() {
    this.log(this.textContent + ' clicked');
  }
}

class Shadowed extends OverButton {
  connectedCallback() {
    console.log('connected');
  }
}

let button = document.body.appendChild(new OverButton('hello'));

upgrade(button, OverButton);
button.setAttribute('test', 456);
upgrade(button, Shadowed);

button.remove();

downgrade(button);
button.removeAttribute('test');

document.body.appendChild(new OverButton('world')).setAttribute('test', 123);

class MyRect extends SVG.Element {}
document.body.appendChild(new MyRect);

console.log(document.toString());
