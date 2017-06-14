'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.zip = (...arrays) => {
    if (arrays.length === 0) return [];

    let minLen = arrays[0].length;
    let i;
    for (i = 1; i < arrays.length; i++) {
      minLen = Math.min(arrays[i].length, minLen);
    }

    const res = new Array(minLen);
    for (i = 0; i < res.length; i++) {
      res[i] = new Array(arrays.length);
      let j;
      for (j = 0; j < res[i].length; j++) {
        res[i][j] = arrays[j][i];
      }
    }
    return res;
  };

  api.common.zipWith = (fn, ...arrays) => (
    api.common
      .zip(...arrays)
      .map(args => fn(...args))
  );

};
