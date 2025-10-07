export const CONFIG = {
  baseUrl: "https://<your-username>.github.io/pokemon-tcg-api/data",
  endpoints: {
    tournaments: "/tournaments.json",
    decklists: "/decklists.json",
    matches: "/matches.json"
  },
  format: "Standard",
  lookbackDays: 60,
  minCardAppearances: 15
};
