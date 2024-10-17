import { Block, GameMode, world } from "@minecraft/server";

const MinecraftDoors = ["minecraft:acacia_door", "minecraft:bamboo_door", "minecraft:birch_door", "minecraft:cherry_door", "minecraft:copper_door", "minecraft:crimson_door", "minecraft:dark_oak_door", "minecraft:exposed_copper_door", "minecraft:jungle_door", "minecraft:mangrove_door", "minecraft:oxidized_copper_door", "minecraft:spruce_door", "minecraft:warped_door", "minecraft:waxed_copper_door", "minecraft:waxed_exposed_copper_door", "minecraft:waxed_oxidized_copper_door", "minecraft:waxed_weathered_copper_door", "minecraft:weathered_copper_door", "minecraft:wooden_door"];

function getBlockFromDoorLowerPartDirection(block) {
	const isHinged = block.above().permutation.getState("door_hinge_bit");
	switch (block.permutation.getState("direction")) {
		case 0: return isHinged ? block.north() : block.south();
		case 1: return isHinged ? block.east() : block.west();
		case 2: return isHinged ? block.south() : block.north();
		case 3: return isHinged ? block.west() : block.east();
	}
}

world.afterEvents.playerInteractWithBlock.subscribe(function (event) {
	if (event.player.isSneaking) return;
	if (!MinecraftDoors.includes(event.block.typeId)) return;
	const block = event.block.permutation.getState("upper_block_bit") ? event.block.below() : event.block;
	const neighbor = getBlockFromDoorLowerPartDirection(block);
	if (!MinecraftDoors.includes(neighbor.typeId)) return;
	if (neighbor.permutation.getState("upper_block_bit")) return;
	neighbor.setPermutation(neighbor.permutation.withState("open_bit", block.permutation.getState("open_bit")));
});

world.afterEvents.itemUseOn.subscribe(function (event) {
	if (event.source.getGameMode() === GameMode.adventure) return;
	if (event.itemStack.typeId !== "minecraft:redstone_torch") return;
	switch (event.block.typeId) {
		case "minecraft:iron_door": {
			const block = event.block.permutation.getState("upper_block_bit") ? event.block.below() : event.block;
			const openBit = !block.permutation.getState("open_bit");
			block.setPermutation(block.permutation.withState("open_bit", openBit));
			event.block.dimension.playSound(openBit ? "open.iron_door" : "close.iron_door", event.block);
		}; break;
		case "minecraft:iron_trapdoor": {
			const openBit = !event.block.permutation.getState("open_bit");
			event.block.setPermutation(event.block.permutation.withState("open_bit", openBit));
			event.block.dimension.playSound(openBit ? "open.iron_trapdoor" : "close.iron_trapdoor", event.block);
		}; break;
	}
});