// Fonctionne en parrallèle du server script équivalent
// Cancel le clic si le joueur cible de la lave

const ClientClipContext = Java.loadClass(
  "net.minecraft.world.level.ClipContext",
);
const ClientClipContextBlock = Java.loadClass(
  "net.minecraft.world.level.ClipContext$Block",
);
const ClientClipContextFluid = Java.loadClass(
  "net.minecraft.world.level.ClipContext$Fluid",
);

function isClientTargetingLava(player, level) {
  const from = player.getEyePosition();
  const to = from.add(
    player.getViewVector(1).scale(player.blockInteractionRange()),
  );
  const hit = level.clip(
    new ClientClipContext(
      from,
      to,
      ClientClipContextBlock.OUTLINE,
      ClientClipContextFluid.ANY,
      player,
    ),
  );
  const fluidId = level.getFluidState(hit.blockPos).type.id;

  return fluidId === "minecraft:lava" || fluidId === "minecraft:flowing_lava";
}

BlockEvents.rightClicked((event) => {
  if (event.item.id !== "create:empty_blaze_burner") {
    return;
  }

  if (isClientTargetingLava(event.player, event.level)) {
    event.cancel();
  }
});
