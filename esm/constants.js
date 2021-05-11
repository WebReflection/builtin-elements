const CALLBACK = 'Callback';

export const ELEMENT = 'Element';
export const CONSTRUCTOR = 'constructor';
export const PROTOTYPE = 'prototype';
export const ATTRIBUTE_CHANGED_CALLBACK = 'attributeChanged' + CALLBACK;
export const CONNECTED_CALLBACK = 'connected' + CALLBACK;
export const DISCONNECTED_CALLBACK = 'dis' + CONNECTED_CALLBACK;
export const UPGRADED_CALLBACK = 'upgraded' + CALLBACK;
export const DOWNGRADED_CALLBACK = 'downgraded' + CALLBACK;

export const HTMLSpecial = {
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
