import { createDriver } from './driver';
import { createSongSlideGenerator } from './generators/songSlide';
import { createVerseSlideGenerator } from './generators/verseSlide';
import { createGoodbyeSlideGenerator } from './generators/goodbyeSlide';
import { createChapterSlideGenerator } from './generators/chapterSlide';
import { createSermonSlideGenerator } from './generators/sermonSlide';
import { createOpenDoorsSlideGenerator } from './generators/openDoorsSlide';
import { createAnnouncementSlideGenerator } from './generators/announcementSlide';

const driver = createDriver('Slides.key');

const createSongSlide = createSongSlideGenerator(driver);
const createVerseSlide = createVerseSlideGenerator(driver);
const createAnnouncementSlide = createAnnouncementSlideGenerator(driver);
const createGoodbyeSlide = createGoodbyeSlideGenerator(driver);
const createChapterSlide = createChapterSlideGenerator(driver);
const createSermonSlide = createSermonSlideGenerator(driver);
