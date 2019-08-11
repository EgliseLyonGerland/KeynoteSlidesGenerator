const _ = require('lodash');
// const debug = require('./utils/debug');
const songs = require('./songs').default;

// const regularBackgroundsNumber = 13;
const songBackgroundsNumber = 3;
const documentWidth = 1920;
const documentHeight = 1080;

let currentSongBackground = 1;

/**
 * Fonts:
 *
 *  - SourceSansPro-Semibold
 *  - SourceSansPro-Bold
 *  - SourceSansPro-Black
 *  - AdobeHebrew-BoldItalic
 */

const typography = {
  songTitle: {
    font: 'AdobeHebrew-BoldItalic',
    size: 80,
  },
  songAuthors: {
    font: 'SourceSansPro-Semibold',
    size: 50,
    opacity: 70,
  },
  songExtras: {
    font: 'SourceSansPro-Regular',
    size: 40,
    opacity: 40,
  },
  songVerse: {
    font: 'SourceSansPro-Semibold',
    size: 72,
  },
  songChorus: {
    font: 'AdobeHebrew-BoldItalic',
    size: 72,
  },
};

const systemEvent = Application('System Events');
const keynote = Application('Keynote');
const mainWindow = systemEvent.processes.Keynote.windows.byName('Slides');

let doc;
if (keynote.documents.length) {
  [doc] = keynote.documents;
} else {
  doc = keynote.Document();
  keynote.documents.push(doc);
}

doc.width = documentWidth;
doc.height = documentHeight;

function press(
  key,
  { shift = false, command = false, option = false, control = false } = {},
) {
  const using = [];
  if (shift) using.push('shift down');
  if (command) using.push('command down');
  if (control) using.push('control down');
  if (option) using.push('option down');

  systemEvent.keystroke(key, { using });
  delay(0.2);
}

function changeSongBackground() {
  currentSongBackground += 1;

  if (currentSongBackground > songBackgroundsNumber) {
    currentSongBackground = 1;
  }
}

function copyBubbles() {
  const currentSlideIndex = _.indexOf(doc.slides, doc.currentSlide);
  [doc.currentSlide] = doc.slides;
  press('a', { command: true });
  press('c', { command: true });
  doc.currentSlide = doc.slides[currentSlideIndex];
}

function addSlide(backgroundName) {
  const slide = keynote.Slide({
    baseSlide: doc.masterSlides.byName(backgroundName),
  });

  doc.slides.push(slide);

  slide.transitionProperties = {
    automaticTransition: false,
    transitionEffect: 'magic move',
    transitionDuration: 0.7,
  };

  return slide;
}

// function debugElements(elements, recursive = false, maxDepth = 0, level = 0) {
//   _.forEach(elements, (element, index) => {
//     debug(
//       '  '.repeat(level),
//       index,
//       // element.class(),
//       element.name(),
//       // element.description(),
//       // element.role(),
//       // element.roleDescription(),
//       // element.title(),
//       // element.help(),
//       // element.size(),
//       // element.position()
//       // element.value()
//     );

//     if (
//       recursive &&
//       (maxDepth === 0 || level < maxDepth - 1) &&
//       element.uiElements
//     ) {
//       debugElements(element.uiElements, recursive, maxDepth, level + 1);
//     }
//   });
// }

function openInspector(tab = 0) {
  const group = mainWindow.toolbars[0].radioGroups[0];
  const button = group.radioButtons[tab];

  if (button.value() === 0) {
    button.click();
    delay(0.5);
  }
}

function selectInspectorTab(tab) {
  mainWindow.radioGroups[0].radioButtons.byName(tab).click();
}

function openBuildOrderWindow() {
  openInspector(1);
  mainWindow.buttons.byName('Ordre de composition').click();
}

function getBuildOrderWindow() {
  openBuildOrderWindow();

  return systemEvent.processes.Keynote.windows.byName('Ordre de composition');
}

function selectEffect(effect) {
  const addEffectButton = mainWindow.buttons.byName('Ajouter un effet');
  addEffectButton.click();
  delay(0.2);
  addEffectButton.popOvers[0].scrollAreas[0].buttons.byName(effect).click();
  delay(0.2);
}

function addText(text, format) {
  const textProperties = typography[format];
  const slide = doc.currentSlide;
  const textItem = keynote.TextItem({
    objectText: text,
  });
  slide.textItems.push(textItem);
  textItem.objectText.size = textProperties.size;
  textItem.objectText.font = textProperties.font;
  textItem.objectText.color = [65535, 65535, 65535];

  if (textProperties.opacity) {
    textItem.opacity = textProperties.opacity;
  }

  return textItem;
}

