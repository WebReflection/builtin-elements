self.builtinElements = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var ATTRIBUTE_CHANGED_CALLBACK = 'attributeChangedCallback';
  var CONNECTED_CALLBACK = 'connectedCallback';
  var DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
  var UPGRADED_CALLBACK = 'upgradedCallback';
  var DOWNGRADED_CALLBACK = 'downgradedCallback';
  var getOwnPropertyNames = Object.getOwnPropertyNames,
      setPrototypeOf = Object.setPrototypeOf;
  var attributes = new WeakMap();
  var observed = new WeakMap();
  var natives = new Set();

  var loop = function loop(list, method, set) {
    for (var i = 0; i < list.length; i++) {
      if (!set.has(list[i])) {
        set.add(list[i]);
        /* c8 ignore start */

        if (observed.has(list[i]) && method in list[i]) list[i][method]();
        /* c8 ignore stop */

        loop(list[i].children || [], method, set);
      }
    }
  };

  var HTMLSpecial = {
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
  var AttributesObserver = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var _records$i = records[i],
          target = _records$i.target,
          attributeName = _records$i.attributeName,
          oldValue = _records$i.oldValue;
      var _constructor = target.constructor;
      if (attributes.has(_constructor) && attributes.get(_constructor).has(target) && ATTRIBUTE_CHANGED_CALLBACK in target) target[ATTRIBUTE_CHANGED_CALLBACK](attributeName, oldValue, target.getAttribute(attributeName));
    }
  });
  var HTML = {};
  var SVG = {};

  var create = function create(tag, isSVG) {
    return isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  };
  /**
   * Set back original element prototype and drops observers.
   * @param {Element} target the element to downgrade
   */


  var downgrade = function downgrade(target) {
    var constructor = target.constructor,
        tagName = target.tagName;

    if (!natives.has(constructor)) {
      if (attributes.has(constructor)) attributes.get(constructor)["delete"](target);
      observed["delete"](target);
      if (DOWNGRADED_CALLBACK in target) target[DOWNGRADED_CALLBACK]();
      setPrototypeOf(target, create(tagName, 'ownerSVGElement' in target).constructor.prototype);
    }
  };
  /**
   * Upgrade an element to a specific class, if not an instance of it already.
   * @param {Element} target the element to upgrade
   * @param {Function} Class the class the element should be upgraded to
   */

  var upgrade = function upgrade(target, Class) {
    if (!(target instanceof Class)) {
      downgrade(target);
      var observedAttributes = Class.observedAttributes,
          prototype = Class.prototype;
      setPrototypeOf(target, prototype);
      if (UPGRADED_CALLBACK in target) target[UPGRADED_CALLBACK]();

      if (observedAttributes) {
        if (!attributes.has(Class)) attributes.set(Class, new WeakMap());
        attributes.get(Class).set(target, 0);
        AttributesObserver.observe(target, {
          attributeFilter: observedAttributes,
          attributeOldValue: true,
          attributes: true
        });

        for (var i = 0; i < observedAttributes.length; i++) {
          var name = observedAttributes[i];
          var value = target.getAttribute(name);
          if (value != null && ATTRIBUTE_CHANGED_CALLBACK in target) target[ATTRIBUTE_CHANGED_CALLBACK](name, null, value);
        }
      }

      if (CONNECTED_CALLBACK in target || DISCONNECTED_CALLBACK in target) {
        observed.set(target, 0);
        if (target.isConnected && CONNECTED_CALLBACK in target) target[CONNECTED_CALLBACK]();
      }
    }
  };
  getOwnPropertyNames(window).forEach(function (name) {
    if (/^(HTML|SVG)/.test(name)) {
      var Kind = RegExp.$1;
      var isSVG = Kind === 'SVG';
      var Class = name.slice(Kind.length, -7) || 'Element';
      var Namespace = isSVG ? SVG : HTML;
      var Native = window[name];
      natives.add(Native);
      [].concat(HTMLSpecial[Class] || Class).forEach(function (Tag) {
        (Namespace[Class] = Namespace[Tag] = function Element() {
          var target = create(Tag, isSVG);
          upgrade(target, this.constructor);
          return target;
        }).prototype = Native.prototype;
      });
    }
  });
  new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var _records$i2 = records[i],
          addedNodes = _records$i2.addedNodes,
          removedNodes = _records$i2.removedNodes;
      loop(removedNodes, DISCONNECTED_CALLBACK, new Set());
      loop(addedNodes, CONNECTED_CALLBACK, new Set());
    }
  }).observe(document, {
    subtree: true,
    childList: true
  });

  exports.HTML = HTML;
  exports.SVG = SVG;
  exports.downgrade = downgrade;
  exports.upgrade = upgrade;

  return exports;

}({}));
