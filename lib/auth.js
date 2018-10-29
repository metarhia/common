'use strict';

const unicodeCategories = require('./unicode-categories');

const unicodeRangesIncludes = (ranges, codePoint) => {
  let left = 0;
  let right = ranges.length - 1;
  while (left <= right) {
    const mid = (left + right) >>> 1;
    const value = ranges[mid];
    if (typeof value === 'number') {
      if (codePoint > value) left = mid + 1;
      else if (codePoint < value) right = mid - 1;
      else return true;
    } else if (codePoint > value[1]) {
      left = mid + 1;
    } else if (codePoint < value[0]) {
      right = mid - 1;
    } else {
      return true;
    }
  }
  return false;
};

const stringIncludesChars = (str, ranges, charsNumber) => {
  let number = 0;
  const utf16singleUnit = 1 << 16;
  for (let index = 0; index <= str.length - (charsNumber - number); index++) {
    const codePoint = str.codePointAt(index);
    if (codePoint >= utf16singleUnit) index++;
    if (unicodeRangesIncludes(ranges, codePoint) &&
      ++number === charsNumber) {
      return true;
    }
  }
  return false;
};

const passwordTests = {
  MIN_LENGTH: {
    test: (password, options) => password.length >= options.minLength,
    hint: options => ({ name: 'MIN_LENGTH', minLength: options.minLength }),
    options: { minLength: 10 },
  },
  MAX_LENGTH: {
    test: (password, options) => password.length <= options.maxLength,
    hint: options => ({ name: 'MAX_LENGTH', maxLength: options.maxLength }),
    options: { maxLength: 128 },
  },
  MIN_PASSPHRASE_LENGTH: {
    test: (password, options) => password.length >= options.minLength,
    hint: options => ({
      name: 'MIN_PASSPHRASE_LENGTH',
      minLength: options.minLength,
    }),
    options: { minLength: 20 },
  },
  MAX_REPEATED_CHARS: {
    test: (password, options) => {
      const regexp = new RegExp(`(.)\\1{${options.number},}`);
      return !regexp.test(password);
    },
    hint: options => ({ name: 'MAX_REPEATED_CHARS', number: options.number }),
    options: { number: 2 },
  },
  MIN_LOWERCASE_CHARS: {
    test: (password, option) => stringIncludesChars(
      password, unicodeCategories.Ll, option.number
    ),
    hint: options => ({ name: 'MIN_LOWERCASE_CHARS', number: options.number }),
    options: { number: 1 },
  },
  MIN_UPPERCASE_CHARS: {
    test: (password, options) => stringIncludesChars(
      password, unicodeCategories.Lu, options.number
    ),
    hint: options => ({ name: 'MIN_UPPERCASE_CHARS', number: options.number }),
    options: { number: 1 },
  },
  MIN_NUMBERS: {
    test: (password, options) => {
      const NUMBERS_RANGE = [[49, 57]];
      return stringIncludesChars(password, NUMBERS_RANGE, options.number);
    },
    hint: options => ({ name: 'MIN_NUMBERS', number: options.number }),
    options: { number: 1 },
  },
  MIN_SPECIAL_CHARS: {
    test: (password, options) => {
      const SPECIAL_CHARS_RANGE = [[32, 47], [58, 64], [91, 96], [123, 126]];
      // https://www.owasp.org/index.php/Password_special_characters
      return stringIncludesChars(password, SPECIAL_CHARS_RANGE, options.number);
    },
    hint: options => ({ name: 'MIN_SPECIAL_CHARS', number: options.number }),
    options: { number: 1 },
  },
};

const loginTests = {
  MIN_LENGTH: {
    test: (login, options) => login.length >= options.minLength,
    hint: options => ({ name: 'MIN_LENGTH', minLength: options.minLength }),
    options: { minLength: 6 },
  },
  MAX_LENGTH: {
    test: (login, options) => login.length <= options.maxLength,
    hint: options => ({ name: 'MAX_LENGTH', maxLength: options.maxLength }),
    options: { maxLength: 50 },
  },
  IS_EMAIL: {
    test: login => {
      const EMAIL_REGEXP = new RegExp(
        '^[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(' +
        '?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'
      );
      const MAX_DOMAIN_LENGTH = 255;
      const MAX_LOCAL_PART_LENGTH = 64;

      if (login.includes('@')) {
        const [localPart, domain] = login.split('@');
        return domain.length <= MAX_DOMAIN_LENGTH &&
          localPart.length <= MAX_LOCAL_PART_LENGTH &&
          EMAIL_REGEXP.test(login);
      }

      return false;
    },
    hint: () => ({ name: 'IS_EMAIL' }),
  },
};

