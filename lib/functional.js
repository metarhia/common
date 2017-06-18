'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.omap = (
    // Function for mapping object fields
    mapFn, // funtions applied to every field value
    obj // object which fields used for mapping
    // Returns object with same reference but with transformed fields
  ) => {
    let key;
    for (key in obj) {
      obj[key] = mapFn(obj[key]);
    }
    return obj;
  };

  api.common.compose = (...fns) => (...args) => {
    if (fns.length === 0) return args[0];

    let res = fns[0](...args);
    let i;
    for (i = 1; i < fns.length; i++) {
      res = fns[i](res);
    }
    return res;
  };

  api.common.maybe = (fn, defVal, value) => (
    value !== undefined && value !== null ? fn(value) : defVal
  );

  function Either(
    // Either can be used for saving either left type or right type value.
    // Left type is commonly used for additional information like error.
    left, // left type value
    right // right type value
    // Returns tuple containing left type value or null as first element
    // and right type value or undefined as second element
  ) {
    if (left !== null && left !== undefined) {
      this.isLeft = true;
      this.val = left;
    } else {
      this.isLeft = false;
      this.val = right;
    }
  }

  api.common.Either = Either;

  api.common.eitherRight = (
    // Function for creating either values with right type inside
    right // right type value
    // Returns either value with right type inside
  ) => (new Either(null, right));

  api.common.altAppend = (
    // Alternative append for either values
    e1, // first either value
    e2 // second either value
    // Returns result of appending two either values
  ) => (e1[0] ? e1 : e2);

  api.common.altConcat = (
    // Alternative concatenation for either values
    ...args // arguments for concatenation
    // Returns result of concatenation of args
  ) => {
    if (args.length === 0) {
      throw new Error('altConcat takes one or more arguments');
    }
    if (args.length === 1) return args[0];

    let res = args[0];
    let i;
    for (i = 1; i < args.length; i++) {
      res = api.common.altAppend(res, args[i]);
    }
    return res;
  };

  api.common.altConcatLazy = (
    // Alternative lazy concatenation for either values
    ...args // array of functions returning either values
    // Returns result of concatenation of either values
  ) => {
    if (args.length === 0) {
      throw new Error('altConcat takes one or more arguments');
    }
    if (args.length === 1) return args[0]();

    let res = args[0]();
    let i;
    for (i = 1; i < args.length; i++) {
      res = api.common.altAppend(res, args[i]());
    }
    return res;
  };

  api.common.either = (
    // Takes function for processing left type value
    // and another one for right type and executes suitable one
    leftFn, // function handling left type value
    rightFn, // function handling right type value
    valE // either value which is processed
    // Returns result of applying one of the given functions
    // to value with stored typed (left or right)
  ) => (
    valE.isLeft ? leftFn(valE.val) : rightFn(valE.val)
  );

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

  api.common.replicate = (count, elem) => {
    const res = new Array(count);
    let i;
    for (i = 0; i < count; i++) {
      res[i] = elem;
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
