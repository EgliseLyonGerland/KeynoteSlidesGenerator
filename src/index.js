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
  songVerse: {
    font: "SourceSansPro-Semibold",
    size: 72
  },
  songChorus: {
    font: "AdobeHebrew-BoldItalic",
    size: 72
  }
};

const keynote = Application("Keynote");
keynote.activate();

let doc;
if (keynote.documents.length) {
  doc = keynote.documents[0];
} else {
  doc = keynote.Document();
  keynote.documents.push(doc);
}

doc.width = documentWidth;
doc.height = documentHeight;

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

  return textItem;
}

function addSongSlide(song) {
  addSlide(songBackgroundsRange[0]);
  addText(song.title, "songTitle");

  _.forEach(song.lyrics, (part, index) => {
    const format = part.type === "chorus" ? "songChorus" : "songVerse";
    const text = part.lines.join(`\n${" ".repeat(index)}`);

    const prevTextItem = addText(text, format);
    prevTextItem.width = documentWidth;
    prevTextItem.opacity = index ? 50 : 0;
    prevTextItem.position = { x: 0, y: 800 };

    addSlide(songBackgroundsRange[0]);

    const nextTextItem = addText(text, format);
    nextTextItem.width = documentWidth;
    nextTextItem.position = { x: 0, y: 200 };
  });
}

addSongSlide(songs["a-l-ageau-de-dieu"]);
