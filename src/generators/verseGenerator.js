import Generator from '../services/Generator';
import { parse } from '../utils/bibleRef';
import { templateRanges } from '../config';

function getNextTemplateIndex() {
  const previousIndex = VerseGenerator.currentTemplateIndex;
  VerseGenerator.currentTemplateIndex += 1;

  if (VerseGenerator.currentTemplateIndex > templateRanges.verse[1]) {
    [VerseGenerator.currentTemplateIndex] = templateRanges.verse;
  }

  return previousIndex;
}

export default class VerseGenerator extends Generator {
  static currentTemplateIndex = templateRanges.verse[0];

  generate() {
    const { bibleRef, excerpt } = this.data;

    const templateIndex = getNextTemplateIndex();

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
