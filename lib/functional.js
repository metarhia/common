'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.fullCurry = (fn, ...args1) => {
    let argsTotalCount = 0;
    const argsParts = [];

    const curryMore = (...argsI) => {
      argsTotalCount += argsI.length;
      argsParts.push(argsI);
      if (argsTotalCount < fn.length) {
        return curryMore;
      } else {
        const allArgs = [].concat(...argsParts);
        return fn(...allArgs);
      }
    };

    return curryMore(...args1);
  };

};
