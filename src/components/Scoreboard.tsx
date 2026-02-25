import React from "react";
import { Box, Text } from "ink";
import type { Game } from "../api/scoreboard.js";

interface Props {
  games: Game[];
  selectedIndex: number;
  dateLabel?: string;
}

function statusColor(status: number): string {
  switch (status) {
    case 2:
      return "green"; // live
    case 3:
      return "gray"; // final
    default:
      return "yellow"; // scheduled
  }
}

export function Scoreboard({ games, selectedIndex, dateLabel = "Today" }: Props) {
  if (games.length === 0) {
    return (
      <Box padding={1}>
        <Text dimColor>No games for {dateLabel}.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box>
        <Text bold underline>Games — {dateLabel}</Text>
        <Text dimColor>  (H/L: prev/next day)</Text>
      </Box>
      <Text> </Text>
      {games.map((game, i) => {
        const isSelected = i === selectedIndex;
        const color = statusColor(game.gameStatus);

        return (
          <Box key={game.gameId}>
            <Text
              bold={isSelected}
              color={isSelected ? "cyan" : undefined}
            >
              {isSelected ? "▸ " : "  "}
            </Text>
            <Text bold={isSelected}>
              {game.awayTeam.teamTricode}
            </Text>
            <Text> </Text>
            <Text bold={isSelected}>
              {game.gameStatus >= 2
                ? `${game.awayTeam.score}`
                : ""}
            </Text>
            <Text dimColor> @ </Text>
            <Text bold={isSelected}>
              {game.homeTeam.teamTricode}
            </Text>
            <Text> </Text>
            <Text bold={isSelected}>
              {game.gameStatus >= 2
                ? `${game.homeTeam.score}`
                : ""}
            </Text>
            <Text>  </Text>
            <Text color={color}>{game.gameStatusText}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
