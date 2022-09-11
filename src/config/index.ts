/**
 * Fonts:
 *
 *  - SourceSansPro-SemiBold
 *  - SourceSansPro-Bold
 *  - SourceSansPro-Black
 *  - AdobeHebrew-BoldItalic
 */

export type SlideType =
  | 'welcome'
  | 'phone'
  | 'announcement'
  | 'section'
  | 'goodbye'
  | 'sermon'
  | 'song'
  | 'verse'
  | 'openDoors';

export const templateRanges: Record<string, [number, number]> = Object.entries({
  welcome: 2,
  phone: 1,
  announcements: 1,
  verse: 4,
  openDoors: 3,
  goodbye: 3,
  sermon: 4,
  song: 3,
  section: 1,
})
  .reduce<[string, number, number][]>((acc, [key, count]) => {
    const prevIndex = acc[acc.length - 1]?.[2] ?? -1;
    acc.push([key, prevIndex + 1, count + prevIndex]);

    return acc;
  }, [])
  .reduce((acc, [key, ...rest]) => ({ ...acc, [key]: rest }), {});

export const regularBackgroundsNumber = 12;
export const documentWidth = 1920;
export const documentHeight = 1080;
