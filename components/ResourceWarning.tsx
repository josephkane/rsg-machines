import { calculatePower, calculateMountingPoints } from '../lib/calculate';
import type { MachineSelection } from '../types/machine';

interface Props {
  selection: MachineSelection;
}

export function ResourceWarning({ selection }: Props) {
  const powerNegative = selection.engine !== null && calculatePower(selection) < 0;
  const mountingNegative = calculateMountingPoints(selection) < 0;

  if (!powerNegative && !mountingNegative) return null;

  return (
    <div className="resource-warnings">
      {powerNegative && (
        <p className="resource-warning">
          Power draw exceeds capacity — reduce add-ons or switch to a higher-output engine.
        </p>
      )}
      {mountingNegative && (
        <p className="resource-warning">
          Mounting points exceeded — remove add-ons or choose a chassis with more mounting points.
        </p>
      )}
    </div>
  );
}
