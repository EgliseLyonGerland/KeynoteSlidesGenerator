import Generator from '../services/Generator';
import { parse } from '../utils/bibleRef';

let currentTemplateIndex = 0;

export default class VerseGenerator extends Generator {
  init() {
    this.totalTemplates
      = this.driver.templates.verse[1] - this.driver.templates.verse[0];
  }

  getNextTemplateIndex() {
    const previousIndex = currentTemplateIndex;
    currentTemplateIndex += 1;

    if (currentTemplateIndex > this.totalTemplates) {
      currentTemplateIndex = 0;
    }

    return previousIndex;
  }

  generate() {
    const { id: bibleRef, excerpt } = this.data;

    const templateIndex = this.getNextTemplateIndex();

    this.driver.addSlideFromTemplate('verse', templateIndex);

    const titleElt = this.driver.findTextElement(/^Title:/);
    const excerptElt = this.driver.findTextElement(/^Description:/);

    if (titleElt === null || excerptElt === null) {
      throw new Error(`Verse template #${templateIndex} is misformatted`);
    }

    const parsedBibleRef = parse(bibleRef);

    let bibleRefText = `${parsedBibleRef.book} ${parsedBibleRef.chapterStart}`;
    if (parsedBibleRef.verseStart && !parsedBibleRef.verseEnd) {
      bibleRefText += ` • ${parsedBibleRef.verseStart}`;
    }
    else if (parsedBibleRef.verseStart && parsedBibleRef.verseEnd) {
      bibleRefText += ` • ${parsedBibleRef.verseStart}–${parsedBibleRef.verseEnd}`;
    }

    titleElt.objectText = bibleRefText;

    excerptElt.objectText = `« ${excerpt} »`;
  }
}
