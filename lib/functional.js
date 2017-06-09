'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.replicate = (count, elem) => {
    const res = new Array(count);
    let i;
    for (i = 0; i < count; i++) {
      res[i] = elem;
    }
    return res;
  };

};
