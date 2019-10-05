const { createDriver } = require('./driver');
const { createSongSlideGenerator } = require('./generators/songSlide');
const { createVerseSlideGenerator } = require('./generators/verseSlide');
const { createGoodbyeSlideGenerator } = require('./generators/goodbyeSlide');
const { createChapterSlideGenerator } = require('./generators/chapterSlide');
const { createSermonSlideGenerator } = require('./generators/sermonSlide');
const {
  createAnnouncementSlideGenerator,
} = require('./generators/announcementSlide');

const driver = createDriver();

const createSongSlide = createSongSlideGenerator(driver);
const createVerseSlide = createVerseSlideGenerator(driver);
const createAnnouncementSlide = createAnnouncementSlideGenerator(driver);
const createGoodbyeSlide = createGoodbyeSlideGenerator(driver);
const createChapterSlide = createChapterSlideGenerator(driver);
const createSermonSlide = createSermonSlideGenerator(driver);
