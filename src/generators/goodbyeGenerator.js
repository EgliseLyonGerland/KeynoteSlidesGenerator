import Generator from '../services/Generator';

export default class GoodbyeGenerator extends Generator {
  generate() {
    this.driver.addSlideFromTemplate('goodbye', 0);
    this.driver.addSlideFromTemplate('goodbye', 1);
  }
}
