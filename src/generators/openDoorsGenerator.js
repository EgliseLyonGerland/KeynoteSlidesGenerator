import Generator from '../services/Generator';

export default class OpenDoorsGenerator extends Generator {
  distribute(elements, { vertical = false, spacing = 0 } = {}) {
    if (elements.length < 2) {
      return;
    }

    const offsetProp = vertical ? 'y' : 'x';
    const sizeProp = vertical ? 'height' : 'width';
    const funcName = `setElement${offsetProp.toUpperCase()}`;

    const [firstElement] = elements;

    let currentOffset = firstElement.position()[offsetProp];

    elements.forEach((element) => {
      this.driver[funcName](element, currentOffset);
      currentOffset += element[sizeProp]() + spacing;
    });
  }

  generate() {
    const { title, detail, prayerTopics } = this.data;

    this.driver.addSlideFromTemplate('openDoors', 0);
    this.driver.addSlideFromTemplate('openDoors', 1);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const descElt = this.driver.findTextElement(/^Description:/);
    descElt.objectText = detail;

    this.distribute([titleElt, descElt], { vertical: true, spacing: 32 });

    const topicsElt = this.driver.findTextElement('Topics:');
    topicsElt.objectText = prayerTopics.map(topic => topic.text).join('\n\n');

    this.driver.addSlideFromTemplate('openDoors', 2);
  }
}
