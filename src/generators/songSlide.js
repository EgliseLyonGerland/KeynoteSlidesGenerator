const _ = require('lodash');

let driver;

function addTitle({ title, copyright = '', authors = '', collection = '' }) {
  driver.addSlideFromTemplate('song', 0);

  const titleElt = driver.findTextElement(/^Title:/);
  titleElt.objectText = title;

  const authorsElt = driver.findTextElement(/^Authors:/);
  authorsElt.objectText = authors;

  const extras = [];
  if (copyright) extras.push(`© ${copyright}`);
  if (collection) extras.push(collection);

  const creditsElt = driver.findTextElement(/^Credits:/);
  creditsElt.objectText = extras.join(' – ');
}

function addLyrics(lyrics, index) {
  const lines = lyrics.text.split('\n');
  const format = lyrics.type === 'chorus' ? 'songChorus' : 'songVerse';
  const text = lines.join(`${' '.repeat(index)}\n`);

  return driver.addText(text, format);
}

function addNextLyrics(lyrics, index) {
  const textItem = addLyrics(lyrics, index);
  textItem.opacity = index ? 50 : 0;
  driver.setElementY(textItem, 648);

  if (index) {
    // Put text in background
    driver.press('b', { shift: true, command: true });
  }
}

function addOverNextLyrics(lyrics, index) {
  const textItem = addLyrics(lyrics, index);

  textItem.opacity = index ? 50 : 0;
  driver.setElementY(textItem, 648 * 2);

  // Put text in background
  driver.press('b', { shift: true, command: true });
}

function addCurrentLyrics(lyrics, index) {
  const textItem = addLyrics(lyrics, index);
  const y = (600 - textItem.height()) / 2;

  driver.setElementY(textItem, y);
}

function createSlide({ repeat = false, ...song } = {}) {
  driver.addSlide('backgroundSong');
  addTitle(song);

  let { lyrics } = song;
  if (repeat) {
    lyrics = [...lyrics, ...lyrics];
  }

  _.forEach(lyrics, (part, index) => {
    addNextLyrics(part, index);

    if (lyrics[index + 1]) {
      addOverNextLyrics(lyrics[index + 1], index + 1);
    }

    driver.addSlide('backgroundSong');
    addCurrentLyrics(part, index);
  });
}

export function createSongSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
