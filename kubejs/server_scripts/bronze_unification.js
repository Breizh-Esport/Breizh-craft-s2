// ============================================================
//  Bronze — un seul bronze dans le pack : MythicMetals
//
//  Probleme d'origine :
//    Deux items "bronze" coexistent (mythicmetals:bronze_ingot et
//    createbigcannons:bronze_ingot) et six recettes d'Alloy Forgery
//    se marchent dessus.
//      - Recettes MythicMetals -> sortie FIXE = bronze MM.
//      - Recettes de compat integrees a Alloy Forgery -> sortie par
//        TAG c:ingots/bronze (liste de priorite).
//    Sur le chemin "lingots" les entrees sont identiques : la recette
//    Alloy Forgery gagne (ordre alphabetique de l'ID) et son tag
//    resolvait vers le bronze de Create Big Cannons -> incoherence.
//
//  Choix : on desactive le bronze de Create Big Cannons. Tous les
//  crafts Create passent par le tag c:ingots/bronze (le bronze MM y
//  est present, donc les canons se coulent sans souci), alors que les
//  integrations MythicMetals (outils/armures) exigent specifiquement
//  le bronze MM. Le bronze MM est donc le seul retenu.
// ============================================================

const MM_BRONZE = 'mythicmetals:bronze_ingot'
const CBC_BRONZE = 'createbigcannons:bronze_ingot'
const CBC_BRONZE_BLOCK = 'createbigcannons:bronze_block'

ServerEvents.recipes(event => {
  // 1) Retire les recettes bronze de compat integrees a Alloy Forgery.
  //    Elles font doublon avec celles de MythicMetals et gagnaient sur
  //    le chemin "lingots". Une fois retirees, les recettes MythicMetals
  //    (sortie fixe) restent seules -> l'Alloy Forgery donne TOUJOURS du
  //    bronze MM (raw, minerai ET lingots).
  event.remove({ id: 'alloy_forgery:compat/alloys/bronze_from_ingots' })
  event.remove({ id: 'alloy_forgery:compat/alloys/bronze_from_ores' })
  event.remove({ id: 'alloy_forgery:compat/alloys/bronze_from_raw_ores' })

  // 2) Desactive toute fabrication du bronze Create Big Cannons
  //    (mixing copper+tin / copper+zinc / brass, compactage, blocs,
  //    pepites...). CBC_BRONZE devient impossible a obtenir.
  //    Les canons ne consomment jamais cet item directement : ils se
  //    coulent depuis le fluide molten_bronze, fondu depuis le tag
  //    c:ingots/bronze qui contient le bronze MM -> aucune casse.
  event.remove({ output: CBC_BRONZE })

  // 3) On garde l'alliage bronze au mixer Create, mais il sort du
  //    bronze MM (equivalent de l'ancien alloy_bronze_tin de CBC).
  event.recipes.create
    .mixing(Item.of(MM_BRONZE, 2), ['#c:ingots/copper', '#c:ingots/tin'])
    .heated()

  // 4) Filet de securite : convertir 1:1 tout bronze CBC deja en stock
  //    (obtenu avant ce changement) en bronze MM.
  event.shapeless(MM_BRONZE, [CBC_BRONZE])

  // 5) Le bloc de bronze CBC (decoratif/stockage) exigeait 9 lingots CBC,
  //    devenus impossibles a obtenir. On le rend craftable avec le bronze
  //    MM a la place, et on remet la decomposition inverse pour ne pas
  //    perdre de matiere.
  event.remove({ output: CBC_BRONZE_BLOCK }) // retire l'ancienne recette (9 lingots CBC)
  event.shaped(CBC_BRONZE_BLOCK, ['###', '###', '###'], { '#': MM_BRONZE })
  event.shapeless(Item.of(MM_BRONZE, 9), [CBC_BRONZE_BLOCK])
})
