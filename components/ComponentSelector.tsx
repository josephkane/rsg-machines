import { useState } from "react";

interface SelectableItem {
  id: string;
  name: string;
}

type SingleProps<T extends SelectableItem> = {
  label: string;
  options: T[];
  multi?: false;
  selected: T | null;
  onSelect: (item: T) => void;
};

type MultiProps<T extends SelectableItem> = {
  label: string;
  options: T[];
  multi: true;
  selectedItems: T[];
  onAdd: (item: T) => void;
  onRemove: (id: string) => void;
};

type Props<T extends SelectableItem> = SingleProps<T> | MultiProps<T>;

const STAT_LABELS: Record<string, string> = {
  speed: "SPD",
  handling: "HDL",
  durability: "DUR",
  mountingPoints: "MNT",
};

function getStatModifiers(item: SelectableItem): Record<string, number> {
  return (
    (item as { statModifiers?: Record<string, number> }).statModifiers ?? {}
  );
}

function getBaseStats(
  item: SelectableItem,
): Record<string, number> | undefined {
  return (item as { stats?: Record<string, number> }).stats;
}

function getDescription(item: SelectableItem): string | undefined {
  return (item as { description?: string }).description;
}

function getPowerCapacity(item: SelectableItem): number | undefined {
  return (item as { powerCapacity?: number }).powerCapacity;
}

function getPowerDraw(item: SelectableItem): number | undefined {
  return (item as { powerDraw?: number }).powerDraw;
}

function getPowerRequirement(item: SelectableItem): number | undefined {
  return (item as { powerRequirement?: number }).powerRequirement;
}

function getMountingCost(item: SelectableItem): number | undefined {
  return (item as { mountingPointsCost?: number }).mountingPointsCost;
}

export function ComponentSelector<T extends SelectableItem>(props: Props<T>) {
  const [open, setOpen] = useState(false);

  function handleOptionClick(item: T) {
    if (props.multi === true) {
      props.onAdd(item);
    } else {
      props.onSelect(item);
    }
    setOpen(false);
  }

  const displayName = (() => {
    if (props.multi === true) return `Choose ${props.label}`;
    if (props.selected !== null) return props.selected.name;
    return `Choose ${props.label}`;
  })();

  const isSelected = props.multi !== true && props.selected !== null;

  const selectedItemIds =
    props.multi === true
      ? new Set(props.selectedItems.map((i) => i.id))
      : new Set<string>();

  const filteredOptions = props.options.filter(
    (item) => !selectedItemIds.has(item.id),
  );

  return (
    <div className="component-slot">
      <div className="slot-label">{props.label}</div>

      <button
        className={`slot-button${isSelected ? " selected" : ""}`}
        onClick={() => setOpen(true)}
      >
        <span className="slot-plus">{isSelected ? "▶" : "+"}</span>
        <span className="slot-button-name">{displayName}</span>
      </button>

      {props.multi === true && props.selectedItems.length > 0 && (
        <div className="addon-tags">
          {props.selectedItems.map((item) => (
            <div key={item.id} className="addon-tag">
              <span>{item.name}</span>
              <button
                className="addon-tag-remove"
                onClick={() => props.onRemove(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">
                // SELECT {props.label.toUpperCase()}
              </span>
              <button className="modal-close" onClick={() => setOpen(false)}>
                [ CLOSE ]
              </button>
            </div>
            <div className="modal-options">
              {filteredOptions.length === 0 && (
                <div className="modal-empty">ALL OPTIONS EQUIPPED</div>
              )}
              {filteredOptions.map((item) => {
                const mods = getStatModifiers(item);
                const baseStats = getBaseStats(item);
                const desc = getDescription(item);
                const powerCap = getPowerCapacity(item);
                const powerDraw = getPowerDraw(item);
                const powerReq = getPowerRequirement(item);
                const mountCost = getMountingCost(item);
                const modEntries = Object.entries(mods).filter(
                  ([, v]) => v !== 0,
                );
                const hasStats =
                  baseStats !== undefined ||
                  powerCap !== undefined ||
                  (powerDraw !== undefined && powerDraw > 0) ||
                  (powerReq !== undefined && powerReq > 0) ||
                  (mountCost !== undefined && mountCost > 0) ||
                  modEntries.length > 0;

                return (
                  <div
                    key={item.id}
                    className="option-card"
                    onClick={() => handleOptionClick(item)}
                  >
                    <div className="option-card-name">{item.name}</div>
                    {desc && <div className="option-card-desc">{desc}</div>}
                    {hasStats && (
                      <div className="option-card-stats">
                        {baseStats &&
                          Object.entries(baseStats).map(([key, val]) => (
                            <span key={key} className="stat-base">
                              {STAT_LABELS[key] ?? key.toUpperCase()} {val}
                            </span>
                          ))}
                        {powerCap !== undefined && (
                          <span className="stat-base">PWR {powerCap}</span>
                        )}
                        {powerDraw !== undefined && powerDraw > 0 && (
                          <span className="stat-delta negative">
                            PWR -{powerDraw}
                          </span>
                        )}
                        {powerReq !== undefined && powerReq > 0 && (
                          <span className="stat-delta negative">
                            PWR -{powerReq}
                          </span>
                        )}
                        {mountCost !== undefined && mountCost > 0 && (
                          <span className="stat-delta negative">
                            MNT -{mountCost}
                          </span>
                        )}
                        {modEntries.map(([key, val]) => (
                          <span
                            key={key}
                            className={`stat-delta ${val > 0 ? "positive" : "negative"}`}
                          >
                            {STAT_LABELS[key] ?? key.toUpperCase()}{" "}
                            {val > 0 ? `+${val}` : val}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
