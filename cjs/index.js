'use strict';
/*! (c) Andrea Giammarchi - ISC */

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
  qualify
} = require('@webreflection/html-shortcuts');

const {setPrototypeOf} = Object;

const attributes = new WeakSet;
const observed = new WeakSet;
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
exports.downgrade = downgrade;

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
      attributes.add(target);
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
      observed.add(target);
      if (target.isConnected && CONNECTED_CALLBACK in target)
        target[CONNECTED_CALLBACK]();
    }
  }
  return target;
};
exports.upgrade = upgrade;

const asLowerCase = Tag => Tag.toLowerCase();
const createMap = (asTag, qualify, isSVG) => new Proxy(new Map, {
  get(map, Tag) {
    if (!map.has(Tag)) {
      function Builtin() {
        return upgrade(create(tag, isSVG), this[CONSTRUCTOR]);
      }
      const tag = asTag(Tag);
      const Native = self[qualify(Tag)];
      map.set(Tag, setPrototypeOf(Builtin, Native));
      Builtin.prototype = Native.prototype;
    }
    return map.get(Tag);
  }
});

const HTML = createMap(asLowerCase, qualify, false);
exports.HTML = HTML;
const SVG = createMap(
  Tag => Tag.replace(/^([A-Z]+?)([A-Z][a-z])/, (_, $1, $2) => asLowerCase($1) + $2),
  Tag => ('SVG' + (Tag === ELEMENT ? '' : Tag) + ELEMENT),
  true
);
exports.SVG = SVG;

const observer = notify((node, connected) => {
  if (observed.has(node)) {
    /* c8 ignore next */
    const method = connected ? CONNECTED_CALLBACK : DISCONNECTED_CALLBACK;
    if (method in node)
      node[method]();
  }
});
exports.observer = observer;
