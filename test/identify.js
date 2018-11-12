'use strict';

const metatests = require('metatests');
const common = require('..');

metatests.test('identify function', test => {
  test.strictSame(common.id(10), 10);
  test.strictSame(common.id({ data: 10 }), { data: 10 });
  test.end();
});

metatests.test('async identify function', test => {
  const cb = (err, data) => {
    test.error(err);
    test.strictSame(data, { data: 10 });
    test.end();
  };

  common.asyncId({ data: 10 }, cb);
});

metatests.test('mapable object identify function', test => {
  const arr = [1, 20, 300];
  const cb = (err, data) => {
    test.error(err);
    test.strictSame(data, [1, 20, 300]);
    test.end();
  };

  common.mapIterationId(arr, () => {}, cb);
});
