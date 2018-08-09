'use strict';

/*eslint max-len: ["error", { "code": 120 }]*/

const config = {
  characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  secret: 'secret',
  length: 64
};

api.metatests.case('Common / id', {
  'common.validateSID': [
    [config, 'XFHczfaqXaaUmIcKfHNF9YAY4BRaMX5Z4Bx99rsB5UA499mTjmewlrWTKTCp77bc',  true],
    [config, 'XFHczfaqXaaUmIcKfHNF9YAY4BRaMX5Z4Bx99rsB5UA499mTjmewlrWTKTCp77bK', false],
    [config, '2XpU8oAewXwKJJSQeY0MByY403AyXprFdhB96zPFbpJxlBqHA3GfBYeLxgHxBhhZ', false],
    [config, 'WRONG-STRING',                                                     false],
    [config, '',                                                                 false],
  ],
  'common.generateSID': [
    [config, (result) => (result.length === 64)],
  ],
  'common.crcSID': [
    [
      config,
      api.common.generateKey(
        config.length - 4,
        config.characters
      ),
      (result)  => (result.length === 4)
    ]
  ],
  'common.idToChunks': [
    [0,                ['0000', '0000']],
    [1,                ['0001', '0000']],
    [30,               ['001e', '0000']],
    [123456789,        ['cd15', '075b']],
    [123456789123,     ['1a83', 'be99', '001c']],
    [9007199254740991, ['ffff', 'ffff', 'ffff', '001f']]
  ],
  'common.idToPath': [
    [0,                '0000/0000'],
    [1,                '0001/0000'],
    [30,               '001e/0000'],
    [123456789,        'cd15/075b'],
    [123456789123,     '1a83/be99/001c'],
    [9007199254740991, 'ffff/ffff/ffff/001f']
  ],
  'common.pathToId': [
    ['0000/0000',           0],
    ['0001/0000',           1],
    ['001e/0000',           30],
    ['1000/0000',           4096],
    ['ffff/0000',           65535],
    ['0000/0001',           65536],
    ['e240/0001',           123456],
    ['0000/001e',           1966080],
    ['cd15/075b',           123456789],
    ['0000/1000',           268435456],
    ['0000/ffff',           4294901760],
    ['0000/0000/0001',      4294967296],
    ['1a83/be99/001c',      123456789123],
    ['0000/0000/1000',      17592186044416],
    ['0000/0000/ffff',      281470681743360],
    ['ffff/ffff/ffff/001f', 9007199254740991]
  ]
});

//console.dir(idToChunks());

api.metatests.test('generateStorageKey', (test) => {
  const key = api.common.generateStorageKey();
  test.strictSame(Array.isArray(key), true);
  test.strictSame(key.length, 3);
  const [dir1, dir2, file] = key;
  test.strictSame(dir1.length, 2);
  test.strictSame(dir2.length, 2);
  test.strictSame(file.length, 8);
  test.strictSame(key.join('/').length, 14);
  test.end();
});

api.metatests.test('Id.constructor', test => {
  const tests = [
    [0, 0],
    [1, 1],
    [30, 30],
    [9007199254740991,
      9007199254740991],
    ['', 0],
    ['0', 0],
    ['1', 1],
    ['10q', 10],
    ['30', 30],
    ['9007199254740991',
      9007199254740991],
    [[], 0],
    [[1], 1],
    [[1, 2], 1],
    [[''], 0],
    [['1'], 0],
    [['qwe'], 0],
    [new Uint32Array(), 0],
    [new Uint32Array(1), 0],
    [new Uint32Array(2), 0],
    [new Uint32Array([]), 0],
    [new Uint32Array([1]), 1],
    [new Uint32Array([1, 2]), 1],
    [null, 0],
    [undefined, 0]
  ];
  let i;
  for (i = 0; i < tests.length; i++) {
    test.strictSame((new api.common.Id(tests[i][0])).toNumber(), tests[i][1]);
  }
  test.end();
});

api.metatests.test('Id.set', (test) => {
  const tests = [
    [0, 0],
    [1, 1],
    [30, 30],
    [9007199254740991,
      9007199254740991],
    ['', 0],
    ['0', 0],
    ['1', 1],
    ['10q', 10],
    ['30', 30],
    ['9007199254740991',
      9007199254740991],
    [[], 0],
    [[1], 1],
    [[1, 2], 1],
    [[''], 0],
    [['1'], 0],
    [['qwe'], 0],
    [new Uint32Array(), 0],
    [new Uint32Array(1), 0],
    [new Uint32Array(2), 0],
    [new Uint32Array([]), 0],
    [new Uint32Array([1]), 1],
    [new Uint32Array([1, 2]), 1],
    [null, 0],
    [undefined, 0]
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    test.strictSame(id.set(tests[i][0]), tests[i][1]);
  }
  test.end();
});

api.metatests.test('Id.next', (test) => {
  const tests = [
    0,
    1,
    30,
    123456789,
    123456789123,
    9007199254740991
  ];
  let i, id;
  for (i = 0; i < tests.length; i++) {
    id = new api.common.Id(tests[i]);
    test.strictSame(id.next(), tests[i] + 1);
  }
  test.end();
});

api.metatests.test('Id.toChunks', (test) => {
  const tests = [
    [0,                ['0000', '0000']],
    [1,                ['0001', '0000']],
    [30,               ['001e', '0000']],
    [123456789,        ['cd15', '075b']],
    [123456789123,     ['1a83', 'be99', '001c']],
    [9007199254740991, ['ffff', 'ffff', 'ffff', '001f']]
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    id.set(tests[i][0]);
    test.strictSame(id.toChunks(), tests[i][1]);
  }
  test.end();
});

api.metatests.test('Id.toPath', (test) => {
  const tests = [
    [0,                '0000/0000'],
    [1,                '0001/0000'],
    [30,               '001e/0000'],
    [123456789,        'cd15/075b'],
    [123456789123,     '1a83/be99/001c'],
    [9007199254740991, 'ffff/ffff/ffff/001f']
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    id.set(tests[i][0]);
    test.strictSame(id.toPath(), tests[i][1]);
  }
  test.end();
});

api.metatests.test('Id.toNumber', (test) => {
  const tests = [
    0,
    1,
    30,
    123456789,
    123456789123,
    9007199254740991
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    id.set(tests[i]);
    test.strictSame(id.toNumber(), tests[i]);
  }
  test.end();
});

api.metatests.test('Id.toString', (test) => {
  const tests = [
    [0,                '0'],
    [1,                '1'],
    [30,               '30'],
    [123456789,        '123456789'],
    [123456789123,     '123456789123'],
    [9007199254740991, '9007199254740991']
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    id.set(tests[i][0]);
    test.strictSame(id.toString(), tests[i][1]);
  }
  test.end();
});

api.metatests.test('Id Symbol.toPrimitive', (test) => {
  const tests = [
    [0,                '0'],
    [1,                '1'],
    [30,               '30'],
    [123456789,        '123456789'],
    [123456789123,     '123456789123'],
    [9007199254740991, '9007199254740991']
  ];
  const id = new api.common.Id();
  let i;
  for (i = 0; i < tests.length; i++) {
    id.set(tests[i][0]);
    test.strictSame(`${id}`, tests[i][1]);
    test.strictSame(+id, tests[i][0]);
  }
  test.end();
});

