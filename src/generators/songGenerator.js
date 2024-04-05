import _ from 'lodash';
import Generator from '../services/Generator';

function applyLyrics(elt, data, index) {
  elt.objectText
    = data.text
      .trim()
      .split('\n')
      .join(`${' '.repeat(index)}\n`) || ' ';

  if (data.type === 'chorus') {
    elt.objectText.font = 'AdobeHebrew-BoldItalic';
  }
}

export default class SongGenerator extends Generator {
  createTitleSlide() {
    const {
      title,
      copyright = '',
      authors = '',
      collection = '',
      lyrics,
    } = this.data;

    this.driver.addSlideFromTemplate('song', 0);

    const titleElt = this.driver.findTextElement(/^Title:/);
    titleElt.objectText = title;

    const authorsElt = this.driver.findTextElement(/^Authors:/);
    authorsElt.objectText = authors || ' ';

    const extras = [];
    if (copyright) { extras.push(`© ${copyright}`); }
    if (collection) { extras.push(collection); }

    const creditsElt = this.driver.findTextElement(/^Credits:/);
    creditsElt.objectText = extras.join(' – ') || ' ';

    // Current lyrics
    const currentLyricsElt = this.driver.findTextElement(/^Current:/);
    applyLyrics(currentLyricsElt, lyrics[0], 0);

    // Next lyrics
    const nextLyricsElt = this.driver.findTextElement(/^Next:/);

    if (!lyrics[1]) {
      nextLyricsElt.delete();
    }
    else {
      applyLyrics(nextLyricsElt, lyrics[1], 1);
    }
  }

  generate() {
    const { repeat = false, song } = this.data;

    let lyrics
      = this.data.lyrics
      || song.lyrics
      || console.error(`No lyrics for the song ${song.title}`);

    if (repeat) {
      lyrics = [...lyrics, ...lyrics];
    }

    this.createTitleSlide();

    _.forEach(lyrics, (current, index) => {
      this.driver.addSlideFromTemplate('song', 1);

      const previousElt = this.driver.findTextElement(/^Previous:/);

      if (index === 0) {
        previousElt.delete();
      }
      else {
        applyLyrics(previousElt, lyrics[index - 1], index - 1);
      }

      const currentElt = this.driver.findTextElement(/^Current:/);
      const nextElt = this.driver.findTextElement(/^Next:/);
      const afterNextElt = this.driver.findTextElement(/^AfterNext:/);

      applyLyrics(currentElt, current, index);

      if (!lyrics[index + 1]) {
        nextElt.delete();
        afterNextElt.delete();
        return;
      }

      applyLyrics(nextElt, lyrics[index + 1], index + 1);

      if (!lyrics[index + 2]) {
        afterNextElt.delete();
        return;
      }

      applyLyrics(afterNextElt, lyrics[index + 2], index + 2);
    });

    // End slide
    this.driver.addSlideFromTemplate('song', 2);

    const previousElt = this.driver.findTextElement(/^Previous:/);
    const lastIndex = lyrics.length - 1;
    applyLyrics(previousElt, lyrics[lastIndex], lastIndex);

    if (this.nextBlock?.type !== 'song') {
      this.driver.addSlide('bg6');
    }
  }
}
