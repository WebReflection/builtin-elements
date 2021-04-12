self.builtinElements = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  var CALLBACK = 'Callback';
  var ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;
  var CONNECTED_CALLBACK = 'connected' + CALLBACK;
  var DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
  var UPGRADED_CALLBACK = 'upgraded' + CALLBACK;
  var DOWNGRADED_CALLBACK = 'downgraded' + CALLBACK;
  var getOwnPropertyNames = Object.getOwnPropertyNames,
      setPrototypeOf = Object.setPrototypeOf;
  var attributes = new WeakMap();
  var observed = new WeakMap();
  var natives = new Set();

  var create = function create(tag, isSVG) {
    return isSVG ? document.createElementNS('http://www.w3.org/2000/svg', tag) : document.createElement(tag);
  };

  var loop = function loop(list, method, set) {
    for (var i = 0; i < list.length; i++) {
      var node = list[i];

      if (!set.has(node)) {
        set.add(node);
        /* c8 ignore start */

        if (observed.has(node) && method in node) node[method]();
        /* c8 ignore stop */

        loop(node.children || [], method, set);
      }
    }
  };

  var AttributesObserver = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i++) {
      var _records$i = records[i],
          target = _records$i.target,
          attributeName = _records$i.attributeName,
          oldValue = _records$i.oldValue;
      if (attributes.has(target)) target[ATTRIBUTE_CHANGED_CALLBACK](attributeName, oldValue, target.getAttribute(attributeName));
    }
  });
  /**
   * Set back original element prototype and drops observers.
   * @param {Element} target the element to downgrade
   */

  var downgrade = function downgrade(target) {
    var constructor = target.constructor,
        tagName = target.tagName;

    if (!natives.has(constructor)) {
      attributes["delete"](target);
      observed["delete"](target);
      if (DOWNGRADED_CALLBACK in target) target[DOWNGRADED_CALLBACK]();
      setPrototypeOf(target, create(tagName, 'ownerSVGElement' in target).constructor.prototype);
    }
  };
  /**
   * Upgrade an element to a specific class, if not an instance of it already.
   * @param {Element} target the element to upgrade
   * @param {Function} Class the class the element should be upgraded to
   * @returns {Element} the `target` parameter after upgrade
   */


  var upgrade = function upgrade(target, Class) {
    if (!(target instanceof Class)) {
      downgrade(target);
      var observedAttributes = Class.observedAttributes,
          prototype = Class.prototype;
      setPrototypeOf(target, prototype);
      if (UPGRADED_CALLBACK in target) target[UPGRADED_CALLBACK]();

      if (observedAttributes && ATTRIBUTE_CHANGED_CALLBACK in prototype) {
        attributes.set(target, 0);
        AttributesObserver.observe(target, {
          attributeFilter: observedAttributes,
          attributeOldValue: true,
          attributes: true
        });

        for (var i = 0; i < observedAttributes.length; i++) {
          var name = observedAttributes[i];
          var value = target.getAttribute(name);
          if (value != null) target[ATTRIBUTE_CHANGED_CALLBACK](name, null, value);
        }
      }

      if (CONNECTED_CALLBACK in target || DISCONNECTED_CALLBACK in target) {
        observed.set(target, 0);
        if (target.isConnected && CONNECTED_CALLBACK in target) target[CONNECTED_CALLBACK]();
      }
    }

    return target;
  };

  var SVG = {};
  var HTML = {};
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
  getOwnPropertyNames(window).forEach(function (name) {
    if (/^(HTML|SVG)/.test(name)) {
      var Kind = RegExp.$1;
      var isSVG = Kind === 'SVG';
      var Class = name.slice(Kind.length, -7) || 'Element';
      var Namespace = isSVG ? SVG : HTML;
      var Native = window[name];
      natives.add(Native);
      [].concat(HTMLSpecial[Class] || Class).forEach(function (Tag) {
        var tag = Tag.toLowerCase();
        (Namespace[Class] = Namespace[Tag] = function Element() {
          return upgrade(create(tag, isSVG), this.constructor);
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
