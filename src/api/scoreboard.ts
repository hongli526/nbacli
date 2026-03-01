import axios from "axios";
import { log } from "../utils/logger.js";

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

function mapStatus(state: string): number {
  if (state === "pre") return 1;
  if (state === "in") return 2;
  return 3; // post
}

export async function fetchScoreboard(date?: string): Promise<Game[]> {
  let url =
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
  if (date) {
    url += `?dates=${date}`;
  }

  log(`FETCH scoreboard ${url}`);
  const { data } = await axios.get(url);

  return data.events.map((ev: any) => {
    const comp = ev.competitions[0];
    const home = comp.competitors.find((c: any) => c.homeAway === "home");
    const away = comp.competitors.find((c: any) => c.homeAway === "away");
    const status = ev.status;

    return {
      gameId: ev.id,
      gameStatusText: status.type?.shortDetail ?? status.type?.description ?? "",
      gameStatus: mapStatus(status.type?.state ?? "post"),
      homeTeam: {
        teamTricode: home.team.abbreviation,
        teamName: home.team.displayName,
        score: parseInt(home.score ?? "0", 10),
      },
      awayTeam: {
        teamTricode: away.team.abbreviation,
        teamName: away.team.displayName,
        score: parseInt(away.score ?? "0", 10),
      },
    };
  });
}
