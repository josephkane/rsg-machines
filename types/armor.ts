export interface Armor {
  id: string;
  name: string;
  description: string;
  powerDraw?: number;
  statModifiers?: {
    speed?: number;
    handling?: number;
    durability?: number;
  };
}
