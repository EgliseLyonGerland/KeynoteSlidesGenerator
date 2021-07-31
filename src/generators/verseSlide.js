import { debugElements } from '../utils/debugElements';

const _ = require('lodash');
const { documentHeight } = require('../config');
const { parse } = require('../utils/bibleRef');

let driver;

const firstTemplateIndex = 3;
const lastTemplateIndex = 6;

let currentTemplateIndex = firstTemplateIndex;

function getNextTemplateIndex() {
  const previousIndex = currentTemplateIndex;
  currentTemplateIndex += 1;

  if (currentTemplateIndex > lastTemplateIndex) {
    currentTemplateIndex = firstTemplateIndex;
  }

  return previousIndex;
}

function createSlide({ bibleRef, excerpt }) {
  const templateIndex = getNextTemplateIndex();

  driver.doc.slides[templateIndex].duplicate();
  driver.doc.currentSlide.skipped = false;

  const [titleElt, excerptElt] = _.reduce(
    driver.doc.currentSlide.textItems,
    (acc, curr) => {
      if (curr.objectText().startsWith('Title:')) {
        acc[0] = curr;
      } else if (curr.objectText().startsWith('Description:')) {
        acc[1] = curr;
      }

      return acc;
    },
    [null, null],
  );

  if (titleElt === null || excerptElt === null) {
    throw new Error(`Verse template #${templateIndex} is misformatted`);
  }

  const parsedBibleRef = parse(bibleRef);

  let bibleRefText = `${parsedBibleRef.book} ${parsedBibleRef.chapterStart}`;
  if (parsedBibleRef.verseStart && !parsedBibleRef.verseEnd) {
    bibleRefText += ` • ${parsedBibleRef.verseStart}`;
  } else if (parsedBibleRef.verseStart && parsedBibleRef.verseEnd) {
    bibleRefText += ` • ${parsedBibleRef.verseStart}–${parsedBibleRef.verseEnd}`;
  }

  titleElt.objectText = bibleRefText;
  excerptElt.objectText = `« ${excerpt} »`;

  const elements = [titleElt];
  if (driver.doc.currentSlide.shapes.length) {
    elements.push(driver.doc.currentSlide.shapes[0]);
  }
  elements.push(excerptElt);

  const totalHeight =
    excerptElt.position().y + excerptElt.height() - titleElt.position().y;

  const y = Math.floor((documentHeight - totalHeight) / 2);
  const delta = y - titleElt.position().y;

  _.forEach(elements, (element) => {
    driver.setElementY(element, element.position().y + delta);
  });
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
