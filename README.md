# Keynote Slides Generator

## Générer les slides sur un Mac

Il faut un Mac avec Keynote. Il n'est pas nécessaire d'installer Node.js, pnpm ou les outils de développement.

1. Récupérez le modèle Keynote à jour auprès de l'équipe, faites-en une copie et ouvrez cette copie. Fermez les autres présentations Keynote.
2. Ouvrez la [dernière release](https://github.com/EgliseLyonGerland/KeynoteSlidesGenerator/releases/latest).
3. Dans **Assets**, téléchargez **KeynoteSlidesGenerator-VERSION.zip** (par exemple **KeynoteSlidesGenerator-14.5.0.zip**). Aucun compte GitHub n'est nécessaire.
4. Décompressez l'archive. Déplacez `KeynoteSlidesGenerator.app` dans un emplacement fixe, par exemple Applications.
5. Téléchargez le fichier JSON des slides.
6. Double-cliquez sur l'application, puis sélectionnez le fichier JSON dans la fenêtre qui s'ouvre. Annuler ferme l'application sans modifier la présentation.
7. Pendant la génération, laissez Keynote au premier plan et n'utilisez ni le clavier ni la souris : le générateur pilote son interface.
8. À l'annonce de fin de génération, enregistrez la présentation sous un nouveau nom.

Le nom du modèle n'a pas d'importance. Il doit contenir les slides de modèle attendues par le générateur (notamment `slide:welcome` et `slide:phone`). Le modèle Keynote n'est pas inclus dans ce dépôt ni dans l'application.

### Autorisations macOS et premier lancement

L'application n'est actuellement ni signée avec un certificat Developer ID, ni notarisée par Apple. macOS peut bloquer son premier lancement. Après avoir vérifié qu'elle provient bien de ce dépôt, utilisez **Réglages Système > Confidentialité et sécurité > Ouvrir quand même** si cette option est proposée. Une politique de sécurité d'entreprise peut interdire cette opération ; une distribution sans cet avertissement demandera une signature et une notarisation Apple.

Autorisez l'application à contrôler **Keynote** et **System Events** lorsque macOS le demande. Autorisez-la aussi dans **Réglages Système > Confidentialité et sécurité > Accessibilité** pour qu'elle puisse piloter l'interface de Keynote. Relancez ensuite l'application si nécessaire. Ces autorisations peuvent être redemandées après une mise à jour.

En cas d'erreur, l'application affiche un message. Si des slides ont déjà été ajoutées, fermez la présentation sans enregistrer et repartez d'une copie intacte du modèle avant de réessayer.

### Mises à jour

Au lancement graphique, l'application consulte la dernière release stable sur GitHub (requête limitée à 3 secondes). Si une version plus récente est disponible, **Télécharger** ouvre sa page dans le navigateur et ferme le générateur ; **Continuer** conserve la version installée. L'installation reste manuelle.

Sans réseau ou si GitHub est indisponible, un message signale que la vérification n'a pas pu être faite, puis la génération reste possible. Tant qu'aucune release n'est publiée, aucun avertissement n'est affiché. La génération en ligne de commande ne fait aucune vérification réseau.

## Développement

### Version

La version de `package.json` est la source de référence : `14.5.N` indique le support de Keynote **14.5**, avec un compteur de changements **N** (`14.5.0`, `14.5.1`, etc.). Ce compteur est mis à jour manuellement, sans incrément automatique par la CI.

Le build inscrit cette version dans `CFBundleShortVersionString` et `CFBundleVersion` de l'application ; elle est visible dans **Lire les informations** du Finder. Le nom de l'archive et de l'artefact CI inclut aussi la version. Cela indique la version de Keynote supportée, sans ajouter de blocage automatique des autres versions de Keynote.

### Commandes

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Le build doit être exécuté sur macOS : il utilise `osacompile`. Il produit `dist/KeynoteSlidesGenerator.app` sans lancer Keynote et sans embarquer le fichier local `src/entry.json`. Le JSON est lu en UTF-8 au lancement ; il doit contenir un tableau `slides` avec les blocs du générateur.

Pour conserver la génération en ligne de commande avec le JSON local :

```sh
pnpm generate
pnpm generate --slide 3
pnpm generate --from 2 --to 5
```

Pour utiliser un autre fichier ou ouvrir le sélecteur :

```sh
pnpm build --run --entry /chemin/vers/slides.json
pnpm build --run
```

Le workflow compile l'application à chaque push sur `main`, sans exécuter le générateur ni nécessiter Keynote sur le runner. Il publie une archive ZIP avec les permissions et métadonnées du bundle macOS. Les artefacts sont conservés 90 jours (sous réserve de la politique du dépôt) ; le workflow peut aussi être relancé manuellement.

Après un build et des tests réussis sur `main`, un job publie aussi une release `vVERSION` contenant le ZIP. La release reste en brouillon jusqu'à la fin du téléversement. Une version déjà publiée n'est pas remplacée : incrémentez `package.json` pour distribuer de nouveaux changements. Le job nécessite l'autorisation GitHub Actions d'écrire le contenu du dépôt ; il utilise le jeton automatique de GitHub, jamais embarqué dans l'application.
