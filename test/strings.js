'use strict';

api.metatests.case('Metarhia common library', {
  'common.subst': [
    [
      'Hello, @name@', { name: 'Ali' }, '', true,
      'Hello, Ali'
    ],
    [
      'Hello, @.name@', { person: { name: 'Ali' } }, 'person', true,
      'Hello, Ali'
    ],
  ],
  'common.section': [
    ['All you need is JavaScript', 'is',   ['All you need ', ' JavaScript']],
    ['All you need is JavaScript', 'no', ['All you need is JavaScript', '']],
    ['All you need is JavaScript', 'JavaScript',   ['All you need is ', '']],
    ['All you need is JavaScript', 'All',   ['', ' you need is JavaScript']],
    ['All you need is JavaScript', 'a', ['All you need is J',   'vaScript']],
  ]
});


api.metatests.test('split', (test) => {
  const s = 'a,b,c,d';
  const result = api.common.split(s, ',', 2);
  test.strictSame(result, ['a', 'b']);
  test.end();
});

api.metatests.test('split all', (test) => {
  const s = 'a,b,c,d';
  const result = api.common.split(s);
  test.strictSame(result, ['a', 'b', 'c', 'd']);
  test.end();
});

api.metatests.test('rsplit', (test) => {
  const s = 'a,b,c,d';
  const result = api.common.rsplit(s, ',', 2);
  test.strictSame(result, ['c', 'd']);
  test.end();
});

api.metatests.test('rsplit all', (test) => {
  const s = 'a,b,c,d';
  const result = api.common.rsplit(s);
  test.strictSame(result, ['a', 'b', 'c', 'd']);
  test.end();
});
