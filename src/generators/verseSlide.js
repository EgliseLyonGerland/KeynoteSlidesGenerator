const { parse } = require('../utils/bibleRef');

let driver;

function createSlide({ bibleRef, excerpt }) {
  const parsedBibleRef = parse(bibleRef);

  const background = driver.getNextRegularBackground();
  driver.addSlide(background);

  const excerptElt = driver.addText(`“ ${excerpt} ”`, 'title', {
    font: 'AdobeHebrew-BoldItalic',
    size: 80,
  });

  excerptElt.width = 920;
  driver.setTextAlignment(excerptElt, 'left');
  driver.setElementX(excerptElt, 150);
  driver.setElementY(excerptElt, 150);
  driver.setDissolveEffect({ duration: 2, appears: 'byChar' });

  let bibleRefText = `—${parsedBibleRef.book} ${parsedBibleRef.chapterStart}`;
  if (parsedBibleRef.verseStart && !parsedBibleRef.verseEnd) {
    bibleRefText += ` • ${parsedBibleRef.verseStart}`;
  } else if (parsedBibleRef.verseStart && parsedBibleRef.verseEnd) {
    bibleRefText += ` • ${parsedBibleRef.verseStart}–${parsedBibleRef.verseEnd}`;
  }

  const bibleRefElt = driver.addText(bibleRefText, 'title', {
    font: 'SourceSansPro-Bold',
    size: 60,
    opacity: 70,
  });

  bibleRefElt.width = 880;
  driver.setTextAlignment(bibleRefElt, 'right');
  driver.setElementX(bibleRefElt, 150);
  driver.setElementY(
    bibleRefElt,
    excerptElt.position().y + excerptElt.height() + 30,
  );
  driver.setDissolveEffect({ duration: 0.7, appears: 'byChar' });
  driver.setEffectStartup('afterPrevious', 0.3);
}

export function createVerseSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
