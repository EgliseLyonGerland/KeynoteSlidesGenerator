export function findElement(slide, matcher, from = 0, type = 'iworkItem') {
  let matched = 0;
  for (let i = 0; i < slide[`${type}s`].length; i += 1) {
    const item = slide.iworkItems[i];

    if (!matcher(item)) {
      continue;
    }
    if (from === matched) {
      return item;
    }

    matched += 1;
  }

  return null;
}

export function findTextElement(slide, expr, from = 0) {
  return findElement(
    slide,
    (item) => {
      try {
        return item.objectText().match(expr);
      }
      catch (e) {
        return false;
      }
    },
    from,
  );
}
