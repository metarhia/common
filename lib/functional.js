'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.omap = (mapFn, obj) => {
    let key;
    for (key in obj) {
      obj[key] = mapFn(obj[key]);
    }
    return obj;
  };
};
