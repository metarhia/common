'use strict';

const metatests = require('metatests');
const common = require('..');

metatests.test('override', test => {
  const fn = test.mustNotCall();
  const obj = {
    fn,
    a: 1,
  };
  common.override(obj, function fn() {
    return this.a;
  });
  test.strictSame(obj.fn(), 1);
  test.strictSame(obj.fn.inherited, fn);
  test.end();
});

class Parent {
  constructor() {
    this.property0 = 'from Parent.constructor';
  }

  method1() {
    this.property1 = 'from Parent.method1';
  }
}

class Lazy {
  constructor() {
    this.property2 = 'from Lazy.constructor';
  }

  method2() {
    this.property3 = 'from Lazy.method2';
  }
}

class Child extends Parent {
  constructor() {
    super();
    this.property4 = 'from Child.constructor';
  }

  method3() {
    this.property5 = 'from Child.method3';
  }
}

common.mixin(Child.prototype, Lazy.prototype);

metatests.test('multiple inheritance with mixin', test => {
  const obj = new Child();
  obj.method1();
  obj.method2();
  obj.method3();
  test.strictSame(obj.property0, 'from Parent.constructor');
  test.strictSame(obj.property4, 'from Child.constructor');
  test.strictSame(obj.property1, 'from Parent.method1');
  test.strictSame(obj.property3, 'from Lazy.method2');
  test.strictSame(obj.property5, 'from Child.method3');
  test.end();
});

metatests.test('privatize', test => {
  const source = {
    CONSTANT: 'constant value',
    field: 'field value',
    '123': 'number field value',
    counter: 0,
    method() {
      return [this.CONSTANT, this.field];
    },
    inc(n = 1) {
      this.counter += n;
      return this.counter;
    },
  };
  const destination = common.privatize(source);
  try {
    destination.CONSTANT = 'can not change freezed';
  } catch (err) {
    test.strictSame(err.constructor.name, 'TypeError');
    test.strictSame(destination.CONSTANT, 'constant value');
  }
  test.strictSame(destination.CONSTANT, 'constant value');
  try {
    destination.field = 'can not change freezed';
  } catch (err) {
    test.strictSame(err.constructor.name, 'TypeError');
    test.strictSame(destination.field, undefined);
  }
  test.strictSame(destination['123'], undefined);
  test.strictSame(destination.method(), ['constant value', 'field value']);
  test.strictSame(destination.inc(), 1);
  try {
    destination.inc = () => 0;
  } catch (err) {
    test.strictSame(err.constructor.name, 'TypeError');
    test.strictSame(destination.inc(), 2);
  }
  test.end();
});
