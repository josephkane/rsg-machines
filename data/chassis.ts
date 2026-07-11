import type { Chassis } from "../types/chassis";

export const chassisOptions: Chassis[] = [
  {
    id: "racer-frame",
    name: "Racer Frame",
    description:
      "Chassis from a classic street racing car. Lightweight and flexible, but not made to take hits.",
    stats: { speed: 8, handling: 8, durability: 4, mountingPoints: 2 },
  },
  {
    id: "utility-frame",
    name: "Utility Frame",
    description:
      "A sturdy frame designed for utility and durability. Good for long-distance travel and carrying heavy loads.",
    stats: { speed: 6, handling: 6, durability: 7, mountingPoints: 3 },
  },
  {
    id: "heavy-frame",
    name: "Heavy Frame",
    description:
      "A heavy frame designed for maximum durability and protection. Good for heavy combat and extreme environments.",
    stats: { speed: 4, handling: 3, durability: 10, mountingPoints: 5 },
  },
];
