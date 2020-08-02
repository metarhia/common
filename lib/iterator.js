/* eslint-disable no-use-before-define */

'use strict';

const toIterator = base => {
  if (!base[Symbol.iterator]) {
    throw new TypeError('Base is not Iterable');
  }
  return base[Symbol.iterator]();
};

class Iterator {
  constructor(base) {
    this.base = toIterator(base);
  }

  [Symbol.iterator]() {
    return this;
  }

  next() {
    return this.base.next();
  }

  count() {
    let count = 0;
    while (!this.next().done) {
      count++;
    }
    return count;
  }

  each(fn, thisArg) {
    this.forEach(fn, thisArg);
  }

  forEach(fn, thisArg) {
    for (const value of this) {
      fn.call(thisArg, value);
    }
  }

  every(predicate, thisArg) {
    for (const value of this) {
      if (!predicate.call(thisArg, value)) {
        return false;
      }
    }
    return true;
  }

  find(predicate, thisArg) {
    for (const value of this) {
      if (predicate.call(thisArg, value)) {
        return value;
      }
    }
    return undefined;
  }

  includes(element) {
    for (const value of this) {
      if (value === element || (Number.isNaN(value) && Number.isNaN(element))) {
        return true;
      }
    }
    return false;
  }

  reduce(reducer, initialValue) {
    let result = initialValue;

    if (result === undefined) {
      const next = this.next();
      if (next.done) {
        throw new TypeError(
          'Reduce of consumed iterator with no initial value'
        );
      }
      result = next.value;
    }

    for (const value of this) {
      result = reducer(result, value);
    }
    return result;
  }

  some(predicate, thisArg) {
    for (const value of this) {
      if (predicate.call(thisArg, value)) {
        return true;
      }
    }
    return false;
  }

  someCount(predicate, count, thisArg) {
    let n = 0;
    for (const value of this) {
      if (predicate.call(thisArg, value)) {
        if (++n === count) return true;
      }
    }
    return false;
  }

  collectTo(CollectionClass) {
    return new CollectionClass(this);
  }

  collectWith(obj, collector) {
    this.forEach(element => collector(obj, element));
    return obj;
  }

  toArray() {
    return Array.from(this);
  }

  // Transforms an iterator of key-value pairs into an object.
  // This is similar to what `{Object.fromEntries()}` would offer.
  toObject() {
    return this.collectWith({}, (obj, { 0: key, 1: val }) => {
      obj[key] = val;
    });
  }

  map(mapper, thisArg) {
    return new MapIterator(this, mapper, thisArg);
  }

  filter(predicate, thisArg) {
    return new FilterIterator(this, predicate, thisArg);
  }

  // Creates an iterator that both filters and maps with the passed `mapper`.
  // This iterator will call `mapper` on each element and if mapper returns
  // NOT `filterValue` it will be returned, otherwise it is ignored.
  // Signature: mapper[, thisArg[, filterValue]]
  //   mapper <Function> function that maps values and returns either new value
  //       that will be the next value of the new iterator or `filterValue`
  //       that will be ignored.
  //     value <any> iterator element
  //   thisArg <any> value to be used as `this` when calling `mapper`
  //   filterValue <any> value to filter out `mapper` results.
  filterMap(mapper, thisArg, filterValue) {
    return new FilterMapIterator(this, mapper, thisArg, filterValue);
  }

  flat(depth = 1) {
    return new FlatIterator(this, depth);
  }

