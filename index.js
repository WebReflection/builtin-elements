self.builtinElements = (function (exports) {
  'use strict';

  /*! (c) Andrea Giammarchi - ISC */
  if (!('isConnected' in Element.prototype)) Object.defineProperty(Element.prototype, 'isConnected', {
    configurable: true,
    get: function get() {
      return !(this.ownerDocument.compareDocumentPosition(this) & this.DOCUMENT_POSITION_DISCONNECTED);
    }
  });

  var TRUE = true,
      FALSE = false;
  var QSA = 'querySelectorAll';
  /**
   * Start observing a generic document or root element.
   * @param {Function} callback triggered per each dis/connected node
   * @param {Element?} root by default, the global document to observe
   * @param {Function?} MO by default, the global MutationObserver
   * @returns {MutationObserver}
   */

  var notify = function notify(callback, root, MO) {
    var loop = function loop(nodes, added, removed, connected, pass) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        var node = nodes[i];

        if (pass || QSA in node) {
          if (connected) {
            if (!added.has(node)) {
              added.add(node);
              removed["delete"](node);
              callback(node, connected);
            }
          } else if (!removed.has(node)) {
            removed.add(node);
            added["delete"](node);
            callback(node, connected);
          }

          if (!pass) loop((node.shadowRoot || node)[QSA]('*'), added, removed, connected, TRUE);
        }
      }
    };

    var observer = new (MO || MutationObserver)(function (records) {
      for (var added = new Set(), removed = new Set(), i = 0, length = records.length; i < length; i++) {
        var _records$i = records[i],
            addedNodes = _records$i.addedNodes,
            removedNodes = _records$i.removedNodes;
        loop(removedNodes, added, removed, FALSE, FALSE);
        loop(addedNodes, added, removed, TRUE, FALSE);
      }
    });
    observer.observe(root || document, {
      subtree: TRUE,
      childList: TRUE
    });
    return observer;
  };

  /*! (c) Andrea Giammarchi - ISC */
  var CONSTRUCTOR = 'constructor';
  var PROTOTYPE = 'prototype';
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
    return document.createElementNS(isSVG ? 'http://www.w3.org/2000/svg' : '', tag);
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
    if (!natives.has(target[CONSTRUCTOR])) {
      attributes["delete"](target);
      observed["delete"](target);
      if (DOWNGRADED_CALLBACK in target) target[DOWNGRADED_CALLBACK]();
      setPrototypeOf(target, create(target.tagName, 'ownerSVGElement' in target)[CONSTRUCTOR][PROTOTYPE]);
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
      setPrototypeOf(target, Class[PROTOTYPE]);
      if (UPGRADED_CALLBACK in target) target[UPGRADED_CALLBACK]();
      var observedAttributes = Class.observedAttributes;

      if (observedAttributes && ATTRIBUTE_CHANGED_CALLBACK in target) {
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
      var isSVG = Kind == 'SVG';
      var Class = name.slice(Kind.length, -7) || 'Element';
      var Namespace = isSVG ? SVG : HTML;
      var Native = window[name];
      natives.add(Native);
      [].concat(HTMLSpecial[Class] || Class).forEach(function (Tag) {
        var tag = Tag.toLowerCase();
        (Namespace[Class] = Namespace[Tag] = function Element() {
          return upgrade(create(tag, isSVG), this[CONSTRUCTOR]);
        })[PROTOTYPE] = Native[PROTOTYPE];
      });
    }
  });
  notify(function (node, connected) {
    if (observed.has(node)) {
      /* c8 ignore next */
      var method = connected ? CONNECTED_CALLBACK : DISCONNECTED_CALLBACK;
      if (method in node) node[method]();
    }
  });

  exports.HTML = HTML;
  exports.SVG = SVG;
  exports.downgrade = downgrade;
  exports.upgrade = upgrade;

  return exports;

}({}));
