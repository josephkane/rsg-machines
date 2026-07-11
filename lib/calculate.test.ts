import { describe, it, expect } from 'vitest';
import { calculateStats, calculatePower, calculateMountingPoints } from './calculate';
import type { MachineSelection } from '../types/machine';
import type { Chassis } from '../types/chassis';
import type { Engine } from '../types/engine';
import type { Suspension } from '../types/suspension';
import type { Armor } from '../types/armor';
import type { Addon } from '../types/addon';

const baseChassis: Chassis = {
  id: 'c1',
  name: 'Test Chassis',
  stats: { speed: 10, handling: 8, durability: 12, mountingPoints: 4 },
};

const baseEngine: Engine = {
  id: 'e1',
  name: 'Test Engine',
  powerCapacity: 20,
};

const baseSuspension: Suspension = { id: 's1', name: 'Test Suspension' };
const baseArmor: Armor = { id: 'a1', name: 'Test Armor' };

function emptySelection(chassis: Chassis | null = null): MachineSelection {
  return { chassis, engine: null, suspension: null, armor: null, addons: [] };
}

describe('calculateStats', () => {
  it('returns chassis base stats when no modifiers exist anywhere', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: baseEngine,
      suspension: baseSuspension,
      armor: baseArmor,
      addons: [],
    };
    expect(calculateStats(sel)).toEqual({ speed: 10, handling: 8, durability: 12 });
  });

  it('stacks positive modifiers across multiple components', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: { ...baseEngine, statModifiers: { speed: 2 } },
      suspension: { ...baseSuspension, statModifiers: { handling: 3 } },
      armor: { ...baseArmor, statModifiers: { durability: 5 } },
      addons: [
        { id: 'ad1', name: 'Turbo', powerRequirement: 2, mountingPointsCost: 1, description: '', statModifiers: { speed: 1 } },
      ],
    };
    expect(calculateStats(sel)).toEqual({ speed: 13, handling: 11, durability: 17 });
  });

  it('reduces stats correctly with negative modifiers', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: { ...baseEngine, statModifiers: { speed: -3 } },
      suspension: { ...baseSuspension, statModifiers: { handling: -2 } },
      armor: { ...baseArmor, statModifiers: { durability: -4 } },
      addons: [],
    };
    expect(calculateStats(sel)).toEqual({ speed: 7, handling: 6, durability: 8 });
  });

  it('mounting points are not affected by any statModifier', () => {
    // Verify calculateStats does not touch mountingPoints at all
    const addon: Addon = {
      id: 'ad2',
      name: 'Heavy Plating',
      powerRequirement: 1,
      mountingPointsCost: 2,
      description: '',
      statModifiers: { speed: 1, handling: 1, durability: 1 },
    };
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: { ...baseEngine, statModifiers: { speed: 1 } },
      suspension: baseSuspension,
      armor: baseArmor,
      addons: [addon],
    };
    const stats = calculateStats(sel);
    // CoreStats does not include mountingPoints — just verify shape
    expect('mountingPoints' in stats).toBe(false);
    // And calculateMountingPoints still reflects chassis value minus addon cost
    expect(calculateMountingPoints(sel)).toBe(2);
  });
});

describe('calculatePower', () => {
  it('returns engine capacity unchanged when no consumers', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: baseEngine,
      suspension: baseSuspension,
      armor: baseArmor,
      addons: [],
    };
    expect(calculatePower(sel)).toBe(20);
  });

  it('subtracts suspension, armor, and addon draw', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: { ...baseEngine, powerCapacity: 30 },
      suspension: { ...baseSuspension, powerDraw: 5 },
      armor: { ...baseArmor, powerDraw: 4 },
      addons: [
        { id: 'ad1', name: 'A', powerRequirement: 3, mountingPointsCost: 1, description: '' },
        { id: 'ad2', name: 'B', powerRequirement: 2, mountingPointsCost: 1, description: '' },
      ],
    };
    expect(calculatePower(sel)).toBe(16); // 30 - 5 - 4 - 3 - 2
  });

  it('goes negative when consumers exceed capacity (no clamping)', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: { ...baseEngine, powerCapacity: 5 },
      suspension: { ...baseSuspension, powerDraw: 10 },
      armor: baseArmor,
      addons: [],
    };
    expect(calculatePower(sel)).toBe(-5);
  });

  it('treats missing powerDraw and powerRequirement as 0', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: baseEngine,
      suspension: baseSuspension, // no powerDraw
      armor: baseArmor,           // no powerDraw
      addons: [],
    };
    expect(calculatePower(sel)).toBe(20);
  });
});

describe('calculateMountingPoints', () => {
  it('returns chassis mountingPoints when no addons', () => {
    const sel = emptySelection(baseChassis);
    expect(calculateMountingPoints(sel)).toBe(4);
  });

  it('subtracts addon costs correctly', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: null,
      suspension: null,
      armor: null,
      addons: [
        { id: 'ad1', name: 'A', powerRequirement: 1, mountingPointsCost: 1, description: '' },
        { id: 'ad2', name: 'B', powerRequirement: 1, mountingPointsCost: 2, description: '' },
      ],
    };
    expect(calculateMountingPoints(sel)).toBe(1); // 4 - 1 - 2
  });

  it('goes negative when addons exceed chassis points (no clamping)', () => {
    const sel: MachineSelection = {
      chassis: baseChassis,
      engine: null,
      suspension: null,
      armor: null,
      addons: [
        { id: 'ad1', name: 'A', powerRequirement: 0, mountingPointsCost: 3, description: '' },
        { id: 'ad2', name: 'B', powerRequirement: 0, mountingPointsCost: 3, description: '' },
      ],
    };
    expect(calculateMountingPoints(sel)).toBe(-2); // 4 - 3 - 3
  });
});
