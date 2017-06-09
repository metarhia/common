'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.zip = (...arrs) => {
    if (arrs.length === 0) return [];

    let minLen = arrs[0].length;
    let i;
    for (i = 1; i < arrs.length; i++) {
      minLen = Math.min(arrs[i].length, minLen);
    }

    const res = new Array(minLen);
    for (i = 0; i < res.length; i++) {
      res[i] = new Array(arrs.length);
      let j;
      for (j = 0; j < res[i].length; j++) {
        res[i][j] = arrs[j][i];
      }
    }
    return res;
  };

  api.common.zipWith = (fn, ...arrs) => (
    api.common
      .zip(...arrs)
      .map(args => fn(...args))
  );

};
