export interface Addon {
  id: string;
  name: string;
  powerRequirement: number;
  mountingPointsCost: number;
  description: string;
  statModifiers?: {
    speed?: number;
    handling?: number;
    durability?: number;
  };
}
