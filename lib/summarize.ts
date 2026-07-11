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
  const {
    stats,
    remainingPower,
    remainingMountingPoints,
    chassisName,
    engineName,
    suspensionName,
    armorName,
    addonNames,
  } = payload;

  const addonsText = addonNames.length > 0 ? addonNames.join(", ") : "none";

  const userMessage =
    `Chassis: ${chassisName}\n` +
    `Engine: ${engineName}\n` +
    `Suspension: ${suspensionName}\n` +
    `Armor: ${armorName}\n` +
    `Add-ons: ${addonsText}\n\n` +
    `Speed: ${stats.speed}\n` +
    `Handling: ${stats.handling}\n` +
    `Durability: ${stats.durability}\n` +
    `Power Capacity: ${stats.powerCapacity} (${remainingPower} remaining after draw)\n` +
    `Mounting Points: ${stats.mountingPoints} (${remainingMountingPoints} remaining)`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key":
        // TODO: add api key function
        "",
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "You are a narrator for a Dungeons & Dragons 2024 campaign featuring magical racing machines. When given a vehicle's stat block and component list, write a 2–3 sentence narrative description of its strengths and weaknesses in the voice of a knowledgeable pit crew chief. Be vivid and specific to the numbers.",
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (block: { type: string; text?: string }) => block.type === "text",
  );
  if (!textBlock?.text) {
    throw new Error("No text content in API response");
  }

  return textBlock.text as string;
}
