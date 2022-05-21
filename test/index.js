const {document, window, MutationObserver} = require('linkedom').parseHTML('<!doctype html><html>');

global.self = window;
global.window = window;
global.document = document;
global.Node = window.Node;
global.Element = window.Element;
global.MutationObserver = MutationObserver;

window.HTMLButtonElement = window.HTMLButtonElement;
window.SVGFEComponentTransferElement = window.SVGElement;
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
    console.log('connected', this.outerHTML);
  }
  disconnectedCallback() {
    console.log('disconnected');
  }
}

let button = document.body.appendChild(new OverButton('hello'));

upgrade(button, OverButton);
button.setAttribute('test', 456);

setTimeout(() => {
  upgrade(button, Shadowed);

  setTimeout(() => {
    button.remove();

    setTimeout(() => {

      downgrade(button);
      button.removeAttribute('test');

      document.body.appendChild(new OverButton('world')).setAttribute('test', 123);

      class MyRect extends SVG.Element {}
      document.body.appendChild(new MyRect);

      class MyFECT extends SVG.FEComponentTransfer {}
      document.body.appendChild(new MyFECT);

      console.log(document.toString());
    });
  });
});
