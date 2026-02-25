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

function getStat(stats: any[], name: string): any {
  return stats.find((s: any) => s.name === name);
}

function mapEntries(entries: any[]): TeamStanding[] {
  return entries.map((entry: any, idx: number) => {
    const team = entry.team;
    const stats = entry.stats;

    const wins = getStat(stats, "wins")?.value ?? 0;
    const losses = getStat(stats, "losses")?.value ?? 0;
    const winPctStat = getStat(stats, "winPercent");
    const gb = getStat(stats, "gamesBehind")?.displayValue ?? "-";
    const streakStat = getStat(stats, "streak");
    const streak = streakStat?.displayValue ?? "-";
    const lastTen = getStat(stats, "Last Ten Games")?.displayValue ?? "-";

    return {
      rank: idx + 1,
      teamTricode: team.abbreviation ?? "",
      teamName: team.shortDisplayName ?? team.displayName ?? "",
      wins,
      losses,
      pct: winPctStat?.displayValue ?? (winPctStat?.value ?? 0).toFixed(3),
      gamesBehind: gb,
      streak,
      lastTen,
    };
  });
}

export async function fetchStandings(): Promise<StandingsData> {
  const url =
    "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings";

  const { data } = await axios.get(url);

  const conferences = data.children;
  let east: TeamStanding[] = [];
  let west: TeamStanding[] = [];

  for (const conf of conferences) {
    const name: string = conf.name?.toLowerCase() ?? "";
    const entries = [...conf.standings.entries].sort((a: any, b: any) => {
      const pctA = getStat(a.stats, "winPercent")?.value ?? 0;
      const pctB = getStat(b.stats, "winPercent")?.value ?? 0;
      return pctB - pctA;
    });
    const teams = mapEntries(entries);
    if (name.includes("east")) {
      east = teams;
    } else {
      west = teams;
    }
  }

  return { east, west };
}
