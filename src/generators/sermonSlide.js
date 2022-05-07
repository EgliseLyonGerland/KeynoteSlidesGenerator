const { format } = require('../utils/bibleRef');

let driver;

function createFirstSlide(title, bibleRef) {
  driver.addSlideFromTemplate('sermon', 0);

  const titleElt = driver.findTextElement(/^Title:/);
  titleElt.objectText = title;

  const refElt = driver.findTextElement(/^Ref:/);
  refElt.objectText = format(bibleRef);
}

function createSecondSlide(title, bibleRef, plan) {
  driver.addSlideFromTemplate('sermon', 1);

  const titleElt = driver.findTextElement(/^Title:/);
  titleElt.objectText = title;

  const refElt = driver.findTextElement(/^Ref:/);
  refElt.objectText = format(bibleRef);

  const planTxt = plan.map((item) => item.replace('(v. ', '(')).join('\n');

  for (let i = 0; i < 2; i += 1) {
    const planElt = driver.findTextElement(/^Plan:/);
    planElt.objectText = planTxt;
  }
}

function createThirdSlide(title, bibleRef) {
  driver.addSlideFromTemplate('sermon', 2);

  const titleElt = driver.findTextElement(/^Title:/);
  titleElt.objectText = title;

  const refElt = driver.findTextElement(/^Ref:/);
  refElt.objectText = format(bibleRef);
}

function createSlide({ title, bibleRef, plan = [] } = {}) {
  createFirstSlide(title, bibleRef);

  if (plan.length) {
    createSecondSlide(title, bibleRef, plan);
  }

  createThirdSlide(title, bibleRef);
}

export function createSermonSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
