const _ = require('lodash');
const splitText = require('split-text');
const { parse, format } = require('../utils/bibleRef');
const { documentWidth, documentHeight } = require('../config');

let driver;

function formatTitle(title) {
  const lines = splitText(title, 24);

  return lines.join('\n');
}

function createFirstSlide(background) {
  driver.addSlide(background);
  driver.addBubbles();

  const line = driver.addLine();

  const text = driver.addText('Prédication', 'chapterTitle');
  driver.setFadeMoveEffect({ duration: 0.5, distance: 10 });
  driver.setEffectStartup('afterPrevious');

  const contentHeight = text.height() + 64;
  const y = (documentHeight - contentHeight) / 2;
  driver.setElementY(text, y);
  driver.setElementY(line, y + text.height() + 64);
}

function createSecondAndThirdSlideElements(
  title,
  author,
  bibleRef,
  contentWidth = documentWidth,
  withAnimation = true,
) {
  const line = driver.addLine({ width: 500, withAnimation: false });
  const chapterTextItem = driver.addText('Prédication', 'chapterTitle', {
    size: 60,
  });

  driver.setElementX(
    chapterTextItem,
    (contentWidth - chapterTextItem.width()) / 2,
  );
  driver.setElementY(chapterTextItem, 150);
  driver.setElementX(line, (contentWidth - 500) / 2);
  driver.setElementY(line, 150 + chapterTextItem.height() + 32);

  let finalTitle;
  if (title) finalTitle = formatTitle(title);
  else finalTitle = `${bibleRef.book} ${bibleRef.chapterStart}`;

  const titleTextItem = driver.addText(`« ${finalTitle} »`, 'sermonTitle');
  driver.setElementX(titleTextItem, (contentWidth - titleTextItem.width()) / 2);

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
    driver.setEffectStartup('afterPrevious');
  }

  const bibleRefTextItem = driver.addText(format(bibleRef), 'sermonBibleRef');

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
    driver.setEffectStartup('withPrevious', 0.2);
  }

  const authorTextItem = driver.addText(author, 'sermonAuthor');

  if (withAnimation) {
    driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
    driver.setEffectStartup('withPrevious', 0.2);
  }

  driver.setElementX(
    bibleRefTextItem,
    (contentWidth - bibleRefTextItem.width()) / 2,
  );
  driver.setElementY(bibleRefTextItem, 800);

  driver.setElementX(
    authorTextItem,
    (contentWidth - authorTextItem.width()) / 2,
  );
  driver.setElementY(authorTextItem, 800 + bibleRefTextItem.height());
}

function createSecondSlide(background, title, author, bibleRef) {
  driver.addSlide(background);
  driver.addBubbles(1);
  createSecondAndThirdSlideElements(title, author, bibleRef);
}

function createThirdSlide(background, title, author, bibleRef, plan) {
  driver.addSlide(background);
  driver.addBubbles(1);
  driver.addVerticalOverlays();

  createSecondAndThirdSlideElements(title, author, bibleRef, 900, false);

  const itemHeight = 220;
  const totalHeight = plan.length * itemHeight;
  const y = (documentHeight - totalHeight) / 2 - 32;

  _.forEach(plan, (item, index) => {
    const number = driver.addText(index + 1, 'sermonPlanNumber');
    driver.setElementX(number, 1130 - index * 20);
    driver.setElementY(number, y + index * itemHeight);
    driver.setFadeMoveEffect({
      duration: 0.5,
      direction: 'leftToRight',
      distance: 5,
    });

    const text = driver.addText(item, 'sermonPlanTitle');
    text.width = 500;
    driver.setTextAlignment(text, 'left');
    driver.setElementX(text, number.position().x + number.width() + 48);
    driver.setElementY(
      text,
      number.position().y + (number.height() - text.height()) / 2 + 16,
    );
    driver.setFadeMoveEffect({
      duration: 0.5,
      direction: 'bottomToTop',
      distance: 5,
    });
    driver.setEffectStartup('withPrevious', 0.1);
  });
}

function createSlide({ title, author, bibleRef, plan } = {}) {
  const background = driver.getNextRegularBackground();
  const parsedBibleRef = parse(bibleRef);

  createFirstSlide(background);

  if (!bibleRef) {
    return;
  }

  createSecondSlide(background, title, author, parsedBibleRef);

  if (plan) {
    createThirdSlide(background, title, author, parsedBibleRef, plan);
  }
}

export function createSermonSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
