export const CONFIG = {
  // Fill these with endpoint paths from the Limitless developer docs
  // (placings, decklists, matches). You’ll just copy URLs from the docs.
  baseUrl: "https://api.limitlesstcg.com", // example; confirm actual base from docs
  endpoints: {
    tournaments: "/vX/tournaments",      // replace with real path
    decklists: "/vX/decklists",          // replace with real path
    matches: "/vX/matches"               // replace with real path
  },
  // Filters
  format: "Standard",
  lookbackDays: 60,
  minCardAppearances: 15
};
