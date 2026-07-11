import { useState } from "react";
import "./App.css";
import { useMachineBuilder } from "../hooks/useMachineBuilder";
import { ComponentSelector } from "../components/ComponentSelector";
import { Visualizer } from "../components/Visualizer";
import { StatBlock } from "../components/StatBlock";
import { StatBlockMobile } from "../components/StatBlockMobile";
import { ResourceWarning } from "../components/ResourceWarning";
import { SummarizeButton } from "../components/SummarizeButton";
import { NarrativeSummary } from "../components/NarrativeSummary";
import { Mechanic } from "../components/Mechanic";
import { chassisOptions } from "../data/chassis";
import { engineOptions } from "../data/engines";
import { suspensionOptions } from "../data/suspensions";
import { armorOptions } from "../data/armors";
import { addonOptions } from "../data/addons";
import {
  calculateStats,
  calculatePower,
  calculateMountingPoints,
} from "../lib/calculate";
import type { SummarizePayload } from "../lib/summarize";
import type { Chassis } from "../types/chassis";
import type { Engine } from "../types/engine";
import type { Suspension } from "../types/suspension";
import type { Armor } from "../types/armor";
import type { Addon } from "../types/addon";

export default function App() {
  const {
    selection,
    setChassis,
    setEngine,
    setSuspension,
    setArmor,
    addAddon,
    removeAddon,
  } = useMachineBuilder();

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  function clearNarrative() {
    setSummary(null);
    setSummaryError(null);
  }

  function handleSetChassis(c: Chassis | null) {
    setChassis(c);
    clearNarrative();
  }

  function handleSetEngine(e: Engine | null) {
    setEngine(e);
    clearNarrative();
  }

  function handleSetSuspension(s: Suspension | null) {
    setSuspension(s);
    clearNarrative();
  }

  function handleSetArmor(a: Armor | null) {
    setArmor(a);
    clearNarrative();
  }

  function handleAddAddon(addon: Addon) {
    addAddon(addon);
    clearNarrative();
  }

  function handleRemoveAddon(id: string) {
    removeAddon(id);
    clearNarrative();
  }

  const { speed, handling, durability } = calculateStats(selection);
  const remainingPower = calculatePower(selection);
  const remainingMountingPoints = calculateMountingPoints(selection);

  const summarizePayload: SummarizePayload = {
    stats: {
      speed,
      handling,
      durability,
      powerCapacity: selection.engine?.powerCapacity ?? 0,
      mountingPoints: selection.chassis?.stats.mountingPoints ?? 0,
    },
    remainingPower,
    remainingMountingPoints,
    chassisName: selection.chassis?.name ?? "",
    engineName: selection.engine?.name ?? "",
    suspensionName: selection.suspension?.name ?? "",
    armorName: selection.armor?.name ?? "",
    addonNames: selection.addons.map((a) => a.name),
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">READY...SET...GO!</h1>
        <p className="app-subtitle">ARE YOU READY FOR THE GREAT RACE?</p>
      </header>

      <main className="app-main">
        <div className="selectors-panel">
          <ComponentSelector
            label="Chassis"
            options={chassisOptions}
            selected={selection.chassis}
            onSelect={handleSetChassis}
          />

          {selection.chassis && (
            <>
              <ComponentSelector
                label="Engine"
                options={engineOptions}
                selected={selection.engine}
                onSelect={handleSetEngine}
              />

              <ComponentSelector
                label="Suspension"
                options={suspensionOptions}
                selected={selection.suspension}
                onSelect={handleSetSuspension}
              />

              <ComponentSelector
                label="Armor"
                options={armorOptions}
                selected={selection.armor}
                onSelect={handleSetArmor}
              />

              <ComponentSelector
                label="Add-ons"
                options={addonOptions}
                multi={true}
                selectedItems={selection.addons}
                onAdd={handleAddAddon}
                onRemove={handleRemoveAddon}
              />
            </>
          )}
        </div>

        <aside className="app-sidebar">
          {selection.chassis && (
            <button
              className="reset-button"
              onClick={() => handleSetChassis(null)}
            >
              Reset Build
            </button>
          )}
          <Visualizer selection={selection} />
          <StatBlock selection={selection} />
          <StatBlockMobile selection={selection} />
          <div className="action-bar">
            <ResourceWarning selection={selection} />
            <SummarizeButton
              payload={summarizePayload}
              onResult={setSummary}
              onError={setSummaryError}
            />
          </div>
        </aside>

        {(summary || summaryError) && (
          <div className="summary-panel">
            <Mechanic />
            <NarrativeSummary summary={summary} error={summaryError} />
          </div>
        )}
      </main>
    </div>
  );
}
