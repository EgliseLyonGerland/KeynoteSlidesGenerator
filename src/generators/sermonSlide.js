const _ = require('lodash');
const { wrapper } = require('text-wrapper');
const { parse, format } = require('../utils/bibleRef');
const { documentWidth, documentHeight } = require('../config');

const BACKGROUND = 'backgroundSermon';
const TITLE_SIZE = 130;
const TITLE_WIDTH = 640;
const BIBLE_REF_SIZE = 66;
const AUTHOR_SIZE = 50;
const SCALE = 0.8;

let driver;

function equalize(textItem) {
  const textHeight = textItem.height();
  while (textItem.height() === textHeight) {
    // eslint-disable-next-line no-param-reassign
    textItem.width = textItem.width() - 1;
  }

  // eslint-disable-next-line no-param-reassign
  textItem.width = textItem.width() + 1;
}

function createFirstSlide(title, author, bibleRef) {
  driver.addSlide(BACKGROUND);
  driver.addBubbles(0, 'center');

  const titleText = driver.addText(title.toUpperCase(), {
    font: 'SourceSansPro-Black',
    size: TITLE_SIZE,
  });
  driver.setTextLineHeight(titleText, 0.8);
  driver.setTextAlignment(titleText, 'left');
  titleText.width = TITLE_WIDTH;
  equalize(titleText);

  driver.setDissolveEffect({ duration: 1.5, appears: 'byChar' });

  const bibleRefText = driver.addText(format(bibleRef), {
    font: 'AdobeHebrew-BoldItalic',
    size: BIBLE_REF_SIZE,
    opacity: 80,
  });

  driver.setDissolveEffect({ duration: 0.9, appears: 'byChar' });
  driver.setEffectStartup('withPrevious', 1.25);

  const authorText = driver.addText(`  •  ${author}`, {
    font: 'SourceSansPro-Black',
    size: AUTHOR_SIZE,
    opacity: 80,
  });

  driver.setDissolveEffect({ duration: 0.9, appears: 'byChar' });
  driver.setEffectStartup('withPrevious', 0.6);

  const totalHeight =
    titleText.height() + bibleRefText.height() + authorText.height();
  const x = 260;
  const y = (documentHeight - totalHeight) / 2;

  driver.setElementXY(titleText, x, y);
  driver.setElementXY(bibleRefText, x, y + titleText.height());

  driver.setElementX(authorText, x + bibleRefText.width());
  driver.setElementY(authorText, y + titleText.height());
}

function createSecondSlide(title, author, bibleRef, plan) {
  driver.addSlide(BACKGROUND);
  driver.addBubbles(0, 'center');

  const titleText = driver.addText(title.toUpperCase(), {
    font: 'SourceSansPro-Black',
    size: TITLE_SIZE * SCALE,
  });
  driver.setTextLineHeight(titleText, 0.8);
  driver.setTextAlignment(titleText, 'left');
  titleText.width = TITLE_WIDTH * SCALE;
  equalize(titleText);

  const bibleRefText = driver.addText(format(bibleRef), {
    font: 'AdobeHebrew-BoldItalic',
    size: BIBLE_REF_SIZE * SCALE,
    opacity: 80,
  });

  const authorText = driver.addText(`  •  ${author}`, {
    font: 'SourceSansPro-Black',
    size: AUTHOR_SIZE * SCALE,
    opacity: 80,
  });

  const x = 260;
  const y = 100;

  driver.setElementXY(titleText, x, y);
  driver.setElementXY(bibleRefText, x, y + titleText.height());

  driver.setElementX(authorText, x + bibleRefText.width());
  driver.setElementY(authorText, y + titleText.height());

  let stepY = bibleRefText.position().y + bibleRefText.height() + 92;

  const steps = plan.map((step, index) => {
    const stepText = driver.addText(step, {
      font: 'AdobeHebrew-BoldItalic',
      size: 60,
      opacity: 30,
    });
    stepText.width = TITLE_WIDTH;

    driver.setTextNumbered(stepText, index + 1, 64);
    driver.setTextAlignment(stepText, 'left');
    driver.setElementX(stepText, x);
    driver.setElementY(stepText, stepY);

    driver.setDissolveEffect({ duration: 0.9, appears: 'byChar' });

    if (index) {
      driver.setEffectStartup('withPrevious', 0.3);
    } else {
      driver.setEffectStartup('afterPrevious');
    }

    stepY += stepText.height() + 32;

    return stepText;
  });

  steps.forEach(step => {
    driver.selectElement(step);
    driver.setOpacityEffect({ duration: 0.6, opacity: 100 });
  });
}

function createSlide({ title, author, bibleRef, plan = [] } = {}) {
  createFirstSlide(title, author, bibleRef);

  if (plan.length) {
    createSecondSlide(title, author, bibleRef, plan);
  }

  driver.addSlide(BACKGROUND);
}

export function createSermonSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
