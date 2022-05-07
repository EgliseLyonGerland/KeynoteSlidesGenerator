let driver;

function createSlide({ title }) {
  driver.addSlideFromTemplate('chapter', 0);

  const titleElt = driver.findTextElement(/^Title:/);
  titleElt.objectText = title;
}

export function createChapterSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
