'use strict';

const metatests = require('metatests');
const common = require('..');

metatests.case(
  'Common / version',
  { common },
  {
    'common.compareVersions': [
      ['0', '0', 0],
      ['00', '0', 0],
      ['0', '00', 0],
      ['0.0', '0', 0],
      ['0', '0.0', 0],

      ['1', '1', 0],
      ['01', '1', 0],
      ['1', '01', 0],
      ['1.0', '1', 0],
      ['1', '1.0', 0],

      ['0', '1', -1],
      ['1.2', '1.3', -1],
      ['1.2.1', '1.3', -1],
      ['1.2', '1.2.3', -1],
      ['1.2', '12', -1],
      ['2.1', '21', -1],

      ['1', '0', 1],
      ['1.3', '1.2', 1],
      ['1.3', '1.2.1', 1],
      ['1.2.3', '1.2', 1],
      ['12', '1.2', 1],
      ['21', '2.1', 1],
    ],
    'common.checkVersion': [
      ['0', '0', true],
      ['00', '0', true],
      ['0', '00', true],
      ['0.0', '0', true],
      ['0', '0.0', true],

      ['1', '1', true],
      ['01', '1', true],
      ['1', '01', true],
      ['1.0', '1', true],
      ['1', '1.0', true],

      ['0', '1', true],
      ['1.2', '1.3', true],
      ['1.2.1', '1.3', true],
      ['1.2', '1.2.3', true],
      ['1.2', '12', true],
      ['2.1', '21', true],

      ['1', '0', false],
      ['1.3', '1.2', false],
      ['1.3', '1.2.1', false],
      ['1.2.3', '1.2', false],
      ['12', '1.2', false],
      ['21', '2.1', false],
    ],
    'common.checkNodeVersion': [[process.versions.node, true]],
    'common.checkV8Version': [[process.versions.v8, true]],
  }
);
