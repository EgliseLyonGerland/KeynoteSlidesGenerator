import { upperFirst } from 'lodash';
import Driver from './Driver';

import AnnouncementGenerator from '../generators/announcementGenerator';
import ChapterGenerator from '../generators/chapterGenerator';
import GoodbyeGenerator from '../generators/goodbyeGenerator';
import SermonGenerator from '../generators/sermonGenerator';
import SongGenerator from '../generators/songGenerator';
import VerseGenerator from '../generators/verseGenerator';

const generators = {
  AnnouncementGenerator,
  ChapterGenerator,
  GoodbyeGenerator,
  SermonGenerator,
  SongGenerator,
  VerseGenerator,
};

export default class Document {
  constructor(documentName) {
    this.driver = new Driver(documentName);
  }

  generate(data) {
    data.forEach((block) => {
      const Generator = generators[`${upperFirst(block.type)}Generator`];
      const gen = new Generator(this.driver, block.data);
      gen.generate();
    });
  }
}
