function once(f) {
  const wrapper = (...args) => {
    if (f === null) return
    const callFn = f
    f = null
    callFn.apply(this, args)
  }
  return wrapper
}

const serialize = obj => {
  const type = typeof obj;
  if (obj === null) return 'null';
  else if (type === 'string') return obj.toString();
  else if (type === 'number') return obj.toString();
  else if (type === 'boolean') return obj.toString();
  else if (type !== 'object') return obj.toString();
  else if (Array.isArray(obj)) {
    return `[${obj}]`;
  } else {
    let s = `"{`;
    for (const key in obj) {
      const value = obj[key];
      if (s.length > 1) {
      s +=`"\"${key}"":` + serialize(value) ;
      }
    }
    return s + `}"`;
  }
};

const stringify1 = (input, callback) => {
  const oneTime = once(callback)
  let val = ''
  const array = Array.isArray(input)

  if(!array || input.length === 0) return
  for(const element of input){
    const check = Array.isArray(element)
    if(check || element.length >= 0) {

      let s = ''
      for (const el of element) {
        if (s.length > 0) s += ','
        s = s + serialize(el)
      }
      val = val + s + '\n'
    }
  }
  oneTime(null, val)
}

const input = [ [ '1', '2', '3', '4' ], [ 'a', 'b', 'c', 'd' ], ]

stringify1(input, function(err, output){
  console.log(output)
});
