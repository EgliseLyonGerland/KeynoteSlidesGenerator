const { format, endOfWeek, addDays } = require('date-fns');
const locale = require('date-fns/locale/fr');
const _ = require('lodash');

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

let nextSunday = addDays(new Date(), 7);
nextSunday = endOfWeek(nextSunday, { weekStartsOn: 1 });
if (nextSunday.getDate() === 1) {
  nextSunday = format(nextSunday, "EEEE '1er' MMMM", { locale });
} else {
  nextSunday = format(nextSunday, 'EEEE d MMMM', { locale });
}

createAnnouncementSlide({
  items: [
    {
      title: _.capitalize(nextSunday),
      detail: 'Culte à 10h au théâtre « Lulu sur la colline »',
    },
    {
      title: 'Groupes de maison',
      detail: 'Date reprise à déterminer',
    },
    {
      title: 'Samedi 14 septembre',
      detail: 'Retraite de rentrée au Chatelard',
    },
    {
      title: 'Dimanche 22 septembre',
      detail: 'Groupe d’ados à partir de 12h30',
    },
  ],
});

createVerseSlide({
  bibleRef: 'Ésaïe 55.1-3a',
  excerpt: 'Ô vous tous qui avez soif, venez vers les eaux.',
  direction: 'leftRight',
});

createSongSlide('nous-tadorons-o-pere');

createVerseSlide({
  bibleRef: 'Matthieu 15.1-20',
  excerpt:
    'C’est du cœur que viennent les mauvaises pensées, meurtres, adultères, prostitutions, vols, faux témoignages, blasphèmes.',
  direction: 'topBottom',
  align: 'left',
});

createSongSlide('psaume-6');

createVerseSlide({
  bibleRef: 'Osée 6.1-3',
  excerpt:
    'Il viendra pour nous comme une ondée, comme la pluie du printemps qui arrose la terre.',
  direction: 'bottomTop',
  align: 'left',
});

createSongSlide('psaume-42');
createSongSlide('viens-o-source-intarissable');
createSongSlide('psaume-84');

createVerseSlide({
  bibleRef: 'Psaume 42.2-6',
  excerpt: 'Mon âme a soif de Dieu, du Dieu vivant.',
  direction: 'topBottom',
});

createSongSlide('jai-soif-de-ta-presence');
createSongSlide('ton-nom-est-admirable', { repeat: true });

createSermonSlide({
  author: 'Gethin Jones',
  bibleRef: 'Jean 4.1-26',
  title: 'La quête de Dieu',
  // plan: [
  //   'La prière reflète notre dépendance',
  //   'La prière reflète notre confiance',
  //   'La prière reflète notre confiance',
  // ],
});

createSongSlide('vers-toi-seigneur', { repeat: true });

createChapterSlide({ title: 'Sainte cène' });

createSongSlide('le-seigneur-regne');

createVerseSlide({
  bibleRef: 'Ésaïe 55.6',
  excerpt:
    'Cherchez l’Éternel pendant qu’il se trouve ; invoquez-le tandis qu’il est près.',
  direction: 'rightLeft',
});

createGoodbyeSlide();
