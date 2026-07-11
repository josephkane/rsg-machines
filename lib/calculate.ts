import type { MachineSelection } from '../types/machine';

export interface CoreStats {
  speed: number;
  handling: number;
  durability: number;
}

export function calculateStats(selection: MachineSelection): CoreStats {
  if (!selection.chassis) return { speed: 0, handling: 0, durability: 0 };
  const base = selection.chassis.stats;

  const components = [
    selection.engine,
    selection.suspension,
    selection.armor,
    ...selection.addons,
  ];

  let speed = base.speed;
  let handling = base.handling;
  let durability = base.durability;

  for (const c of components) {
    if (!c?.statModifiers) continue;
    speed += c.statModifiers.speed ?? 0;
    handling += c.statModifiers.handling ?? 0;
    durability += c.statModifiers.durability ?? 0;
  }

  return { speed, handling, durability };
}

export function calculatePower(selection: MachineSelection): number {
  const capacity = selection.engine?.powerCapacity ?? 0;
  const suspDraw = selection.suspension?.powerDraw ?? 0;
  const armorDraw = selection.armor?.powerDraw ?? 0;
  const addonDraw = selection.addons.reduce((sum, a) => sum + (a.powerRequirement ?? 0), 0);
  return capacity - suspDraw - armorDraw - addonDraw;
}

export function calculateMountingPoints(selection: MachineSelection): number {
  const total = selection.chassis ? selection.chassis.stats.mountingPoints : 0;
  const used = selection.addons.reduce((sum, a) => sum + (a.mountingPointsCost ?? 0), 0);
  return total - used;
}
