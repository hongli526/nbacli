# NBA CLI

A terminal-based NBA scoreboard, box scores, and standings viewer built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

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
| `Enter` / `l` | Select / drill into box score |
| `h` | Go back |
| `H` / `L` | Previous / next day |
| `t` | Jump to today's scores |
| `1` | Scores view |
| `2` | Standings view |
| `3` | Toggle auto-refresh (default: off) |
| `r` | Manual refresh |
| `?` | Toggle help |
| `q` | Quit |

## Views

- **Scoreboard** — Today's games with live scores, navigate between days with `H`/`L`
- **Box Score** — Player stats (PTS, REB, AST, STL, BLK, FG, 3PT, FT, +/-)
- **Standings** — Eastern and Western conference tables (W-L, PCT, GB, Streak, L10)

## Data Sources

- Scoreboard and box scores: [ESPN API](https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard)
- Standings: [ESPN API](https://site.api.espn.com/apis/v2/sports/basketball/nba/standings)
