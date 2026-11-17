import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';

const bundle = readFileSync(new URL('../dist/index.jxa', import.meta.url), 'utf8');

function application({
  content = '{"slides":[]}',
  chooseError,
  readError,
  documents = 1,
  templates = ['welcome', 'phone', 'end'],
  generationError,
} = {}) {
  const alerts = [];
  const reads = [];
  const duplicates = [];
  const windows = [];
  let choices = 0;
  let keynoteRequests = 0;
  const doc = {
    name: () => 'Modele du dimanche.key',
    currentSlide: {},
    slides: templates.map(name => ({
      iworkItems: [{ objectText: () => `slide:${name}` }],
      duplicate() {
        if (generationError) {
          throw generationError;
        }
        duplicates.push(name);
      },
    })),
  };
  const host = {
    activate() {},
    chooseFile(options) {
      choices += 1;
      assert.deepEqual(Array.from(options.ofType), ['public.json']);
      if (chooseError) {
        throw chooseError;
      }
      return '/tmp/slides du dimanche.json';
    },
    displayAlert(title, options) {
      alerts.push({ title, ...options });
    },
  };
  function Application(name) {
    if (name === 'Keynote') {
      keynoteRequests += 1;
      return {
        documents: Array.from({ length: documents }, () => doc),
        activate() {},
        frontmost: () => true,
      };
    }
    assert.equal(name, 'System Events');
    return {
      processes: {
        Keynote: {
          windows: {
            byName(name) {
              windows.push(name);
              return {};
            },
          },
        },
      },
    };
  }
  Application.currentApplication = () => host;
  const context = vm.createContext({
    Application,
    Path: path => path,
    ObjC: {
      import: name => assert.equal(name, 'Foundation'),
      unwrap: value => value.text ?? value,
    },
    $: {
      NSUTF8StringEncoding: 4,
      NSString: {
        stringWithContentsOfFileEncodingError(path, encoding, error) {
          reads.push(path);
          assert.equal(encoding, 4);
          assert.equal(error, null);
          return { isNil: () => Boolean(readError), text: content };
        },
      },
    },
    console: { log() {} },
    delay() {},
  });
  vm.runInContext(bundle, context);
  return {
    run: args => context.run(args),
    alerts,
    reads,
    duplicates,
    windows,
    get choices() { return choices; },
    get keynoteRequests() { return keynoteRequests; },
  };
}

test('loading the bundle does not prompt or automate Keynote before run', () => {
  const app = application();
  assert.equal(app.choices, 0);
  assert.equal(app.keynoteRequests, 0);
});

test('interactive launch selects external JSON and generates the usual opening slides', () => {
  const app = application();
  app.run([]);
  assert.equal(app.choices, 1);
  assert.deepEqual(app.reads, ['/tmp/slides du dimanche.json']);
  assert.deepEqual(app.duplicates, ['welcome', 'phone']);
  assert.deepEqual(app.windows, ['Modele du dimanche.key']);
  assert.equal(app.alerts.length, 1);
  assert.equal(app.alerts[0].title, 'Génération terminée ✔️');
});

test('command-line input uses the given file without dialogs', () => {
  const app = application({
    content: '{"slides":[{"type":"slide","data":{"name":"phone"}}]}',
  });
  app.run(['/tmp/autre fichier.json']);
  assert.equal(app.choices, 0);
  assert.deepEqual(app.reads, ['/tmp/autre fichier.json']);
  assert.deepEqual(app.duplicates, ['welcome', 'phone', 'phone']);
  assert.deepEqual(app.alerts, []);
});

test('native applet launch accepts an Apple event instead of an argument array', () => {
  const event = new Proxy({}, {
    get(target, key) {
      assert.fail(`The native Apple event must not be accessed: ${String(key)}`);
    },
  });
  const app = application();
  app.run(event);
  assert.equal(app.choices, 1);
  assert.deepEqual(app.duplicates, ['welcome', 'phone']);
});

test('canceling the picker leaves Keynote untouched', () => {
  const app = application({ chooseError: { errorNumber: -128 } });
  app.run([]);
  assert.equal(app.keynoteRequests, 0);
  assert.deepEqual(app.reads, []);
  assert.deepEqual(app.alerts, []);
});

test('picker errors other than cancellation are displayed', () => {
  const app = application({ chooseError: new Error('Selection impossible') });
  app.run([]);
  assert.equal(app.alerts[0].message, 'Selection impossible');
  assert.equal(app.alerts[0].as, 'critical');
});

