const _ = require('lodash');
const {
  documentWidth,
  documentHeight,
  regularBackgroundsNumber,
} = require('../config');

let driver;
let currentBackground = 1;
const margin = 80;
const maxContentWidth = documentWidth - 400;
// const maxContentHeight = documentHeight - 400;

function changeBackground() {
  currentBackground += 1;

  if (currentBackground > regularBackgroundsNumber) {
    currentBackground = 1;
  }
}

const templates = {
  topBottomAlignCenter(book, verse, excerpt, line) {
    // eslint-disable-next-line no-param-reassign
    excerpt.width = Math.min(excerpt.width(), maxContentWidth);

    const totalHeight = book.height() + excerpt.height() + margin * 2;
    const y = (documentHeight - totalHeight) / 2;

    driver.setElementY(book, y);
    driver.setElementY(line, y + book.height() + margin);
    driver.setElementY(excerpt, line.position().y + margin);

    if (verse) {
      const width = book.width() + verse.width() + 16;
      const x = (documentWidth - width) / 2;

      driver.setElementX(book, x);
      driver.setElementXY(verse, x + book.width() + 16, y);
    }
  },

  topBottomAlignLeft(book, verse, excerpt, line) {
    // eslint-disable-next-line no-param-reassign
    excerpt.width = Math.min(excerpt.width(), maxContentWidth);
    driver.alignText('left');

    const totalHeight = book.height() + excerpt.height() + margin * 2;
    const y = (documentHeight - totalHeight) / 2;

    driver.setElementY(book, y);
    driver.setElementY(line, y + book.height() + margin);
    driver.setElementY(excerpt, line.position().y + margin);

    let totalTitleWidth = book.width();
    if (verse) {
      totalTitleWidth += 16 + verse.width();
    }

    const totalWidth = Math.max(totalTitleWidth, excerpt.width(), line.width());
    const x = (documentWidth - totalWidth) / 2;

    driver.setElementX(book, x);
    driver.setElementX(line, x);
    driver.setElementX(excerpt, x);

    if (verse) {
      driver.setElementX(book, x);
      driver.setElementXY(verse, x + book.width() + 16, y);
    }
  },
};

function createSlide({
  book,
  verse,
  verseRange,
  excerpt,
  direction = 'topBottom',
  align = 'left',
}) {
  const background = `backgroundR${currentBackground}`;

  driver.addSlide(background);
  driver.addBubbles(0, 'center');

  const bookTextItem = driver.addText(book, 'verseTitle');

  let verseTextItem;
  if (verse) {
    verseTextItem = driver.addText(`• ${verse}`, 'verseSubtitle');
  } else if (verseRange) {
    verseTextItem = driver.addText(
      `• ${verseRange[0]}–${verseRange[1]}`,
      'verseSubtitle',
    );
  }

  // eslint-disable-next-line no-irregular-whitespace
  const excerptTextItem = driver.addText(`“ ${excerpt} ”`, 'verseExcerpt');
  const line = driver.addLine();

  const templateName = _.camelCase(`${direction} align ${align}`);
  templates[templateName](bookTextItem, verseTextItem, excerptTextItem, line);

  changeBackground();
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
