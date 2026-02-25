import React from "react";
import { Box, Text } from "ink";
import type { StandingsData, TeamStanding } from "../api/standings.js";

interface Props {
  data: StandingsData;
}

function ConferenceTable({
  title,
  teams,
}: {
  title: string;
  teams: TeamStanding[];
}) {
  const rankW = 4;
  const nameW = 22;
  const colW = 7;

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">
        {title}
      </Text>
      <Box>
        <Text bold>
          {"#".padEnd(rankW)}
          {"TEAM".padEnd(nameW)}
          {"W".padStart(colW)}
          {"L".padStart(colW)}
          {"PCT".padStart(colW)}
          {"GB".padStart(colW)}
          {"STK".padStart(colW)}
          {"L10".padStart(colW)}
        </Text>
      </Box>
      <Text dimColor>{"─".repeat(rankW + nameW + colW * 6)}</Text>
      {teams.map((t) => (
        <Box key={t.teamTricode}>
          <Text>
            {String(t.rank).padEnd(rankW)}
            {`${t.teamTricode} ${t.teamName}`.slice(0, nameW - 1).padEnd(nameW)}
            {String(t.wins).padStart(colW)}
            {String(t.losses).padStart(colW)}
            {t.pct.padStart(colW)}
            {t.gamesBehind.padStart(colW)}
            {t.streak.padStart(colW)}
            {t.lastTen.padStart(colW)}
          </Text>
        </Box>
      ))}
    </Box>
  );
}

export function Standings({ data }: Props) {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>
        NBA Standings
      </Text>
      <Text> </Text>
      <ConferenceTable title="Eastern Conference" teams={data.east} />
      <Text> </Text>
      <ConferenceTable title="Western Conference" teams={data.west} />
    </Box>
  );
}
