/*! (c) Andrea Giammarchi - ISC */

const CONSTRUCTOR = 'constructor';
const PROTOTYPE = 'prototype';
const CALLBACK = 'Callback';
const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;
const CONNECTED_CALLBACK = 'connected' + CALLBACK;
const DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
const UPGRADED_CALLBACK = 'upgraded' + CALLBACK;
const DOWNGRADED_CALLBACK = 'downgraded' + CALLBACK;

const {getOwnPropertyNames, setPrototypeOf} = Object;

const attributes = new WeakMap;
const observed = new WeakMap;
const natives = new Set;

const create = (tag, isSVG) => isSVG ?
  document.createElementNS('http://www.w3.org/2000/svg', tag) :
  document.createElement(tag);

const loop = (list, method, set) => {
  for (let i = 0; i < list.length; i++) {
    const node = list[i];
    if (!set.has(node)) {
      set.add(node);
      /* c8 ignore start */
      if (observed.has(node) && method in node)
        node[method]();
      /* c8 ignore stop */
      loop(node.children || [], method, set);
    }
  }
};

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
const HTMLSpecial = {
  'Anchor': 'A',
  'DList': 'DL',
  'Directory': 'Dir',
  'Heading': ['H6', 'H5', 'H4', 'H3', 'H2', 'H1'],
  'Image': 'Img',
  'OList': 'OL',
  'Paragraph': 'P',
  'TableCaption': 'Caption',
  'TableCell': ['TH', 'TD'],
  'TableRow': 'TR',
  'UList': 'UL'
};

getOwnPropertyNames(window).forEach(name => {
  if (/^(HTML|SVG)/.test(name)) {
    const {$1: Kind} = RegExp;
    const isSVG = Kind == 'SVG';
    const Class = name.slice(Kind.length, -7) || 'Element';
    const Namespace = isSVG ? SVG : HTML;
    const Native = window[name];
    natives.add(Native);
    [].concat(HTMLSpecial[Class] || Class).forEach(Tag => {
      const tag = Tag.toLowerCase();
      (Namespace[Class] = Namespace[Tag] = function Element() {
        return upgrade(create(tag, isSVG), this[CONSTRUCTOR]);
      })[PROTOTYPE] = Native[PROTOTYPE];
    });
  }
});

new MutationObserver(records => {
  for (let i = 0; i < records.length; i++) {
    const {addedNodes, removedNodes} = records[i];
    loop(removedNodes, DISCONNECTED_CALLBACK, new Set);
    loop(addedNodes, CONNECTED_CALLBACK, new Set);
  }
}).observe(document, {subtree: true, childList: true});

export {HTML, SVG, upgrade, downgrade};
