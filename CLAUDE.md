# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project overview

A single-page Thai-language Rock-Paper-Scissors game (เกมเป่ายิ้งฉุบ) played against
a simple random-choice AI. Pure client-side HTML/CSS/JS, no build step, no
dependencies, no backend.

## File layout

- `index.html.txt` — page markup (name-entry screen + game screen)
- `script.js.txt` — game logic (score tracking, AI random choice, win/lose/draw)
- `style.css.txt` — styling (Kanit Google Font, card-style layout)

**Important:** the source files carry a `.txt` suffix appended to their real
extension (e.g. `script.js.txt` instead of `script.js`), so `index.html.txt`
cannot be opened directly in a browser and won't load its linked
`style.css`/`script.js` as-is. If asked to run or preview the game, rename/copy
the files to their proper extensions (`index.html`, `style.css`, `script.js`)
first, keeping the `<link>`/`<script src>` references in `index.html`
consistent with whatever names are used.

## Conventions

- All user-facing strings and code comments are in Thai — keep new UI text and
  comments in Thai to match the existing style, unless told otherwise.
- No framework, bundler, or package.json — edit the HTML/CSS/JS files directly.
- Element IDs (`setupArea`, `gameArea`, `playerScore`, `aiScore`, `resultText`,
  `choicesText`, `.choice-btn[data-choice]`, `resetBtn`, etc.) are the wiring
  between the three files; keep IDs/classes in sync across all three when
  renaming.
