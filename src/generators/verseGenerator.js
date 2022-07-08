import Generator from '../services/Generator';
import { parse } from '../utils/bibleRef';
import { templateRanges } from '../config';

const totalTemplates = templateRanges.verse[1] - templateRanges.verse[0];

let currentTemplateIndex = 0;

function getNextTemplateIndex() {
  const previousIndex = currentTemplateIndex;
  currentTemplateIndex += 1;

  if (currentTemplateIndex > totalTemplates) {
    currentTemplateIndex = 0;
  }

  return previousIndex;
}

export default class VerseGenerator extends Generator {
  generate() {
    const { id: bibleRef, excerpt } = this.data;

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
