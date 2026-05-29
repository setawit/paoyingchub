# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Thai-language Rock-Paper-Scissors (เป่ายิ้งฉุบ) game built as a zero-dependency static web application. There is no build step, no package manager, and no test framework — open `index.html.txt` directly in a browser to run it.

## File Extension Convention

All source files carry a `.txt` extension (`index.html.txt`, `style.css.txt`, `script.js.txt`). This is intentional (files were uploaded this way). The HTML file references `style.css` and `script.js` via `<link>` and `<script>` tags — if you rename the files to their natural extensions those references will work as-is; otherwise keep the `.txt` extensions consistent.

## Architecture

The app has two UI states managed by toggling a `.hidden` CSS class:

- **Setup view** (`#setup-area`): collects the player's name, then hides itself and shows the game view.
- **Game view** (`#game-area`): displays scoreboard, result text, and the three choice buttons.

All game state lives in module-level variables in `script.js.txt`:
- `playerScore` / `aiScore` — running totals, reset by the Reset button (scores reset, but the player name and game view stay visible).
- `playerName` — set once on start, displayed in score and result text.

The AI always picks randomly (`Math.random()`). Win/lose/draw logic is a simple explicit comparison in `playRound()`.

Result colors are hardcoded: win → `#2a9d8f` (teal), lose → `#e76f51` (orange-red), draw → `#8d99ae` (grey).

## Language & Styling

- All UI text and code comments are in Thai.
- The Kanit font (Google Fonts) is used throughout for Thai script legibility.
- Choice labels map: `rock` → ค้อน, `paper` → กระดาษ, `scissors` → กรรไกร.
