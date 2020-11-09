'use strict';

// Override method: save old to `fn.inherited`
// Previous function will be accessible by obj.fnName.inherited
//   obj - <Object>, containing method to override
//   fn - <Function>, name will be used to find method
const override = (obj, fn) => {
  fn.inherited = obj[fn.name];
  obj[fn.name] = fn;
};

// Mixin for ES6 classes without overriding existing methods
//   target - <Object>, mixin to target
//   source - <Object>, source methods
const mixin = (target, source) => {
  const methods = Object.getOwnPropertyNames(source);
  const mix = {};
  for (const method of methods) {
    if (!target[method]) {
      mix[method] = source[method];
    }
  }
  Object.assign(target, mix);
};

// Convert instance with public fields to instance with private fields
//   instance - <Object>, source instance
// Returns: <Object> - destination instance
//
// Example: common.privatize({ private: 5, f() { return this.private; } });
const privatize = instance => {
  const iface = {};
  const fields = Object.keys(instance);
  for (const fieldName of fields) {
    const field = instance[fieldName];
    if (fieldName === fieldName.toUpperCase()) {
      iface[fieldName] = field;
    } else if (typeof field === 'function') {
      const bindedMethod = field.bind(instance);
      iface[fieldName] = bindedMethod;
      instance[fieldName] = bindedMethod;
    }
  }
  return iface;
};

module.exports = {
  override,
  mixin,
  privatize,
};
