import React, { useState, useEffect, useCallback } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
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
  const [dateOffset, setDateOffset] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { lastUpdated, tick, refresh, autoRefreshEnabled, toggleAutoRefresh } =
    useAutoRefresh(30000);

  // NBA dates are in US Eastern time
  const getETDate = useCallback((offset: number) => {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    et.setDate(et.getDate() + offset);
    return et;
  }, []);

  const getDateStr = useCallback((offset: number) => {
    const et = getETDate(offset);
    const y = et.getFullYear();
    const m = String(et.getMonth() + 1).padStart(2, "0");
    const d = String(et.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }, [getETDate]);

  const getDisplayDate = useCallback((offset: number) => {
    if (offset === 0) return "Today";
    if (offset === -1) return "Yesterday";
    if (offset === 1) return "Tomorrow";
    const et = getETDate(offset);
    return et.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, [getETDate]);

  const loadScoreboard = useCallback(async (offset: number) => {
    try {
      setError(null);
      setLoading(true);
      const data = await fetchScoreboard(getDateStr(offset));
      setGames(data);
    } catch (e: any) {
      setError(`Failed to load scoreboard: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [getDateStr]);

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
      loadScoreboard(dateOffset);
    } else if (view === "standings") {
      loadStandings();
    } else if (view === "boxscore" && selectedGameId) {
      loadBoxScore(selectedGameId);
    }
  }, [view, tick, dateOffset, selectedGameId, loadScoreboard, loadStandings, loadBoxScore]);

  const filteredGames = searchQuery
    ? games.filter((g) => {
        const q = searchQuery.toLowerCase();
        return (
          g.homeTeam.teamTricode.toLowerCase().includes(q) ||
          g.homeTeam.teamName.toLowerCase().includes(q) ||
          g.awayTeam.teamTricode.toLowerCase().includes(q) ||
          g.awayTeam.teamName.toLowerCase().includes(q)
        );
      })
    : games;

  const listLength =
    view === "scoreboard" ? filteredGames.length : 0;

  // Search mode input handler
  useInput(
    (input, key) => {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery("");
        setSelectedIndex(0);
      } else if (key.return) {
        setSearchMode(false);
      } else if (key.backspace || key.delete) {
        setSearchQuery((q) => q.slice(0, -1));
        setSelectedIndex(0);
      } else if (input && !key.ctrl && !key.meta) {
        setSearchQuery((q) => q + input);
        setSelectedIndex(0);
      }
    },
    { isActive: searchMode },
  );

  const { selectedIndex, setSelectedIndex } = useVim({
    listLength,
    isActive: !searchMode,
    onSelect: (index) => {
      if (view === "scoreboard" && filteredGames[index]) {
        const game = filteredGames[index];
        if (game.gameStatus >= 2) {
          setSelectedGameId(game.gameId);
          setSearchMode(false);
          setSearchQuery("");
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
    onPrevDay: () => {
      if (view === "scoreboard") {
        setDateOffset((d) => d - 1);
        setSelectedIndex(0);
      }
    },
    onNextDay: () => {
      if (view === "scoreboard") {
        setDateOffset((d) => d + 1);
        setSelectedIndex(0);
      }
    },
    onToday: () => {
      setDateOffset(0);
      setSelectedIndex(0);
      setView("scoreboard");
    },
    onSearch: () => {
      if (view === "scoreboard") {
        setSearchMode(true);
        setSearchQuery("");
      }
    },
    onClearSearch: () => {
      setSearchQuery("");
      setSelectedIndex(0);
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
      {showHelp ? (
        <Box flexDirection="column" paddingX={1} paddingY={1}>
          <Text bold underline>Keybindings</Text>
          <Text>  <Text bold>j/k</Text>    Navigate up/down</Text>
          <Text>  <Text bold>Enter/l</Text> Select / drill in</Text>
          <Text>  <Text bold>h</Text>       Go back</Text>
          <Text>  <Text bold>H/L</Text>    Previous/next day</Text>
          <Text>  <Text bold>t</Text>      {"Today's scores"}</Text>
          <Text>  <Text bold>/</Text>      Search games (Esc to clear)</Text>
          <Text>  <Text bold>1</Text>       Scores view</Text>
          <Text>  <Text bold>2</Text>       Standings view</Text>
          <Text>  <Text bold>3</Text>       Toggle auto-refresh</Text>
          <Text>  <Text bold>r</Text>       Manual refresh</Text>
          <Text>  <Text bold>?</Text>       Toggle this help</Text>
          <Text>  <Text bold>q</Text>       Quit</Text>
        </Box>
      ) : loading ? (
        <Box padding={1}>
          <Text color="yellow">Loading...</Text>
        </Box>
      ) : error ? (
        <Box padding={1}>
          <Text color="red">{error}</Text>
        </Box>
      ) : view === "scoreboard" ? (
        <Scoreboard games={filteredGames} selectedIndex={selectedIndex} dateLabel={getDisplayDate(dateOffset)} />
      ) : view === "boxscore" && boxScore ? (
        <BoxScore data={boxScore} />
      ) : view === "standings" && standings ? (
        <Standings data={standings} />
      ) : null}

      {/* Search bar */}
      {(searchMode || searchQuery) && (
        <Box paddingX={1}>
          <Text color="yellow">/</Text>
          <Text>{searchQuery}</Text>
          {searchMode && <Text color="yellow">_</Text>}
          {!searchMode && searchQuery && (
            <Text dimColor>  (Esc to clear)</Text>
          )}
        </Box>
      )}

      {/* Status bar */}
      <Box paddingX={1} marginTop={1}>
        <Text dimColor>Updated: {timeStr}</Text>
      </Box>
    </Box>
  );
}

// Enter alternate screen buffer so the terminal is clean after exit
process.stdout.write("\x1b[?1049h");
process.on("exit", () => {
  process.stdout.write("\x1b[?1049l");
});

render(<App />);
