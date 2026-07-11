import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { SummarizePayload } from "../lib/summarize.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.RSG_MACHINES_SUMMARIZE_API_KEY;
  if (!apiKey) {
    res
      .status(500)
      .json({ error: "Server is missing RSG_MACHINES_SUMMARIZE_API_KEY" });
    return;
  }

  const payload = req.body as SummarizePayload;
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
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
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
    res
      .status(response.status)
      .json({ error: `API request failed (${response.status}): ${errorText}` });
    return;
  }

  const data = await response.json();
  const textBlock = data.content?.find(
    (block: { type: string; text?: string }) => block.type === "text",
  );
  if (!textBlock?.text) {
    res.status(502).json({ error: "No text content in API response" });
    return;
  }

  res.status(200).json({ summary: textBlock.text as string });
}