function addSongTitleEntryEffect() {
  openInspector(1);
  selectInspectorTab('Entrée');
  selectEffect('Fondu et déplacement');

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De haut en bas').click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
}

function addSongAuthorsEntryEffect() {
  openInspector(1);
  selectInspectorTab('Entrée');
  selectEffect('Fondu et déplacement');

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De bas en haut').click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
  buildOrderWindow.textFields[0].value = '0,2 s';
}

function addSongExtrasEntryEffect() {
  openInspector(1);
  selectInspectorTab('Entrée');
  selectEffect('Dissolution');

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = '0,7 s';
  scrollArea.popUpButtons[0].click();
  scrollArea.popUpButtons[0].menus[0].menuItems.byName('Par caractère').click();
  scrollArea.popUpButtons[1].click();
  scrollArea.popUpButtons[1].menus[0].menuItems
    .byName('Plan supérieur')
    .click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[2].click();
  buildOrderWindow.textFields[0].value = '0,3 s';
}

function addSongTitle({
  title,
  copyright = '',
  authors = '',
  collection = '',
}) {
  const titleTextItem = addText(title, 'songTitle');

  if (authors) {
    const authorsTextItem = addText(authors, 'songAuthors');

    const margin = 16;
    const height = titleTextItem.height() + authorsTextItem.height() + margin;
    const y = (documentHeight - height) / 2;

    titleTextItem.position = { x: titleTextItem.position().x, y };
    addSongTitleEntryEffect();

    authorsTextItem.position = {
      x: authorsTextItem.position().x,
      y: y + titleTextItem.height() + margin,
    };
    addSongAuthorsEntryEffect();
  } else {
    titleTextItem.locked = false;
    addSongTitleEntryEffect();
  }

  const extras = [];
  if (copyright) extras.push(`© ${copyright}`);
  if (collection) extras.push(collection);

  if (extras.length) {
    const extrasTextItem = addText(extras.join(' – '), 'songExtras');

    extrasTextItem.position = {
      x: extrasTextItem.position().x,
      y: 900,
    };

    addSongExtrasEntryEffect();
  }
}

function addNextSongLyricsEntryEffect() {
  openInspector(1);
  selectEffect('Fondu et déplacement');

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName('De bas en haut').click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
}

function addNextSongLyrics(text, format, index, isLast) {
  const textItem = addText(text, format);
  textItem.width = documentWidth;
  textItem.opacity = index ? 50 : 0;
  textItem.position = { x: 0, y: 810 };

  if (index) {
    // Put text in background
    press('b', { shift: true, command: true });
  }

  if (index && !isLast) {
    addNextSongLyricsEntryEffect();
  }
}

function addCurrentSongLyrics(text, format) {
  const nextTextItem = addText(text, format);
  nextTextItem.width = documentWidth;
  nextTextItem.position = { x: 0, y: 200 };
}

function addBubbles(index = 0) {
  press('v', { command: true });

  const { currentSlide: slide } = doc;

  _.forEach(slide.images, (shape, position) => {
    // eslint-disable-next-line no-param-reassign
    shape.position = {
      x: 0,
      y: -(position + 1) * 50 * index,
    };
  });
}

function addSongSlide(song) {
  const background = `backgroundS${currentSongBackground}`;

  addSlide(background);
  addBubbles();
  addSongTitle(song);

  _.forEach(song.lyrics, (part, index) => {
    const format = part.type === 'chorus' ? 'songChorus' : 'songVerse';
    const text = part.lines.join(`${' '.repeat(index)}\n`);
    const isLast = index === song.lyrics.length;

    addNextSongLyrics(text, format, index, isLast);
    addSlide(background);
    addBubbles(index + 1);
    addCurrentSongLyrics(text, format);
  });

  changeSongBackground();
}

keynote.activate();
delay(0.5);

copyBubbles();

addSongSlide(songs['comme-un-phare']);
// addSongSlide(songs["dieu-tres-saint"]);
// addSongSlide(songs["psaume-95"]);
// addSongSlide(songs["redempteur-admirable"]);
// addSongSlide(songs["te-ressembler-jesus"]);
// addSongSlide(songs["celebrez-jesus"]);
// addSongSlide(songs["il-est-un-jour"]);
// addSongSlide(songs["tu-me-veux-a-ton-service"]);
// addSongSlide(songs["gloire-gloire-gloire"]);
