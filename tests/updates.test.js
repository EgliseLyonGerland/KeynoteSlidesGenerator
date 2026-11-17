import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkForUpdates } from '../src/services/updates.js';

const releaseUrl = 'https://github.com/EgliseLyonGerland/KeynoteSlidesGenerator/releases/latest';

function createApp({ response, shellError, choice = 'Continuer' } = {}) {
  return {
    doShellScript: vi.fn(() => {
      if (shellError) {
        throw shellError;
      }
      return response;
    }),
    displayAlert: vi.fn(() => ({ buttonReturned: choice })),
    openLocation: vi.fn(),
  };
}

function releaseResponse(tagName, overrides = {}) {
  return `${JSON.stringify({
    tag_name: tagName,
    draft: false,
    prerelease: false,
    ...overrides,
  })}\n200`;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('checkForUpdates', () => {
  it('treats a missing release as a normal first-launch state', () => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({ response: '{"message":"Not Found"}\n404' });

    expect(checkForUpdates(app)).toBe(true);
    expect(app.displayAlert).not.toHaveBeenCalled();
    expect(app.openLocation).not.toHaveBeenCalled();
  });

  it.each([
    ['same version', '1.2.3'],
    ['older patch version', '1.2.2'],
    ['older minor version', '1.1.9'],
    ['older major version', '0.99.99'],
  ])('does not prompt for the %s', (_description, latestVersion) => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({ response: releaseResponse(latestVersion) });

    expect(checkForUpdates(app)).toBe(true);
    expect(app.displayAlert).not.toHaveBeenCalled();
    expect(app.openLocation).not.toHaveBeenCalled();
  });

  it.each([
    ['patch', '1.2.4'],
    ['minor', '1.3.0'],
    ['major', '2.0.0'],
  ])('offers a %s update and continues when declined', (_part, latestVersion) => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({ response: releaseResponse(`v${latestVersion}`) });

    expect(checkForUpdates(app)).toBe(true);
    expect(app.displayAlert).toHaveBeenCalledWith('Une mise à jour est disponible', {
      message: `Version installée : 1.2.3\nNouvelle version : ${latestVersion}\n\nTéléchargez la nouvelle application depuis les fichiers de la release.`,
      buttons: ['Continuer', 'Télécharger'],
      defaultButton: 'Télécharger',
    });
    expect(app.openLocation).not.toHaveBeenCalled();
  });

  it('opens the release page and returns false when download is selected', () => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({
      response: releaseResponse('1.2.4'),
      choice: 'Télécharger',
    });

    expect(checkForUpdates(app)).toBe(false);
    expect(app.openLocation).toHaveBeenCalledWith(releaseUrl);
  });

  it.each([
    ['network failure', undefined, new Error('curl: Operation timed out'), /Operation timed out/],
    ['HTTP error', 'Service Unavailable\n503', undefined, /code HTTP 503/],
    ['invalid JSON', 'invalid JSON\n200', undefined, /JSON/],
    ['invalid release version', releaseResponse('v1.2.3-beta.1'), undefined, /version publiée est invalide/],
    ['draft release', releaseResponse('1.2.4', { draft: true }), undefined, /version stable/],
    ['prerelease', releaseResponse('1.2.4', { prerelease: true }), undefined, /version stable/],
  ])('reports a %s and lets the app continue', (_case, response, shellError, message) => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({ response, shellError });

    expect(checkForUpdates(app)).toBe(true);
    expect(app.displayAlert).toHaveBeenCalledWith('Vérification des mises à jour indisponible', {
      message: expect.stringMatching(message),
    });
    expect(app.openLocation).not.toHaveBeenCalled();
  });

  it('requests the GitHub release API using the expected shell options', () => {
    vi.stubEnv('APP_VERSION', '1.2.3');
    const app = createApp({ response: releaseResponse('1.2.3') });

    checkForUpdates(app);

    expect(app.doShellScript).toHaveBeenCalledWith(expect.stringContaining('https://api.github.com/repos/EgliseLyonGerland/KeynoteSlidesGenerator/releases/latest'), {
      alteringLineEndings: false,
    });
  });
});
