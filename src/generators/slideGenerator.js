import Generator from '../services/Generator';

export default class GoodbyeGenerator extends Generator {
  generate() {
    const { name, index = 0 } = this.data;

    this.driver.addSlideFromTemplate(name, index);
  }
}
