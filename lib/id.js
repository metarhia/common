'use strict';

const crypto = require('crypto');

const math = require('./math');
const { ALPHA_DIGIT } = require('./strings');

const generateKey = (
  // Generate random key
  length, // number, key length
  possible // string, with possible characters
  // Returns: string, key
) => {
  const base = possible.length;
  let key = '';
  let i, index;
  for (i = 0; i < length; i++) {
    index = Math.floor(math.cryptoRandom() * base);
    key += possible[index];
  }
  return key;
};

const generateStorageKey = (
  // Generate file storage key
  // Returns: Array of string, [folder1, folder2, code]
) => {
  const folder1 = generateKey(2, ALPHA_DIGIT);
  const folder2 = generateKey(2, ALPHA_DIGIT);
  const code = generateKey(8, ALPHA_DIGIT);
  return [folder1, folder2, code];
};

const guidPrefetcher = math.cryptoPrefetcher(4096, 16);

const generateGUID = (
  // Generate an RFC4122-compliant GUID (UUID v4)
  // Returns: string, GUID
) => {
  const bytes = guidPrefetcher.next();

  bytes[6] &= 0x0F;
  bytes[6] |= 0x40;
  bytes[8] &= 0x3F;
  bytes[8] |= 0x80;

  return [
    bytes.toString('hex', 0, 4),
    bytes.toString('hex', 4, 6),
    bytes.toString('hex', 6, 8),
    bytes.toString('hex', 8, 10),
    bytes.toString('hex', 10, 16)
  ].join('-');
};

const crcSID = (
  // Calculate SID CRC
  config, // record, { length, characters, secret }
  key // string, SID key
  // Returns: string, CRC
) => (
  crypto
    .createHash('md5')
    .update(key + config.secret)
    .digest('hex')
    .substring(0, 4)
);

const generateSID = (
  // Generate random SID
  config // record, { length, characters, secret }
  // Returns: string, SID
) => {
  const key = generateKey(
    config.length - 4,
    config.characters
  );
  return key + crcSID(config, key);
};

const validateSID = (
  // Validate SID
  config, // record, { length, characters, secret }
  sid // string, session id
  // Returns: boolean
) => {
  if (!sid) return false;
  const crc = sid.substr(sid.length - 4);
  const key = sid.substr(0, sid.length - 4);
  return crcSID(config, key) === crc;
};

const hash = (
  // Calculate hash with salt
  password, // string
  salt // string
  // Returns: string, hash
) => (
  crypto
    .createHmac('sha512', salt)
    .update(password)
    .digest('hex')
);

const validateHash = (
  // Validate hash
  hash, // string
  password, // string
  salt // string
  // Returns: boolean
) => (hash(password, salt) === hash);

const idToChunks = id => {
  let hex = id.toString(16);
  const remainder = hex.length % 4;
  if (remainder !== 0) {
    const pad = 4 - remainder;
    hex = new Array(pad + 1).join('0') + hex;
  }
  let count = hex.length / 4;
  if (count === 1) {
    hex = '0000' + hex;
    count++;
  }
  const chunks = new Array(count);
  let i, chunk;
  for (i = 0; i < count; i++) {
    chunk = hex.substr((i + 1) * -4, 4);
    chunks[i] = chunk;
  }
  return chunks;
};

const idToPath = id => {
  const chunks = idToChunks(id);
  const path = chunks.join('/');
  return path;
};

const pathToId = path => {
  const chunks = path.split('/');
  let hex = '';
  let i;
  for (i = chunks.length - 1; i >= 0; i--) {
    hex += chunks[i];
  }
  return parseInt(hex, 16);
};

class Id {
  constructor(
    n // Initial value
    // string or number or Array of Number, Uint32Array
  ) {
    if (typeof(n) === 'number')
      this.value = n;
    else if (typeof(n) === 'string')
      this.value = parseInt(n, 10) || 0;
    else if (Array.isArray(n) &&
             n.length &&
             typeof(n[0]) === 'number')
      this.value = n[0];
    else if (n && n.constructor === Uint32Array && n.length)
      this.value = n[0];
    else
      this.value = 0;
  }

  toChunks(
    // Get chunks of file path based on current id value
    // Returns: array of strings, minimal length is 2
  ) {
    return idToChunks(this.value);
  }

  toPath(
    // Get file path based on current id value
    // Returns: string
  ) {
    return idToPath(this.value);
  }

  toNumber(
    // Get current id value
    // Returns: number
  ) {
    return this.value;
  }

  toString(
    // Get current id value
    // Returns: string
  ) {
    return this.value + '';
  }

  next(
    // Increment id value by 1
    // Returns: number
  ) {
    return ++this.value;
  }

  set(
    // Set id value
    n // New id value
    // string or number or Array of Number, Uint32Array
    // Returns: number
  ) {
    if (typeof(n) === 'number')
      this.value = n;
    else if (typeof(n) === 'string')
      this.value = parseInt(n, 10) || 0;
    else if (Array.isArray(n) &&
             n.length &&
             typeof(n[0]) === 'number')
      this.value = n[0];
    else if (n && n.constructor === Uint32Array && n.length)
      this.value = n[0];
    else
      this.value = 0;
    return this.value;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.value;
    if (hint === 'string') return this.value + '';
    return null;
  }
}

module.exports = {
  generateKey,
  generateGUID,
  generateSID,
  crcSID,
  validateSID,
  hash,
  validateHash,
  generateStorageKey,
  idToChunks,
  idToPath,
  pathToId,
  Id,
};
