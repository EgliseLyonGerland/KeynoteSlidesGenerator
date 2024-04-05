import map from 'lodash/map';
import size from 'lodash/size';
import repeat from 'lodash/repeat';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isObjectLike from 'lodash/isObjectLike';
import isString from 'lodash/isString';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isFunction from 'lodash/isFunction';
import isNaN from 'lodash/isNaN';
import isUndefined from 'lodash/isUndefined';
import kleur from 'kleur';

const DEPTH_MAX = 3;

const { log } = console;

function indent(level) {
  return repeat(' ', level);
}

function isMultiline(str) {
  return /\n/.test(str);
}

function format(value) {
  if (value === null) {
    return kleur.bold('null');
  }

  if (isNumber(value) || isBoolean(value) || isNaN(value)) {
    return kleur.yellow(value);
  }

  if (isUndefined(value)) {
    return kleur.dim('undefined');
  }

  if (isFunction(value)) {
    if (value.name) {
      return kleur.cyan(`[Function ${value.name}]`);
    }

    return kleur.cyan('[Function]');
  }

  return value;
}

function stringify(data, level = 0, indentSize = 0) {
  if (isArray(data)) {
    return stringifyArray(data, level, indentSize);
  }

  if (isPlainObject(data)) {
    return stringifyObject(data, level, indentSize);
  }

  if (isString(data)) {
    return kleur.green(`'${data}'`);
  }

  return format(data);
}

function stringifyObject(data, level = 0, indentSize = 0) {
  if (level > DEPTH_MAX) {
    return kleur.cyan('[Object]');
  }

  if (size(data) === 0) {
    return '{}';
  }

  let multiline = false;

  const parts = map(data, (value, key) => {
    const content = stringify(value, level + 1, indentSize + 3);

    if (!isMultiline(content)) {
      return `${key}: ${content}`;
    }

    multiline = true;

    const separator = `\n${indent(indentSize + 3)}`;

    return `${key}:${separator}${content}`;
  });

  if (size(parts) > 1) {
    multiline = true;
  }

  let content;
  if (multiline) {
    content = parts.join(`,\n${indent(indentSize + 2)}`);
  }
  else {
    content = parts.join(', ');
  }

  return `{ ${content} }`;
}

function stringifyArray(data, level = 0, indentSize = 0) {
  if (level > DEPTH_MAX) {
    return kleur.cyan('[Array]');
  }

  if (size(data) === 0) {
    return '[]';
  }

  let multiline = false;
  let length = 0;

  const parts = map(data, (value) => {
    const content = stringify(value, level + 1, indentSize + 2);

    if (isMultiline(content)) {
      multiline = true;
    }

    length += size(content);

    return content;
  });

  if (length > 200) {
    multiline = true;
  }

  let content;
  if (multiline) {
    content = parts.join(`,\n${indent(indentSize + 2)}`);
  }
  else {
    content = parts.join(', ');
  }

  return `[ ${content} ]`;
}

export function debug(...args) {
  const formattedArgs = map(args, (arg) => {
    if (isObjectLike(arg)) {
      return stringify(arg);
    }

    return format(arg);
  });

  log.apply(this, formattedArgs);
}

export default null;
