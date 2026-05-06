// Conversion de l'empty blaze burner en blaze burner via un clic sur de la lave

const ClipContext = Java.loadClass("net.minecraft.world.level.ClipContext");
const ClipContextBlock = Java.loadClass(
  "net.minecraft.world.level.ClipContext$Block",
);
const ClipContextFluid = Java.loadClass(
  "net.minecraft.world.level.ClipContext$Fluid",
);
const SoundEvents = Java.loadClass("net.minecraft.sounds.SoundEvents");
const SoundSource = Java.loadClass("net.minecraft.sounds.SoundSource");
const LAVA_FIZZ_LEVEL_EVENT = 1501;
const EMPTY_BLAZE_BURNER = "create:empty_blaze_burner";
const BLAZE_BURNER = "create:blaze_burner";

ServerEvents.recipes((event) => {
  event.recipes.create
    .mixing("create:chromatic_compound", [
      "#neoforge:dusts/glowstone",
      "create:powdered_obsidian",
      "create:polished_rose_quartz",
    ])
    .superheated();
});

function getTargetedLavaPos(player, level) {
  const from = player.getEyePosition();
  const to = from.add(
    player.getViewVector(1).scale(player.blockInteractionRange()),
  );
  const hit = level.clip(
    new ClipContext(
      from,
      to,
      ClipContextBlock.OUTLINE,
      ClipContextFluid.ANY,
      player,
    ),
  );
  const fluidId = level.getFluidState(hit.blockPos).type.id;

  if (fluidId === "minecraft:lava" || fluidId === "minecraft:flowing_lava") {
    return hit.blockPos;
  }

  return null;
}

function fillBlazeBurner(event) {
  const lavaPos = getTargetedLavaPos(event.player, event.level);

  if (lavaPos === null) {
    return false;
  }

  if (event.item.count > 1) {
    event.item.count--;
    event.player.addItem(Item.of(BLAZE_BURNER));
  } else {
    event.player.setItemInHand(event.hand, Item.of(BLAZE_BURNER));
  }

  event.level.playSound(
    null,
    lavaPos.getX() + 0.5,
    lavaPos.getY() + 0.5,
    lavaPos.getZ() + 0.5,
    SoundEvents.LAVA_EXTINGUISH,
    SoundSource.BLOCKS,
    1.5,
    0.9,
  );
  event.level.levelEvent(LAVA_FIZZ_LEVEL_EVENT, lavaPos, 0);
  return true;
}

ItemEvents.firstRightClicked(EMPTY_BLAZE_BURNER, fillBlazeBurner);

BlockEvents.rightClicked((event) => {
  if (event.item.id !== EMPTY_BLAZE_BURNER) {
    return;
  }

  if (fillBlazeBurner(event)) {
    event.cancel();
  }
});
