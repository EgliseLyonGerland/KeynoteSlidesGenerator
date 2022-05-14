import Generator from '../services/Generator';

export default class ChapterGenerator extends Generator {
  generate() {
    const { title } = this.data;

    this.driver.addSlideFromTemplate('chapter', 0);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;
  }
}
