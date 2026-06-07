<#
.SYNOPSIS
    Publie une nouvelle version du modpack Breizh Craft.

.DESCRIPTION
    Automatise le processus de release :
      1. Valide la version fournie (SemVer).
      2. Vérifie que l'on est sur la branche 'main' avec un arbre de travail propre.
      3. Vérifie que le tag 'vX.Y.Z' n'existe pas déjà.
      4. Met à jour la version dans pakku.json et config/bcc-common.toml
         (fichiers réécrits en UTF-8 sans BOM).
      5. Commit, crée un tag annoté 'vX.Y.Z' et pousse le commit et le tag
         via 'git push --follow-tags'.

    Le script s'arrête (exit 1) si l'une des vérifications préalables échoue.

.PARAMETER Version
    Version SemVer au format X.Y.Z, avec pré-release (-pre) et/ou métadonnée
    de build (+build) optionnelles. Le préfixe 'v' est ajouté automatiquement
    pour le tag git.

.EXAMPLE
    .\scripts\release.ps1 -Version 2.0.0
    Publie la release stable v2.0.0.

.EXAMPLE
    .\scripts\release.ps1 -Version 2.0.0-alpha+008
    Publie une pré-release v2.0.0-alpha+008.

.NOTES
    À lancer depuis n'importe quel répertoire ; les chemins sont résolus
    relativement à la racine du dépôt. Après publication, générer les
    artefacts avec 'pakku export curseforge | modrinth | serverpack'.
#>
param(
    [Parameter(Mandatory)]
    [string]$Version
)

if ($Version -notmatch '^\d+\.\d+\.\d+(-[a-zA-Z0-9][a-zA-Z0-9.-]*)?(\+[a-zA-Z0-9][a-zA-Z0-9.-]*)?$') {
    Write-Error "Invalid semantic version '$Version'. Expected format: X.Y.Z or X.Y.Z-pre or X.Y.Z-pre+build"
    exit 1
}

$branch = (git branch --show-current 2>&1)
if ($branch -ne "main") {
    Write-Error "Not on main branch (currently on '$branch'). Releases must be made from main."
    exit 1
}

$status = (git status --porcelain 2>&1)
if ($status) {
    Write-Error "Working directory has uncommitted changes. Commit or stash them before releasing."
    exit 1
}

$tag = "v$Version"

$existingTag = (git tag -l $tag 2>&1)
if ($existingTag) {
    Write-Error "Tag '$tag' already exists."
    exit 1
}

Write-Host "Preparing release $tag..."

$projectRoot = Split-Path $PSScriptRoot -Parent

$pakkuPath = Join-Path $projectRoot "pakku.json"
$pakkuContent = Get-Content $pakkuPath -Raw
$pakkuContent = $pakkuContent -replace '"version"\s*:\s*"[^"]*"', ('"version": "' + $Version + '"')
[System.IO.File]::WriteAllText($pakkuPath, $pakkuContent, [System.Text.UTF8Encoding]::new($false))

$tomlPath = Join-Path $projectRoot "config\bcc-common.toml"
$tomlContent = Get-Content $tomlPath -Raw
$tomlContent = $tomlContent -replace 'modpackVersion = "[^"]*"', ('modpackVersion = "' + $Version + '"')
[System.IO.File]::WriteAllText($tomlPath, $tomlContent, [System.Text.UTF8Encoding]::new($false))

Write-Host "Updated version to $Version in pakku.json and config/bcc-common.toml"

git add pakku.json
git add config/bcc-common.toml
git commit -m "chore: release $tag"
git tag -a $tag -m "Release $tag"
git push --follow-tags

Write-Host "Released $tag successfully."
