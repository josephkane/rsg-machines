import type { Armor } from "../types/armor";

export const armorOptions: Armor[] = [
  {
    id: "scrap-metal",
    name: "Scrap Metal",
    description:
      "Readily available and lightweight, yet thin. Not designed for repeated hits.",
    powerDraw: 1,
    statModifiers: { speed: -1, durability: 3 },
  },
  {
    id: "composite",
    name: "Composite",
    description:
      "Flexible and lightweight, this armor is electrified to repel small arms fire.",
    powerDraw: 2,
    statModifiers: { durability: 5 },
  },
  {
    id: "fortress",
    name: "Fortress",
    description:
      "A heavy layer of armor designed to protect against heavy weapons and repeated hits.",
    powerDraw: 4,
    statModifiers: { speed: -2, handling: -1, durability: 8 },
  },
];
