import type { Engine } from "../types/engine";

export const engineOptions: Engine[] = [
  {
    id: "mazda-rotary",
    name: "Mazda Rotary",
    description:
      "A classic rotary engine from Mazda. Efficient and reliable, but not the most powerful.",
    powerCapacity: 4,
    statModifiers: { speed: 3, handling: 1, durability: -2 },
  },
  {
    id: "turbo-diesel",
    name: "Turbo Diesel",
    description:
      "A powerful diesel engine. Good for heavy-duty work and long-distance travel.",
    powerCapacity: 8,
    statModifiers: { speed: 2, durability: 3 },
  },
  {
    id: "military-turbine",
    name: "Military Turbine",
    description:
      "A military-grade turbine engine, probably from a fighter jet. Good for heavy-duty work and long-distance travel.",
    powerCapacity: 12,
    statModifiers: { speed: 4, handling: -1, durability: 1 },
  },
];
