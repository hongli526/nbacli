import axios from "axios";

export interface TeamStanding {
  rank: number;
  teamTricode: string;
  teamName: string;
  wins: number;
  losses: number;
  pct: string;
  gamesBehind: string;
  streak: string;
  lastTen: string;
}

export interface StandingsData {
  east: TeamStanding[];
  west: TeamStanding[];
}

const STATS_HEADERS = {
  Referer: "https://www.nba.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
  Accept: "application/json",
};

export async function fetchStandings(): Promise<StandingsData> {
  const url =
    "https://cdn.nba.com/static/json/liveData/standings/standings_00.json";

  const { data } = await axios.get(url, { headers: STATS_HEADERS });

  const teams = data.standings.entries;

  const mapTeam = (t: any, idx: number): TeamStanding => ({
    rank: idx + 1,
    teamTricode: t.team?.triCode ?? t.teamTriCode ?? "",
    teamName: t.team?.name ?? t.teamName ?? "",
    wins: t.stats?.wins?.value ?? t.wins ?? 0,
    losses: t.stats?.losses?.value ?? t.losses ?? 0,
    pct: (t.stats?.winPct?.value ?? t.winPct ?? 0).toFixed(3),
    gamesBehind: String(t.stats?.gamesBehind?.value ?? t.gamesBehind ?? "-"),
    streak: t.stats?.streak?.value
      ? `${t.stats.streak.value > 0 ? "W" : "L"}${Math.abs(t.stats.streak.value)}`
      : (t.streak ?? "-"),
    lastTen: t.stats?.last10Record
      ? `${t.stats.last10Record.wins}-${t.stats.last10Record.losses}`
      : (t.lastTen ?? "-"),
  });

  // The NBA API returns standings grouped; we need to split by conference
  const east: TeamStanding[] = [];
  const west: TeamStanding[] = [];

  let eastIdx = 0;
  let westIdx = 0;

  for (const t of teams) {
    const conf =
      t.team?.conference ?? t.teamConference ?? t.conference ?? "";
    if (conf.toLowerCase().includes("east")) {
      east.push(mapTeam(t, eastIdx++));
    } else {
      west.push(mapTeam(t, westIdx++));
    }
  }

  return { east, west };
}
