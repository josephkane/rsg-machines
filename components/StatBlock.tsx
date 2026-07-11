import { calculateStats, calculatePower, calculateMountingPoints } from '../lib/calculate';
import type { MachineSelection } from '../types/machine';

interface Props {
  selection: MachineSelection;
}

export function StatBlock({ selection }: Props) {
  const { speed, handling, durability } = calculateStats(selection);
  const power = calculatePower(selection);
  const mountingPoints = calculateMountingPoints(selection);

  return (
    <div className="stat-block">
      <h2 className="stat-block-title">Stats</h2>
      <dl className="stat-list">
        <div className="stat-row">
          <dt>Speed</dt>
          <dd>{Math.round(speed)}</dd>
        </div>
        <div className="stat-row">
          <dt>Handling</dt>
          <dd>{Math.round(handling)}</dd>
        </div>
        <div className="stat-row">
          <dt>Durability</dt>
          <dd>{Math.round(durability)}</dd>
        </div>
        <div className={`stat-row${power < 0 ? ' stat-row--negative' : ''}`}>
          <dt>Power</dt>
          <dd>{selection.engine ? Math.round(power) : '—'}</dd>
        </div>
        <div className={`stat-row${mountingPoints < 0 ? ' stat-row--negative' : ''}`}>
          <dt>Mounting Points</dt>
          <dd>{selection.chassis ? Math.round(mountingPoints) : '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
