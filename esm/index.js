/*! (c) Andrea Giammarchi - ISC */

const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback';
const CONNECTED_CALLBACK = 'connectedCallback';
const DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
const UPGRADED_CALLBACK = 'upgradedCallback';
const DOWNGRADED_CALLBACK = 'downgradedCallback';

const {getOwnPropertyNames, setPrototypeOf} = Object;

const attributes = new WeakMap;
const observed = new WeakMap;
const natives = new Set;

const loop = (list, method, set) => {
  for (let i = 0; i < list.length; i++) {
    if (!set.has(list[i])) {
      set.add(list[i]);
      /* c8 ignore start */
      if (observed.has(list[i]) && method in list[i])
        list[i][method]();
      /* c8 ignore stop */
      loop(list[i].children || [], method, set);
    }
  }
};

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

const AttributesObserver = new MutationObserver(records => {
  for (let i = 0; i < records.length; i++) {
    const {target, attributeName, oldValue} = records[i];
    const {constructor} = target;
    if (
      attributes.has(constructor) &&
      attributes.get(constructor).has(target) &&
      ATTRIBUTE_CHANGED_CALLBACK in target
    )
      target[ATTRIBUTE_CHANGED_CALLBACK](
        attributeName,
        oldValue,
        target.getAttribute(attributeName)
      );
  }
});

export const HTML = {};
export const SVG = {};

const create = (tag, isSVG) => isSVG ?
  document.createElementNS('http://www.w3.org/2000/svg', tag) :
  document.createElement(tag);

/**
 * Set back original element prototype and drops observers.
 * @param {Element} target the element to downgrade
 */
export const downgrade = target => {
  const {constructor, tagName} = target;
  if (!natives.has(constructor)) {
    if (attributes.has(constructor))
      attributes.get(constructor).delete(target);
    observed.delete(target);
    if (DOWNGRADED_CALLBACK in target)
      target[DOWNGRADED_CALLBACK]();
    setPrototypeOf(
      target,
      create(tagName, 'ownerSVGElement' in target).constructor.prototype
    );
  }
};

/**
 * Upgrade an element to a specific class, if not an instance of it already.
 * @param {Element} target the element to upgrade
 * @param {Function} Class the class the element should be upgraded to
 */
export const upgrade = (target, Class) => {
  if (!(target instanceof Class)) {
    downgrade(target);
    const {observedAttributes, prototype} = Class;
    setPrototypeOf(target, prototype);
    if (UPGRADED_CALLBACK in target)
      target[UPGRADED_CALLBACK]();
    if (observedAttributes) {
      if (!attributes.has(Class))
        attributes.set(Class, new WeakMap);
      attributes.get(Class).set(target, 0);
      AttributesObserver.observe(target, {
        attributeFilter: observedAttributes,
        attributeOldValue: true,
        attributes: true
      });
      for (let i = 0; i < observedAttributes.length; i++) {
        const name = observedAttributes[i];
        const value = target.getAttribute(name);
        if (value != null && ATTRIBUTE_CHANGED_CALLBACK in target)
          target[ATTRIBUTE_CHANGED_CALLBACK](name, null, value);
      }
    }
    if (CONNECTED_CALLBACK in target || DISCONNECTED_CALLBACK in target) {
      observed.set(target, 0);
      if (target.isConnected && CONNECTED_CALLBACK in target)
        target[CONNECTED_CALLBACK]();
    }
  }
};

getOwnPropertyNames(window).forEach(name => {
  if (/^(HTML|SVG)/.test(name)) {
    const {$1: Kind} = RegExp;
    const isSVG = Kind === 'SVG';
    const Class = name.slice(Kind.length, -7) || 'Element';
    const Namespace = isSVG ? SVG : HTML;
    const Native = window[name];
    natives.add(window[name]);
    [].concat(HTMLSpecial[Class] || Class).forEach(Tag => {
      (Namespace[Class] = Namespace[Tag] = function Element() {
        const target = create(Tag, isSVG);
        upgrade(target, this.constructor);
        return target;
      }).prototype = Native.prototype;
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
