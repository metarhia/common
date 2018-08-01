'use strict';

module.exports = class Map {

  constructor(elements) {
    this._storage = Object.create(null);
    this._elementCount = 0;

    if (elements && typeof elements[Symbol.iterator] === 'function') {
      for (const [key, value] of elements) {
        this.set(key, value);
      }
    }
  }

  clear() {
    this._storage = Object.create(null);
    this._elementCount = 0;
  }

  delete(key) {
    if (this._storage[key] === undefined)
      return false;
    delete this._storage[key];
    this._elementCount--;
    return true;
  }

  entries() {
    const storage = this._storage;
    const entries = new Array(this._elementCount);
    let i = 0;
    for (const key in storage) {
      entries[i++] = [key, storage[key]];
    }
    return entries;
  }

  forEach(callback, thisArg) {
    const storage = this._storage;
    for (const key in storage) {
      callback.call(thisArg, storage[key], key, this);
    }
  }

  get(key) {
    return this._storage[key];
  }

  has(key) {
    return this._storage[key] !== undefined;
  }

  keys() {
    const storage = this._storage;
    const keys = new Array(this._elementCount);
    let i = 0;
    for (const key in storage) {
      keys[i++] = key;
    }
    return keys;
  }

  set(key, value) {
    const storage = this._storage;
    if (storage[key] === undefined)
      this._elementCount++;
    storage[key] = value;
    return this;
  }

  values() {
    const storage = this._storage;
    const values = new Array(this._elementCount);
    let i = 0;
    for (const key in storage) {
      values[i++] = storage[key];
    }
    return values;
  }

  *[Symbol.iterator]() {
    const storage = this._storage;
    for (const key in storage) {
      yield [key, storage[key]];
    }
  }
};
