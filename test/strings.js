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
  ],
  'common.split': [
    ['a,b,c,d', ',', 2,              ['a', 'b']],
    ['a,b,c,d',            ['a', 'b', 'c', 'd']],
    ['a;b;c;d', ';',       ['a', 'b', 'c', 'd']],
    ['a,b,c,d', ';',                ['a,b,c,d']],
  ],
  'common.rsplit': [
    ['a,b,c,d', ',', 2,              ['c', 'd']],
    ['a,b,c,d',            ['a', 'b', 'c', 'd']],
    ['a;b;c;d', ';',       ['a', 'b', 'c', 'd']],
    ['a,b,c,d', ';',                ['a,b,c,d']],
  ],
});
