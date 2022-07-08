/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { range } from 'lodash';
import Generator from '../services/Generator';

export default class AnnouncementsGenerator extends Generator {
  generate() {
    this.driver.addSlideFromTemplate('announcements', 0);

    const textElt = this.driver.findTextElement(/^Lorem ipsum/);

    const { items = [] } = this.data;

    textElt.objectText = '';

    const detailIndexes = [];

    items.forEach(({ title, detail }) => {
      textElt.objectText = `${textElt.objectText()}${title}`;
      textElt.objectText = `${textElt.objectText()}${String.fromCharCode(
        8232,
      )}`;

      const currentIndex = textElt.objectText().length - 1;

      textElt.objectText = `${textElt.objectText()}${detail
        .split('\n')
        .join(String.fromCharCode(8232))}`;

      detailIndexes.push([currentIndex, textElt.objectText().length - 1]);

      textElt.objectText = `${textElt.objectText()}\n`;
    });

    const defaultSize = textElt.objectText.characters[0].size();

    detailIndexes.forEach(([from, to]) => {
      range(from, to + 1).forEach((i) => {
        textElt.objectText.characters[i].font = 'SourceSansPro-Regular';
        textElt.objectText.characters[i].size = defaultSize * 0.9;
      });
    });
  }
}
