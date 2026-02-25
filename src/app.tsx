import React, { useState, useEffect, useCallback } from "react";
import { render, Box, Text, useApp } from "ink";
import { Scoreboard } from "./components/Scoreboard.js";
import { BoxScore } from "./components/BoxScore.js";
import { Standings } from "./components/Standings.js";
import { fetchScoreboard, type Game } from "./api/scoreboard.js";
import { fetchBoxScore, type BoxScoreData } from "./api/boxscore.js";
import { fetchStandings, type StandingsData } from "./api/standings.js";
import { useAutoRefresh } from "./hooks/useAutoRefresh.js";
import { useVim } from "./hooks/useVim.js";

type View = "scoreboard" | "boxscore" | "standings";

function App() {
  const { exit } = useApp();
  const [view, setView] = useState<View>("scoreboard");
  const [showHelp, setShowHelp] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [boxScore, setBoxScore] = useState<BoxScoreData | null>(null);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { lastUpdated, tick, refresh, autoRefreshEnabled, toggleAutoRefresh } =
    useAutoRefresh(30000);

  const loadScoreboard = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchScoreboard();
      setGames(data);
    } catch (e: any) {
      setError(`Failed to load scoreboard: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBoxScore = useCallback(async (gameId: string) => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchBoxScore(gameId);
      setBoxScore(data);
    } catch (e: any) {
      setError(`Failed to load box score: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStandings = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchStandings();
      setStandings(data);
    } catch (e: any) {
      setError(`Failed to load standings: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data based on current view
  useEffect(() => {
    if (view === "scoreboard") {
      loadScoreboard();
    } else if (view === "standings") {
      loadStandings();
    } else if (view === "boxscore" && selectedGameId) {
      loadBoxScore(selectedGameId);
    }
  }, [view, tick, selectedGameId, loadScoreboard, loadStandings, loadBoxScore]);

  const listLength =
    view === "scoreboard" ? games.length : 0;

  const { selectedIndex } = useVim({
    listLength,
    isActive: true,
    onSelect: (index) => {
      if (view === "scoreboard" && games[index]) {
        const game = games[index];
        if (game.gameStatus >= 2) {
          setSelectedGameId(game.gameId);
          setView("boxscore");
        }
      }
    },
    onBack: () => {
      if (view === "boxscore") {
        setBoxScore(null);
        setSelectedGameId(null);
        setView("scoreboard");
      }
    },
    onViewChange: (v) => {
      if (v === "scoreboard" || v === "standings") {
        setView(v);
      }
    },
    onRefresh: refresh,
    onToggleAutoRefresh: toggleAutoRefresh,
    onToggleHelp: () => setShowHelp((v) => !v),
    onQuit: () => exit(),
  });

  const timeStr = lastUpdated.toLocaleTimeString();

  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box paddingX={1}>
        <Text bold color="magenta">
          🏀 NBA CLI
        </Text>
        <Text dimColor>
          {"  "}[<Text color={view === "scoreboard" ? "cyan" : undefined}>1:Scores</Text>]
          {"  "}[<Text color={view === "standings" ? "cyan" : undefined}>2:Standings</Text>]
          {"  "}[3:Auto-refresh <Text color={autoRefreshEnabled ? "green" : "red"}>{autoRefreshEnabled ? "ON" : "OFF"}</Text>]
          {"  "}[?:Help]
        </Text>
      </Box>

      {/* Content */}
      {loading ? (
        <Box padding={1}>
          <Text color="yellow">Loading...</Text>
        </Box>
      ) : error ? (
        <Box padding={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : view === "scoreboard" ? (
        <Scoreboard games={games} selectedIndex={selectedIndex} />
      ) : view === "boxscore" && boxScore ? (
        <BoxScore data={boxScore} />
      ) : view === "standings" && standings ? (
        <Standings data={standings} />
      ) : null}

      {/* Help panel */}
      {showHelp && (
        <Box flexDirection="column" paddingX={1} marginTop={1}>
          <Text bold underline>Keybindings</Text>
          <Text>  <Text bold>j/k</Text>    Navigate up/down</Text>
          <Text>  <Text bold>Enter/l</Text> Select / drill in</Text>
          <Text>  <Text bold>h</Text>       Go back</Text>
          <Text>  <Text bold>1</Text>       Scores view</Text>
          <Text>  <Text bold>2</Text>       Standings view</Text>
          <Text>  <Text bold>3</Text>       Toggle auto-refresh</Text>
          <Text>  <Text bold>r</Text>       Manual refresh</Text>
          <Text>  <Text bold>?</Text>       Toggle this help</Text>
          <Text>  <Text bold>q</Text>       Quit</Text>
        </Box>
      )}

      {/* Status bar */}
      <Box paddingX={1} marginTop={showHelp ? 0 : 1}>
        <Text dimColor>Updated: {timeStr}</Text>
      </Box>
    </Box>
  );
}

render(<App />);
