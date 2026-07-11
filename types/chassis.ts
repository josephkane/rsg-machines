export interface Chassis {
  id: string;
  name: string;
  description: string;
  stats: {
    speed: number;
    handling: number;
    durability: number;
    mountingPoints: number;
  };
}
