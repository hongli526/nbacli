import axios from "axios";

export interface Game {
  gameId: string;
  gameStatusText: string;
  gameStatus: number; // 1=scheduled, 2=in progress, 3=final
  homeTeam: {
    teamTricode: string;
    teamName: string;
    score: number;
  };
  awayTeam: {
    teamTricode: string;
    teamName: string;
    score: number;
  };
}

export async function fetchScoreboard(): Promise<Game[]> {
  const url =
    "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";

  const { data } = await axios.get(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const games = data.scoreboard.games;

  return games.map((g: any) => ({
    gameId: g.gameId,
    gameStatusText: g.gameStatusText?.trim() ?? "",
    gameStatus: g.gameStatus,
    homeTeam: {
      teamTricode: g.homeTeam.teamTricode,
      teamName: g.homeTeam.teamName,
      score: g.homeTeam.score,
    },
    awayTeam: {
      teamTricode: g.awayTeam.teamTricode,
      teamName: g.awayTeam.teamName,
      score: g.awayTeam.score,
    },
  }));
}
