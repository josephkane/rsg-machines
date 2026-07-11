import { describe, expect, it } from 'vitest';
import { parseSelectionIDs, selectionToSearch } from './url';
import type { MachineSelection } from '../types/machine';

const emptySelection: MachineSelection = {
  chassis: null,
  engine: null,
  suspension: null,
  armor: null,
  addons: [],
};

describe('parseSelectionIDs', () => {
  it('returns all nulls and empty addons for an empty string', () => {
    expect(parseSelectionIDs('')).toEqual({
      chassisId: null,
      engineId: null,
      suspensionId: null,
      armorId: null,
      addonIds: [],
    });
  });

  it('parses all params when all are present', () => {
    expect(
      parseSelectionIDs('?chassis=c1&engine=e1&suspension=s1&armor=a1&addon=x1'),
    ).toEqual({
      chassisId: 'c1',
      engineId: 'e1',
      suspensionId: 's1',
      armorId: 'a1',
      addonIds: ['x1'],
    });
  });

  it('parses multiple addon params in order', () => {
    const result = parseSelectionIDs('?chassis=c1&addon=x1&addon=x2&addon=x3');
    expect(result.addonIds).toEqual(['x1', 'x2', 'x3']);
  });

  it('returns null for absent params while still parsing present ones', () => {
    const result = parseSelectionIDs('?chassis=c1');
    expect(result.chassisId).toBe('c1');
    expect(result.engineId).toBeNull();
    expect(result.suspensionId).toBeNull();
    expect(result.armorId).toBeNull();
    expect(result.addonIds).toEqual([]);
  });

  it('works without a leading ?', () => {
    const result = parseSelectionIDs('chassis=c1&engine=e1');
    expect(result.chassisId).toBe('c1');
    expect(result.engineId).toBe('e1');
  });
});

describe('selectionToSearch', () => {
  it('returns the pathname when nothing is selected', () => {
    expect(selectionToSearch(emptySelection, '/')).toBe('/');
  });

  it('returns the provided pathname (not a hardcoded fallback)', () => {
    expect(selectionToSearch(emptySelection, '/build')).toBe('/build');
  });

  it('serializes a chassis-only selection', () => {
    const selection: MachineSelection = {
      ...emptySelection,
      chassis: { id: 'c1' } as never,
    };
    expect(selectionToSearch(selection, '/')).toBe('?chassis=c1');
  });

  it('serializes a full selection with no addons', () => {
    const selection: MachineSelection = {
      chassis: { id: 'c1' } as never,
      engine: { id: 'e1' } as never,
      suspension: { id: 's1' } as never,
      armor: { id: 'a1' } as never,
      addons: [],
    };
    expect(selectionToSearch(selection, '/')).toBe(
      '?chassis=c1&engine=e1&suspension=s1&armor=a1',
    );
  });

  it('serializes multiple addons', () => {
    const selection: MachineSelection = {
      ...emptySelection,
      chassis: { id: 'c1' } as never,
      addons: [{ id: 'x1' } as never, { id: 'x2' } as never],
    };
    const result = selectionToSearch(selection, '/');
    expect(result).toBe('?chassis=c1&addon=x1&addon=x2');
  });

  it('round-trips through parseSelectionIDs', () => {
    const selection: MachineSelection = {
      chassis: { id: 'c1' } as never,
      engine: { id: 'e1' } as never,
      suspension: { id: 's1' } as never,
      armor: { id: 'a1' } as never,
      addons: [{ id: 'x1' } as never, { id: 'x2' } as never],
    };
    const search = selectionToSearch(selection, '/');
    const parsed = parseSelectionIDs(search);
    expect(parsed).toEqual({
      chassisId: 'c1',
      engineId: 'e1',
      suspensionId: 's1',
      armorId: 'a1',
      addonIds: ['x1', 'x2'],
    });
  });
});
