'use strict';

// Compare versions
//   v1 - <string>, with format `a.b.c`
//   v2 - <string>, with format `x.y.z`
// Returns: <number>
//     - `0` if `v1` and `v2` are equal
//     - `1` if `v1` > `v2`
//     - `-1` if `v1` < `v2`
const compareVersions = (v1, v2) => {
  if (v1 === v2) return 0;
  const arr1 = v1.split('.').map(num => parseInt(num));
  const arr2 = v2.split('.').map(num => parseInt(num));

  if (arr1.length < arr2.length) {
    arr1.push(...Array(arr2.length - arr1.length).fill(0));
  } else if (arr2.length < arr1.length) {
    arr2.push(...Array(arr1.length - arr2.length).fill(0));
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] < arr2[i]) return -1;
    if (arr1[i] > arr2[i]) return 1;
  }
  return 0;
};

// Check if first version is equal or bigger than the second one
//   v1 - <string>, with format `a.b.c`
//   v2 - <string>, with format `x.y.z`
// Returns: <boolean>
//     - `true` if `v1` and `v2` are equal or `v1` < `v2`
//     - `false` if `v1` > `v2`
const checkVersion = (v1, v2) => compareVersions(v1, v2) <= 0;

// Check if `process.versions.node` is equal or bigger than the specified one
//   version - <string>, with format `a.b.c`
// Returns: <boolean>
//     - `true` if `version` is less or equal than `process.versions.node`
//     - `false` if `version` is bigger than `process.versions.node`
const checkNodeVersion = version =>
  compareVersions(version, process.versions.node) <= 0;

// Check if `process.versions.v8` is equal or bigger than the specified one
//   version - <string>, with format `a.b.c`
// Returns: <boolean>
//     - `true` if `version` is less or equal than `process.versions.v8`
//     - `false` if `version` is bigger than `process.versions.v8`
const checkV8Version = version =>
  compareVersions(version, process.versions.v8) <= 0;

module.exports = {
  compareVersions,
  checkVersion,
  checkNodeVersion,
  checkV8Version,
};
