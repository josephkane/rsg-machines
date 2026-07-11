import type { Suspension } from "../types/suspension";

export const suspensionOptions: Suspension[] = [
  {
    id: "racing",
    name: "Racing",
    description:
      "A suspension designed for speed and handling. Good for racing and chasing down opponents, but not very durable.",
    statModifiers: { handling: 3, durability: -1 },
  },
  {
    id: "rock-crawler",
    name: "Rock Crawler",
    description:
      "A suspension designed for off-roading and rock crawling. Good for moving quickly through rough terrain and obstacles, but spongy on straightaways.",
    statModifiers: { handling: 2, durability: 1 },
  },
  {
    id: "monster",
    name: "Monster",
    description:
      "A suspension designed for maximum durability and protection. Good for heavy combat and extreme environments, but slow and heavy.",
    statModifiers: { speed: -2, handling: -2, durability: 3 },
  },
];
