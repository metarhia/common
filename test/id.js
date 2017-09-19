'use strict';

const tap = require('tap');
const common = require('..');

tap.test('generateStorageKey', (test) => {
  const key = common.generateStorageKey();
  test.strictSame(key.length, 3);
  test.strictSame(key.join('/').length, 14);
  test.end();
});
