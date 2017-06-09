'use strict';

module.exports = (api) => {

  api.common.curry = (fn, ...args) => fn.bind(null, ...args);

  api.common.curryTwice = fn => api.common.curry(api.common.curry, fn);

};
