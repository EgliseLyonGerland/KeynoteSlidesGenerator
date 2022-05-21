import Generator from '../services/Generator';

export default class SectionGenerator extends Generator {
  generate() {
    const { title } = this.data;

    this.driver.addSlideFromTemplate('section', 0);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;
  }
}
