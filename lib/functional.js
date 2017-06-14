'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.zip = (
    // Zipping several arrays into one.
    ...arrays // input arrays
    // Returns array length is minimal of input arrays length
    // Element with index i of resulting array is array with
    // elements with index i from input arrays.
  ) => {
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

  api.common.zipWith = (
    // Zipping arrays using specific function
    fn, // function for zipping elements with index i
    ...arrays // input arrays
    // Element with index i of resulting array is result
    // of fn called with arguments from arrays
  ) => (
    api.common
      .zip(...arrays)
      .map(args => fn(...args))
  );

};
