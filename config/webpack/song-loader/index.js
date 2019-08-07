function isBlankLine(text) {
  return text.trim() === "";
}

function isTypeLine(text) {
  const trimedText = text.trim();

  return trimedText === "[verse]" || trimedText === "[chorus]";
}

function resolveType(text) {
  return text.substr(1, text.length - 2);
}

function stringifyLyrics(lyrics) {
  return lyrics
    .map(part => `[${part.type}]\n${part.lines.join("\n")}`)
    .join("\n\n");
}

function parseLyrics(text) {
  let currentType = "verse";

  return text
    .trim()
    .split("\n")
    .reduce((acc, curr) => {
      if (acc.length === 0 || isBlankLine(curr)) {
        return [...acc, { type: currentType, lines: [] }];
      }

      if (isTypeLine(curr)) {
        currentType = resolveType(curr);

        if (acc[acc.length - 1].lines.length) {
          return [...acc, { type: currentType, lines: [] }];
        }

        acc[acc.length - 1].type = currentType;

        return acc;
      }

      acc[acc.length - 1].lines.push(curr);

      return acc;
    }, []);
}

function transformHeader(content) {
  return content
    .trim()
    .split("\n")
    .reduce((acc, line) => {
      let [key, value] = line.split(":");

      key = key.trim();
      value = value.trim();

      return {
        ...acc,
        [key]: value
      };
    }, {});
}

function transform(content) {
  const [header, lyrics] = content.split("---");

  return {
    ...transformHeader(header),
    lyrics: parseLyrics(lyrics)
  };
}

function loader(content) {
  // eslint-disable-next-line no-unused-expressions
  this.cacheable && this.cacheable();
  // this.value = content;
  const song = transform(content);

  return `module.exports = ${JSON.stringify(song)}`;
}

module.exports = loader;
module.exports.seperable = true;
