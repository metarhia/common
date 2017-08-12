'use strict';

const { range } = require('./array');

const SCALAR_TYPES = ['boolean', 'number', 'string', 'undefined'];

const isScalar = (
  // Check is value scalar
  value // scalar value or Object
  // Returns: boolean
) => SCALAR_TYPES.includes(typeof(value));

const copy = (
  // Copy dataset (copy objects to new array)
  ds // array of objects, source dataset
  // Returns: array of objects
) => ds.slice();

const clone = (
  // Clone Object
  obj // object or array
  // Returns: object or array
) => {
  if (typeof(obj) !== 'object' || obj === null) return obj;
  return Array.isArray(obj) ? cloneArray(obj) : cloneObject(obj);
};

const transformArrObj = (
  // Transforms val accordingly to its type
  val, // transforming value
  transformArr, // function for transforming array
  transformObj // function for transforming object
  // Returns: if val is primitive type value then returns unchanged
  // else accordingly to its type transformed value
) => {
  if (typeof(val) !== 'object' || val === null) {
    return val;
  }
  if (Array.isArray(val)) {
    return transformArr(val);
  }
  return transformObj(val);
};

const cloneFields = (
  // Clones specified fields from srcObj to dstObj
  srcObj, // source object
  dstObj, // destination object
  fieldNames // iterable containing names of fields needed copying
) => {
  let fieldName, val;
  for (fieldName of fieldNames) {
    val = srcObj[fieldName];
    dstObj[fieldName] = transformArrObj(val, cloneArray, cloneObject);
  }
};

const duplicateFields = (
  // Clones specified fields from srcObj to dstObj
  references, // references, same as in duplicateArray and duplicateObject
  srcObj, // source object
  dstObj, // destination object
  fieldNames // iterable containing names of fields needed copying
) => {
  let fieldName, val;
  for (fieldName of fieldNames) {
    val = srcObj[fieldName];
    if (references.has(val)) {
      dstObj[fieldName] = references.get(val);
    } else {
      dstObj[fieldName] = transformArrObj(val, duplicateArray, duplicateObject);
    }
  }
};

function cloneArray(arr) {
  const size = arr.length;
  const array = new Array(size);
  cloneFields(arr, array, range(0, size - 1));
  return array;
}

function cloneObject(obj) {
  const object = {};
  const keys = Object.keys(obj);
  cloneFields(obj, object, keys);
  return object;
}

const duplucate = (
  // Duplicate object ot array
  obj // object or array
  // Returns: object or array
) => {
  if (typeof(obj) !== 'object' || obj === null) return obj;
  const references = new Map();
  const dup = Array.isArray(obj) ? duplicateArray : duplicateObject;
  return dup(obj, references);
};

function duplicateArray(arr, references) {
  const size = arr.length;
  const array = new Array(size);
  references.set(arr, array);
  duplicateFields(references, arr, array, range(0, size - 1));
  return array;
}

function duplicateObject(obj, references) {
  const object = (
    obj.constructor ? new obj.constructor() : Object.create(null)
  );
  references.set(obj, object);
  const keys = Object.keys(obj);
  duplicateFields(references, obj, object, keys);
  return object;
}

const getByPath = (
  // Read property by dot-separated path
  data, // hash
  dataPath // string, dot-separated path
  // Returns: value
) => {
  const path = dataPath.split('.');
  let obj = data;
  let i, len, next, prop;
  for (i = 0, len = path.length; i < len; i++) {
    prop = path[i];
    next = obj[prop];
    if (next === undefined || next === null) return next;
    obj = next;
  }
  return obj;
};

const setByPath = (
  // Set property by dot-separated path
  data, // hash
  dataPath, // string, dot-separated path
  value // new value
) => {
  const path = dataPath.split('.');
  let obj = data;
  let i, len, next, prop;
  for (i = 0, len = path.length; i < len; i++) {
    prop = path[i];
    next = obj[prop];
    if (i === path.length - 1) {
      obj[prop] = value;
      return true;
    } else {
      if (next === undefined || next === null) {
        if (typeof(obj) !== 'object') return false;
        next = {};
        obj[prop] = next;
      }
      obj = next;
    }
  }
  return false;
};

const deleteByPath = (
  // Delete property by dot-separated path
  data, // object
  dataPath // string, dot-separated path
  // Returns: boolean
) => {
  const path = dataPath.split('.');
  let obj = data;
  let i, len, next, prop;
  for (i = 0, len = path.length; i < len; i++) {
    prop = path[i];
    next = obj[prop];
    if (i === path.length - 1) {
      if (obj.hasOwnProperty(prop)) {
        delete obj[prop];
        return true;
      }
    } else {
      if (next === undefined || next === null) return false;
      obj = next;
    }
  }
  return false;
};

const merge = (
  // Distinct merge miltiple arrays
  ...args // array of array
  // Returns: array
) => {
  const array = args[0];
  let i, ilen, j, jlen, arr, val;
  for (i = 1, ilen = args.length; i < ilen; i++) {
    arr = args[i];
    for (j = 0, jlen = arr.length; j < jlen; j++) {
      val = arr[j];
      if (!array.includes(val)) array.push(val);
    }
  }
  return array;
};

module.exports = {
  isScalar,
  copy,
  clone,
  duplucate,
  getByPath,
  setByPath,
  deleteByPath,
  merge,
};
