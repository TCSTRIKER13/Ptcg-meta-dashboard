// Compute archetype stats and card stats
export function computeStats({ tournaments, decklists }, cfg) {
  // Per deck win rate
  for (const d of decklists) {
    const total = (d.wins ?? 0) + (d.losses ?? 0);
    d.games = total;
    d.winRate = total > 0 ? d.wins / total : null;
    d.topCut = d.placing && (String(d.placing).toLowerCase().includes("top") || String(d.placing) === "1" || String(d.placing).toLowerCase() === "1st");
  }

  // Archetype aggregation
  const archetypes = {};
  for (const d of decklists) {
    if (!d.archetype) continue;
    const a = archetypes[d.archetype] ?? (archetypes[d.archetype] = { decks: 0, wins: 0, losses: 0, topCuts: 0, events: new Set() });
    a.decks++;
    a.wins += d.wins ?? 0;
    a.losses += d.losses ?? 0;
    if (d.topCut) a.topCuts++;
    a.events.add(d.tournamentId);
  }
  const archetypeStats = Object.entries(archetypes).map(([name, v]) => ({
    archetype: name,
    decks: v.decks,
    wins: v.wins,
    losses: v.losses,
    winRate: (v.wins + v.losses) > 0 ? v.wins / (v.wins + v.losses) : null,
    topCuts: v.topCuts,
    eventCount: v.events.size
  }));

  // Card aggregation
  const cardMap = new Map();
  for (const d of decklists) {
    const uniqueCardNames = new Set((d.cards ?? []).map(c => c.name));
    for (const name of uniqueCardNames) {
      const entry = cardMap.get(name) ?? { decksWith: 0, topCuts: 0, winRateSum: 0, winRateCount: 0 };
      entry.decksWith++;
      if (d.topCut) entry.topCuts++;
      if (d.winRate !== null) { entry.winRateSum += d.winRate; entry.winRateCount++; }
      cardMap.set(name, entry);
    }
  }
  const cardStatsRaw = Array.from(cardMap.entries()).map(([name, v]) => {
    const cutRate = v.decksWith > 0 ? v.topCuts / v.decksWith : 0;
    const avgWin = v.winRateCount > 0 ? v.winRateSum / v.winRateCount : null;
    return { card: name, appearances: v.decksWith, cutRate, avgWin };
  });

  // Score and filter small samples
  const cardStats = cardStatsRaw
    .filter(c => c.appearances >= cfg.minCardAppearances)
    .map(c => ({
      ...c,
      // Simple weighted score: prioritize conversion (Top cut), then win rate, then usage at the top.
      // Define MetaShareTop as cutRate * appearances normalized; here we approximate with cutRate.
      score: 0.5 * c.cutRate + 0.3 * (c.avgWin ?? 0) + 0.2 * c.cutRate
    }))
    .sort((a, b) => b.score - a.score);

  return { archetypeStats, cardStats, tournaments, decklists };
}
