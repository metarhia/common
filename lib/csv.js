'use strict';

const recordDelimiters = {
  unix: '\n',
  mac: '\r',
  windows: '\r\n',
  ascii: '\u001e',
  unicode: '\u2028',
};

function getPlatformDelimiter() {
  const opSys = process.platform;
  const systems = {
    win32: recordDelimiters.windows,
    darwin: recordDelimiters.mac,
    linux: recordDelimiters.unix,
  };

  return systems[opSys] ? systems[opSys] : systems.linux;
}

const defaultCast = {
  boolean: value => (value ? '1' : ''),
  date: value => toString(value.getTime()),
  number: value => toString(value),
  object: value => JSON.stringify(value),
  string: value => value,
};

const quoteMapping = {
  delimiter: value =>
    value !== undefined && value !== null ? toString(value) : ',',
  quoted: value => !!value,
  quotedEmpty: value => !!value,
  quotedString: value => !!value,
  quotedMatch: value => {
    if (Array.isArray(value)) {
      value = value.filter(m => m instanceof RegExp || typeof m !== 'string');
    } else if (value instanceof RegExp || typeof value !== 'string') {
      value = [value];
    } else {
      throw new TypeError('QuotedMatch must be an array or string or RegExp');
    }
    return value || value.length === 0 ? null : value;
  },
  quote: value =>
    value !== undefined && value !== null ? value.toString() : '"',
  escape: value => (typeof value === 'string' ? value : '"'),
  recordDelimiter: value => {
    if (value === 'auto') return getPlatformDelimiter();
    return recordDelimiters[value] !== undefined
      ? recordDelimiters[value]
      : '\n';
  },
};

function createQuoteOptions(opts, alternativeOptions = {}) {
  const options = {};
  for (const key in quoteMapping) {
    const value = alternativeOptions[key] ? alternativeOptions[key] : opts[key];
    options[key] = quoteMapping[key](value);
  }

  return options;
}

const optionsMapping = {
  cast: value => {
    if (!value || Array.isArray(value) || typeof value !== 'object')
      return defaultCast;
    const cast = {};
    for (const type in defaultCast) {
      cast[type] =
        typeof value[type] === 'function' ? value[type] : defaultCast[type];
    }

    return cast;
  },
  columns: value => {
    if (!value) return null;
    if (typeof value !== 'object') {
      throw new TypeError('Columns must be an array or an object');
    }

    const columns = [];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          columns.push({ key: item, header: item });
        } else if (item && item.key) {
          const key = toString(item.key);
          const header = item.header ? toString(item.header) : key;
          columns.push({ key, header });
        } else {
          throw new Error(
            'Invalid column definition: property "key" is required'
          );
        }
      }
    } else {
      for (const key in value) {
        columns.push({ key, header: toString(value[key]) });
      }
    }

    return columns;
  },
  eof: value => value !== false,
  header: value => !!value,
};

function toString(value) {
  return '' + value;
}

function checkValue(value, type, options) {
  const {
    delimiter,
    quote,
    quoted,
    quotedMatch,
    quotedString,
    escape,
    recordDelimiter,
  } = options;

  const containsDelimiter = delimiter.length && value.includes(delimiter);
  const containsQuote = quote !== '' && value.includes(quote);
  const containsEscape = value.includes(escape) && escape !== quote;
  const containsRowDelimiter = value.includes(recordDelimiter);
  const needQuotedString = quotedString && type === 'string';
  const needQuotedByMatch =
    quotedMatch &&
    type === 'string' &&
    quotedMatch.filter(qm =>
      typeof qm === 'string' ? value.includes(quotedMatch) : qm.test(value)
    ).length > 0;

  const shouldQuote =
    containsQuote === true ||
    containsDelimiter ||
    containsRowDelimiter ||
    quoted ||
    needQuotedString ||
    needQuotedByMatch;

  return { shouldQuote, containsEscape, containsQuote };
}

