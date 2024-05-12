import chalk from 'chalk';
import { format, previousSunday, setDefaultOptions } from 'date-fns';
import { snakeCase } from 'lodash';
import { fr, se } from 'date-fns/locale';
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

function formatRef(ref: string) {
  return ref.replace('.', ' • ').replace('-', '–');
}

function formatDay(date: Date) {
  return date.getDate() === 1 ? '1er' : format(date, 'd');
}

function formatSunday(sunday: Date) {
  return `${formatDay(sunday)} ${format(sunday, 'MMMM y')}`;
}

function main() {
  const sermon = entry.find(item => item.type === 'sermon' ? item : null);

  if (!sermon) {
    console.log('Sermon undefined');
    return;
  }

  const now = new Date();
  const sunday = now.getDay() === 0 ? now : previousSunday(now);
  const { bibleRefs, title, author, plan } = sermon.data;

  if (!bibleRefs || !title || !author) {
    return;
  }

  const [ref] = bibleRefs;

  nl(2);

  heading('Website info');
  console.log(title);
  console.log(ref.id);

  separator();

  heading('Video info');
  console.log(title);
  console.log(formatRef(ref.id));
  console.log(author);
  console.log(`Prédication du ${formatSunday(sunday)}`);

  if (plan) {
    nl();
    plan.forEach((item, index) => console.log(`${index + 1}.`, item.text));
  }

  separator();

  const audioFilename = `${snakeCase(`${format(sunday, 'yMMdd')} ${ref.id} ${title}`)}.mp3`;
  heading('Audio filename');
  console.log(audioFilename);

  separator();

  const videoFilename = `Prédication du dimanche ${formatSunday(sunday)}`;
  heading('Video filename');
  console.log(videoFilename);

  separator();

  const youtubeTitle = [
    [title, `(${ref.id})`].join(' '),
    `Prédication du ${format(sunday, 'dd/MM/y')}`,
    author,
  ].join(' - ');

  heading('Youtube title');
  console.log(youtubeTitle);

  separator();

  const youtubeBody = [
    [title, author].join(' - '),
    [videoFilename, 'Culte de l\'Église Lyon Gerland (Réformée Évangélique)'].join(' - '),
    ref.id,
    'https://www.egliselyongerland.org/blog/post/',
  ].join('\n');

  heading('Youtube body');
  console.log(youtubeBody);

  nl(2);
}

main();
