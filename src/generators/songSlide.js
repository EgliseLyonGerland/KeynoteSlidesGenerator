const _ = require('lodash');

let driver;

function addTitle({ title, copyright = '', authors = '', collection = '' }) {
  const titleTextItem = driver.addText(title, 'songTitle');

  driver.setFadeMoveEffect({
    duration: 0.7,
    direction: 'topToBottom',
    distance: 10,
  });

  if (authors) {
    const authorsTextItem = driver.addText(authors, 'songAuthors');

    const margin = 16;
    const height = titleTextItem.height() + authorsTextItem.height() + margin;
    const y = (600 - height) / 2;

    driver.setElementY(titleTextItem, y);
    driver.setElementY(authorsTextItem, y + titleTextItem.height() + margin);

    driver.setFadeMoveEffect({
      duration: 0.7,
      direction: 'bottomToTop',
      distance: 10,
    });
    driver.setEffectStartup('withPrevious', 0.2);
  }

  const extras = [];
  if (copyright) extras.push(`© ${copyright}`);
  if (collection) extras.push(collection);

  if (extras.length) {
    const extrasTextItem = driver.addText(extras.join(' – '), 'songExtras');

    driver.setElementY(extrasTextItem, 450);
    driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
    driver.setEffectStartup('afterPrevious', 0.3);
  }
}

function addNextLyrics(text, format, index, isLast) {
  const textItem = driver.addText(text, format);
  textItem.opacity = index ? 50 : 0;
  driver.setElementY(textItem, 648);

  if (index) {
    // Put text in background
    driver.press('b', { shift: true, command: true });
  }

  if (index && !isLast) {
    driver.setFadeMoveEffect({
      duration: 1,
      direction: 'bottomToTop',
      distance: 10,
    });
    driver.setEffectStartup('afterPrevious', 0.2);
  }
}

function addCurrentLyrics(text, format) {
  const textItem = driver.addText(text, format);
  // const y = (documentHeight - textItem.height()) / 2;
  const y = (600 - textItem.height()) / 2;

  driver.setElementY(textItem, y);
}

function createSlide({ repeat = false, ...song } = {}) {
  driver.addSlide('backgroundSong');
  driver.addBubbles();
  addTitle(song);

  let { lyrics } = song;
  if (repeat) {
    lyrics = [...lyrics, ...lyrics];
  }

  _.forEach(lyrics, (part, index) => {
    const lines = part.text.split('\n');
    const format = part.type === 'chorus' ? 'songChorus' : 'songVerse';
    const text = lines.join(`${' '.repeat(index)}\n`);
    const isLast = index === lyrics.length;

    addNextLyrics(text, format, index, isLast);
    driver.addSlide('backgroundSong');
    driver.addBubbles(index + 1);
    addCurrentLyrics(text, format, lines.length);
  });
}

export function createSongSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
