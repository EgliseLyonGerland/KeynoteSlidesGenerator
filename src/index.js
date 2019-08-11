const { createDriver } = require('./driver');
const { createSongSlideGenerator } = require('./generators/songSlide');

const driver = createDriver();
const createSongSlide = createSongSlideGenerator(driver);

createSongSlide('comme-un-phare');
// createSongSlide('dieu-tres-saint');
// createSongSlide('psaume-95');
// createSongSlide('redempteur-admirable');
// createSongSlide('te-ressembler-jesus');
// createSongSlide('celebrez-jesus');
// createSongSlide('il-est-un-jour');
// createSongSlide('tu-me-veux-a-ton-service');
// createSongSlide('gloire-gloire-gloire');
