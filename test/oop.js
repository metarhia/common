'use strict';

const metatests = require('metatests');
const common = require('..');

class Father {
  constructor(fname) {
    this.fname = fname;
  }
  getName() {
    return this.fname;
  }
}

class Son {
  constructor(fname, sname) {
    this.fname = fname;
    this.sname = sname;
  }
  getName() {
    return { fname: this.fname, sname: this.sname };
  }
  getAge() {
    return 126;
  }
}

metatests.test('inherits', test => {
  common.inherits(Son, Father);
  test.strictSame(Son.super_, Father);
  test.end();
});

metatests.test('override', test => {
  const obj = new Son('Mao', 'Zedong');
  function getName() {
    return this.fname;
  }
  common.override(obj, getName);
  test.strictSame('Mao', obj.getName());
  test.strictSame({ fname: 'Mao', sname: 'Zedong' }, obj.getName.inherited());
  test.end();
});

metatests.test('mixin', test => {
  const b = new Father('Marcus');
  const object = {
    a: () => 'a',
    b: () => 'b',
  };
  common.mixin(b, object);
  test.strictSame(b.a(), 'a');
  test.strictSame(b.b(), 'b');
  test.end();
});
