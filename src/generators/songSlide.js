const _ = require('lodash');
const {
  documentWidth,
  documentHeight,
  songBackgroundsNumber,
} = require('../config');
const songs = require('../songs').default;

let driver;
let currentBackground = 1;

function addTitleEntryEffect() {
  driver.openInspector(1);
  driver.selectInspectorTab('Entrée');
  driver.selectEffect('Fondu et déplacement');

  const scrollArea = driver.mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De haut en bas').click();

  const buildOrderWindow = driver.getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
}

function addAuthorsEntryEffect() {
  driver.openInspector(1);
  driver.selectInspectorTab('Entrée');
  driver.selectEffect('Fondu et déplacement');

  const scrollArea = driver.mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De bas en haut').click();

  const buildOrderWindow = driver.getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
  buildOrderWindow.textFields[0].value = '0,2 s';
}

function addExtrasEntryEffect() {
  driver.openInspector(1);
  driver.selectInspectorTab('Entrée');
  driver.selectEffect('Dissolution');

  const scrollArea = driver.mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.popUpButtons[0].click();
  scrollArea.popUpButtons[0].menus[0].menuItems.byName('Par caractère').click();
  scrollArea.popUpButtons[1].click();
  scrollArea.popUpButtons[1].menus[0].menuItems
    .byName('Plan supérieur')
    .click();

  const buildOrderWindow = driver.getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[2].click();
  buildOrderWindow.textFields[0].value = '0,3 s';
}

function addTitle({ title, copyright = '', authors = '', collection = '' }) {
  const titleTextItem = driver.addText(title, 'songTitle');

  if (authors) {
    const authorsTextItem = driver.addText(authors, 'songAuthors');

    const margin = 16;
    const height = titleTextItem.height() + authorsTextItem.height() + margin;
    const y = (documentHeight - height) / 2;

    titleTextItem.position = { x: titleTextItem.position().x, y };
    addTitleEntryEffect();

    authorsTextItem.position = {
      x: authorsTextItem.position().x,
      y: y + titleTextItem.height() + margin,
    };
    addAuthorsEntryEffect();
  } else {
    titleTextItem.locked = false;
    addTitleEntryEffect();
  }

  const extras = [];
  if (copyright) extras.push(`© ${copyright}`);
  if (collection) extras.push(collection);

  if (extras.length) {
    const extrasTextItem = driver.addText(extras.join(' – '), 'songExtras');

    extrasTextItem.position = {
      x: extrasTextItem.position().x,
      y: 900,
    };

    addExtrasEntryEffect();
  }
}

function addNextLyricsEntryEffect() {
  driver.openInspector(1);
  driver.selectEffect('Fondu et déplacement');

  const scrollArea = driver.mainWindow.scrollAreas[0];
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De bas en haut').click();

  const buildOrderWindow = driver.getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
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
    addNextLyricsEntryEffect();
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

function createSlide(songId) {
  const song = songs[songId];
  const background = `backgroundS${currentBackground}`;

  driver.addSlide(background);
  driver.addBubbles();
  addTitle(song);

  _.forEach(song.lyrics, (part, index) => {
    const format = part.type === 'chorus' ? 'songChorus' : 'songVerse';
    const text = part.lines.join(`${' '.repeat(index)}\n`);
    const isLast = index === song.lyrics.length;

    addNextLyrics(text, format, index, isLast);
    driver.addSlide(background);
    driver.addBubbles(index + 1);
    addCurrentLyrics(text, format);
  });

  changeBackground();
}

export function createSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
