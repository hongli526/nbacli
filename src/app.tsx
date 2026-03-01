import React, { useState, useEffect, useCallback } from "react";
import { render, Box, Text, useApp, useInput } from "ink";
import { Scoreboard } from "./components/Scoreboard.js";
import { BoxScore } from "./components/BoxScore.js";
import { PlayByPlay } from "./components/PlayByPlay.js";
import { Standings } from "./components/Standings.js";
import { fetchScoreboard, type Game } from "./api/scoreboard.js";
import { fetchBoxScore, type BoxScoreData } from "./api/boxscore.js";
import { fetchPlays, type PlayEvent } from "./api/plays.js";
import { fetchStandings, type StandingsData } from "./api/standings.js";
import { useAutoRefresh } from "./hooks/useAutoRefresh.js";
import { useVim } from "./hooks/useVim.js";

type View = "scoreboard" | "game" | "standings";
type GameView = "boxscore" | "plays";

function App() {
  const { exit } = useApp();
  const [view, setView] = useState<View>("scoreboard");
  const [gameView, setGameView] = useState<GameView>("boxscore");
  const [showHelp, setShowHelp] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [boxScore, setBoxScore] = useState<BoxScoreData | null>(null);
  const [plays, setPlays] = useState<PlayEvent[] | null>(null);
  const [playsScrollOffset, setPlaysScrollOffset] = useState(0);
  const [standings, setStandings] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [dateOffset, setDateOffset] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameLastUpdated, setGameLastUpdated] = useState<Date>(new Date());

  // Auto-refresh for scoreboard/standings only (user-controlled via '3')
  const { lastUpdated, tick, refresh, autoRefreshEnabled, toggleAutoRefresh } =
    useAutoRefresh(30000);

  // Load both box score and plays (used for initial game select)
  const loadGameData = useCallback(async (gameId: string) => {
    const [boxData, playsData] = await Promise.all([
      fetchBoxScore(gameId),
      fetchPlays(gameId),
    ]);
    setBoxScore(boxData);
    setPlays(playsData);
    setGameLastUpdated(new Date());
  }, []);

  // Load only plays (used for 10s auto-refresh in PBP view)
  const refreshPlays = useCallback(async (gameId: string) => {
    const playsData = await fetchPlays(gameId);
    setPlays(playsData);
    setGameLastUpdated(new Date());
  }, []);

  // Always-on 10s auto-refresh for PBP view only
  useEffect(() => {
    if (view !== "game" || gameView !== "plays" || !selectedGameId) return;
    const id = setInterval(() => {
      if (selectedGameId) refreshPlays(selectedGameId);
    }, 10000);
    return () => clearInterval(id);
  }, [view, gameView, selectedGameId, refreshPlays]);

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
  // tick drives scoreboard/standings refresh; game view has its own interval
  useEffect(() => {
    if (view === "scoreboard") {
      loadScoreboard(dateOffset);
    } else if (view === "standings") {
      loadStandings();
    } else if (view === "game" && selectedGameId) {
      // Initial load only (auto-refresh handled by separate interval)
      setLoading(true);
      setError(null);
      loadGameData(selectedGameId)
        .catch((e: any) => setError(`Failed to load game data: ${e.message}`))
        .finally(() => setLoading(false));
    }
  }, [view, tick, dateOffset, selectedGameId, loadScoreboard, loadStandings, loadGameData]);

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

  const inPlaysView = view === "game" && gameView === "plays";

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

  // Plays view scroll handler (clamped, not wrapping)
  useInput(
    (input, key) => {
      if (!plays) return;
      const termRows = process.stdout.rows ?? 24;
      const visibleRows = Math.max(termRows - 10, 5);
      const maxOffset = Math.max(plays.length - visibleRows, 0);
      if (input === "j" || key.downArrow) {
        setPlaysScrollOffset((o) => Math.min(o + 1, maxOffset));
      } else if (input === "k" || key.upArrow) {
        setPlaysScrollOffset((o) => Math.max(o - 1, 0));
      } else if (input === "g") {
        setPlaysScrollOffset(0);
      } else if (input === "G") {
        setPlaysScrollOffset(maxOffset);
      }
    },
    { isActive: inPlaysView && !searchMode },
  );

  const refreshAll = useCallback(() => {
    refresh();
    if (view === "game" && selectedGameId) {
      loadGameData(selectedGameId);
    }
  }, [refresh, view, selectedGameId, loadGameData]);

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
          setGameView("boxscore");
          setPlaysScrollOffset(0);
          setView("game");
        }
      }
    },
    onBack: () => {
      if (view === "game") {
        setBoxScore(null);
        setPlays(null);
        setSelectedGameId(null);
        setView("scoreboard");
      }
    },
    onViewChange: (v) => {
      if (v === "scoreboard" || v === "standings") {
        setView(v);
      }
    },
    onPlays: () => {
      if (view === "game") {
        if (gameView === "plays") {
          setGameView("boxscore");
        } else {
          setGameView("plays");
          setPlaysScrollOffset(0);
        }
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
      if (searchQuery) {
        setSearchQuery("");
        setSelectedIndex(0);
      }
    },
    onRefresh: refreshAll,
    onToggleAutoRefresh: toggleAutoRefresh,
    onToggleHelp: () => setShowHelp((v) => !v),
    onQuit: () => exit(),
  });

  const timeStr = (view === "game" ? gameLastUpdated : lastUpdated).toLocaleTimeString();

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
          {view === "game" && (
            <>
              {"  "}[<Text color={gameView === "plays" ? "cyan" : undefined}>P:Plays</Text>]
            </>
          )}
          {view !== "game" && (
            <>
              {"  "}[3:Auto-refresh <Text color={autoRefreshEnabled ? "green" : "red"}>{autoRefreshEnabled ? "ON" : "OFF"}</Text>]
            </>
          )}
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
          <Text>  <Text bold>p</Text>       Toggle play-by-play (in game view)</Text>
          <Text>  <Text bold>H/L</Text>    Previous/next day</Text>
          <Text>  <Text bold>t</Text>      {"Today's scores"}</Text>
          <Text>  <Text bold>/</Text>      Search games (Esc to clear)</Text>
          <Text>  <Text bold>1</Text>       Scores view</Text>
          <Text>  <Text bold>2</Text>       Standings view</Text>
          <Text>  <Text bold>3</Text>       Toggle auto-refresh (scores/standings)</Text>
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
      ) : view === "game" && gameView === "boxscore" && boxScore ? (
        <BoxScore data={boxScore} />
      ) : view === "game" && gameView === "plays" && plays && boxScore ? (
        <PlayByPlay
          plays={plays}
          awayTricode={boxScore.awayTeam.teamTricode}
          homeTricode={boxScore.homeTeam.teamTricode}
          scrollOffset={playsScrollOffset}
          gameStatusText={boxScore.gameStatusText}
        />
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

// Enter alternate screen buffer and clear it so Ink renders from the top
process.stdout.write("\x1b[?1049h\x1b[H\x1b[2J");
process.on("exit", () => {
  process.stdout.write("\x1b[?1049l");
});

render(<App />);
