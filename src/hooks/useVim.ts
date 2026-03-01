import { useState } from "react";
import { useInput } from "ink";

interface UseVimOptions {
  listLength: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  onQuit?: () => void;
  onRefresh?: () => void;
  onToggleAutoRefresh?: () => void;
  onToggleHelp?: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
  onSearch?: () => void;
  onClearSearch?: () => void;
  onViewChange?: (view: string) => void;
  onPlays?: () => void;
  isActive?: boolean;
}

export function useVim({
  listLength,
  onSelect,
  onBack,
  onQuit,
  onRefresh,
  onToggleAutoRefresh,
  onToggleHelp,
  onPrevDay,
  onNextDay,
  onToday,
  onSearch,
  onClearSearch,
  onViewChange,
  onPlays,
  isActive = true,
}: UseVimOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput(
    (input, key) => {
      if (!isActive) return;

      // Navigation (wrap around)
      if (input === "j" || key.downArrow) {
        setSelectedIndex((i) => (i + 1) % listLength);
      } else if (input === "k" || key.upArrow) {
        setSelectedIndex((i) => (i - 1 + listLength) % listLength);
      }

      // Select / drill in
      if (key.return || input === "l") {
        onSelect?.(selectedIndex);
      }

      // Go back
      if (input === "h") {
        onBack?.();
      }

      // Day navigation
      if (input === "H") {
        onPrevDay?.();
      } else if (input === "L") {
        onNextDay?.();
      } else if (input === "t") {
        onToday?.();
      }

      // View switching
      if (input === "1") {
        onViewChange?.("scoreboard");
      } else if (input === "2") {
        onViewChange?.("standings");
      }

      // Play-by-play toggle
      if (input === "p") {
        onPlays?.();
      }

      // Toggle auto-refresh
      if (input === "3") {
        onToggleAutoRefresh?.();
      }

      // Refresh
      if (input === "r") {
        onRefresh?.();
      }

      // Help
      if (input === "?") {
        onToggleHelp?.();
      }

      // Search
      if (input === "/") {
        onSearch?.();
      } else if (key.escape) {
        onClearSearch?.();
      }

      // Quit
      if (input === "q") {
        onQuit?.();
      }
    },
    { isActive },
  );

  return { selectedIndex, setSelectedIndex };
}
