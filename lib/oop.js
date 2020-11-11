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

const REF_TYPES = ['object', 'function'];

// Deep freeze object structure
//   instance - <Object>, target nested objects structure
// Returns: <Object> - deep freezed instance
//
const deepFreeze = instance => {
  Object.freeze(instance);
  const fields = Object.getOwnPropertyNames(instance);
  for (const fieldName of fields) {
    const value = instance[fieldName];
    if (value === null) continue;
    if (!REF_TYPES.includes(typeof value) || Object.isFrozen(value)) continue;
    deepFreeze(value);
  }
  return instance;
};

// Deep freeze namespaces
//   namespaces - <Object>, target nested objects structure
//   skipNames - <Array>, nemes to be skipped for freezing at first level
// Returns: undefined
//
const freezeNamespaces = (namespaces, skipNames = []) => {
  for (const namespace of namespaces) {
    const names = Object.keys(namespace);
    for (const name of names) {
      const target = namespace[name];
      if (skipNames.includes(name)) continue;
      deepFreeze(target);
    }
  }
};

module.exports = {
  override,
  mixin,
  deepFreeze,
  freezeNamespaces,
};
