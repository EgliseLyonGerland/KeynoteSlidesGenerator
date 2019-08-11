const {
  documentWidth,
  documentHeight,
  regularBackgroundsNumber,
} = require('../config');

let driver;
let currentBackground = 2;

function createSlide({ book, verse, verseRange, excerpt }) {
  const background = `background${currentBackground}`;

  driver.addSlide(background);
  driver.addBubbles(0, 'center');
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;
  return createSlide;
}

export default null;
