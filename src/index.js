import { find } from 'lodash';
import Document, { validateEntry } from './services/Document';
import { checkForUpdates } from './services/updates';

function generate(entry) {
  validateEntry(entry);
  const doc = new Document();

  const blocks = []
    .concat(
      { type: 'slide', data: { name: 'welcome' } },
      { type: 'slide', data: { name: 'phone' } },
    )
    .concat(entry.slides);

  const announcements = find(blocks, ['type', 'announcements']);

  if (announcements) {
    blocks.push({
      type: 'goodbye',
      data: { announcements: announcements.data.items },
    });
  }

  doc.generate(blocks);
}

export function run(argv = []) {
  // Applets receive an Apple event here; only osascript supplies an argument array.
  const args = Array.isArray(argv) ? argv : [];
  const app = Application.currentApplication();
  app.includeStandardAdditions = true;
  const interactive = args.length === 0;
  let file;

  if (interactive) {
    app.activate();
    if (!checkForUpdates(app)) {
      return;
    }
    try {
      file = app.chooseFile({
        withPrompt: 'Choisissez le fichier .json contenant les slides.',
        ofType: ['public.json'],
      });
    }
    catch (error) {
      if (error.errorNumber === -128) {
        return;
      }
      app.displayAlert('Impossible de choisir le fichier', {
        message: error.message,
        as: 'critical',
      });
      return;
    }
  }
  else {
    file = Path(args[0]);
  }

  try {
    ObjC.import('Foundation');
    const content = $.NSString.stringWithContentsOfFileEncodingError(
      String(file),
      $.NSUTF8StringEncoding,
      null,
    );
    if (content.isNil()) {
      throw new Error(`Impossible de lire le fichier .json en UTF-8 : ${String(file)}. Vérifiez son contenu et les autorisations d'accès.`);
    }

    generate(JSON.parse(ObjC.unwrap(content)));

    if (interactive) {
      app.activate();
      app.displayAlert('Génération terminée ✔️', {
        message: 'La génération s’est terminée avec succès.',
      });
    }
  }
  catch (error) {
    if (!interactive) {
      throw error;
    }
    app.activate();
    app.displayAlert('La génération a échoué', {
      message: `${error.message}\n\nVérifiez le fichier .json, le modèle Keynote et les autorisations macOS. Si la génération a déjà commencé, repartez d'une copie du modèle original.`,
      as: 'critical',
    });
  }
}
