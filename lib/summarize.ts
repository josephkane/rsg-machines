export interface SummarizePayload {
  stats: {
    speed: number;
    handling: number;
    durability: number;
    powerCapacity: number;
    mountingPoints: number;
  };
  remainingPower: number;
  remainingMountingPoints: number;
  chassisName: string;
  engineName: string;
  suspensionName: string;
  armorName: string;
  addonNames: string[];
}

export async function summarizeMachine(
  payload: SummarizePayload,
): Promise<string> {
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data.summary) {
    throw new Error("No summary in API response");
  }

  return data.summary as string;
}
