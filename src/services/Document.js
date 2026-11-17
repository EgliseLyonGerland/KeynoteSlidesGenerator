import { upperFirst } from 'lodash';
import kleur from 'kleur';

import AnnouncementsGenerator from '../generators/announcementsGenerator';
import SectionGenerator from '../generators/sectionGenerator';
import SlideGenerator from '../generators/slideGenerator';
import OpenDoorsGenerator from '../generators/openDoorsGenerator';
import SermonGenerator from '../generators/sermonGenerator';
import SongGenerator from '../generators/songGenerator';
import VerseGenerator from '../generators/verseGenerator';
import GoodbyeGenerator from '../generators/goodbyeGenerator';
import RecitationGenerator from '../generators/recitationGenerator';
import { options } from '../config';
import Driver from './Driver';

const generators = {
  AnnouncementsGenerator,
  SectionGenerator,
  SlideGenerator,
  OpenDoorsGenerator,
  SermonGenerator,
  SongGenerator,
  VerseGenerator,
  GoodbyeGenerator,
  RecitationGenerator,
};

const { slide, from, to } = options;

export function validateEntry(entry) {
  if (!entry || !Array.isArray(entry.slides)) {
    throw new Error('Le fichier .json n’est pas valide');
  }

  entry.slides.forEach((block, index) => {
    if (
      !block
      || typeof block.type !== 'string'
      || !Object.prototype.hasOwnProperty.call(generators, `${upperFirst(block.type)}Generator`)
      || !block.data
      || typeof block.data !== 'object'
      || Array.isArray(block.data)
    ) {
      throw new Error(`Le bloc ${index + 1} du fichier .json est invalide (type ou données).`);
    }
  });
}

export default class Document {
  constructor() {
    this.driver = new Driver();
  }

  generate(data) {
    console.log('Start generating');

    data.forEach((block, index) => {
      const number = index + 1;
      const title = ` • Slide #${number} (${block.type})`;

      if (
        (slide && slide !== number)
        || (from && from > number)
        || (to && to < number)
      ) {
        console.log(title, kleur.red('skipped'));
        return;
      }

      console.log(title);

      const Generator = generators[`${upperFirst(block.type)}Generator`];
      const gen = new Generator(this.driver, block.data);
      gen.setPreviousBlock(data[index - 1] || null);
      gen.setNextBlock(data[index + 1] || null);
      if (gen.init) {
        gen.init();
      }
      gen.generate();
    });

    console.log('Done generating');
  }
}
