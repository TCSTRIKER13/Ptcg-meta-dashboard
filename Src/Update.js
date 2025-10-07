import { fetchRecentData } from "./fetchLimitless.js";
import { computeStats } from "./stats.js";
import { CONFIG } from "./config.js";
import fs from "fs";

async function main() {
  const raw = await fetchRecentData();
  const stats = computeStats(raw, CONFIG);

  // Write to /data for the frontend
  if (!fs.existsSync("data")) fs.mkdirSync("data");
  fs.writeFileSync("data/tournaments.json", JSON.stringify(stats.tournaments, null, 2));
  fs.writeFileSync("data/decklists.json", JSON.stringify(stats.decklists, null, 2));
  fs.writeFileSync("data/archetypes.json", JSON.stringify(stats.archetypeStats, null, 2));
  fs.writeFileSync("data/cards.json", JSON.stringify(stats.cardStats, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
