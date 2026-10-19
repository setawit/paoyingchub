# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A simple "Rock-Paper-Scissors vs AI" web game (เกมเป่ายิ้งฉุบ VS AI) built with
vanilla HTML, CSS, and JavaScript. The UI is in Thai and uses the Google
"Kanit" font. There is no build system, framework, or dependency — it runs
directly in the browser.

The game flow:
1. The player enters a name on a setup screen.
2. The game screen appears with a scoreboard, result area, and three choice
   buttons (rock/✊, paper/✋, scissors/✌️).
3. Each round, the player picks a weapon, the AI picks randomly, the winner is
   decided, and the score updates.
4. A "play again" (เล่นใหม่) button resets both scores.

## File Layout

The source files are stored with a trailing `.txt` extension:

- `index.html.txt` — page markup and structure
- `style.css.txt` — styling and layout
- `script.js.txt` — game logic (DOM refs, event listeners, round resolution)

> [!IMPORTANT]
> `index.html.txt` references the assets as `style.css` and `script.js`
> (without the `.txt` suffix). To run the game in a browser, the three files
> must be renamed to drop `.txt` (i.e. `index.html`, `style.css`, `script.js`)
> so the `<link>` and `<script>` tags resolve. When editing, edit the `.txt`
> files that are committed to the repo.

## Running the Game

There is no build step. After renaming the files to drop `.txt`, open
`index.html` in a browser, or serve the directory with any static file server,
for example:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Code Notes

- `script.js.txt` is organized into commented sections (Thai): element lookups,
  game state variables, event listeners, and the core game functions.
- Game state is held in module-level variables: `playerScore`, `aiScore`,
  `playerName`, and the `choices` array.
- Key functions: `getAIChoice()` (random AI move), `playRound()` (resolves a
  round and updates score), `updateScoreDisplay()`, and `displayResult()`
  (renders the outcome and Thai labels for each weapon).
- UI sections are toggled with the `hidden` CSS class (`setup-area` vs
  `game-area`).
- User-facing text is in Thai; keep new strings consistent with that language.
