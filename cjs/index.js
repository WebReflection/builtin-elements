'use strict';
/*! (c) Andrea Giammarchi - ISC */

require('@ungap/is-connected');
const {notify} = require('element-notifier');

const {
  ELEMENT,
  CONSTRUCTOR,
  PROTOTYPE,
  ATTRIBUTE_CHANGED_CALLBACK,
  CONNECTED_CALLBACK,
  DISCONNECTED_CALLBACK,
  UPGRADED_CALLBACK,
  DOWNGRADED_CALLBACK,
  HTMLSpecial
} = require('./constants.js');

const {getOwnPropertyNames, setPrototypeOf} = Object;

const attributes = new WeakMap;
const observed = new WeakMap;
const natives = new Set;

const create = (tag, isSVG) => document.createElementNS(
  isSVG ? 'http://www.w3.org/2000/svg' : '',
  tag
);

const AttributesObserver = new MutationObserver(records => {
  for (let i = 0; i < records.length; i++) {
    const {target, attributeName, oldValue} = records[i];
    if (attributes.has(target))
      target[ATTRIBUTE_CHANGED_CALLBACK](
        attributeName,
        oldValue,
        target.getAttribute(attributeName)
      );
  }
});

/**
 * Set back original element prototype and drops observers.
 * @param {Element} target the element to downgrade
 */
const downgrade = target => {
  if (!natives.has(target[CONSTRUCTOR])) {
    attributes.delete(target);
    observed.delete(target);
    if (DOWNGRADED_CALLBACK in target)
      target[DOWNGRADED_CALLBACK]();
    setPrototypeOf(
      target,
      create(
        target.tagName,
        'ownerSVGElement' in target
      )[CONSTRUCTOR][PROTOTYPE]
    );
  }
};

/**
 * Upgrade an element to a specific class, if not an instance of it already.
 * @param {Element} target the element to upgrade
 * @param {Function} Class the class the element should be upgraded to
 * @returns {Element} the `target` parameter after upgrade
 */
const upgrade = (target, Class) => {
  if (!(target instanceof Class)) {
    downgrade(target);
    setPrototypeOf(target, Class[PROTOTYPE]);
    if (UPGRADED_CALLBACK in target)
      target[UPGRADED_CALLBACK]();
    const {observedAttributes} = Class;
    if (observedAttributes && ATTRIBUTE_CHANGED_CALLBACK in target) {
      attributes.set(target, 0);
      AttributesObserver.observe(target, {
        attributeFilter: observedAttributes,
        attributeOldValue: true,
        attributes: true
      });
      for (let i = 0; i < observedAttributes.length; i++) {
        const name = observedAttributes[i];
        const value = target.getAttribute(name);
        if (value != null)
          target[ATTRIBUTE_CHANGED_CALLBACK](name, null, value);
      }
    }
    if (CONNECTED_CALLBACK in target || DISCONNECTED_CALLBACK in target) {
      observed.set(target, 0);
      if (target.isConnected && CONNECTED_CALLBACK in target)
        target[CONNECTED_CALLBACK]();
    }
  }
  return target;
};

const SVG = {};
const HTML = {};

getOwnPropertyNames(window).forEach(name => {
  if (/^(HTML|SVG)/.test(name)) {
    const {$1: Kind} = RegExp;
    const isSVG = Kind == 'SVG';
    const Class = name.slice(Kind.length, -7) || ELEMENT;
    const Namespace = isSVG ? SVG : HTML;
    const Native = window[name];
    natives.add(Native);
    [].concat(HTMLSpecial[Class] || Class).forEach(Tag => {
      const tag = Tag.toLowerCase();
      Element.tagName = tag;
      Element[PROTOTYPE] = Native[PROTOTYPE];
      Namespace[Class] = Namespace[Tag] = Element;
      function Element() {
        return upgrade(create(tag, isSVG), this[CONSTRUCTOR]);
      }
    });
  }
});

const observer = notify((node, connected) => {
  if (observed.has(node)) {
    /* c8 ignore next */
    const method = connected ? CONNECTED_CALLBACK : DISCONNECTED_CALLBACK;
    if (method in node)
      node[method]();
  }
});

exports.HTML = HTML;
exports.SVG = SVG;
exports.upgrade = upgrade;
exports.downgrade = downgrade;
exports.observer = observer;