for (const content of [
  '{',
  'null',
  '{}',
  '{"slides":{}}',
  '{"slides":[null]}',
  '{"slides":[{"type":"unknown","data":{}}]}',
  '{"slides":[{"type":"song","data":null}]}',
  '{"slides":[{"type":"song","data":[]}]}',
]) {
  test(`invalid JSON input fails before touching Keynote: ${content}`, () => {
    const app = application({ content });
    app.run([]);
    assert.equal(app.keynoteRequests, 0);
    assert.equal(app.alerts.length, 1);
    assert.equal(app.alerts[0].as, 'critical');
  });
}

test('file read failures are reported', () => {
  const app = application({ readError: 'Fichier inaccessible' });
  app.run([]);
  assert.match(app.alerts[0].message, /Impossible de lire le fichier \.json en UTF-8/);
  assert.equal(app.keynoteRequests, 0);
});

for (const documents of [0, 2]) {
  test(`requires exactly one open Keynote document (found ${documents})`, () => {
    const app = application({ documents });
    app.run([]);
    assert.match(app.alerts[0].message, /Ouvrez uniquement/);
    assert.deepEqual(app.duplicates, []);
  });
}

test('rejects a presentation without the expected templates', () => {
  const app = application({ templates: ['welcome', 'end'] });
  app.run([]);
  assert.match(app.alerts[0].message, /welcome.*phone/);
  assert.deepEqual(app.duplicates, []);
});

test('generation errors are shown without a success dialog', () => {
  const app = application({ generationError: new Error('Accessibilite refusee') });
  app.run([]);
  assert.equal(app.alerts.length, 1);
  assert.equal(app.alerts[0].as, 'critical');
  assert.match(app.alerts[0].message, /Accessibilite refusee/);
});

test('command-line errors propagate to the caller', () => {
  const app = application({ content: '{}' });
  assert.throws(() => app.run(['/tmp/invalid.json']), /Le fichier \.json n’est pas valide/);
  assert.deepEqual(app.alerts, []);
});

test('bundle contains no embedded entry.json module', () => {
  assert.doesNotMatch(bundle, /src\/entry\.json/);
});

test('compiled app metadata matches the package version and its signature remains valid', {
  skip: process.platform !== 'darwin',
}, () => {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  const appPath = fileURLToPath(new URL('../dist/KeynoteSlidesGenerator.app', import.meta.url));
  for (const key of ['CFBundleShortVersionString', 'CFBundleVersion']) {
    const result = spawnSync('plutil', [
      '-extract',
      key,
      'raw',
      `${appPath}/Contents/Info.plist`,
    ], { encoding: 'utf8', timeout: 15000 });
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), version);
  }
  const signature = spawnSync('codesign', ['--verify', '--deep', '--strict', appPath], {
    encoding: 'utf8',
    timeout: 15000,
  });
  assert.ifError(signature.error);
  assert.equal(signature.status, 0, signature.stderr);
});

test('compiled app invokes run and reads an external UTF-8 JSON with osascript', {
  skip: process.platform !== 'darwin',
}, () => {
  const dir = mkdtempSync(join(tmpdir(), 'keynote-slides-test-'));
  try {
    const path = join(dir, 'donnees ete.json');
    writeFileSync(path, '{"slides":[{"type":"inconnu-é","data":{}}]}');
    const result = spawnSync('osascript', [
      '-l',
      'JavaScript',
      fileURLToPath(new URL('../dist/KeynoteSlidesGenerator.app', import.meta.url)),
      path,
    ], { encoding: 'utf8', timeout: 15000 });
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Le bloc 1 du fichier \.json est invalide/);
  }
  finally {
    rmSync(dir, { recursive: true });
  }
});

test('compiled app reports missing files without a native bridge crash', {
  skip: process.platform !== 'darwin',
}, () => {
  const dir = mkdtempSync(join(tmpdir(), 'keynote-missing-file-test-'));
  try {
    const result = spawnSync('osascript', [
      '-l',
      'JavaScript',
      fileURLToPath(new URL('../dist/KeynoteSlidesGenerator.app', import.meta.url)),
      join(dir, 'missing.json'),
    ], { encoding: 'utf8', timeout: 15000 });
    assert.ifError(result.error);
    assert.equal(result.signal, null);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Impossible de lire le fichier \.json en UTF-8/);
  }
  finally {
    rmSync(dir, { recursive: true });
  }
});
