'use strict';

const metatests = require('metatests');
const common = require('..');
const metasync = require('metasync');
const events = require('events');

global.api = { common, events, metatests, metasync };

api.metatests.namespace({ common: api.common });

const all = [
  'array', 'cache', 'callback', 'curry', 'curryN',
  'data', 'either', 'enum', 'events', 'id', 'math', 'mixin',
  'mp', 'network', 'omap', 'partial', 'replicate', 'restLeft',
  'safe', 'sort', 'strings', 'time', 'units', 'zip', 'zipWith', 'iterator'
];

all.forEach(name => require('./' + name));

api.metatests.report();
