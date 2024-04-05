/* eslint-disable no-param-reassign */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { range } from 'lodash';
import Generator from '../services/Generator';

export function createText(textElt, items) {
  textElt.objectText = '';

  const titleIndexes = [];

  items.forEach(({ title, detail }) => {
    const currentIndex = Math.max(0, textElt.objectText().length - 1);

    textElt.objectText = `${textElt.objectText()}${title.trim()}`;

    titleIndexes.push([currentIndex, textElt.objectText().length - 1]);

    textElt.objectText = `${textElt.objectText()}${String.fromCharCode(8232)}`;
    textElt.objectText = `${textElt.objectText()}${detail
      .trim()
      .split('\n')
      .join(String.fromCharCode(8232))}`;

    textElt.objectText = `${textElt.objectText()}\n`;
  });

  return Promise.all(
    titleIndexes.reduce(
      (acc, [from, to]) => [
        ...acc,
        ...range(from, to + 1).map(
          (i) =>
            new Promise((resolve) => {
              textElt.objectText.characters[i].font = 'SourceSansPro-Bold';
              textElt.objectText.characters[i].color = [65535, 65535, 65535];
              resolve();
            }),
        ),
      ],
      [],
    ),
  );
}

export default class AnnouncementsGenerator extends Generator {
  async generate() {
    this.driver.addSlideFromTemplate('announcements', 0);

    const textElt = this.driver.findTextElement(/^Lorem ipsum/);
    const { items = [] } = this.data;

    await createText(textElt, items);
  }
}
