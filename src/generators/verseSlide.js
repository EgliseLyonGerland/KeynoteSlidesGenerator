const _ = require('lodash');
const { documentWidth, documentHeight } = require('../config');

const { log } = console;

let driver;

const margin = 80;
const maxContentWidth = documentWidth - 300;

const templates = {
  topBottomAlignCenter(book, verse, excerpt) {
    const line = driver.addLine();
    const totalHeight = book.height() + excerpt.height() + margin * 2;
    const y = (documentHeight - totalHeight) / 2;

    driver.setElementX(book, (documentWidth - book.width()) / 2);
    driver.setElementY(book, y);

    driver.setElementX(line, (documentWidth - line.width()) / 2);
    driver.setElementY(line, y + book.height() + margin);

    driver.setElementX(excerpt, (documentWidth - excerpt.width()) / 2);
    driver.setElementY(excerpt, line.position().y + margin);

    if (verse) {
      const width = book.width() + verse.width();
      const x = (documentWidth - width) / 2;

      driver.setElementX(book, x);
      driver.setElementXY(verse, x + book.width(), y);
    }
  },

  topBottomAlignLeft(book, verse, excerpt) {
    driver.setTextAlignment(excerpt, 'left');

    const line = driver.addLine();
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
      driver.setElementXY(verse, x + book.width(), y);
    }
  },

  bottomTopAlignCenter(book, verse, excerpt) {
    const line = driver.addLine();
    const totalHeight = book.height() + excerpt.height() + margin * 2;
    const y = (documentHeight - totalHeight) / 2;

    driver.setElementX(excerpt, (documentWidth - excerpt.width()) / 2);
    driver.setElementY(excerpt, y);

    driver.setElementX(line, (documentWidth - line.width()) / 2);
    driver.setElementY(line, y + excerpt.height() + margin);

    driver.setElementX(book, (documentWidth - book.width()) / 2);
    driver.setElementY(book, line.position().y + margin);

    if (verse) {
      const width = book.width() + verse.width();
      const x = (documentWidth - width) / 2;

      driver.setElementX(book, x);
      driver.setElementXY(verse, x + book.width(), book.position().y);
    }
  },

  bottomTopAlignLeft(book, verse, excerpt) {
    driver.setTextAlignment(excerpt, 'left');

    const line = driver.addLine();
    const totalHeight = book.height() + excerpt.height() + margin * 2;
    const y = (documentHeight - totalHeight) / 2;

    driver.setElementY(excerpt, y);
    driver.setElementY(line, y + excerpt.height() + margin);
    driver.setElementY(book, line.position().y + margin);

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
      driver.setElementXY(verse, x + book.width(), book.position().y);
    }
  },

  leftRightAlignCenter(book, verse, excerpt) {
    driver.setTextAlignment(excerpt, 'left');

    const line = driver.addLine({ vertical: true });
    const excerptMaxWidth = maxContentWidth - book.width() - margin * 2;
    // eslint-disable-next-line no-param-reassign
    excerpt.width = Math.min(excerpt.width(), excerptMaxWidth);

    const totalWidth = book.width() + excerpt.width() + margin * 2;
    const x = (documentWidth - totalWidth) / 2;

    driver.setElementX(book, x);
    driver.setElementX(line, x + book.width() + margin);
    driver.setElementX(excerpt, line.position().x + margin);

    if (verse) {
      const totalHeight = book.height() + verse.height();
      const y = (documentHeight - totalHeight) / 2;

      driver.setElementX(verse, book.position().x);
      driver.setElementY(book, y);
      driver.setElementY(verse, y + book.height());
    }
  },

  rightLeftAlignCenter(book, verse, excerpt) {
    driver.setTextAlignment(excerpt, 'left');

    const line = driver.addLine({ vertical: true });
    const excerptMaxWidth = maxContentWidth - book.width() - margin * 2;
    // eslint-disable-next-line no-param-reassign
    excerpt.width = Math.min(excerpt.width(), excerptMaxWidth);

    const totalWidth = book.width() + excerpt.width() + margin * 2;
    const x = (documentWidth - totalWidth) / 2;

    driver.setElementX(excerpt, x);
    driver.setElementX(line, x + excerpt.width() + margin);
    driver.setElementX(book, line.position().x + margin);

    if (verse) {
      const totalHeight = book.height() + verse.height();
      const y = (documentHeight - totalHeight) / 2;

      driver.setElementX(verse, book.position().x);
      driver.setElementY(book, y);
      driver.setElementY(verse, y + book.height());
    }
  },
};

function createSlide({
  book,
  verse,
  verseRange,
  excerpt,
  direction = 'topBottom',
  align = 'center',
  bubblesPosition = 0,
}) {
  const templateName = _.camelCase(`${direction} align ${align}`);

  if (!templates[templateName]) {
    log(`No template \`${direction}\` with \`${align}\` alignment found`);

    return;
  }

  const background = driver.getNextRegularBackground();

  driver.addSlide(background);
  driver.addBubbles(bubblesPosition, 'center');

  const bookTextItem = driver.addText(book, 'verseTitle');

  let verseTextItem;
  if (verse) {
    verseTextItem = driver.addText(`• ${verse}`, 'verseSubtitle');
  } else if (verseRange) {
    verseTextItem = driver.addText(
      ` • ${verseRange[0]}–${verseRange[1]}`,
      'verseSubtitle',
    );
  }

  // eslint-disable-next-line no-irregular-whitespace
  const excerptTextItem = driver.addText(`“ ${excerpt} ”`, 'verseExcerpt');
  excerptTextItem.width = Math.min(excerptTextItem.width(), maxContentWidth);

  templates[templateName](bookTextItem, verseTextItem, excerptTextItem);

  driver.selectElement(bookTextItem);
  driver.setFadeMoveEffect({
    duration: 0.7,
    direction: 'bottomToTop',
    distance: 10,
  });
  driver.setEffectStartup('afterPrevious');

  if (verseTextItem) {
    driver.selectElement(verseTextItem);
    driver.setFadeMoveEffect({
      duration: 0.7,
      direction: 'bottomToTop',
      distance: 10,
    });
    driver.setEffectStartup('withPrevious');
  }

  driver.selectElement(excerptTextItem);
  driver.setDissolveEffect({ duration: 2, appears: 'byChar' });
  driver.setEffectStartup('withPrevious', 0.3);
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
