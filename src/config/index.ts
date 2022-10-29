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

export const regularBackgroundsNumber = 12;
export const documentWidth = 1920;
export const documentHeight = 1080;

export const options = JSON.parse(process.env.OPTIONS || '{}') as {
  slide?: number;
  from?: number;
  to?: number;
};
