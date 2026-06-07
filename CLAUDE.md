# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

เกมเป่ายิ้งฉุบ VS AI — a Thai-language Rock-Paper-Scissors web game. Zero dependencies, no build step, no package manager. Open `index.html` directly in a browser to run.

## Running the Project

Since this is a static site with no build tooling, serve it with any local HTTP server:

```bash
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

No install step required.

## File Notes

The three source files use a `.txt` extension but contain standard web code:

| File | Content |
|------|---------|
| `index.html.txt` | HTML markup and structure |
| `script.js.txt` | Game logic (vanilla JS) |
| `style.css.txt` | Styles (CSS3) |

The HTML references `style.css` and `script.js` (without `.txt`), so rename or copy the files before serving if the extensions matter.

## Architecture

The app has two UI states toggled via the `.hidden` CSS class:

1. **Setup area** (`#setup-area`) — player enters their name, hidden once game starts
2. **Game area** (`#game-area`) — scoreboard, result display, and choice buttons; hidden initially

Game flow in `script.js.txt`:
- `startGameBtn` click → hide setup, show game
- `.choice-btn` click → `playRound(playerChoice)` → `getAIChoice()` (random) → determine result → `updateScoreDisplay()` + `displayResult()`
- `resetBtn` click → zero out scores and reset result text (stays in game area, does not return to setup)

State is held in module-level variables (`playerScore`, `aiScore`, `playerName`); there is no persistence layer.

## Internationalisation

All UI text is Thai. Choice values in JS are English keys (`rock`, `paper`, `scissors`); the `thaiChoices` map in `displayResult()` handles translation for display. The Kanit font (Google Fonts) is loaded for Thai character rendering.

## Color Conventions

Result colors are applied inline via `resultText.style.color`:
- Win: `#2a9d8f` (teal/green)
- Lose: `#e76f51` (red-orange)
- Draw: `#8d99ae` (grey)
