import _ from 'lodash';

function merge(fields, values) {
  return fields.reduce(
    (acc, key, index) => ({
      ...acc,
      [key]: values[index],
    }),
    {},
  );
}

export function parse(ref) {
  /**
   * Examples:
   *
   *  - 1 Pierre
   *  - 1 Pierre 15
   *  - 1 Pierre 15-16
   *  - 1 Pierre 15.3
   *  - 1 Pierre 15.3-8
   *  - 1 Pierre 15.3-16.8
   */
  const exprs = [
    {
      regExp: /^(.+?)$/,
      fields: ['book'],
    },
    {
      regExp: /^(.+?) *(\d+)$/,
      fields: ['book', 'chapterStart'],
    },
    {
      regExp: /^(.+?) *(\d+)-(\d+)$/,
      fields: ['book', 'chapterStart', 'chapterEnd'],
    },
    {
      regExp: /^(.+?) *(\d+)\.(\d+[a-z]?)$/,
      fields: ['book', 'chapterStart', 'verseStart'],
    },
    {
      regExp: /^(.+?) *(\d+)\.(\d+[a-z]?)-(\d+[a-z]?)$/,
      fields: ['book', 'chapterStart', 'verseStart', 'verseEnd'],
    },
    {
      regExp: /^(.+?) *(\d+)\.(\d+[a-z]?)-(\d+)\.(\d+[a-z]?)$/,
      fields: ['book', 'chapterStart', 'verseStart', 'chapterEnd', 'verseEnd'],
    },
  ];

  const ref$ = _.trim(ref);

  return exprs.reverse().reduce((acc, { regExp, fields }) => {
    const matches = regExp.exec(ref$);

    if (acc) {
      return acc;
    }

    if (matches) {
      return merge(fields, matches.slice(1));
    }

    return null;
  }, null);
}

export function format(ref) {
  let $ref = ref;
  if (_.isString(ref)) {
    $ref = parse(ref);
  }

  const {
    book,
    chapterStart,
    verseStart = null,
    chapterEnd = null,
    verseEnd = null,
  } = $ref;

  if (chapterEnd && verseEnd) {
    return `${book} ${chapterStart}.${verseStart} — ${chapterEnd}.${verseEnd}`;
  }

  if (verseEnd) {
    return `${book} ${chapterStart} • ${verseStart}—${verseEnd}`;
  }

  if (verseStart) {
    return `${book} ${chapterStart} • ${verseStart}`;
  }

  if (chapterEnd) {
    return `${book} ${chapterStart}–${chapterEnd}`;
  }

  if (chapterStart) {
    return `${book} ${chapterStart}`;
  }

  return book;
}

export default null;
