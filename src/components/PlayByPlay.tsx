import { Box, Text } from "ink";
import type { PlayEvent } from "../api/plays.js";

interface Props {
  plays: PlayEvent[];
  awayTricode: string;
  homeTricode: string;
  scrollOffset: number;
  gameStatusText: string;
}

export function PlayByPlay({ plays, awayTricode, homeTricode, scrollOffset, gameStatusText }: Props) {
  const termRows = process.stdout.rows ?? 24;
  // Reserve rows for header, score line, column header, separator, status bar, etc.
  const visibleRows = Math.max(termRows - 10, 5);

  const visible = plays.slice(scrollOffset, scrollOffset + visibleRows);
  const latestPlay = plays[0];

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>
        Play-by-Play — {gameStatusText}
      </Text>
      {latestPlay && (
        <Text bold>
          {`${awayTricode} ${latestPlay.awayScore}  @  ${homeTricode} ${latestPlay.homeScore}`}
        </Text>
      )}
      <Text> </Text>
      <Box>
        <Text bold>
          {"QTR".padEnd(5)}
          {"TIME".padEnd(8)}
          {"PLAY"}
        </Text>
      </Box>
      <Text dimColor>{"─".repeat(70)}</Text>
      {visible.map((play) => {
        const qtr = play.period <= 4 ? `Q${play.period}` : `OT${play.period - 4}`;
        const line = `${qtr.padEnd(5)}${play.clock.padEnd(8)}${play.text}`;

        if (play.scoringPlay) {
          return (
            <Box key={play.id}>
              <Text bold color="green">{line}</Text>
            </Box>
          );
        }

        if (play.shootingPlay) {
          return (
            <Box key={play.id}>
              <Text dimColor>{line}</Text>
            </Box>
          );
        }

        return (
          <Box key={play.id}>
            <Text>{line}</Text>
          </Box>
        );
      })}
      {plays.length > 0 && (
        <Text dimColor>
          {`\n  ${scrollOffset + 1}-${Math.min(scrollOffset + visibleRows, plays.length)} of ${plays.length} plays`}
        </Text>
      )}
    </Box>
  );
}
