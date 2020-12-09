'use strict';

const os = require('os');

// Convert IPv4 address from string form to number form
// Signature: IP_string
//   IP_string - <string>, (optional), default: '127.0.0.1', IPv4 address in string form
// Returns: <number>
const ipToInt = (ip = '127.0.0.1') =>
  ip.split('.').reduce((res, item) => (res << 8) + +item, 0);

// Convert IPv4 address from number form to string form
// Signature: IP_number
//   IP_number - <number>, (optional), default: 0, IPv4 address in number form
// Returns: <string>
const intToIp = (ipInt = 0) =>
  [ipInt >>> 24, (ipInt >> 16) & 255, (ipInt >> 8) & 255, ipInt & 255].join(
    '.'
  );

let LOCAL_IPS_CACHE;

// Get local network interfaces
// Returns: <string[]>
const localIPs = () => {
  if (LOCAL_IPS_CACHE) return LOCAL_IPS_CACHE;
  const ips = [];
  const ifHash = os.networkInterfaces();
  for (const ifName in ifHash) {
    const ifItem = ifHash[ifName];
    for (let i = 0; i < ifItem.length; i++) {
      const protocol = ifItem[i];
      if (protocol.family === 'IPv4') {
        ips.push(protocol.address);
      }
    }
  }
  LOCAL_IPS_CACHE = ips;
  return ips;
};

// Parse host string
//   host - <string>, host or empty string, may contain `:port`
// Returns: <string>, host without port but not empty
const parseHost = host => {
  if (!host) {
    return 'no-host-name-in-http-headers';
  }
  const portOffset = host.indexOf(':');
  if (portOffset > -1) host = host.substr(0, portOffset);
  return host;
};

module.exports = {
  ipToInt,
  intToIp,
  localIPs,
  parseHost,
};
