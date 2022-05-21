import { upperFirst } from 'lodash';
import Driver from './Driver';

import AnnouncementsGenerator from '../generators/announcementsGenerator';
import SectionGenerator from '../generators/sectionGenerator';
import GoodbyeGenerator from '../generators/goodbyeGenerator';
import OpenDoorsGenerator from '../generators/openDoorsGenerator';
import SermonGenerator from '../generators/sermonGenerator';
import SongGenerator from '../generators/songGenerator';
import VerseGenerator from '../generators/verseGenerator';

const generators = {
  AnnouncementsGenerator,
  SectionGenerator,
  GoodbyeGenerator,
  OpenDoorsGenerator,
  SermonGenerator,
  SongGenerator,
  VerseGenerator,
};

export default class Document {
  constructor(documentName) {
    this.driver = new Driver(documentName);
  }

  generate(data) {
    data.forEach((block, index) => {
      const Generator = generators[`${upperFirst(block.type)}Generator`];
      const gen = new Generator(this.driver, block.data);
      gen.setPreviousBlock(data[index - 1] || null);
      gen.setNextBlock(data[index + 1] || null);
      gen.generate();
    });
  }
}
