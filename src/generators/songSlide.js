const _ = require('lodash');
const {
  documentWidth,
  documentHeight,
  songBackgroundsNumber,
} = require('../config');
const songs = require('../songs').default;

let driver;
let currentBackground = 2;

function addTitle({ title, copyright = '', authors = '', collection = '' }) {
  const titleTextItem = driver.addText(title, 'songTitle');

  driver.setFadeMoveEffect({
    duration: 0.7,
    direction: 'topToBottom',
    distance: 10,
  });
  driver.setEffectStartup('afterPrevious');

  if (authors) {
    const authorsTextItem = driver.addText(authors, 'songAuthors');

    const margin = 16;
    const height = titleTextItem.height() + authorsTextItem.height() + margin;
    const y = (documentHeight - height) / 2;

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

    driver.setElementY(extrasTextItem, 900);
    driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
    driver.setEffectStartup('afterPrevious', 0.3);
  }
}

function addNextLyrics(text, format, index, isLast) {
  const textItem = driver.addText(text, format);
  textItem.width = documentWidth;
  textItem.opacity = index ? 50 : 0;
  textItem.position = { x: 0, y: 810 };

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
  const nextTextItem = driver.addText(text, format);
  nextTextItem.width = documentWidth;
  nextTextItem.position = { x: 0, y: 200 };
}

function changeBackground() {
  currentBackground += 1;

  if (currentBackground > songBackgroundsNumber) {
    currentBackground = 1;
  }
}

function createSlide(songId, { repeat = false }) {
  const song = songs[songId];
  const background = `backgroundS${currentBackground}`;

  driver.addSlide(background);
  driver.addBubbles();
  addTitle(song);

  let { lyrics } = song;
  if (repeat) {
    lyrics = [...lyrics, ...lyrics];
  }

  _.forEach(lyrics, (part, index) => {
    const format = part.type === 'chorus' ? 'songChorus' : 'songVerse';
    const text = part.lines.join(`${' '.repeat(index)}\n`);
    const isLast = index === lyrics.length;

    addNextLyrics(text, format, index, isLast);
    driver.addSlide(background);
    driver.addBubbles(index + 1);
    addCurrentLyrics(text, format);
  });

  changeBackground();
}

export function createSongSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
