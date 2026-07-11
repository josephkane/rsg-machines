import { calculateStats, calculatePower, calculateMountingPoints } from '../lib/calculate';
import type { MachineSelection } from '../types/machine';

interface Props {
  selection: MachineSelection;
}

export function StatBlockMobile({ selection }: Props) {
  const { speed, handling, durability } = calculateStats(selection);
  const power = calculatePower(selection);
  const mountingPoints = calculateMountingPoints(selection);

  return (
    <div className="stat-block-mobile">
      <div className="stat-chip">
        <span className="stat-chip-label">Spd</span>
        <span className="stat-chip-value">{Math.round(speed)}</span>
      </div>
      <div className="stat-chip">
        <span className="stat-chip-label">Hdl</span>
        <span className="stat-chip-value">{Math.round(handling)}</span>
      </div>
      <div className="stat-chip">
        <span className="stat-chip-label">Dur</span>
        <span className="stat-chip-value">{Math.round(durability)}</span>
      </div>
      <div className={`stat-chip${power < 0 ? ' stat-chip--negative' : ''}`}>
        <span className="stat-chip-label">Pwr</span>
        <span className="stat-chip-value">{selection.engine ? Math.round(power) : '—'}</span>
      </div>
      <div className={`stat-chip${mountingPoints < 0 ? ' stat-chip--negative' : ''}`}>
        <span className="stat-chip-label">Mnt</span>
        <span className="stat-chip-value">{selection.chassis ? Math.round(mountingPoints) : '—'}</span>
      </div>
    </div>
  );
}
