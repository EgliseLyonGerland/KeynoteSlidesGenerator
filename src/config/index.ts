/**
 * Fonts:
 *
 *  - SourceSansPro-SemiBold
 *  - SourceSansPro-Bold
 *  - SourceSansPro-Black
 *  - AdobeHebrew-BoldItalic
 */

type Typography = Record<
  string,
  {
    font: string;
    size: number;
    opacity?: number;
  }
>;

export type SlideType =
  | 'announcement'
  | 'chapter'
  | 'goodbye'
  | 'sermon'
  | 'song'
  | 'verse';

export const templateRanges: Partial<Record<SlideType, [number, number]>> = {
  verse: [3, 6],
  goodbye: [10, 11],
};

export const typography: Typography = {
  title: {
    font: 'SourceSansPro-Black',
    size: 90,
  },
  announcementItemTitle: {
    font: 'SourceSansPro-Bold',
    size: 50,
  },
  announcementItemDetail: {
    font: 'SourceSansPro-SemiBold',
    size: 40,
    opacity: 70,
  },
  verseTitle: {
    font: 'SourceSansPro-Black',
    size: 90,
  },
  verseSubtitle: {
    font: 'SourceSansPro-Regular',
    size: 90,
    opacity: 80,
  },
  verseExcerpt: {
    font: 'AdobeHebrew-BoldItalic',
    size: 90,
  },
  songTitle: {
    font: 'AdobeHebrew-BoldItalic',
    size: 80,
  },
  songAuthors: {
    font: 'SourceSansPro-SemiBold',
    size: 50,
    opacity: 70,
  },
  songExtras: {
    font: 'SourceSansPro-Regular',
    size: 40,
    opacity: 40,
  },
  songVerse: {
    font: 'SourceSansPro-SemiBold',
    size: 66,
  },
  songChorus: {
    font: 'AdobeHebrew-BoldItalic',
    size: 66,
  },
  goodbyeLine1: {
    font: 'SourceSansPro-Regular',
    size: 140,
    opacity: 70,
  },
  goodbyeLine2: {
    font: 'SourceSansPro-Black',
    size: 140,
    opacity: 70,
  },
  goodbyeLine3: {
    font: 'SourceSansPro-Bold',
    size: 140,
    opacity: 70,
  },
  goodbyeAddress: {
    font: 'AdobeHebrew-BoldItalic',
    size: 50,
    opacity: 70,
  },
  chapterTitle: {
    font: 'SourceSansPro-Black',
    size: 90,
  },
  sermonTitle: {
    font: 'AdobeHebrew-BoldItalic',
    size: 80,
  },
  sermonBibleRef: {
    font: 'SourceSansPro-Bold',
    size: 60,
    opacity: 70,
  },
  sermonAuthor: {
    font: 'SourceSansPro-SemiBold',
    size: 40,
    opacity: 50,
  },
  sermonPlanNumber: {
    font: 'SourceSansPro-BlackItalic',
    size: 220,
    opacity: 20,
  },
  sermonPlanTitle: {
    font: 'AdobeHebrew-BoldItalic',
    size: 50,
    opacity: 80,
  },
  countdown: {
    font: 'Muli',
    size: 86,
  },
  openDoorsTitle: {
    font: 'BarlowCondensed-Bold',
    size: 65,
  },
  openDoorsDetail: {
    font: 'SourceSansPro-Regular',
    size: 46,
  },
  openDoorsPrayerTopicsHeadline: {
    font: 'BarlowCondensed-Bold',
    size: 55,
  },
  openDoorsPrayerTopic: {
    font: 'AdobeHebrew-Regular',
    size: 35,
  },
};

export const regularBackgroundsNumber = 12;
export const documentWidth = 1920;
export const documentHeight = 1080;
