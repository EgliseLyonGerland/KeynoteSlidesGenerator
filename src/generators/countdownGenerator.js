import { documentHeight } from '../config';

let driver;

function getDigits(value) {
  const seconds = value % 60;
  const second2 = seconds % 10;
  const second1 = Math.floor(seconds / 10);

  const minutes = (value - seconds) / 60;
  const minute2 = minutes % 10;
  const minute1 = Math.floor(minutes / 10);

  return { minute1, minute2, second1, second2 };
}

function createSlide() {
  const duration = 300;

  driver.addSlide();

  const initialDigits = getDigits(duration);

  let minute1 = driver.addText(initialDigits.minute1);
  driver.setElementXY(minute1, 816, documentHeight / 2);
  driver.setDissolveEffect({ duration: 0.7 });
  driver.setEffectStartup('withPrevious', 0.1);

  let minute2 = driver.addText(initialDigits.minute2);
  driver.setElementXY(minute2, 877, documentHeight / 2);
  driver.setDissolveEffect({ duration: 0.7 });
  driver.setEffectStartup('withPrevious', 0.1);

  const colon = driver.addText(':');
  driver.setElementXY(colon, 946, documentHeight / 2);
  driver.setDissolveEffect({ duration: 0.7 });
  driver.setEffectStartup('withPrevious', 0.1);

  let second1 = driver.addText(initialDigits.second1);
  driver.setElementXY(second1, 983, documentHeight / 2);
  driver.setDissolveEffect({ duration: 0.7 });
  driver.setEffectStartup('withPrevious', 0.1);

  let second2 = driver.addText(initialDigits.second2);
  driver.setElementXY(second2, 1043, documentHeight / 2);
  driver.setDissolveEffect({ duration: 0.7 });
  driver.setEffectStartup('withPrevious', 0.1);

  for (let i = 0; i < duration; i += 1) {
    const digits = getDigits(duration - i - 1);

    driver.selectElement(second2);
    driver.setFadeScaleOutEffect({ duration: 0.4, scale: 50 });
    driver.setEffectStartup('withPrevious', 0.6);

    second2 = driver.addText(digits.second2);
    driver.setElementXY(second2, 1043, documentHeight / 2);
    driver.setFadeScaleEffect({ duration: 0.4, scale: 150 });
    driver.setEffectStartup('withPrevious');

    if (digits.second2 === 9) {
      driver.selectElement(second1);
      driver.setFadeScaleOutEffect({ duration: 0.4, scale: 50 });
      driver.setEffectStartup('withPrevious');

      second1 = driver.addText(digits.second1);
      driver.setElementXY(second1, 983, documentHeight / 2);
      driver.setFadeScaleEffect({ duration: 0.4, scale: 150 });
      driver.setEffectStartup('withPrevious');

      if (digits.second1 === 5) {
        driver.selectElement(minute2);
        driver.setFadeScaleOutEffect({ duration: 0.4, scale: 50 });
        driver.setEffectStartup('withPrevious');

        minute2 = driver.addText(digits.minute2);
        driver.setElementXY(minute2, 877, documentHeight / 2);
        driver.setFadeScaleEffect({ duration: 0.4, scale: 150 });
        driver.setEffectStartup('withPrevious');

        if (digits.minute2 === 9) {
          driver.selectElement(minute1);
          driver.setFadeScaleOutEffect({ duration: 0.4, scale: 50 });
          driver.setEffectStartup('withPrevious');

          minute1 = driver.addText(digits.minute1);
          driver.setElementXY(minute1, 816, documentHeight / 2);
          driver.setFadeScaleEffect({ duration: 0.4, scale: 150 });
          driver.setEffectStartup('withPrevious');
        }
      }
    }
  }
}

export function createCountdownSlideGenerator(driver_) {
  driver = driver_;

  return createSlide;
}

export default null;
