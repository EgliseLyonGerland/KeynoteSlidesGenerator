import chalk from 'chalk';
import { format, setDefaultOptions } from 'date-fns';
import { snakeCase } from 'lodash';
import { fr } from 'date-fns/locale';
import invariant from 'tiny-invariant';
import entry from '../src/entry.json';

setDefaultOptions({ locale: fr });

function heading(str: string) {
  console.log(chalk.bold.cyan(str));
  nl();
}

function nl(size = 1) {
  console.log('\n'.repeat(size));
}

function separator() {
  console.log();
  console.log('────────────────────────────────────────────────');
  console.log();
}

interface BibleRef {
  raw: string
  book: string
  chapterStart: number
  verseStart: number | null
  chapterEnd: number | null
  verseEnd: number | null
}

export function parseRef(ref: string): BibleRef | null {
  /**
   * Examples:
   *
   *  - 1 Pierre
   *  - 1 Pierre 15
   *  - 1 Pierre 15-16
   *  - 1 Pierre 15.3
   *  - 1 Pierre 15.3-8
   *  - 1 Pierre 15.3-16.8
   */
  const exprs = [
    // {
    //   regExp: /^(.+?)$/,
    //   fields: ["book"]
    // },
    /^(?<book>.+?) *(?<chapterStart>\d+)$/,
    /^(?<book>.+?) *(?<chapterStart>\d+)-(?<chapterEnd>\d+)$/,
    /^(?<book>.+?) *(?<chapterStart>\d+)\.(?<verseStart>\d+[a-z]?)$/,
    /^(?<book>.+?) *(?<chapterStart>\d+)\.(?<verseStart>\d+[a-z]?)-(?<verseEnd>\d+[a-z]?)$/,
    /^(?<book>.+?) *(?<chapterStart>\d+)\.(?<verseStart>\d+[a-z]?)-(?<chapterEnd>\d+)\.(?<verseEnd>\d+[a-z]?)$/,
  ];

  return exprs.reverse().reduce<BibleRef | null>((acc, regExp) => {
    if (acc) {
      return acc;
    }

    const matches = regExp.exec(ref.trim());

    if (!matches || !matches.groups) {
      return null;
    }

    return {
      raw: ref,
      book: matches.groups.book,
      chapterStart: Number(matches.groups.chapterStart),
      verseStart: Number(matches.groups.verseStart) || null,
      chapterEnd: Number(matches.groups.chapterEnd) || null,
      verseEnd: Number(matches.groups.verseEnd) || null,
    };
  }, null);
}

function formatRef(ref: string) {
  return ref.replace(/\./gm, ':').replace('-', '…');
}

function formatDay(date: Date) {
  return date.getDate() === 1 ? '1er' : format(date, 'd');
}

function formatSunday(sunday: Date) {
  return `${formatDay(sunday)} ${format(sunday, 'MMMM y')}`;
}

function main() {
  const sermon = entry.slides.find(item => item.type === 'sermon' ? item : null);

  if (!sermon) {
    console.log('Sermon undefined');
    return;
  }

  const date = new Date(entry.date);

  const { bibleRefs, title, author, plan } = sermon.data;

  if (!bibleRefs || !title || !author) {
    return;
  }

  const ref = parseRef(bibleRefs[0].id);

  invariant(ref, `Unable to parse bible ref: ${bibleRefs[0].id}`);

  nl(2);

  heading('Website info');
  console.log(title);
  console.log(ref.raw);

  separator();

  heading('Video info');
  console.log(title);
  console.log(formatRef(ref.raw));
  console.log(author);
  console.log(`Prédication du ${formatSunday(date)}`);

  if (plan.length > 0) {
    nl();
    plan.forEach((item, index) => console.log(`${index + 1}.`, item.text));
  }

  separator();

  const audioFilename = `${snakeCase(`${format(date, 'yMMdd')} ${ref.raw} ${title}`)}.mp3`;
  heading('Audio filename');
  console.log(audioFilename);

  separator();

  const videoFilename = `Prédication du dimanche ${formatSunday(date)}`;
  heading('Video filename');
  console.log(videoFilename);

  separator();

  const youtubeTitle = `${title.trim()} (${ref.raw.trim()})`;

  heading('Youtube title');
  console.log(youtubeTitle);

  separator();

  const youtubeBody = `
${videoFilename} - Culte de l'Église Lyon Gerland (Réformée Évangélique)

➤ Auteur
${author.trim()}

➤ Référence biblique
${ref.raw.trim()}

➤ La prédication est aussi à retrouver en audio sur notre site internet
https://www.egliselyongerland.org/blog/post/

➤ Retrouvez-nous sur les réseaux sociaux
Facebook : https://www.facebook.com/egliselyongerland
X : https://x.com/EREdeLyon

➤ Pour plus d'informations sur l'église
https://www.egliselyongerland.org/

➤ Soutenez l'église en faisant un don
https://www.egliselyongerland.org/don

➤ Intro réalisée avec #remotion
https://www.remotion.dev/
`.trim();

  heading('Youtube body');
  console.log(youtubeBody);

  nl(2);
}

main();
