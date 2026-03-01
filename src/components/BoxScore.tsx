import React from "react";
import { Box, Text } from "ink";
import type { BoxScoreData, PlayerStats } from "../api/boxscore.js";

interface Props {
  data: BoxScoreData;
}

function PlayerTable({
  teamTricode,
  players,
  totals,
}: {
  teamTricode: string;
  players: BoxScoreData["homeTeam"]["players"];
  totals: PlayerStats;
}) {
  const nameW = 22;
  const colW = 6;
  const shotW = 7;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        {teamTricode}
      </Text>
      <Box>
        <Text bold>
          {"PLAYER".padEnd(nameW)}
          {"MIN".padStart(colW)}
          {"PTS".padStart(colW)}
          {"REB".padStart(colW)}
          {"AST".padStart(colW)}
          {"STL".padStart(colW)}
          {"BLK".padStart(colW)}
          {"FG".padStart(shotW)}
          {"3PT".padStart(shotW)}
          {"FT".padStart(shotW)}
          {"+/-".padStart(colW)}
        </Text>
      </Box>
      <Text dimColor>{"─".repeat(nameW + colW * 7 + shotW * 3)}</Text>
      {players.map((p, i) => (
        <Box key={i}>
          <Text>
            {p.name.slice(0, nameW - 1).padEnd(nameW)}
            {p.min.padStart(colW)}
            {String(p.pts).padStart(colW)}
            {String(p.reb).padStart(colW)}
            {String(p.ast).padStart(colW)}
            {String(p.stl).padStart(colW)}
            {String(p.blk).padStart(colW)}
            {p.fg.padStart(shotW)}
            {p.threes.padStart(shotW)}
            {p.ft.padStart(shotW)}
            {(p.plusMinus >= 0 ? `+${p.plusMinus}` : String(p.plusMinus)).padStart(colW)}
          </Text>
        </Box>
      ))}
      <Text dimColor>{"─".repeat(nameW + colW * 7 + shotW * 3)}</Text>
      <Box>
        <Text bold>
          {totals.name.padEnd(nameW)}
          {totals.min.padStart(colW)}
          {String(totals.pts).padStart(colW)}
          {String(totals.reb).padStart(colW)}
          {String(totals.ast).padStart(colW)}
          {String(totals.stl).padStart(colW)}
          {String(totals.blk).padStart(colW)}
          {totals.fg.padStart(shotW)}
          {totals.threes.padStart(shotW)}
          {totals.ft.padStart(shotW)}
          {"".padStart(colW)}
        </Text>
      </Box>
    </Box>
  );
}

export function BoxScore({ data }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>
        Box Score — {data.gameStatusText}
      </Text>
      <Text bold>
        {`${data.awayTeam.teamTricode} ${data.awayTeam.score}  @  ${data.homeTeam.teamTricode} ${data.homeTeam.score}`}
      </Text>
      <Text> </Text>
      <PlayerTable
        teamTricode={data.awayTeam.teamTricode}
        players={data.awayTeam.players}
        totals={data.awayTeam.totals}
      />
      <Text> </Text>
      <PlayerTable
        teamTricode={data.homeTeam.teamTricode}
        players={data.homeTeam.players}
        totals={data.homeTeam.totals}
      />
    </Box>
  );
}
