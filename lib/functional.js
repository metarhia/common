'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

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

  // Either can be used for saving either left type or right type value.
  // Left type is commonly used for additional information like error.
  //
  api.common.makeEither = (left, right) => ([left, right]);

  // Function for creating Either values with right type inside
  //
  api.common.eitherRight = api.common.curry(api.common.makeEither, null);

  // Alternative append for either values
  //
  api.common.altAppend = (e1, e2) => (e1[0] ? e1 : e2);

  // Alternative concatenation for either values
  //
  api.common.altConcat = (...args) => {
    switch (args.length) {
      case 0: throw new Error('altConcat takes one or more arguments');
      case 1: return args[0];
      default: {
        let res = args[0];
        let i;
        for (i = 1; i < args.length; i++) {
          res = api.common.altAppend(res, args[i]);
        }
        return res;
      }
    }
  };

  // Alternative lazy concatenation for either values
  //
  api.common.altConcatLazy = (...args) => {
    switch (args.length) {
      case 0: throw new Error('altConcat takes one or more arguments');
      case 1: return args[0]();
      default: {
        let res = args[0]();
        let i;
        for (i = 1; i < args.length; i++) {
          res = api.common.altAppend(res, args[i]());
        }
        return res;
      }
    }
  };

  // Takes function for processing left type value
  // and another one for right type and executes suitable one
  //
  api.common.either = (leftFn, rightFn, [err, data]) => (
    err ? leftFn(err) : rightFn(data)
  );

};
