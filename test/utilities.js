'use strict';

api.metatests.test('Check called filename', (test) => {
  test.ok(api.common.callerFilepath().endsWith('test/utilities.js'));
  test.strictSame(api.common.callerFilename(), 'utilities.js');
  test.end();
});

api.metatests.test('Check called filename parent', (test) => {
  test.ok(api.common.callerFilepath(1).endsWith('test/all.js'));
  test.strictSame(api.common.callerFilename(1), 'all.js');
  test.end();
});
