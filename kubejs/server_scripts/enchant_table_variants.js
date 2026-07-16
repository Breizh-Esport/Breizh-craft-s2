// Deux variantes de table d'enchantement : "Easy Magic" (defaut) <-> "Apothic".
// Voir memoire: easymagic-apotheosis-enchant-fix
//
// Contrainte (decompilee) : le bloc minecraft:enchanting_table DOIT rester dans le tag
// easymagic:unaltered_enchanting_tables, sinon le garde d'Easy Magic bloque la table Apothic
// ("Unable to open. Break and replace to use."). Consequence : l'item vanilla pose nativement
// la table APOTHIC. On rebascule donc vers le bloc Easy Magic a la pose, SAUF si l'item porte
// le marqueur custom_data {apothic:1b}.
//
// Worldgen : Easy Magic reconvertit lui-meme les tables generees (convert_..._world_gen = true),
// donc les tables du monde sont Easy Magic sans intervention ici.

const $DataComponents = Java.loadClass('net.minecraft.core.component.DataComponents')
const $Items = Java.loadClass('net.minecraft.world.item.Items')
const $Player = Java.loadClass('net.minecraft.world.entity.player.Player')

// Item "Apothic" = table vanilla + marqueur custom_data + nom d'affichage
const APOTHIC_TABLE = "minecraft:enchanting_table[minecraft:custom_data={apothic:1b},minecraft:custom_name='\"Apothic Enchanting Table\"']"

// Un ItemStack est-il une table marquee Apothic ?
function isApothicTable(stack) {
    if (stack == null || stack.isEmpty()) return false
    if (!stack.is($Items.ENCHANTING_TABLE)) return false
    let data = stack.get($DataComponents.CUSTOM_DATA)
    return data != null && data.copyTag().getBoolean('apothic')
}

// --- Recettes : conversion dans les deux sens via table de craft (reactif consomme) ---
ServerEvents.recipes(event => {
    // Table Easy Magic + livre -> table Apothic
    event.shapeless(Item.of(APOTHIC_TABLE), ['minecraft:enchanting_table', 'minecraft:book'])
        .id('kubejs:enchanting_table_to_apothic')
    // Table (+ eclat d'amethyste) -> table Easy Magic (plain) : revert d'une table Apothic
    event.shapeless('minecraft:enchanting_table', ['minecraft:enchanting_table', 'minecraft:amethyst_shard'])
        .id('kubejs:enchanting_table_to_easymagic')
})

// --- Pose : sans marqueur -> devient le bloc Easy Magic (comportement par defaut) ---
BlockEvents.placed('minecraft:enchanting_table', event => {
    const entity = event.entity
    let apothic = false
    if (entity instanceof $Player) {
        apothic = isApothicTable(entity.getMainHandItem()) || isApothicTable(entity.getOffhandItem())
    }
    if (!apothic) {
        event.block.set('easymagic:enchanting_table')
    }
})

// --- Drops : tout bloc minecraft:enchanting_table restant dans le monde est une table Apothic
//     (les poses "plain" sont rebasculees en easymagic, le worldgen est converti par Easy Magic),
//     donc il doit lacher l'item Apothic -> symetrique avec le bloc easymagic qui lache l'item plain.
BlockEvents.drops('minecraft:enchanting_table', event => {
    if (event.containsItem('minecraft:enchanting_table')) {
        event.removeItem('minecraft:enchanting_table')
        event.addItem(Item.of(APOTHIC_TABLE))
    }
})
