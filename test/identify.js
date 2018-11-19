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
