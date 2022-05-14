import Document from './services/Document';

const entry = require('./entry.json');

const doc = new Document('Slides.key');
doc.generate(entry);
