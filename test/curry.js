'use strict';

const metatests = require('metatests');
const common = require('..');

metatests.test('curry(f)(1)(2)(3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum)(1)(2)(3);
  test.strictSame(res, 6);
  test.end();
});

metatests.test('curry(f, 1)(2)(3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum, 1)(2)(3);
  test.strictSame(res, 6);
  test.end();
});

metatests.test('curry(f, 1, 2)(3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum, 1, 2)(3);
  test.strictSame(res, 6);
  test.end();
});

metatests.test('curry(f, 1, 2, 3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum, 1, 2, 3);
  test.strictSame(res, 6);
  test.end();
});

metatests.test('curry(f, 1)(2, 3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum, 1)(2, 3);
  test.strictSame(res, 6);
  test.end();
});

metatests.test('curry(f)(1, 2, 3)', (test) => {
  const sum = (x, y, z) => (x + y + z);
  const res = common.curry(sum)(1, 2, 3);
  test.strictSame(res, 6);
  test.end();
});

metatests.testSync('multiple curry of sum(x, y)', (test) => {
  const sum = (x, y) => x + y;
  const sumCurry = common.curry(sum);
  const addOne = sumCurry(1);
  const addTwo = sumCurry(2);
  test.strictSame(addOne(10), 11);
  test.strictSame(addOne(20), 21);
  test.strictSame(addTwo(10), 12);
  test.strictSame(addTwo(20), 22);
});

metatests.testSync('multiple curry of sum(x, y, z)', (test) => {
  const sum = (x, y, z) => x + y + z;
  const sumCurry = common.curry(sum);
  const addOneTwo = sumCurry(1, 2);
  const addTwoThree = sumCurry(2, 3);
  test.strictSame(addOneTwo(10), 13);
  test.strictSame(addOneTwo(20), 23);
  test.strictSame(addTwoThree(10), 15);
  test.strictSame(addTwoThree(20), 25);
});
