# builtin-elements

[![Coverage Status](https://coveralls.io/repos/github/WebReflection/builtin-elements/badge.svg?branch=main)](https://coveralls.io/github/WebReflection/builtin-elements?branch=main)

<sup>**Social Media Photo by [zebbache djoubair](https://unsplash.com/@djoubair) on [Unsplash](https://unsplash.com/)**</sup>

A zero friction custom elements like primitive.

  * zero polyfills needed
  * nothing to `define(...)`
  * same Custom Elements mechanism plus ...
  * ... the ability to `upgrade` or `downgrade` any element, at any time (*hydration*)
  * all in [~1K](./es.js) once minified+gzipped <sup><sub>(~2K without compression)</sub></sup>
  * it works even on IE11 <sup><sub>(requires transpilation if written as ES6+)</sub></sup>

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

- - -

### Examples

  * **[Live Demo](https://webreflection.github.io/builtin-elements/test/)** <sup><sub>(compatible with IE11)</sub></sup>
  * **[µhtml example](https://codepen.io/WebReflection/pen/rNjJrXv?editors=0010)**
  * **[React example](https://codepen.io/WebReflection/pen/xxgYeyv?editors=0010)**

- - -

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
    * `class Main extends HTML.Main {}` works too, together with `Header`, `Footer`, `Section`, `Article`, and others
  * An `SVG` namespace to extend too
  * An `upgrade(element, Class)` helper to manually upgrade any element at any time:
    * no replacement, hence nothing is lost or changed
  * A `downgrade(element)` utility to drop all notifications about anything when/if needed
  * An `observer`, from *element-notifier*, able to [.add(specialNodes)](https://github.com/WebReflection/element-notifier#about-shadowdom) to observe. Also the main library observer that can be *disconnected* whenever is needed.

```js
// full class features
class BuiltinElement extends HTML.Element {

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
