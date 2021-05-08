const _ = require('lodash');

const { log } = console;

export function debugElements(
  elements,
  recursive = false,
  maxDepth = 0,
  properties = [
    'class',
    'name',
    'title',
    'description',
    // 'role',
    // 'roleDescription',
    // 'help',
    // 'size',
    // 'position',
    // 'value',
  ],
  level = 0,
) {
  _.forEach(elements, (element, index) => {
    log(
      '  '.repeat(level),
      index,
      ...properties.map((property) => element[property]()),
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
