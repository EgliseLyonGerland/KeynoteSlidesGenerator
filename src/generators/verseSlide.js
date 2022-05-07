const { parse } = require('../utils/bibleRef');
const { templateRanges } = require('../config');

let driver;

let currentTemplateIndex = templateRanges.verse[0];

function getNextTemplateIndex() {
  const previousIndex = currentTemplateIndex;
  currentTemplateIndex += 1;

  if (currentTemplateIndex > templateRanges.verse[1]) {
    [currentTemplateIndex] = templateRanges.verse;
  }

  return previousIndex;
}

function createSlide({ bibleRef, excerpt }) {
  const templateIndex = getNextTemplateIndex();

  driver.addSlideFromTemplate('verse', templateIndex);

  const titleElt = driver.findTextElement(/^Title:/);
  const excerptElt = driver.findTextElement(/^Description:/);

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
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
