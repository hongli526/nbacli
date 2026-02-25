import React from "react";
import { Box, Text } from "ink";
import type { BoxScoreData } from "../api/boxscore.js";

interface Props {
  data: BoxScoreData;
}

function PlayerTable({
  teamTricode,
  players,
}: {
  teamTricode: string;
  players: BoxScoreData["homeTeam"]["players"];
}) {
  const nameW = 22;
  const colW = 6;

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
          {"FG%".padStart(colW)}
          {"+/-".padStart(colW)}
        </Text>
      </Box>
      <Text dimColor>{"─".repeat(nameW + colW * 8)}</Text>
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
            {p.fgPct.padStart(colW)}
            {(p.plusMinus >= 0 ? `+${p.plusMinus}` : String(p.plusMinus)).padStart(colW)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export function BoxScore({ data }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>
        Box Score — {data.gameStatusText}
      </Text>
      <Text> </Text>
      <PlayerTable
        teamTricode={data.awayTeam.teamTricode}
        players={data.awayTeam.players}
      />
      <Text> </Text>
      <PlayerTable
        teamTricode={data.homeTeam.teamTricode}
        players={data.homeTeam.players}
      />
    </Box>
  );
}
