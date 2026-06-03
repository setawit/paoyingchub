# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**เกมเป่ายิ้งฉุบ VS AI** — A Thai-language Rock Paper Scissors browser game. The player enters a name, then plays rounds against an AI opponent (random choice). Scores accumulate until the player clicks "เล่นใหม่" (reset).

## File Naming Convention

All source files use `.txt` extensions despite containing HTML/CSS/JS content:
- `index.html.txt` — HTML structure
- `style.css.txt` — CSS styling
- `script.js.txt` — JavaScript game logic

To run the game locally, rename the files to their proper extensions (`index.html`, `style.css`, `script.js`) and open `index.html` in a browser. The HTML references `style.css` and `script.js` without the `.txt` suffix, so the `.txt` files will not load correctly as-is.

There is no build system, package manager, test suite, or linter.

## Architecture

The app has two UI phases controlled by CSS class `.hidden` (sets `display: none`):
1. **Setup phase** (`#setup-area`): Player enters their name and clicks "เริ่มเกม". On submit, the setup area is hidden and the game area is revealed.
2. **Game phase** (`#game-area`): Shows scoreboard, result text, three choice buttons (rock/paper/scissors), and a reset button.

**Game logic flow** (`script.js.txt`):
- `playRound(playerChoice)` → calls `getAIChoice()` (pure `Math.random()`) → determines win/draw/lose → calls `updateScoreDisplay()` and `displayResult()`
- Scores are held in module-level `let playerScore` and `let aiScore` variables; reset resets both to 0 without reloading the page

**Styling** (`style.css.txt`):
- Uses Google Fonts **Kanit** (loaded via `<link>`) for proper Thai text rendering
- Result text color changes dynamically via `resultText.style.color`: green (`#2a9d8f`) for win, red (`#e76f51`) for lose, grey (`#8d99ae`) for draw
- Choice buttons are circular (`border-radius: 50%`) and lift on hover (`translateY(-5px)`)