const loginPasswordTests = {
  LOGIN_INCLUDES_PASSWORD: {
    test: (login, password) => !login.includes(password),
    hint: () => ({ name: 'LOGIN_INCLUDES_PASSWORD' }),
  },
  PASSWORD_INCLUDES_LOGIN: {
    test: (login, password) => !password.includes(login),
    hint: () => ({ name: 'PASSWORD_INCLUDES_LOGIN' }),
  },
};

class AuthenticationStrength {
  // AuthenticationStrength constructor
  //   valid - <boolean>
  //   hints - <Object>
  //     required - <Array>
  //     optional - <Array>
  //   compliance - <number>, ratio of passed optional tests
  //                to all optional tests
  constructor(valid, hints, compliance) {
    this.valid = valid;
    this.hints = hints;
    if (!valid) {
      this.strength = 'Not valid';
    } else if (compliance < 0.25) {
      this.strength = 'Very weak';
    } else if (compliance < 0.4) {
      this.strength = 'Weak';
    } else if (compliance < 0.6) {
      this.strength = 'Good';
    } else if (compliance < 0.8) {
      this.strength = 'Strong';
    } else {
      this.strength = 'Very strong';
    }
  }
}


// Function that checks the arguments on a test suite
//   tests - <Array>, of password/login tests
//   required - <Array>, required tests configs
//   optional - <Array>, optional tests configs
//   testArgs - <Array>, [password] / [login] / [login, password]
// Returns: <AuthenticationStrength>
const makeTest = (tests, required, optional, ...testArgs) => {
  const test = testsConfig => {
    const testsHints = [];
    testsConfig.forEach(testConfig => {
      const [testName, userOptions] = typeof testConfig === 'string' ?
        [testConfig, {}] : [testConfig.name, testConfig];
      const { test, hint, options = {} } = tests[testName];
      const testOptions = Object.assign({}, options, userOptions);
      if (!test(...testArgs, testOptions)) testsHints.push(hint(testOptions));
    });
    return testsHints;
  };

  const requiredHints = test(required);
  const optionalHints = test(optional);

  const valid = !requiredHints.length;
  const compliance =
    optional.length ? 1 - optionalHints.length / optional.length : 1;
  const hints = { required: requiredHints, optional: optionalHints };

  return new AuthenticationStrength(valid, hints, compliance);
};

// Function that tests the login
//   login - <string>, login to test
//   required - <Array>, required tests configs
//   optional - <Array>, optional tests configs, defalult: `[]`
// Returns: <AuthenticationStrength>
const checkLogin = (login, required, optional = []) => {
  if (!required) {
    required = ['MIN_LENGTH', 'MAX_LENGTH'];
  }
  return makeTest(loginTests, required, optional, login);
};

// Function that tests the password
//   password - <string>, password to test
//   required - <Array>, required tests configs
//   optional - <Array>, optional tests configs, default: `[]`
// Returns: <AuthenticationStrength>
const checkPassword = (password, required, optional = []) => {
  if (!required) {
    required = ['MIN_LENGTH', 'MAX_LENGTH'];
    optional = [
      'MIN_NUMBERS',
      'MIN_SPECIAL_CHARS',
      'MIN_UPPERCASE_CHARS',
      'MIN_LOWERCASE_CHARS',
    ];
  }
  return makeTest(passwordTests, required, optional, password);
};

// Function that tests the login with password
//   login - <string>, login to test
//   password - <string>, password to test
//   required - <Array>, required tests configs
//   optional - <Array>, optional tests configs, default: `[]`
// Returns: <AuthenticationStrength>
const checkLoginPassword = (login, password, required, optional = []) => {
  if (!required) {
    required = [
      'PASSWORD_INCLUDES_LOGIN',
      'LOGIN_INCLUDES_PASSWORD',
    ];
  }
  return makeTest(loginPasswordTests, required, optional, login, password);
};

module.exports = {
  checkLogin,
  checkPassword,
  checkLoginPassword,
};
