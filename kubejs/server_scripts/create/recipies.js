ServerEvents.recipes(event => {
  event.replaceInput(
    { output: 'create:empty_blaze_burner' },
    'create:iron_sheet',
    'minecraft:iron_ingot'
  )

  event.remove({ output: 'create:whisk'})
  event.shaped(
    Item.of('create:whisk', 1),
    [
      ' A ',
      'BAB',
      ' B '
    ],
    {
      A: 'create:andesite_alloy',
      B: 'minecraft:iron_ingot'
    }
  )
})
