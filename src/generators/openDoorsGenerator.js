// import { minBy, maxBy } from 'lodash';
// import { documentHeight, documentWidth } from '../config';
import Generator from '../services/Generator';

// const locations = [
//   'top',
//   'bottom',
//   'left',
//   'right',
//   'topLeft',
//   'topRight',
//   'bottomLeft',
//   'bottomRight',
//   'vcenter',
//   'hcenter',
// ];

// function move(elements, location) {
//   // const x =

//   const offsetProp = vertical ? 'y' : 'x';
//   const sizeProp = vertical ? 'height' : 'width';
//   const documentSize = vertical ? documentHeight : documentWidth;
//   const funcName = `setElement${offsetProp.toUpperCase()}`;

//   const first = minBy(elements, (element) => element.position()[offsetProp]);
//   const last = maxBy(elements, (element) => element.position()[offsetProp]);

//   const offset = first.position()[offsetProp];
//   const size = last.position()[offsetProp] + last[sizeProp]();
//   const delta = (documentSize - size) / 2 - offset;

//   elements.forEach((element) => {
//     this.driver[funcName](element, element.position()[offsetProp] - delta);
//   });
// }

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

    this.driver.setElementY(titleElt, 80);
    this.distribute([titleElt, descElt], { vertical: true, spacing: 32 });

    const objects = [0, 1, 2].reduce((acc, index) => {
      const topic = this.driver.findTextElement(`Topic${index + 1}:`);

      const separator = index
        ? this.driver.findElement(
            (element) => element.width() === 164,
            index - 1,
            'shape',
          )
        : null;

      // if (!(index in prayerTopics)) {
      //   if (separator) {
      //     this.driver.deleteElement(separator);
      //   }

      //   // this.driver.deleteElement(topic);

      //   return acc;
      // }

      topic.objectText = prayerTopics[index];

      return acc.concat(separator ? [separator, topic] : [topic]);
    }, []);

    this.distribute(objects, { vertical: true, spacing: 64 });

    // center(all, { vertical: true });

    this.driver.addSlideFromTemplate('openDoors', 2);
  }
}
