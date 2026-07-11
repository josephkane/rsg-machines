import type { MachineSelection } from '../types/machine';

export function parseSelectionIDs(search: string): {
  chassisId: string | null;
  engineId: string | null;
  suspensionId: string | null;
  armorId: string | null;
  addonIds: string[];
} {
  const params = new URLSearchParams(search);
  return {
    chassisId: params.get('chassis'),
    engineId: params.get('engine'),
    suspensionId: params.get('suspension'),
    armorId: params.get('armor'),
    addonIds: params.getAll('addon'),
  };
}

export function selectionToSearch(
  selection: MachineSelection,
  pathname: string = window.location.pathname,
): string {
  const params = new URLSearchParams();
  if (selection.chassis) params.set('chassis', selection.chassis.id);
  if (selection.engine) params.set('engine', selection.engine.id);
  if (selection.suspension) params.set('suspension', selection.suspension.id);
  if (selection.armor) params.set('armor', selection.armor.id);
  for (const addon of selection.addons) params.append('addon', addon.id);
  const search = params.toString();
  return search ? `?${search}` : pathname;
}
