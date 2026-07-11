export interface Engine {
  id: string;
  name: string;
  description: string;
  powerCapacity: number;
  statModifiers?: {
    speed?: number;
    handling?: number;
    durability?: number;
  };
}
