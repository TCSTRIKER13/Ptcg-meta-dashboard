import fetch from "node-fetch";
import { CONFIG } from "./config.js";

const KEY = process.env.LIMITLESS_API_KEY;

// Helper
async function getJson(url) {
  const res = await fetch(url, {
    headers: { "X-Access-Key": KEY } // per docs, key in header is accepted[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://docs.limitlesstcg.com/developer.html?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "1")
  });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json();
}

export async function fetchRecentData() {
  const since = new Date(Date.now() - CONFIG.lookbackDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // 1) List tournaments in timeframe + format
  const tourUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.tournaments}?format=${encodeURIComponent(CONFIG.format)}&since=${since}`;
  const tournaments = await getJson(tourUrl);

  // 2) Pull decklists for those tournaments
  const decklists = [];
  for (const t of tournaments) {
    const dlUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.decklists}?tournamentId=${encodeURIComponent(t.id)}`;
    const dls = await getJson(dlUrl);
    // Normalize minimal fields we need
    for (const d of dls) {
      decklists.push({
        tournamentId: t.id,
        tournamentName: t.name,
        date: t.date,
        player: d.player,
        archetype: d.archetype,
        placing: d.placing, // e.g., "Top 8", "1st", or numeric rank
        wins: d.wins ?? null,
        losses: d.losses ?? null,
        cards: d.cards?.map(c => ({ name: c.name, count: c.count })) ?? []
      });
    }
  }

  // 3) Optional: Matches for advanced matchup stats
  // You can enable this if you want matchup matrices later.
  // const matches = await Promise.all(tournaments.map(async (t) => {
  //   const mUrl = `${CONFIG.baseUrl}${CONFIG.endpoints.matches}?tournamentId=${encodeURIComponent(t.id)}`;
  //   return getJson(mUrl);
  // }));

  return { tournaments, decklists /*, matches: matches.flat()*/ };
}
