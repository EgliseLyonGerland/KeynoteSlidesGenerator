import { find } from 'lodash';
import Document from './services/Document';

const entry = require('./entry.json');

const doc = new Document('Slides.key');

const blocks = []
  .concat(
    { type: 'slide', data: { name: 'welcome' } },
    { type: 'slide', data: { name: 'phone' } },
  )
  .concat(entry);

const announcements = find(blocks, ['type', 'announcements']);

if (announcements) {
  blocks.push({
    type: 'goodbye',
    data: { announcements: announcements.data.items },
  });
}

doc.generate(blocks);
