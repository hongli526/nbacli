import axios from "axios";

export interface PlayerStats {
  name: string;
  min: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  fg: string;
  threes: string;
  ft: string;
  plusMinus: number;
}

export interface TeamBoxScore {
  teamTricode: string;
  teamName: string;
  players: PlayerStats[];
  score: number;
  totals: PlayerStats;
}

export interface BoxScoreData {
  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
  gameStatusText: string;
}

// ESPN labels: MIN, PTS, FG, 3PT, FT, REB, AST, TO, STL, BLK, OREB, DREB, PF, +/-
function parsePlayer(athlete: any, stats: string[]): PlayerStats {
  return {
    name: athlete.displayName ?? "",
    min: stats[0] ?? "0",
    pts: parseInt(stats[1] ?? "0", 10),
    fg: stats[2] ?? "0-0",
    threes: stats[3] ?? "0-0",
    ft: stats[4] ?? "0-0",
    reb: parseInt(stats[5] ?? "0", 10),
    ast: parseInt(stats[6] ?? "0", 10),
    stl: parseInt(stats[8] ?? "0", 10),
    blk: parseInt(stats[9] ?? "0", 10),
    plusMinus: parseInt(stats[13] ?? "0", 10),
  };
}

export async function fetchBoxScore(gameId: string): Promise<BoxScoreData> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;

  const { data } = await axios.get(url);

  const boxscore = data.boxscore;
  const header = data.header;

  const statusText =
    header?.competitions?.[0]?.status?.type?.shortDetail ?? "";

  const competitors: any[] =
    header?.competitions?.[0]?.competitors ?? [];

  const competitorById = new Map(
    competitors.map((c: any) => [String(c.id), c]),
  );

  const mapTeam = (teamData: any): TeamBoxScore => {
    const team = teamData.team;
    const competitor = competitorById.get(String(team.id));
    const athletes = teamData.statistics[0]?.athletes ?? [];
    const totalsRaw: string[] = teamData.statistics[0]?.totals ?? [];
    return {
      teamTricode: team.abbreviation ?? "",
      teamName: team.displayName ?? "",
      players: athletes.map((a: any) =>
        parsePlayer(a.athlete, a.stats),
      ),
      score: parseInt(competitor?.score ?? "0", 10),
      totals: {
        name: "TOTAL",
        min: totalsRaw[0] ?? "0",
        pts: parseInt(totalsRaw[1] ?? "0", 10),
        fg: totalsRaw[2] ?? "0-0",
        threes: totalsRaw[3] ?? "0-0",
        ft: totalsRaw[4] ?? "0-0",
        reb: parseInt(totalsRaw[5] ?? "0", 10),
        ast: parseInt(totalsRaw[6] ?? "0", 10),
        stl: parseInt(totalsRaw[8] ?? "0", 10),
        blk: parseInt(totalsRaw[9] ?? "0", 10),
        plusMinus: parseInt(totalsRaw[13] ?? "0", 10),
      },
    };
  };

  // boxscore.players[0] is away, [1] is home (by displayOrder)
  const sorted = [...boxscore.players].sort(
    (a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );

  return {
    awayTeam: mapTeam(sorted[0]),
    homeTeam: mapTeam(sorted[1]),
    gameStatusText: statusText,
  };
}