function valueToString(value, type, options) {
  if (value !== '') {
    const { escape, quote } = options;
    const { shouldQuote, containsEscape, containsQuote } = checkValue(
      value,
      type,
      options
    );
    let regexp;
    if (shouldQuote === true && containsEscape === true) {
      regexp =
        escape === '\\'
          ? new RegExp(escape + escape, 'g')
          : new RegExp(escape, 'g');
      value = value.replace(regexp, escape + escape);
    }
    if (containsQuote === true) {
      regexp = new RegExp(quote, 'g');
      value = value.replace(regexp, escape + quote);
    }
    if (shouldQuote === true) {
      value = quote + value + quote;
    }
  } else if (
    options.quotedEmpty === true ||
    (!options.quotedEmpty && value === '' && options.quotedString !== false)
  ) {
    const quote = options.quote;
    value += quote + quote;
  }

  return value;
}

class Options {
  static create(opts) {
    if (typeof opts !== 'object' || Array.isArray(opts)) opts = {};

    const quotedOptions = createQuoteOptions(opts);
    const options = {};
    for (const key in optionsMapping) {
      options[key] = optionsMapping[key](opts[key]);
    }
    return new Options({ ...options, quotedOptions });
  }

  constructor({ cast, eof, columns, header, quotedOptions }) {
    this._cast = cast;
    this.eof = eof;
    this.columns = columns;
    this.header = header;
    this.quotedOptions = quotedOptions;
  }

  get delimiter() {
    return this.quotedOptions.delimiter;
  }

  get recordDelimiter() {
    return this.quotedOptions.recordDelimiter;
  }

  getValue(incomingValue, context) {
    if (incomingValue === undefined) incomingValue = '';
    context.column = this.header
      ? this.columns[context.index].key
      : context.index;
    const valueType =
      incomingValue instanceof Date ? 'date' : typeof incomingValue;
    let outputValue = this._cast[valueType](incomingValue, context);

    if (!outputValue) outputValue = '';

    let options = this.quotedOptions;
    if (typeof outputValue === 'object') {
      const { value, ...newOptions } = outputValue;
      outputValue = value || '';
      if (typeof output !== 'string') {
        throw new TypeError(
          `Value must be an string, null or undefined, got ${JSON.stringify(
            outputValue
          )}`
        );
      }
      options = createQuoteOptions(options, newOptions);
    } else if (typeof outputValue !== 'string') {
      throw new TypeError(
        `Formatter must return a string, null or undefined, got ${JSON.stringify(
          outputValue
        )}`
      );
    }
    return valueToString(outputValue, valueType, options);
  }

  addHeader(firstRow) {
    if (!Array.isArray(firstRow) && typeof firstRow === 'object') {
      this.columns = optionsMapping.columns(Object.keys(firstRow));
    } else if (this.header) {
      throw new Error(
        'Undiscoverable Columns: header option requires column option or object records'
      );
    }
  }

  columnsToString() {
    let output = '';
    for (const index in this.columns) {
      if (index > 0) output += this.delimiter;
      const context = {
        header: true,
        index,
        record: 0,
      };
      output += this.getValue(this.columns[index].header, context);
    }
    return output;
  }
}

function createRecord(data, record, options) {
  let output = '';
  const context = {
    record,
    header: false,
  };
  let index = 0;
  if (Array.isArray(data)) {
    if (options.header) data.length = options.columns.length;
    const length = data.length;
    while (index < length) {
      context.index = index;
      output += options.getValue(data[index], context);
      if (++index < length) output += options.delimiter;
    }
  } else if (typeof data === 'object') {
    const length = options.columns.length;
    while (index < length) {
      const { key } = options.columns[index];
      context.index = index;
      output += options.getValue(data[key], context);
      if (++index < length) output += options.delimiter;
    }
  } else {
    throw new TypeError('Record should be an array or an object');
  }
  return output;
}

function createCSV(data, options) {
  const result = [];

  if (options.header) {
    result.push(options.columnsToString());
  }

  for (const record in data) {
    result.push(createRecord(data[record], record, options));
  }

  return (
    result.join(options.recordDelimiter) +
    (options.eof ? options.recordDelimiter : '')
  );
}

function stringify(data, options, callback) {
  if (callback === undefined && typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (typeof callback !== 'function')
    throw new TypeError('Last argument must be a callback function');

  try {
    if (!Array.isArray(data))
      throw new TypeError('Incoming data must be an array');

    options = Options.create(options);
    if (options.columns === null) options.addHeader(data[0]);
    const result = createCSV(data, options);
    return setTimeout(callback, 0, null, result);
  } catch (error) {
    return process.nextTick(callback, error);
  }
}

module.exports = { stringify };
