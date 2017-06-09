'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.maybe = (fn, defVal, value) => (
    value !== undefined && value !== null ? fn(value) : defVal
  );

};
