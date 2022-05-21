import { omit } from 'lodash';
import Document from './services/Document';

const entry = require('./entry.json');

const doc = new Document('Slides.key');

doc.generate(
  entry
    .reduce((acc, item) => {
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
    }, [])
    .concat([{ type: 'goodbye' }]),
);
