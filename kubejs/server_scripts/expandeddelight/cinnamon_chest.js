// ============================================================
//  Coffres cannelle -> Quark Acacia Chest
//
//  Expanded Delight ajoute le bois de cannelle mais aucun coffre.
//  On branche la cannelle sur le coffre acacia de Quark :
//    - 8 planches de cannelle  -> 1 coffre
//    - 8 rondins de cannelle   -> 4 coffres (recette en gros)
// ============================================================

ServerEvents.recipes(event => {
  // 8 planches de cannelle -> 1 coffre acacia
  event.shaped(
    Item.of('quark:acacia_chest', 1),
    [
      'PPP',
      'P P',
      'PPP'
    ],
    {
      P: 'expandeddelight:cinnamon_planks'
    }
  )

  // 8 rondins de cannelle -> 4 coffres acacia (recette en gros)
  event.shaped(
    Item.of('quark:acacia_chest', 4),
    [
      'LLL',
      'L L',
      'LLL'
    ],
    {
      L: 'expandeddelight:cinnamon_log'
    }
  )
})
