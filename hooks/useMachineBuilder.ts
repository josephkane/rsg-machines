import { useState, useEffect } from 'react';
import type { Chassis } from '../types/chassis';
import type { Engine } from '../types/engine';
import type { Suspension } from '../types/suspension';
import type { Armor } from '../types/armor';
import type { Addon } from '../types/addon';
import type { MachineSelection } from '../types/machine';
import { chassisOptions } from '../data/chassis';
import { engineOptions } from '../data/engines';
import { suspensionOptions } from '../data/suspensions';
import { armorOptions } from '../data/armors';
import { addonOptions } from '../data/addons';
import { parseSelectionIDs } from '../lib/url';

function initFromURL(): { chassis: Chassis | null; engine: Engine | null; suspension: Suspension | null; armor: Armor | null; addons: Addon[] } {
  const { chassisId, engineId, suspensionId, armorId, addonIds } = parseSelectionIDs(window.location.search);
  const chassis = chassisId ? (chassisOptions.find(c => c.id === chassisId) ?? null) : null;

  if (!chassis) {
    if (window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    return { chassis: null, engine: null, suspension: null, armor: null, addons: [] };
  }

  const engine = engineId ? (engineOptions.find(e => e.id === engineId) ?? null) : null;
  const suspension = suspensionId ? (suspensionOptions.find(s => s.id === suspensionId) ?? null) : null;
  const armor = armorId ? (armorOptions.find(a => a.id === armorId) ?? null) : null;
  const addons = addonIds.map(id => addonOptions.find(a => a.id === id)).filter((a): a is Addon => a !== undefined);

  return { chassis, engine, suspension, armor, addons };
}

export function useMachineBuilder() {
  const [chassis, setChassis] = useState<Chassis | null>(() => initFromURL().chassis);
  const [engine, setEngine] = useState<Engine | null>(() => initFromURL().engine);
  const [suspension, setSuspension] = useState<Suspension | null>(() => initFromURL().suspension);
  const [armor, setArmor] = useState<Armor | null>(() => initFromURL().armor);
  const [addons, setAddons] = useState<Addon[]>(() => initFromURL().addons);

  useEffect(() => {
    const params = new URLSearchParams();
    if (chassis) params.set('chassis', chassis.id);
    if (engine) params.set('engine', engine.id);
    if (suspension) params.set('suspension', suspension.id);
    if (armor) params.set('armor', armor.id);
    for (const addon of addons) params.append('addon', addon.id);
    const search = params.toString();
    window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname);
  }, [chassis, engine, suspension, armor, addons]);

  function selectChassis(c: Chassis | null) {
    setChassis(c);
    if (c === null) {
      setEngine(null);
      setSuspension(null);
      setArmor(null);
      setAddons([]);
    }
  }

  function addAddon(addon: Addon) {
    setAddons(prev => [...prev, addon]);
  }

  function removeAddon(id: string) {
    setAddons(prev => prev.filter(a => a.id !== id));
  }

  const isComplete =
    chassis !== null &&
    engine !== null &&
    suspension !== null &&
    armor !== null;

  const selection: MachineSelection = { chassis, engine, suspension, armor, addons };

  return {
    selection,
    setChassis: selectChassis,
    setEngine,
    setSuspension,
    setArmor,
    addAddon,
    removeAddon,
    isComplete,
  };
}
