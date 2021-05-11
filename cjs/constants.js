'use strict';
const CALLBACK = 'Callback';

const ELEMENT = 'Element';
exports.ELEMENT = ELEMENT;
const CONSTRUCTOR = 'constructor';
exports.CONSTRUCTOR = CONSTRUCTOR;
const PROTOTYPE = 'prototype';
exports.PROTOTYPE = PROTOTYPE;
const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;
exports.ATTRIBUTE_CHANGED_CALLBACK = ATTRIBUTE_CHANGED_CALLBACK;
const CONNECTED_CALLBACK = 'connected' + CALLBACK;
exports.CONNECTED_CALLBACK = CONNECTED_CALLBACK;
const DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
exports.DISCONNECTED_CALLBACK = DISCONNECTED_CALLBACK;
const UPGRADED_CALLBACK = 'upgraded' + CALLBACK;
exports.UPGRADED_CALLBACK = UPGRADED_CALLBACK;
const DOWNGRADED_CALLBACK = 'downgraded' + CALLBACK;
exports.DOWNGRADED_CALLBACK = DOWNGRADED_CALLBACK;

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
  'UList': 'UL',
  // Generic Element based Classes
  [ELEMENT]: [
    'Article', 'Aside',
    'Footer',
    'Header',
    'Main',
    'Nav',
    'Section',
    ELEMENT
  ]
};
exports.HTMLSpecial = HTMLSpecial;
