import type { Chassis } from './chassis';
import type { Engine } from './engine';
import type { Suspension } from './suspension';
import type { Armor } from './armor';
import type { Addon } from './addon';

export interface MachineSelection {
  chassis: Chassis | null;
  engine: Engine | null;
  suspension: Suspension | null;
  armor: Armor | null;
  addons: Addon[];
}

export interface MachineStats {
  speed: number;
  handling: number;
  durability: number;
  powerCapacity: number;
  mountingPoints: number;
}
