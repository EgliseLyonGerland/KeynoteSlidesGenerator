import Generator from '../services/Generator';

export default class GoodbyeGenerator extends Generator {
  generate() {
    const { name, from = 0, to = Infinity } = this.data;

    if (!this.driver.templates[name]) {
      throw new Error(`Template ${name} not found`);
    }
    if (from > to) {
      throw new Error('`from` must be lower or equal than `to`');
    }

    const template = this.driver.templates[name];
    const max = Math.min(to, template[1] - template[0]);

    for (let i = from; i <= max; i += 1) {
      this.driver.addSlideFromTemplate(name, i);
    }
  }
}
