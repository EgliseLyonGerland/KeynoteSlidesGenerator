let driver;

function createSlide() {
  driver.addSlideFromTemplate('goodbye', 0);
  driver.addSlideFromTemplate('goodbye', 1);
}

export function createGoodbyeSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
