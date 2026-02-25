import { useState, useCallback } from "react";
import { useInput } from "ink";

interface UseVimOptions {
  listLength: number;
  onSelect?: (index: number) => void;
  onBack?: () => void;
  onQuit?: () => void;
  onRefresh?: () => void;
  onViewChange?: (view: string) => void;
  isActive?: boolean;
}

export function useVim({
  listLength,
  onSelect,
  onBack,
  onQuit,
  onRefresh,
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

      // View switching
      if (input === "1") {
        onViewChange?.("scoreboard");
      } else if (input === "2") {
        onViewChange?.("standings");
      }

      // Refresh
      if (input === "r") {
        onRefresh?.();
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
