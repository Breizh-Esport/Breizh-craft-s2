# Breizh Craft — Saison 2

Modpack Minecraft **NeoForge 1.21.1** géré avec [`pakku`](https://github.com/juraj-hrivnak/Pakku).

Le dépôt contient les métadonnées du pack, la liste verrouillée des mods et les
overrides (config, scripts KubeJS, configs par défaut). Les artefacts distribuables
(CurseForge, Modrinth, serveur) sont générés à la demande.

## Aperçu

| Élément | Valeur |
| --- | --- |
| Loader | NeoForge `21.1.228` |
| Version Minecraft | `1.21.1` |
| Cible d'export | `multiplatform` (CurseForge + Modrinth + serverpack) |

## Structure du dépôt

- `pakku.json` — métadonnées du pack (`name`, `version`, overrides, side des mods).
- `pakku-lock.json` — liste verrouillée des mods, version du loader, métadonnées des fichiers fournisseurs.
- `config/`, `kubejs/`, `defaultconfigs/` — overrides embarqués dans les exports.
- `mods/` — fichiers `.jar` locaux de l'instance de développement.
- `scripts/` — outils de maintenance (release, comparaison de modpacks).
- `build/` — **sortie générée**, ne pas éditer à la main.

> `pakku.json` et `pakku-lock.json` font foi. `build/` est régénérable.

## Workflow de développement

Toutes les commandes se lancent depuis la racine du dépôt.

```pwsh
pakku sync                 # met à jour pakku.lock.json suite à une mise à jour des mods
pakku export curseforge    # construit le zip CurseForge dans build/curseforge/
pakku export modrinth      # construit le .mrpack dans build/modrinth/
pakku export serverpack    # génère le server pack dans build/serverpack/
```

Si `pakku` n'est pas dans le `PATH`, installez-le et configurez-le avant de contribuer.

### Validation

Aucun framework de test automatisé n'est configuré. Avant d'ouvrir une PR :

1. Lancer `pakku lock` et exporter au moins une cible.
2. Vérifier que l'archive produite existe sous `build/` et s'ouvre correctement.
3. Smoke-test dans une instance Minecraft locale si des mods ou configs ont changé.

## Publier une release

Le script [`scripts/release.ps1`](scripts/release.ps1) automatise le bump de version,
le commit, le tag et le push. Voir la section ci-dessous pour le détail.

```pwsh
.\scripts\release.ps1 -Version 2.0.0-beta+001
```

## Scripts

### `scripts/release.ps1`

Publie une nouvelle version du modpack en une commande : met à jour la version dans
les fichiers du pack, commit, crée un tag annoté et pousse le tout.

#### Utilisation

```pwsh
.\scripts\release.ps1 -Version <X.Y.Z[-pre][+build]>
```

Exemples :

```pwsh
.\scripts\release.ps1 -Version 2.0.0
.\scripts\release.ps1 -Version 2.0.0-alpha+008
.\scripts\release.ps1 -Version 2.1.0-rc.1
```

#### Paramètre

| Paramètre | Obligatoire | Description |
| --- | --- | --- |
| `-Version` | Oui | Version [SemVer](https://semver.org/lang/fr/) au format `X.Y.Z`, avec pré-release (`-pre`) et/ou métadonnée de build (`+build`) optionnelles. Le préfixe `v` est ajouté automatiquement pour le tag. |

#### Vérifications préalables (le script échoue si une condition n'est pas remplie)

1. **Format de version** valide selon SemVer.
2. **Branche `main`** courante — les releases ne se font que depuis `main`.
3. **Arbre de travail propre** — aucun changement non commité.
4. **Tag inexistant** — `vX.Y.Z` ne doit pas déjà exister.

#### Actions effectuées

1. Remplace `"version"` dans `pakku.json` par la version fournie.
2. Remplace `modpackVersion` dans `config/bcc-common.toml`.
3. `git add` des deux fichiers, puis commit `chore: release vX.Y.Z`.
4. Crée le tag annoté `vX.Y.Z` (message `Release vX.Y.Z`).
5. `git push --follow-tags` (pousse le commit **et** le tag).

> Les fichiers sont réécrits en UTF-8 **sans BOM** pour rester compatibles avec `pakku`.

#### Après publication

Générer et diffuser les artefacts correspondants :

```pwsh
pakku export curseforge
pakku export modrinth
pakku export serverpack
```

### `scripts/compare_modpacks.py`

Outil Python de comparaison entre deux modpacks (analyse des listes de mods).

## Contribution

- Commits impératifs, concis et scopés (ex. `feat(quests): Chapter 1`, `chore: mod updates`).
- Un changement logique par commit (mise à jour de dépendance, tweak de config, export).
- Ne pas committer de secrets ni de fichiers locaux à la machine.
- Ne pas éditer manuellement les artefacts sous `build/`.
- Conserver les noms/versions de fichiers de mods exacts (ex. `modname-1.2.3.jar`).
