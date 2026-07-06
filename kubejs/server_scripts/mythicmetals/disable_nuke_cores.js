// ============================================================
//  Mythic Metals — desactivation complete des "nuke cores"
//
//  Ces blocs explosifs peuvent raser de larges zones. On les
//  neutralise entierement pour eviter tout grief sur le serveur.
//
//  Blocs concernes (tag mythicmetals:nuke_cores) :
//    - mythicmetals:banglum_nuke_core
//    - mythicmetals:carmot_nuke_core
//    - mythicmetals:quadrillum_nuke_core
//    - mythicmetals:sponge_nuke_core
// ============================================================

const NUKE_CORES = [
  'mythicmetals:banglum_nuke_core',
  'mythicmetals:carmot_nuke_core',
  'mythicmetals:quadrillum_nuke_core',
  'mythicmetals:sponge_nuke_core'
]

// 1) Retire toutes les recettes qui produisent ces blocs.
//    -> plus aucun moyen de les fabriquer en survie.
ServerEvents.recipes(event => {
  NUKE_CORES.forEach(id => event.remove({ output: id }))
})

// 2) Empeche la pose de ces blocs. Meme obtenus via creatif,
//    loot ou commande, ils sont retires des qu'ils sont poses
//    et ne peuvent donc jamais etre armes ni detoner.
BlockEvents.placed(event => {
  if (event.block.hasTag('mythicmetals:nuke_cores')) {
    event.block.set('minecraft:air')
  }
})
