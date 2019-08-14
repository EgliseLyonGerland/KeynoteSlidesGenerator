// const _ = require('lodash');
const { documentHeight } = require('../config');

let driver;

function addGoodbyeText(adjustPosition = 0, withAnimation = true) {
  const line1 = driver.addText('BON', 'goodbyeLine1');
  driver.setTextAlignment(line1, 'left');

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.5, appears: 'byChar' });
    driver.setEffectStartup('afterPrevious');
  }

  const line2 = driver.addText('DIMANCHE', 'goodbyeLine2');
  driver.setTextAlignment(line2, 'left');

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.5, appears: 'byChar' });
    driver.setEffectStartup('withPrevious', 0.2);
  }

  const line3 = driver.addText('À TOUS!', 'goodbyeLine3');
  driver.setTextAlignment(line3, 'left');

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.5, appears: 'byChar' });
    driver.setEffectStartup('withPrevious', 0.2);
  }

  const linesHeight = line1.height() + line2.height() + line3.height();
  const x = 250;
  const y = (documentHeight - linesHeight) / 2 + adjustPosition;

  driver.setElementXY(line1, x, y + 40);
  driver.setElementXY(line2, x, y + line1.height());
  driver.setElementXY(line3, x, line2.position().y + line2.height() - 30);
}

function addAddress() {
  const address = driver.addText(
    'https://www.egliselyongerland.org',
    'goodbyeAddress',
  );
  driver.setElementY(address, 950);
  driver.setDissolveEffect({ duration: 0.5, appears: 'byChar' });
  driver.setEffectStartup('afterPrevious');
}

function createSlide() {
  const background = driver.getNextRegularBackground();

  driver.addSlide(background);
  driver.addBubbles();

  addGoodbyeText();

  driver.addSlide(background);
  driver.addBubbles(1);
  driver.addHorizontalOverlays();

  addGoodbyeText(-200, false);
  addAddress();
}

export function createGoodbyeSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
