'use strict';

const sortComparePriority = (
  // Compare for array.sort with priority
  priority, // array of strings with priority
  s1, s2 // string, to compare
  // Returns: number
  // Example: files.sort(common.sortComparePriority)
) => {
  let a = priority.indexOf(s1);
  let b = priority.indexOf(s2);
  if (a === -1) a = Infinity;
  if (b === -1) b = Infinity;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const sortCompareDirectories = (
  // Compare for array.sort, directories first
  a, b // string, to compare
  // Returns: number
  // Example: files.sort(sortCompareDirectories);
) => {
  let s1 = a.name;
  let s2 = b.name;
  if (s1.charAt(0) !== '/') s1 = '0' + s1;
  if (s2.charAt(0) !== '/') s2 = '0' + s2;
  if (s1 < s2) return -1;
  if (s1 > s2) return 1;
  return 0;
};

const sortCompareByName = (
  // Compare for array.sort
  a, b // object, { name } to compare
  // Returns: number
  // Example: files.sort(sortCompareByName)
) => {
  const s1 = a.name;
  const s2 = b.name;
  if (s1 < s2) return -1;
  if (s1 > s2) return 1;
  return 0;
};

module.exports = {
  sortComparePriority,
  sortCompareDirectories,
  sortCompareByName,
};
