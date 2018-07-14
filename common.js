'use strict';

const submodules = [
  require('./lib/utilities'), // Common utilities
  require('./lib/math'), // Math common function
  require('./lib/array'), // Arrays manipulations
  require('./lib/data'), // Data structures manipulations
  require('./lib/strings'), // Strings utilities
  require('./lib/time'), // Data and Time functions
  require('./lib/fp'), // Functional programming
  require('./lib/oop'), // Object-oriented programming
  require('./lib/callbacks'), // Callback utilities
  require('./lib/events'), // Events and emitter
  require('./lib/units'), // Units conversion
  require('./lib/network'), // Network utilities
  require('./lib/id'), // Keys and identifiers
  require('./lib/sort'), // Sort compare functions
  require('./lib/cache'), // Cache (enhanced Map)
  require('./lib/mp'), // Metaprogramming
];

module.exports = Object.assign({}, ...submodules);
