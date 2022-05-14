import _ from 'lodash';
import Generator from '../services/Generator';

export default class SongGenerator extends Generator {
  createTitleSlide() {
    const { title, copyright = '', authors = '', collection = '' } = this.data;

    this.driver.addSlideFromTemplate('song', 0);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const authorsElt = this.driver.findTextElement(/^Authors:/);
    authorsElt.objectText = authors || ' ';

    const extras = [];
    if (copyright) extras.push(`© ${copyright}`);
    if (collection) extras.push(collection);

    const creditsElt = this.driver.findTextElement(/^Credits:/);
    creditsElt.objectText = extras.join(' – ') || ' ';
  }

  addLyrics(lyrics, index) {
    const lines = lyrics.text.split('\n');
    const format = lyrics.type === 'chorus' ? 'songChorus' : 'songVerse';
    const text = lines.join(`${' '.repeat(index)}\n`);

    return this.driver.addText(text, format);
  }

  addNextLyrics(lyrics, index) {
    const textItem = this.addLyrics(lyrics, index);
    textItem.opacity = index ? 50 : 0;
    this.driver.setElementY(textItem, 648);

    if (index) {
      // Put text in background
      this.driver.press('b', { shift: true, command: true });
    }
  }

  addOverNextLyrics(lyrics, index) {
    const textItem = this.addLyrics(lyrics, index);

    textItem.opacity = index ? 50 : 0;
    this.driver.setElementY(textItem, 648 * 2);

    // Put text in background
    this.driver.press('b', { shift: true, command: true });
  }

  addCurrentLyrics(lyrics, index) {
    const textItem = this.addLyrics(lyrics, index);
    const y = (600 - textItem.height()) / 2;

    this.driver.setElementY(textItem, y);
  }

  generate() {
    const { repeat = false, lyrics } = this.data;

    this.createTitleSlide();

    _.forEach(repeat ? [...lyrics, ...lyrics] : lyrics, (part, index) => {
      this.addNextLyrics(part, index);

      if (lyrics[index + 1]) {
        this.addOverNextLyrics(lyrics[index + 1], index + 1);
      }

      this.driver.addSlide('backgroundSong');
      this.addCurrentLyrics(part, index);
    });

    if (this.nextBlock?.type !== 'song') {
      this.driver.addSlide('backgroundSong');
    }
  }
}
