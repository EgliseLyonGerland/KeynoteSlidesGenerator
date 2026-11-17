const releasesUrl = 'https://github.com/EgliseLyonGerland/KeynoteSlidesGenerator/releases/latest';
const apiUrl = 'https://api.github.com/repos/EgliseLyonGerland/KeynoteSlidesGenerator/releases/latest';

function parseVersion(version) {
  if (typeof version !== 'string' || !/^v?\d+\.\d+\.\d+$/.test(version)) {
    throw new Error('La version publiée est invalide.');
  }
  return version.replace(/^v/, '').split('.').map(Number);
}

export function checkForUpdates(app) {
  let latest;
  try {
    const response = app.doShellScript(
      `/usr/bin/curl --silent --show-error --connect-timeout 2 --max-time 3 --proto '=https' --header 'Accept: application/vnd.github+json' --user-agent 'KeynoteSlidesGenerator' --write-out '\\n%{http_code}' '${apiUrl}'`,
      { alteringLineEndings: false },
    );

    const separator = response.lastIndexOf('\n');
    const status = response.slice(separator + 1);
    if (status === '404') {
      return true;
    }
    if (status !== '200') {
      throw new Error(`GitHub a répondu avec le code HTTP ${status}.`);
    }

    const release = JSON.parse(response.slice(0, separator));

    if (release.draft !== false || release.prerelease !== false) {
      throw new Error('La réponse de GitHub ne contient pas une version stable.');
    }

    latest = parseVersion(release.tag_name);
  }
  catch (error) {
    app.displayAlert('Vérification des mises à jour indisponible', {
      message: `${error.message}\n\nVous pouvez continuer à générer les slides avec la version installée.`,
    });
    return true;
  }

  const installed = parseVersion(process.env.APP_VERSION);
  const difference = latest.findIndex((part, index) => part !== installed[index]);

  if (difference === -1 || latest[difference] < installed[difference]) {
    return true;
  }

  const choice = app.displayAlert('Une mise à jour est disponible', {
    message: `Version installée : ${process.env.APP_VERSION}\nNouvelle version : ${latest.join('.')}\n\nTéléchargez la nouvelle application depuis les fichiers de la release.`,
    buttons: ['Continuer', 'Télécharger'],
    defaultButton: 'Télécharger',
  });
  if (choice.buttonReturned === 'Télécharger') {
    app.openLocation(releasesUrl);
    return false;
  }
  return true;
}
