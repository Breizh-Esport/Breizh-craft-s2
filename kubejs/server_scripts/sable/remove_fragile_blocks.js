// ============================================================
//  Sable — desactive le comportement "bloc fragile"
//
//  Probleme d'origine :
//    Deux freezes serveur (watchdog, tick fige a l'infini) causes par
//    Sable / sable_rapier 2.0.3. Chaine du crash :
//      RapierPhysicsPipeline.step (natif)
//        -> FragileBlockCallback.onHit  (un engin physique heurte un
//           bloc du tag #sable:fragile et le detruit)
//        -> Level.destroyBlock -> setBlockState
//        -> RapierVoxelColliderBakery.newVoxelCollider (natif)  = FIGE
//    Le re-bake du collider voxel est appele de facon RE-ENTRANTE depuis
//    l'interieur du pas de simulation natif -> boucle infinie.
//
//    Le tag #sable:fragile contient #minecraft:leaves (toutes les
//    feuilles) + bambou/melon/citrouille/cactus/glace/nenuphar. Les
//    feuilles etant partout, un engin Aeronautics qui frole un arbre
//    suffit a declencher le freeze.
//
//  Choix : on vide entierement le tag #sable:fragile. Plus aucun bloc
//    n'est "fragile" -> le callback ne se declenche plus -> plus de
//    re-bake re-entrant -> plus de freeze. On perd l'effet cosmetique
//    "les engins brisent les blocs fragiles", ce qui est acceptable
//    face a un crash serveur.
//
//  NB : ceci supprime le DECLENCHEUR, pas le bug natif de Sable. Un fix
//    de fond passe par une mise a jour / un signalement a Sable.
// ============================================================

ServerEvents.tags('block', event => {
  event.removeAll('sable:fragile')
})
