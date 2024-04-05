export function findElement(slide: JXAKeynote.Slide, matcher: (item: any) => boolean, from = 0) {
  let matched = 0;
  for (let i = 0; i < slide.iworkItems.length; i += 1) {
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

export function findTextElement(slide: JXAKeynote.Slide, expr: string | RegExp, from = 0) {
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
  ) as any | undefined;
}
