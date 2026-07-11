import { useState } from "react";
import type { SummarizePayload } from "../lib/summarize";
import { summarizeMachine } from "../lib/summarize";

interface Props {
  payload: SummarizePayload;
  onResult: (summary: string) => void;
  onError: (msg: string) => void;
}

export function SummarizeButton({ payload, onResult, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const disabled =
    !payload.chassisName ||
    !payload.engineName ||
    !payload.suspensionName ||
    !payload.armorName;

  async function handleClick() {
    setLoading(true);
    try {
      const summary = await summarizeMachine(payload);
      onResult(summary);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={`summarize-button${disabled ? " summarize-button--disabled" : ""}${loading ? " summarize-button--loading" : ""}`}
      onClick={handleClick}
      disabled={disabled || loading}
      title={
        disabled
          ? "Select chassis, engine, suspension, and armor to summarize"
          : undefined
      }
    >
      {loading ? "Asking Trom…" : "Ask Trom"}
    </button>
  );
}
