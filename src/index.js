import { omit } from 'lodash';
import Document from './services/Document';

const entry = require('./entry.json');

const doc = new Document('Slides.key');

doc.generate(
  [].concat(
    { type: 'slide', data: { name: 'welcome' } },
    { type: 'slide', data: { name: 'welcome', index: 1 } },
    { type: 'slide', data: { name: 'phone' } },
    ...entry.reduce((acc, item) => {
      if (item.type === 'songs') {
        acc.push(
          ...item.data.items.map((song) => ({
            type: 'song',
            data: song,
          })),
        );
      } else if (item.type === 'recitation') {
        const { recitation, ...rest } = item.data;

        acc.push({
          type: 'song',
          data: {
            ...rest,
            song: {
              ...omit(recitation, 'content'),
              lyrics: recitation.content,
            },
          },
        });
      } else if (item.type === 'reading') {
        acc.push(
          ...item.data.bibleRefs.map((ref) => ({
            type: 'verse',
            data: ref,
          })),
        );
      } else {
        acc.push(item);
      }

      return acc;
    }, []),
    { type: 'slide', data: { name: 'goodbye' } },
    { type: 'slide', data: { name: 'goodbye', index: 1 } },
  ),
);
