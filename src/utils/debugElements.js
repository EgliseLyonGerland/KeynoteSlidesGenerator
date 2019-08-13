const _ = require('lodash');
const { debug } = require('./debug');

export function debugElements(
  elements,
  recursive = false,
  maxDepth = 0,
  properties = [
    'class',
    'name',
    'description',
    'role',
    'roleDescription',
    'title',
    'help',
    'size',
    'position',
    'value',
  ],
  level = 0,
) {
  _.forEach(elements, (element, index) => {
    debug(
      '  '.repeat(level),
      index,
      ...properties.map(property => element[property]()),
    );

    if (
      recursive &&
      (maxDepth === 0 || level < maxDepth - 1) &&
      element.uiElements
    ) {
      debugElements(
        element.uiElements,
        recursive,
        maxDepth,
        properties,
        level + 1,
      );
    }
  });
}

export default null;
