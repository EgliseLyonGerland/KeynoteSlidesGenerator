const _ = require('lodash');
const { debug } = require('./debug');

export function debugElements(
  elements,
  recursive = false,
  maxDepth = 0,
  level = 0,
) {
  _.forEach(elements, (element, index) => {
    debug(
      '  '.repeat(level),
      index,
      element.class(),
      element.name(),
      element.description(),
      element.role(),
      element.roleDescription(),
      element.title(),
      element.help(),
      element.size(),
      element.position(),
      element.value(),
    );

    if (
      recursive &&
      (maxDepth === 0 || level < maxDepth - 1) &&
      element.uiElements
    ) {
      debugElements(element.uiElements, recursive, maxDepth, level + 1);
    }
  });
}

export default null;
