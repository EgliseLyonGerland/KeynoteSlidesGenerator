# Keynote Slides Generator

## Generer les slides sur un Mac

Il faut un Mac avec Keynote. Il n'est pas necessaire d'installer Node.js, pnpm ou les outils de developpement.

1. Recuperez le modele Keynote a jour aupres de l'equipe, faites-en une copie et ouvrez cette copie. Fermez les autres presentations Keynote.
2. Ouvrez [GitHub Actions](https://github.com/EgliseLyonGerland/KeynoteSlidesGenerator/actions/workflows/build.yml), puis la derniere execution reussie de **Build macOS application** sur `main`.
3. Dans **Artifacts**, telechargez **KeynoteSlidesGenerator-VERSION-macOS** (par exemple **KeynoteSlidesGenerator-14.5.0-macOS**). Il faut etre connecte a GitHub et avoir acces au depot.
4. Decompressez l'artefact, puis l'archive `KeynoteSlidesGenerator-VERSION.zip` qu'il contient. Deplacez `KeynoteSlidesGenerator.app` dans un emplacement fixe, par exemple Applications.
5. Telechargez le fichier JSON des slides.
6. Double-cliquez sur l'application, puis selectionnez le fichier JSON dans la fenetre qui s'ouvre. Annuler ferme l'application sans modifier la presentation.
7. Pendant la generation, laissez Keynote au premier plan et n'utilisez ni le clavier ni la souris : le generateur pilote son interface.
8. A l'annonce de fin de generation, enregistrez la presentation sous un nouveau nom.

Le nom du modele n'a pas d'importance. Il doit contenir les slides de modele attendues par le generateur (notamment `slide:welcome` et `slide:phone`). Le modele Keynote n'est pas inclus dans ce depot ni dans l'application.

### Autorisations macOS et premier lancement

L'application n'est actuellement ni signee avec un certificat Developer ID, ni notarisee par Apple. macOS peut bloquer son premier lancement. Apres avoir verifie qu'elle provient bien de ce depot, utilisez **Reglages Systeme > Confidentialite et securite > Ouvrir quand meme** si cette option est proposee. Une politique de securite d'entreprise peut interdire cette operation ; une distribution sans cet avertissement demandera une signature et une notarisation Apple.

Autorisez l'application a controler **Keynote** et **System Events** lorsque macOS le demande. Autorisez-la aussi dans **Reglages Systeme > Confidentialite et securite > Accessibilite** pour qu'elle puisse piloter l'interface de Keynote. Relancez ensuite l'application si necessaire. Ces autorisations peuvent etre redemandees apres une mise a jour.

En cas d'erreur, l'application affiche un message. Si des slides ont deja ete ajoutees, fermez la presentation sans enregistrer et repartez d'une copie intacte du modele avant de reessayer.

## Developpement

### Version

La version de `package.json` est la source de reference : `14.5.N` indique le support de Keynote **14.5**, avec un compteur de changements **N** (`14.5.0`, `14.5.1`, etc.). Ce compteur est mis a jour manuellement, sans increment automatique par la CI.

Le build inscrit cette version dans `CFBundleShortVersionString` et `CFBundleVersion` de l'application ; elle est visible dans **Lire les informations** du Finder. Le nom de l'archive et de l'artefact CI inclut aussi la version. Cela indique la version de Keynote supportee, sans ajouter de blocage automatique des autres versions de Keynote.

### Commandes

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Le build doit etre execute sur macOS : il utilise `osacompile`. Il produit `dist/KeynoteSlidesGenerator.app` sans lancer Keynote et sans embarquer le fichier local `src/entry.json`. Le JSON est lu en UTF-8 au lancement ; il doit contenir un tableau `slides` avec les blocs du generateur.

Pour conserver la generation en ligne de commande avec le JSON local :

```sh
pnpm generate
pnpm generate --slide 3
pnpm generate --from 2 --to 5
```

Pour utiliser un autre fichier ou ouvrir le selecteur :

```sh
pnpm build --run --entry /chemin/vers/slides.json
pnpm build --run
```

Le workflow compile l'application a chaque push sur `main`, sans executer le generateur ni necessiter Keynote sur le runner. Il publie une archive ZIP avec les permissions et metadonnees du bundle macOS. Les artefacts sont conserves 90 jours (sous reserve de la politique du depot) ; le workflow peut aussi etre relance manuellement.
