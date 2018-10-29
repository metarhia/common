'use strict';

const crypto = require('crypto');

const math = require('./math');
const { ALPHA_DIGIT } = require('./strings');

// Generate random key
//   length - <number>, key length
//   possible - <string>, with possible characters
// Returns: <string>, key
const generateKey = (length, possible) => {
  const base = possible.length;
  let key = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(math.cryptoRandom() * base);
    key += possible[index];
  }
  return key;
};

// Generate file storage key
// Returns: <string[]>, [folder1, folder2, code]
const generateStorageKey = () => {
  const folder1 = generateKey(2, ALPHA_DIGIT);
  const folder2 = generateKey(2, ALPHA_DIGIT);
  const code = generateKey(8, ALPHA_DIGIT);
  return [folder1, folder2, code];
};

const guidPrefetcher = math.cryptoPrefetcher(4096, 16);

// Generate an RFC4122-compliant GUID (UUID v4)
// Returns: <string>, GUID
const generateGUID = () => {
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
    bytes.toString('hex', 10, 16),
  ].join('-');
};

// Calculate SID CRC
//   config - <Object>, { secret }
//   key - <string>, SID key
// Returns: <string>, CRC
const crcSID = (config, key) => crypto.createHash('md5')
  .update(key + config.secret)
  .digest('hex')
  .substring(0, 4);

// Generate random SID
//   config - <Object>, { length, characters, secret }
// Returns: <string>, SID
const generateSID = config => {
  const key = generateKey(
    config.length - 4,
    config.characters
  );
  return key + crcSID(config, key);
};

// Validate SID
//   config - <Object>, { secret }
//   sid - <string>, session id
// Returns: <boolean>
const validateSID = (config, sid) => {
  if (!sid) return false;
  const crc = sid.substr(sid.length - 4);
  const key = sid.substr(0, sid.length - 4);
  return crcSID(config, key) === crc;
};

// Calculate hash with salt
//   password - <string>
//   salt - <string>
// Returns: <string>, hash
const hash = (password, salt) => crypto.createHmac('sha512', salt)
  .update(password)
  .digest('hex');

// Validate hash
//   hash - <string>
//   password - <string>
//   salt - <string>
// Returns: <boolean>
const validateHash = (hash, password, salt) => hash(password, salt) === hash;

// Convert id to array of hex strings
//   id - <number>
// Returns: <Array>, minimal length is 2
//          which contains hex strings with length of 4
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
  for (let i = 0; i < count; i++) {
    const chunk = hex.substr((i + 1) * -4, 4);
    chunks[i] = chunk;
  }
  return chunks;
};

// Convert id to file path
//   id - <number>
// Returns: <string>
const idToPath = id => {
  const chunks = idToChunks(id);
  const path = chunks.join('/');
  return path;
};

// Convert file path to id
//   path - <string>
// Returns: <number>
const pathToId = path => {
  const chunks = path.split('/');
  let hex = '0x';
  for (let i = chunks.length - 1; i >= 0; i--) {
    hex += chunks[i];
  }
  return parseInt(hex, 16);
};

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
};
