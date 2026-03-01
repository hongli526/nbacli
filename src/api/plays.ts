import axios from "axios";
import { log } from "../utils/logger.js";

export interface PlayEvent {
  id: string;
  clock: string;
  period: number;
  text: string;
  awayScore: number;
  homeScore: number;
  scoringPlay: boolean;
  shootingPlay: boolean;
}

export async function fetchPlays(gameId: string): Promise<PlayEvent[]> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;

  log(`FETCH plays ${url}`);
  const { data } = await axios.get(url);

  const rawPlays: any[] = data.plays ?? [];

  const plays: PlayEvent[] = rawPlays.map((p: any) => ({
    id: String(p.id ?? ""),
    clock: p.clock?.displayValue ?? "",
    period: p.period?.number ?? 0,
    text: (p.text ?? "").replace(/\n/g, " "),
    awayScore: parseInt(p.awayScore ?? "0", 10),
    homeScore: parseInt(p.homeScore ?? "0", 10),
    scoringPlay: p.scoringPlay ?? false,
    shootingPlay: p.shootingPlay ?? false,
  }));

  // Newest first
  plays.reverse();

  return plays;
}
