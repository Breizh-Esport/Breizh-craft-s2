// ============================================================
//  Mythic Metals — nuke cores : masquage cote client
//
//  Pendant du server script (disable_nuke_cores.js) : ces blocs
//  n'etant plus fabricables ni posables, on les retire aussi du
//  recipe viewer (EMI) pour ne pas afficher d'entrees mortes.
// ============================================================

const NUKE_CORES = [
  'mythicmetals:banglum_nuke_core',
  'mythicmetals:carmot_nuke_core',
  'mythicmetals:quadrillum_nuke_core',
  'mythicmetals:sponge_nuke_core'
]

// Retire les 4 nuke cores de l'index EMI (et de toute recette
// qui les reference encore) via l'API recipe viewer de KubeJS.
RecipeViewerEvents.removeEntriesCompletely('item', event => {
  NUKE_CORES.forEach(id => event.remove(id))
})
