'use strict';
const common = require('../common.js');
// Unit64 at a point of 3rd commit in branch
// https://github.com/metarhia/common/compare/master...uint64-impl~1
const { Uint64 } = require('../../../metarhia-common/common');

const bench = common.createBenchmark(main, {
  n: [1e6],
  kind: ['uint64', 'bigint'],
  op: ['and', 'xor', 'inc', 'dec', 'mul', 'div'],
  val: [
    '0: 0x123ff, 0xab',
    '1: 0xffffffffff, 0xffff',
    '2: 0xffffeeee00ff11, 0x3ffffeeee00ff11'
  ],
});

const values = [
  [0x123ff, 0xab],
  [0xffffffffff, 0xffff],
  ['0xffffeeee00ff11', '0x3ffffeeee00ff11']
];

function main(opts) {
  if (opts.kind === 'uint64') benchUint64(opts);
  else benchBigInt(opts);
}

function benchUint64({ n, kind, op, val }) {
  const [ val1, val2 ] = values[parseInt(val[0])];
  const v1 = new Uint64(val1);
  const v2 = new Uint64(val2);

  bench.start();
  for (let i = 0; i < n; ++i) {
    switch (op) {
      case 'and': {
        Uint64.and(v1, v2);
        break;
      }
      case 'xor': {
        Uint64.xor(v1, v2);
        break;
      }
      case 'inc': {
        v1.inc();
        v2.inc();
        break;
      }
      case 'dec': {
        v1.dec();
        v2.dec();
        break;
      }
      case 'mul': {
        Uint64.mult(v1, v2);
        break;
      }
      case 'div': {
        Uint64.div(v1, v2);
        break;
      }
    }
  }
  bench.end(n);
}

function benchBigInt({ n, kind, op, val }) {
  const [ val1, val2 ] = values[parseInt(val[0])];
  const v1 = BigInt(val1);
  const v2 = BigInt(val2);

  bench.start();
  for (let i = 0; i < n; ++i) {
    switch (op) {
      case 'and': {
        v1 & v2;
        break;
      }
      case 'xor': {
        v1 ^ v2;
        break;
      }
      case 'inc': {
        v1 + 1n;
        v2 + 1n;
        break;
      }
      case 'dec': {
        v1 - 1n;
        v2 - 1n;
        break;
      }
      case 'mul': {
        v1 * v2;
        break;
      }
      case 'div': {
        v1 / v2;
        break;
      }
    }
  }
  bench.end(n);
}
