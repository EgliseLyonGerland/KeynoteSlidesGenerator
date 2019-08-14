const { documentHeight } = require('../config');

let driver;

function createSlide({ title }) {
  const background = driver.getNextRegularBackground();
  driver.addSlide(background);
  driver.addBubbles();

  const line = driver.addLine();

  const text = driver.addText(title, 'chapterTitle');
  driver.setFadeMoveEffect({ duration: 0.5, distance: 10 });
  driver.setEffectStartup('afterPrevious');

  const contentHeight = text.height() + 64;
  const y = (documentHeight - contentHeight) / 2;
  driver.setElementY(text, y);
  driver.setElementY(line, y + text.height() + 64);
}

export function createChapterSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
