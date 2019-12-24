const once = f => (...args) => {
  if (!f) return;
  const res = f(...args);
  f = null;
  return res;
};

const serialize = obj => {
  const type = typeof obj;
  const serializer = serializers[type];
  return serializer(obj);
};

serializers = {
  string: s => s + '',
  number: n => n + '',
  boolean: b => b.toString(),
  function: f => f.toString(),
  object: obj => {
    if (obj instanceof Array) return '[' + `${obj}` + ']';
    if (obj === null) return 'null';
    let str = '{';
    for (const key in obj) {
      const value = obj[key];
      if (str.length > 1) str += ',';
      str += key + ':' + serialize(value);
    }
    return str + '}';
  }
};


const isArrayLike = item =>
  item && item.length >= 0

const stringify = (input, callback) => {
  const one = once(callback)
  const flag = isArrayLike(input)
  let val = ''

  if (!flag) return ''
  for (const item of input) {
    const check = isArrayLike(item)
    if (check) {
      let s = ''
      for (const el of item) {
        if (s.length > 0) s += ',';
        s += serialize(el)
       }
       val += val + s + '\n'
     }
   }
   one(null, val)
}

const input = [ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ], ]

stringify(input, function(err, output){
  console.log(output)
});
