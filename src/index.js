const _ = require("lodash");
const songs = require("./songs").default;

const regularBackgroundsRange = [1, 9];
const songBackgroundsRange = [10, 13];
const documentWidth = 1920;
const documentHeight = 1080;

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
    font: "SourceSansPro-Bold",
    size: 72
  },
  songSubtitle: {
    font: "SourceSansPro-Regular",
    size: 40,
    opacity: 72
  },
  songVerse: {
    font: "SourceSansPro-Semibold",
    size: 72
  },
  songChorus: {
    font: "AdobeHebrew-BoldItalic",
    size: 72
  }
};

const systemEvent = Application("System Events");
const keynote = Application("Keynote");
const mainWindow = systemEvent.processes["Keynote"].windows.byName("Test");

let doc;
if (keynote.documents.length) {
  doc = keynote.documents[0];
} else {
  doc = keynote.Document();
  keynote.documents.push(doc);
}

doc.width = documentWidth;
doc.height = documentHeight;

function copyBubbles() {
  const currentSlideIndex = _.indexOf(doc.slides, doc.currentSlide);
  doc.currentSlide = doc.slides[1];
  press("a", { command: true });
  press("c", { command: true });
  doc.currentSlide = doc.slides[currentSlideIndex];
}

function press(
  key,
  { shift = false, command = false, option = false, control = false } = {}
) {
  let using = [];
  if (shift) using.push("shift down");
  if (command) using.push("command down");
  if (control) using.push("control down");
  if (option) using.push("option down");

  systemEvent.keystroke(key, { using });
  delay(0.2);
}

function addSlide(backgroundId = 1) {
  const slide = keynote.Slide({
    baseSlide: doc.masterSlides[backgroundId]
  });

  doc.slides.push(slide);

  slide.transitionProperties = {
    automaticTransition: false,
    transitionEffect: "magic move",
    transitionDuration: 0.7
  };

  return slide;
}

function addText(text, format) {
  const textProperties = typography[format];
  const slide = doc.currentSlide;
  const textItem = keynote.TextItem({
    objectText: text
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

function openInspector(tab = 0) {
  const group = mainWindow.toolbars[0].radioGroups[0];
  const button = group.radioButtons[tab];

  if (button.value() === 0) {
    button.click();
    delay(0.5);
  }
}

function openBuildOrderWindow() {
  openInspector(1);
  mainWindow.buttons.byName("Ordre de composition").click();
}

function getBuildOrderWindow() {
  openBuildOrderWindow();

  return systemEvent.processes["Keynote"].windows.byName(
    "Ordre de composition"
  );
}

function selectEffect(effect) {
  const addEffectButton = mainWindow.buttons.byName("Ajouter un effet");
  addEffectButton.click();
  delay(0.2);
  addEffectButton.popOvers[0].scrollAreas[0].buttons.byName(effect).click();
  delay(0.2);
}

function addSongTitleEntryEffect() {
  openInspector(1);
  selectEffect("Fondu et déplacement");

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = "0,7 s";
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName("De haut en bas").click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
}

function addSongSubtitleEntryEffect() {
  openInspector(1);
  selectEffect("Fondu et déplacement");

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.textFields[0].value = "0,7 s";
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName("De bas en haut").click();

  const buildOrderWindow = getBuildOrderWindow();
  buildOrderWindow.popUpButtons[0].click();
  buildOrderWindow.popUpButtons[0].menus[0].menuItems[1].click();
  buildOrderWindow.textFields[0].value = "0,2 s";
}

function addSongTitle({
  title,
  copyright = "",
  authors = "",
  collection = ""
}) {
  const titleTextItem = addText(title, "songTitle");
  const subtitle = [];

  if (authors) subtitle.push(authors);
  if (copyright) subtitle.push(`© ${copyright}`);
  if (collection) subtitle.push(collection);

  const subtitleTextItem = addText(subtitle.join(" – "), "songSubtitle");

  const margin = 16;
  const height = titleTextItem.height() + subtitleTextItem.height() + margin;
  const y = (documentHeight - height) / 2;

  titleTextItem.position = { x: titleTextItem.position().x, y };
  addSongTitleEntryEffect();

  subtitleTextItem.position = {
    x: subtitleTextItem.position().x,
    y: y + titleTextItem.height() + margin
  };
  addSongSubtitleEntryEffect();
}

function addNextSongLyricsEntryEffect() {
  openInspector(1);
  selectEffect("Fondu et déplacement");

  const scrollArea = mainWindow.scrollAreas[0];
  scrollArea.sliders[1].value = 0.1;

  const popUpButton = scrollArea.popUpButtons[0];
  popUpButton.click();
  popUpButton.menus[0].menuItems.byName("De bas en haut").click();

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
    press("b", { shift: true, command: true });
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
  press("v", { command: true });

  const { currentSlide: slide } = doc;

  _.forEach(slide.images, (shape, position) => {
    shape.position = {
      x: 0,
      y: -(position + 1) * 50 * index
    };
  });
}

function addSongSlide(song) {
  addSlide(songBackgroundsRange[0]);
  addBubbles();
  addSongTitle(song);

  _.forEach(song.lyrics, (part, index) => {
    const format = part.type === "chorus" ? "songChorus" : "songVerse";
    const text = part.lines.join(`${" ".repeat(index)}\n`);
    const isLast = index === song.lyrics.length;

    addNextSongLyrics(text, format, index, isLast);
    addSlide(songBackgroundsRange[0]);
    addBubbles(index + 1);
    addCurrentSongLyrics(text, format);
  });
}

keynote.activate();
delay(0.5);
copyBubbles();
addSongSlide(songs["a-l-ageau-de-dieu"]);
