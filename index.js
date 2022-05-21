self.builtinElements = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  const TRUE = true, FALSE = false, QSA = 'querySelectorAll';

  /**
   * Start observing a generic document or root element.
   * @param {(node:Element, connected:boolean) => void} callback triggered per each dis/connected element
   * @param {Document|Element} [root=document] by default, the global document to observe
   * @param {Function} [MO=MutationObserver] by default, the global MutationObserver
   * @returns {MutationObserver}
   */
  const notify = (callback, root = document, MO = MutationObserver) => {
    const loop = (nodes, added, removed, connected, pass) => {
      for (const node of nodes) {
        if (pass || (QSA in node)) {
          if (connected) {
            if (!added.has(node)) {
              added.add(node);
              removed.delete(node);
              callback(node, connected);
            }
          }
          else if (!removed.has(node)) {
            removed.add(node);
            added.delete(node);
            callback(node, connected);
          }
          if (!pass)
            loop(node[QSA]('*'), added, removed, connected, TRUE);
        }
      }
    };

    const mo = new MO(records => {
      const added = new Set, removed = new Set;
      for (const {addedNodes, removedNodes} of records) {
        loop(removedNodes, added, removed, FALSE, FALSE);
        loop(addedNodes, added, removed, TRUE, FALSE);
      }
    });

    const {observe} = mo;
    (mo.observe = node => observe.call(mo, node, {subtree: TRUE, childList: TRUE}))(root);

    return mo;
  };

  const CALLBACK = 'Callback';
  const EMPTY = '';
  const HEADING = 'Heading';
  const TABLECELL = 'TableCell';
  const TABLE_SECTION = 'TableSection';

  const ELEMENT = 'Element';
  const CONSTRUCTOR = 'constructor';
  const PROTOTYPE = 'prototype';
  const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;
  const CONNECTED_CALLBACK = 'connected' + CALLBACK;
  const DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
  const UPGRADED_CALLBACK = 'upgraded' + CALLBACK;
  const DOWNGRADED_CALLBACK = 'downgraded' + CALLBACK;

  const qualify = name => ('HTML' + (namespace[name] || '') + ELEMENT);

  const namespace = {
    A: 'Anchor',
    Caption: 'TableCaption',
    DL: 'DList',
    Dir: 'Directory',
    Img: 'Image',
    OL: 'OList',
    P: 'Paragraph',
    TR: 'TableRow',
    UL: 'UList',

    Article: EMPTY,
    Aside: EMPTY,
    Footer: EMPTY,
    Header: EMPTY,
    Main: EMPTY,
    Nav: EMPTY,
    [ELEMENT]: EMPTY,

    H1: HEADING,
    H2: HEADING,
    H3: HEADING,
    H4: HEADING,
    H5: HEADING,
    H6: HEADING,

    TD: TABLECELL,
    TH: TABLECELL,

    TBody: TABLE_SECTION,
    TFoot: TABLE_SECTION,
    THead: TABLE_SECTION,
  };

  /*! (c) Andrea Giammarchi - ISC */

  const {setPrototypeOf} = Object;

  const attributes = new WeakSet;
  const observed = new WeakSet;

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
    const Class = target[CONSTRUCTOR];
    if (Class !== self[Class.name]) {
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
  const SVG = createMap(
    Tag => Tag.replace(/^([A-Z]+?)([A-Z][a-z])/, (_, $1, $2) => asLowerCase($1) + $2),
    Tag => ('SVG' + (Tag === ELEMENT ? '' : Tag) + ELEMENT),
    true
  );

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
  exports.downgrade = downgrade;
  exports.observer = observer;
  exports.upgrade = upgrade;

  return exports;

})({});
