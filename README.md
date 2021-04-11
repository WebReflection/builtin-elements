# builtin-elements

A zero friction custom elements like primitive.

  * zero polyfills needed
  * nothing to `define(...)`
  * same Custom Elements mechanism plus ...
  * ... the ability to `upgrade` or `downgrade` any element, at any time (*hydration*)
  * all in [less than 1K](./es.js) once minified
  * it works even on IE11

```js
import {HTML, SVG} from 'builtin-elements';

class MyButton extends HTML.Button {
  constructor(text) {
    super();
    this.textContent = text;
  }
}

document.body.appendChild(new MyButton('Hello!'));
```

**[Live Demo](https://webreflection.github.io/builtin-elements/test/)**

## API

This module exports the following utilities:

  * An `HTML` namespace to extend, example:
    * `class Div extends HTML.Div {}`
    * `class P extends HTML.Paragraph {}`
    * `class P extends HTML.P {}`
    * `class TD extends HTML.TD {}`
    * `class UL extends HTML.UL {}`
    * `class UL extends HTML.UList {}`
    * ... and all available *HTML* natives ...
  * An `SVG` namespace to extend too
  * An `upgrade(element, Class)` helper to manually upgrade any element at any time:
    * no replacement, hence nothing is lost or changed
  * A `downgrade(element)` utility to drop all notifications about anything when/if needed

```js
// full class features
class BuiltinElement extends HTML.Div {

  // exact same Custom Elements primitives
  static get observedAttributes() { return ['test']; }
  attributeChangedCallback(name, oldValue, newValue) {}
  connectedCallback() {}
  disconnectedCallback() {}

  // the best place to setup any component
  upgradedCallback() {}

  // the best place to teardown any component
  downgradedCallback() {}
}
```

When *hydration* is desired, `upgradedCallback` is the method to setup once all listeners, and if elements are subject to change extend, or be downgraded as regular element, `downgradedCallback` is the best place to cleanup listeners and/or anything else.
