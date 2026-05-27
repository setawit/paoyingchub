# CLAUDE.md — paoyingchub

## Project overview

**เกมเป่ายิ้งฉุบ VS AI** ("Rock-Paper-Scissors vs AI") is a browser-based game written entirely in vanilla HTML5, CSS3, and JavaScript with no build tooling or dependencies beyond a Google Fonts CDN load. The UI and all copy are in Thai.

## Repository layout

```
paoyingchub/
├── index.html.txt   # HTML document (entry point)
├── script.js.txt    # Game logic
└── style.css.txt    # Styles
```

> **Note on `.txt` extensions:** The three source files use `.txt` extensions because they were uploaded to GitHub through the web interface. The content is valid HTML/JS/CSS. The HTML file references `style.css` and `script.js` (without `.txt`), so the files must be renamed to their proper extensions before the game can run from the repository as-is. Keep this in mind when making changes — either rename the files or update the `<link>` and `<script>` references in `index.html.txt` to match.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (`lang="th"`) |
| Styling | CSS3 — Flexbox layout, CSS transitions |
| Logic | Vanilla ES6 JavaScript (no frameworks) |
| Fonts | Google Fonts — [Kanit](https://fonts.google.com/specimen/Kanit) (Thai script support) |
| Build | None — open in any modern browser |
| Tests | None |
| CI/CD | None |

## How to run

Open `index.html` (rename from `index.html.txt`) directly in any modern browser — no server or install step required.

```bash
# Quick rename and open (Linux/macOS)
cp index.html.txt index.html
cp script.js.txt script.js
cp style.css.txt style.css
open index.html      # macOS
xdg-open index.html  # Linux
```

## Game flow

1. **Setup screen** — player enters their name and clicks "เริ่มเกม" (Start Game).
2. **Game screen** — three circular buttons: ✊ ค้อน (Rock), ✋ กระดาษ (Paper), ✌️ กรรไกร (Scissors).
3. Clicking a button calls `playRound(playerChoice)`, which:
   - Calls `getAIChoice()` — a `Math.random()` pick from `['rock', 'paper', 'scissors']`.
   - Determines win/draw/lose with standard RPS rules.
   - Increments the appropriate score counter.
   - Calls `displayResult()` to update the result text and scoreboard.
4. **Reset** — "เล่นใหม่" resets both scores to 0 and clears result text; the player name is preserved.

## Source file guide

### `index.html.txt`

- Single-page layout inside `.container` (max-width 500 px).
- Two mutually exclusive sections toggled via the `.hidden` CSS class:
  - `#setup-area` — name input + start button (visible on load).
  - `#game-area` — scoreboard, result area, choice buttons, reset button (hidden on load).
- Loads Google Fonts via `<link>` preconnect tags, then `style.css`, then `script.js` at the bottom of `<body>`.

### `script.js.txt`

Key DOM references captured at the top (all `getElementById` / `querySelectorAll`).

| Symbol | Type | Purpose |
|--------|------|---------|
| `playerScore` / `aiScore` | `let number` | Running score counters |
| `playerName` | `let string` | Set on game start, displayed in scoreboard and result text |
| `choices` | `const string[]` | `['rock', 'paper', 'scissors']` — source of truth for valid moves |
| `getAIChoice()` | function | Returns a random element from `choices` |
| `playRound(playerChoice)` | function | Core round logic; updates scores; calls display helpers |
| `updateScoreDisplay()` | function | Syncs `playerScore`/`aiScore` to DOM |
| `displayResult(result, playerChoice, aiChoice)` | function | Updates `#resultText` (color-coded) and `#choicesText` |

Result color coding:
- Win → `#2a9d8f` (teal/green)
- Lose → `#e76f51` (orange-red)
- Draw → `#8d99ae` (gray)

### `style.css.txt`

| Class / ID | Purpose |
|------------|---------|
| `body` | Full-viewport Flexbox centering, Kanit font, light-gray background (`#f0f2f5`) |
| `.container` | White card, rounded corners, shadow, max-width 500 px |
| `.hidden` | `display: none` — toggled by JS to switch screens |
| `.scoreboard` | Two-column flex row for player vs AI scores |
| `.score` | `3rem` orange (`#fca311`) score number |
| `.choices` | Flex row of the three choice buttons |
| `.choice-btn` | 100×100 px circle buttons; hover lifts with `translateY(-5px)` and shows orange border |
| `#resetBtn` | Red (`#d00000`) reset button, darker on hover (`#9d0208`) |

Primary color palette: `#22223b` (dark navy), `#4a4e69` (slate), `#fca311` (orange accent).

## Conventions

- **Language:** All UI copy is in Thai. Keep new copy in Thai to match.
- **No framework:** Do not introduce npm, bundlers, or JS frameworks without explicit agreement — the intentional constraint is zero tooling.
- **File extensions:** Work within the `.txt` naming scheme or rename all three files consistently and update the HTML references.
- **Vanilla DOM:** Use `getElementById`, `querySelector`, `classList`, `textContent`, and `style` directly — no helper libraries.
- **No comments in English:** Existing inline comments are in Thai; continue that pattern or omit comments entirely.
- **Score state lives in JS variables:** `playerScore` and `aiScore` are module-level `let` variables reset by the reset handler. There is no persistent storage (localStorage, etc.).

## Common tasks

### Add a new move (e.g., Lizard or Spock)

1. Append the move name to the `choices` array in `script.js.txt`.
2. Add a new `<button class="choice-btn" data-choice="...">` in `index.html.txt`.
3. Extend the win-condition `else if` in `playRound()`.
4. Add the Thai translation to the `thaiChoices` map in `displayResult()`.

### Change the AI strategy

Replace the body of `getAIChoice()` in `script.js.txt`. The function must return one of the strings in the `choices` array.

### Persist scores across page reloads

Use `localStorage` in `updateScoreDisplay()` to write scores, and read them back on script load to initialize `playerScore` / `aiScore`.

### Add a round limit / win condition

Introduce a `maxRounds` constant and check it at the end of `playRound()`. Disable choice buttons and show a final-result banner when the limit is reached.

## Git workflow

- Development branch for this documentation task: `claude/claude-md-docs-GpbT3`
- Main branch: `main`
- Commit messages follow the GitHub web-upload style already in history ("Add files via upload"). Prefer descriptive imperative-mood messages for code changes.
- Remote: proxied through `http://local_proxy@127.0.0.1:44233/git/setawit/paoyingchub`
- Push with: `git push -u origin <branch-name>`
