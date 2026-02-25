import { useState, useCallback } from "react";
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
  onViewChange?: (view: string) => void;
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
  onViewChange,
  isActive = true,
}: UseVimOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const clamp = useCallback(
    (idx: number) => Math.max(0, Math.min(idx, listLength - 1)),
    [listLength],
  );

  useInput(
    (input, key) => {
      if (!isActive) return;

      // Navigation
      if (input === "j" || key.downArrow) {
        setSelectedIndex((i) => clamp(i + 1));
      } else if (input === "k" || key.upArrow) {
        setSelectedIndex((i) => clamp(i - 1));
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
      }

      // View switching
      if (input === "1") {
        onViewChange?.("scoreboard");
      } else if (input === "2") {
        onViewChange?.("standings");
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

      // Quit
      if (input === "q") {
        onQuit?.();
      }
    },
    { isActive },
  );

  return { selectedIndex, setSelectedIndex };
}
