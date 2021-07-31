const { templateRanges } = require('../config');

let driver;

function createSlide() {
  driver.duplicateSlide(templateRanges.goodbye[0]);
  driver.duplicateSlide(templateRanges.goodbye[1]);
}

export function createGoodbyeSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
