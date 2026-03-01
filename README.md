# NBA CLI

A terminal-based NBA scoreboard, box scores, play-by-play, and standings viewer built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Install

```bash
git clone git@github.com:hongli526/nbacli.git
cd nbacli
npm install
```

## Usage

```bash
npm start
```

## Keybindings

| Key | Action |
|-----|--------|
| `j` / `k` | Navigate up/down |
| `Enter` / `l` | Select / drill into game |
| `h` | Go back |
| `p` | Toggle play-by-play (in game view) |
| `H` / `L` | Previous / next day |
| `t` | Jump to today's scores |
| `/` | Search games (Esc to clear) |
| `1` | Scores view |
| `2` | Standings view |
| `3` | Toggle auto-refresh for scores/standings (default: off) |
| `r` | Manual refresh |
| `?` | Toggle help |
| `q` | Quit |

## Views

- **Scoreboard** — Today's games with live scores, navigate between days with `H`/`L`
- **Box Score** — Player stats (PTS, REB, AST, STL, BLK, FG, 3PT, FT, +/-)
- **Play-by-Play** — Live game feed with running score, auto-refreshes every 10s
- **Standings** — Eastern and Western conference tables (W-L, PCT, GB, Streak, L10)

## Data Sources

All data from the [ESPN API](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard) — no API key required.