  flatMap(mapper, thisArg) {
    return new FlatMapIterator(this, mapper, thisArg);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // Returns an iterator of Arrays where the i-th tuple contains
  // the i-th element from each of the passed iterators.
  // The iterator stops when the shortest input iterable is exhausted.
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  zip(...iterators) {
    return new ZipIterator(this, iterators);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // If the iterables are of uneven length, missing values are filled-in
  // with <undefined>. Iteration continues until the longest iterable
  // is exhausted.
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  zipLongest(...iterators) {
    return new ZipIteratorLongest(this, iterators);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // If the iterables are of uneven length, missing values are filled-in
  // with <defaultValue>. Iteration continues until the longest iterable
  // is exhausted.
  //   defaultValue <any> value to fill-in missing values with
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  zipLongestWith(defaultValue, ...iterators) {
    return new ZipIteratorLongest(this, iterators, defaultValue);
  }

  chain(...iterators) {
    return new ChainIterator(this, iterators);
  }

  take(amount) {
    return new TakeIterator(this, amount);
  }

  takeWhile(predicate, thisArg) {
    return new TakeWhileIterator(this, predicate, thisArg);
  }

  skip(amount) {
    for (let i = 0; i < amount; i++) {
      this.next();
    }
    return this;
  }

  skipWhile(predicate, thisArg) {
    return new SkipWhileIterator(this, predicate, thisArg);
  }

  // Consumes an iterator, partitioning it into Arrays
  // Signature: predicate[, thisArg]
  //   predicate <Function> function returns a value to partition this iterator
  //     value <any> current iterator element
  //     Returns: <boolean> | <number> key denoting resulting partition this
  //         value will be assigned to. Number denotes index in the resulting
  //         array. Boolean will be cast to number
  //   thisArg <any> value to be used as `this` when calling `predicate`
  //   Returns: <Array> array of partitions (arrays), will always have at
  //       least 2 arrays in it
  partition(predicate, thisArg) {
    const result = [[], []];
    for (const value of this) {
      const res = predicate.call(thisArg, value);
      const index = typeof res === 'number' ? res : Number(res);
      if (result.length <= index) {
        const oldLength = result.length;
        result.length = index + 1;
        for (let i = oldLength; i < result.length; i++) {
          result[i] = [];
        }
      }
      result[index].push(value);
    }
    return result;
  }

  enumerate() {
    return new EnumerateIterator(this);
  }

  // Consumes an iterator grouping values by keys
  // Signature: classifier[, thisArg]
  //   classifier <Function> gets value to group by
  //     value <any> current iterator value
  //     Returns: <any> value to group by
  //   thisArg <any> value to be used as `this` when calling `classifier`
  //   Returns: <Map> map with arrays of iterator values grouped
  //       by keys returned by `classifier`
  groupBy(classifier, thisArg) {
    const map = new Map();
    for (const value of this) {
      const key = classifier.call(thisArg, value);
      const collection = map.get(key);
      if (!collection) map.set(key, [value]);
      else collection.push(value);
    }
    return map;
  }

  join(sep = ',', prefix = '', suffix = '') {
    let result = prefix;
    const { done, value } = this.next();
    if (!done) {
      result += value;
      for (const value of this) {
        result += sep + value;
      }
    }
    return result + suffix;
  }

  // Find value in this iterator by comparing every value with
  // the found one using `comparator`
  // Signature: comparator[, accessor[, thisArg]]
  //   comparator <Function> returns `true` if new value should be accepted
  //     currValue <any> current value, starts with undefined
  //     nextValue <any> next value
  //     Returns: <boolean> `true` if next value should be accepted
  //   accessor <Function> gets value to compare by, current iterator value
  //       is used by default
  //     value <any> current iterator value
  //     Returns: <any> value to compare by
  //   thisArg <any> value to be used as `this` when calling `accessor` and
  //       `comparator`
  // Returns: last iterator value where `comparator` returned `true`,
  //     <undefined> by default
  findCompare(comparator, accessor, thisArg) {
    let res = undefined;
    let resCompareBy = undefined;
    for (const value of this) {
      const compareBy = accessor ? accessor.call(thisArg, value) : value;
      if (comparator.call(thisArg, resCompareBy, compareBy)) {
        resCompareBy = compareBy;
        res = value;
      }
    }
    return res;
  }

  // Find the maximum value in this iterator
  // Signature: [accessor[, thisArg]]
  //   accessor <Function> gets value to compare by, current iterator value
  //       is used by default
  //     value <any> current iterator value
  //     Returns: <any> value to compare by
  //   thisArg <any> value to be used as `this` when calling `accessor`
  // Returns: element with maximum value or <undefined> if iterator is empty
  max(accessor, thisArg) {
    return this.findCompare(
      (curr, next) => curr === undefined || next > curr,
      accessor,
      thisArg
    );
  }

  // Find the minimum value in this iterator
  // Signature: [accessor[, thisArg]]
  //   accessor <Function> gets value to compare by, current iterator value
  //       is used by default
  //     value <any> current iterator value
  //     Returns: <any> value to compare by
  //   thisArg <any> value to be used as `this` when calling `accessor`
  // Returns: element with minimum value or <undefined> if iterator is empty
  min(accessor, thisArg) {
    return this.findCompare(
      (curr, next) => curr === undefined || next < curr,
      accessor,
      thisArg
    );
  }

  // Call a function with `this`. Will be equivalent to calling `fn(it)`.
  //   fn <Function>
  //     this <Iterator>
  // Returns: the result of `fn(this)` call.
  apply(fn) {
    return fn(this);
  }

  // Call a function with `this` and wrap the result in an Iterator.
  //   fn <Function>
  //     this <Iterator>
  // Returns: <Iterator> result of `fn(this)` wrapped in an Iterator.
  //
  // Example:
  // iter([1, 2])
  //   .chainApply(([a, b]) => [a + b, a - b])
  //   .join(', ');
  // Result: '3, -1'
  chainApply(fn) {
    const res = fn(this);
    return iter(res && res[Symbol.iterator] ? res : [res]);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // Returns an iterator of Arrays where the i-th tuple contains
  // the i-th element from each of the passed iterators.
  // The iterator stops when the shortest input iterable is exhausted.
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  static zip(base, ...iterators) {
    return new ZipIterator(toIterator(base), iterators);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // If the iterables are of uneven length, missing values are filled-in
  // with <undefined>. Iteration continues until the longest iterable
  // is exhausted.
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  static zipLongest(base, ...iterators) {
    return new ZipIteratorLongest(toIterator(base), iterators);
  }

  // Creates an iterator that aggregates elements from each of the iterators.
  //
  // If the iterables are of uneven length, missing values are filled-in
  // with <defaultValue>. Iteration continues until the longest iterable
  // is exhausted.
  //   defaultValue <any> value to fill-in missing values with
  //   ...iterators <Array> iterators to be aggregated
  // Returns: <Iterator>
  static zipLongestWith(defaultValue, base, ...iterators) {
    return new ZipIteratorLongest(toIterator(base), iterators, defaultValue);
  }

  // Create iterator iterating over the range
  // Signature: start, stop[, step]
  //   start <number>
  //   stop <number>
  //   step <number> (optional), default: `1`
  //
  // Returns: <Iterator>
  static range(start, stop, step) {
    return new Iterator(rangeGenerator(start, stop, step));
  }
}

Object.defineProperty(Iterator.prototype, Symbol.toStringTag, {
  value: 'Metarhia Iterator',
  writable: false,
  enumerable: false,
  configurable: true,
});

function* rangeGenerator(start, stop, step = 1) {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  while (true) {
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return;
    }
    yield start;
    start += step;
  }
}

class MapIterator extends Iterator {
  constructor(base, mapper, thisArg) {
    super(base);
    this.mapper = mapper;
    this.thisArg = thisArg;
  }

  next() {
    const { done, value } = this.base.next();
    return {
      done,
      value: done ? undefined : this.mapper.call(this.thisArg, value),
    };
  }
}

class FilterIterator extends Iterator {
  constructor(base, predicate, thisArg) {
    super(base);
    this.predicate = predicate;
    this.thisArg = thisArg;
  }

  next() {
    for (const value of this.base) {
      if (this.predicate.call(this.thisArg, value)) {
        return { done: false, value };
      }
    }
    return { done: true, value: undefined };
  }
}

class FilterMapIterator extends Iterator {
  constructor(base, mapper, thisArg, filterValue) {
    super(base);
    this.mapper = mapper;
    this.thisArg = thisArg;
    this.filterValue = filterValue;
  }

  next() {
    for (const value of this.base) {
      const nextValue = this.mapper.call(this.thisArg, value);
      if (nextValue !== this.filterValue) {
        return { done: false, value: nextValue };
      }
    }
    return { done: true, value: undefined };
  }
}

class FlatIterator extends Iterator {
  constructor(base, depth) {
    super(base);
    this.currentDepth = 0;
    this.stack = new Array(depth + 1);
    this.stack[0] = base;
  }

  next() {
    while (this.currentDepth >= 0) {
      const top = this.stack[this.currentDepth];
      const next = top.next();

      if (next.done) {
        this.stack[this.currentDepth] = null;
        this.currentDepth--;
        continue;
      }

      if (
        this.currentDepth === this.stack.length - 1 ||
        !next.value[Symbol.iterator]
      ) {
        return next;
      }

      this.stack[++this.currentDepth] = next.value[Symbol.iterator]();
    }

    return { done: true, value: undefined };
  }
}

class FlatMapIterator extends Iterator {
  constructor(base, mapper, thisArg) {
    super(base);
    this.mapper = mapper;
    this.thisArg = thisArg;
    this.currentIterator = null;
  }

  next() {
    if (!this.currentIterator) {
      const next = this.base.next();
      if (next.done) {
        return next;
      }

      const value = this.mapper.call(this.thisArg, next.value);
      if (!value[Symbol.iterator]) {
        return { done: false, value };
      }

      this.currentIterator = toIterator(value);
    }

    const next = this.currentIterator.next();

    if (next.done) {
      this.currentIterator = null;
      return this.next();
    }
    return next;
  }
}

class TakeIterator extends Iterator {
  constructor(base, amount) {
    super(base);
    this.amount = amount;
    this.iterated = 0;
  }

  next() {
    this.iterated++;
    if (this.iterated <= this.amount) {
      return this.base.next();
    }
    return { done: true, value: undefined };
  }
}

class TakeWhileIterator extends Iterator {
  constructor(base, predicate, thisArg) {
    super(base);
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.done = false;
  }

  next() {
    if (this.done) return { done: true, value: undefined };
    const next = this.base.next();
    if (!next.done && this.predicate.call(this.thisArg, next.value)) {
      return next;
    }
    this.done = true;
    return { done: true, value: undefined };
  }
}

class ZipIterator extends Iterator {
  constructor(base, iterators) {
    super(base);
    this.iterators = iterators.map(toIterator);
  }

  next() {
    const result = [];

    const next = this.base.next();
    if (next.done) {
      return next;
    }
    result.push(next.value);

    for (const iterator of this.iterators) {
      const next = iterator.next();
      if (next.done) {
        return next;
      }
      result.push(next.value);
    }

    return { done: false, value: result };
  }
}

class ZipIteratorLongest extends Iterator {
  constructor(base, iterators, defaultValue) {
    super(base);
    this.done = false;
    this.iterators = iterators.map(toIterator);
    this.defaultValue = defaultValue;
  }

  next() {
    if (this.done) return { done: true, value: undefined };

    const result = [];

    const next = this.base.next();
    result.push(!next.done ? next.value : this.defaultValue);

    let allDone = next.done;
    for (const iterator of this.iterators) {
      const next = iterator.next();
      result.push(!next.done ? next.value : this.defaultValue);
      allDone = allDone && next.done;
    }

    if (allDone) {
      this.done = true;
      return { done: true, value: undefined };
    }
    return { done: false, value: result };
  }
}

class ChainIterator extends Iterator {
  constructor(base, iterators) {
    super(base);
    this.currentIterator = base;
    this.iterators = iterators.map(toIterator)[Symbol.iterator]();
  }

  next() {
    const next = this.currentIterator.next();
    if (!next.done) {
      return next;
    }
    const iterator = this.iterators.next();
    if (iterator.done) {
      return iterator;
    }
    this.currentIterator = iterator.value;
    return this.next();
  }
}

class EnumerateIterator extends Iterator {
  constructor(base) {
    super(base);
    this.index = 0;
  }

  next() {
    const next = this.base.next();
    if (next.done) {
      return next;
    }
    return { done: false, value: [this.index++, next.value] };
  }
}

class SkipWhileIterator extends Iterator {
  constructor(base, predicate, thisArg) {
    super(base);
    this.predicate = predicate;
    this.thisArg = thisArg;
    this.doneSkipping = false;
  }

  next() {
    let next = this.base.next();
    if (this.doneSkipping) return next;
    while (!next.done && this.predicate.call(this.thisArg, next.value)) {
      next = this.base.next();
    }
    this.doneSkipping = true;
    return next;
  }
}

const iter = base => new Iterator(base);

module.exports = {
  Iterator,
  iter,
  iterEntries: obj => iter(Object.entries(obj)),
  iterKeys: obj => iter(Object.keys(obj)),
  iterValues: obj => iter(Object.values(obj)),
};
