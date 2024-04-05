import { format } from '../utils/bibleRef';
import Generator from '../services/Generator';

export default class SermonGenerator extends Generator {
  generateFirstSlide() {
    const { title, bibleRef } = this.data;

    this.driver.addSlideFromTemplate('sermon', 0);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const refElt = this.driver.findTextElement(/^Ref:/);
    refElt.objectText = bibleRef;
  }

  generateSecondSlide() {
    const { title, bibleRef, plan } = this.data;

    if (plan.length === 0) {
      return;
    }

    this.driver.addSlideFromTemplate('sermon', 1);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const refElt = this.driver.findTextElement(/^Ref:/);
    refElt.objectText = bibleRef;

    const planTxt = plan
      .map(item => item.text.replace('(v. ', '(v. '))
      .join('\n');

    for (let i = 0; i < 2; i += 1) {
      const planElt = this.driver.findTextElement(/^Plan:/);
      planElt.objectText = planTxt;
    }
  }

  generateThirdSlide() {
    const { title, bibleRef } = this.data;

    this.driver.addSlideFromTemplate('sermon', 2);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const refElt = this.driver.findTextElement(/^Ref:/);
    refElt.objectText = bibleRef;
  }

  generate() {
    const { bibleRefs } = this.data;

    this.data.bibleRef = format(bibleRefs[0].id);

    this.generateFirstSlide();
    this.generateSecondSlide();
    this.generateThirdSlide();

    this.driver.addSlideFromTemplate('sermon', 3);
  }
}
