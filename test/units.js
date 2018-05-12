'use strict';

api.metatests.case('Common / units', {
  'common.duration': [
    [            '1d', 86400000  ],
    [            '2d', 172800000 ],
    [           '10h', 36000000  ],
    [            '7m', 420000    ],
    [           '13s', 13000     ],
    [        '2d 43s', 172843000 ],
    [ '5d 17h 52m 1s', 496321000 ],
    [ '1d 10h 7m 13s', 122833000 ],
    [            '1s', 1000      ],
    [             500, 500       ],
    [               0, 0         ],
    [              '', 0         ],
    [            '15', 0         ],
    [           '10q', 0         ],
    [            null, 0         ],
    [       undefined, 0         ],
  ],
  'common.bytesToSize': [
    [                        0, '0'     ],
    [                        1, '1'     ],
    [                      100, '100'   ],
    [                      999, '999'   ],
    [                     1000, '1 Kb'  ],
    [                     1023, '1 Kb'  ],
    [                     1024, '1 Kb'  ],
    [                     1025, '1 Kb'  ],
    [                     1111, '1 Kb'  ],
    [                     2222, '2 Kb'  ],
    [                    10000, '10 Kb' ],
    [                  1000000, '1 Mb'  ],
    [                100000000, '100 Mb'],
    [              10000000000, '10 Gb' ],
    [            1000000000000, '1 Tb'  ],
    [          100000000000000, '100 Tb'],
    [        10000000000000000, '10 Pb' ],
    [      1000000000000000000, '1 Eb'  ],
    [    100000000000000000000, '100 Eb'],
    [  10000000000000000000000, '10 Zb' ],
    [1000000000000000000000000, '1 Yb'  ],
  ],
  'common.sizeToBytes': [
    [      '',                       NaN],
    [       0,                         0],
    [     '0',                         0],
    [     '1',                         1],
    [     512,                       512],
    [   '100',                       100],
    [   '999',                       999],
    [  '1 Kb',                      1000],
    [  '2 Kb',                      2000],
    [ '10 Kb',                     10000],
    [  '1 Mb',                   1000000],
    ['100 Mb',                 100000000],
    [ '10 Gb',               10000000000],
    [  '1 Tb',             1000000000000],
    ['100 Tb',           100000000000000],
    [ '10 Pb',         10000000000000000],
    [  '1 Eb',       1000000000000000000],
    ['100 Eb',     100000000000000000000],
    [ '10 Zb',   10000000000000000000000],
    [  '1 Yb', 1000000000000000000000000],
  ],
});
