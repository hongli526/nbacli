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
}

export interface BoxScoreData {
  homeTeam: TeamBoxScore;
  awayTeam: TeamBoxScore;
  gameStatusText: string;
}

const STATS_HEADERS = {
  Referer: "https://www.nba.com/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)",
  Accept: "application/json",
};

export async function fetchBoxScore(gameId: string): Promise<BoxScoreData> {
  const url = `https://cdn.nba.com/static/json/liveData/boxscore/boxscore_${gameId}.json`;

  const { data } = await axios.get(url, { headers: STATS_HEADERS });

  const game = data.game;

  const mapPlayers = (players: any[]): PlayerStats[] =>
    players
      .filter((p: any) => p.status === "ACTIVE" && p.statistics)
      .map((p: any) => {
        const s = p.statistics;
        return {
          name: `${p.firstName} ${p.familyName}`,
          min: s.minutesCalculated?.replace("PT", "").replace("M", "") ?? "0",
          pts: s.points ?? 0,
          reb: s.reboundsTotal ?? 0,
          ast: s.assists ?? 0,
          stl: s.steals ?? 0,
          blk: s.blocks ?? 0,
          fg: `${s.fieldGoalsMade ?? 0}-${s.fieldGoalsAttempted ?? 0}`,
          threes: `${s.threePointersMade ?? 0}-${s.threePointersAttempted ?? 0}`,
          ft: `${s.freeThrowsMade ?? 0}-${s.freeThrowsAttempted ?? 0}`,
          plusMinus: s.plusMinusPoints ?? 0,
        };
      });

  return {
    homeTeam: {
      teamTricode: game.homeTeam.teamTricode,
      teamName: game.homeTeam.teamName,
      players: mapPlayers(game.homeTeam.players),
    },
    awayTeam: {
      teamTricode: game.awayTeam.teamTricode,
      teamName: game.awayTeam.teamName,
      players: mapPlayers(game.awayTeam.players),
    },
    gameStatusText: game.gameStatusText?.trim() ?? "",
  };
}
