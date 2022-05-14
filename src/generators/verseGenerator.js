import Generator from '../services/Generator';
import { parse } from '../utils/bibleRef';
import { templateRanges } from '../config';

export default class VerseGenerator extends Generator {
  currentTemplateIndex = templateRanges.verse[0];

  getNextTemplateIndex() {
    const previousIndex = this.currentTemplateIndex;
    this.currentTemplateIndex += 1;

    if (this.currentTemplateIndex > templateRanges.verse[1]) {
      [this.currentTemplateIndex] = templateRanges.verse;
    }

    return previousIndex;
  }

  generate() {
    const { bibleRef, excerpt } = this.data;

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
    } else if (parsedBibleRef.verseStart && parsedBibleRef.verseEnd) {
      bibleRefText += ` • ${parsedBibleRef.verseStart}–${parsedBibleRef.verseEnd}`;
    }

    titleElt.objectText = bibleRefText;

    excerptElt.objectText = `« ${excerpt} »`;
  }
}
