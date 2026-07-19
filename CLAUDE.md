# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

Despite the name "paoyingchub", this is the **FarmPlan Operating System (FPOS) blueprint repository** — an architecture-documentation repo (mostly in Thai) for an AI-powered farm planning platform, not a working codebase. There is no build system, package manager, linter, or test runner. The numbered `00_`–`11_` Markdown files at the root ARE the product; the code folders (`/core`, `/api`, `/ui`, etc.) are scaffolding for future code and currently contain only READMEs.

The two non-documentation items:
- `ui/farmplan-v3.html` — a self-contained working prototype (single HTML file, LocalStorage persistence, no dependencies). Verify changes by opening it in a browser; there is no build step.
- `archive/` — the legacy paoyingchub rock-paper-scissors game, kept only for git history. Never modify it or treat it as part of FPOS.

## Document Hierarchy and Reading Order

`00_MASTER.md` is the repository root document — vision, rules, and the AI Contract that governs everything else. Documents are numbered in dependency order (`00_MASTER.md` §13): read `00` → `01_PRD` → `02_DOMAIN_MODEL` → `03_DATABASE` → `04_OPTIMIZATION_ENGINE` → `05_KNOWLEDGE_BASE` → `06_API_SPECIFICATION` → `07_UI_SPECIFICATION` → `08_AGENT_SYSTEM` → `09_ENGINEERING_STANDARD` → `10_TEST_PLAN` → `11_DEPLOYMENT`.

**`02_DOMAIN_MODEL.md` is the Single Source of Truth for entities.** Entity names used anywhere else (database schema, API spec, UI, prototype code) must match it exactly. To change an entity, edit `02_DOMAIN_MODEL.md` first, then propagate to the other documents.

Each root document is "governed by" a folder and vice versa (see the Repository Map in `README.md`): `/core`↔`04`, `/database`↔`03`, `/knowledge`↔`05`, `/api`↔`06`, `/ui`↔`07`, `/agents` and `/prompts`↔`08`, `/tests`↔`10`. Keep a folder's contents consistent with its governing spec.

## Rules for Editing Documents

From `00_MASTER.md` §10 and `09_ENGINEERING_STANDARD.md` §5, every `.md` file must have:
- A header block with **Version** and **Last Updated** (bump these on every meaningful edit)
- Systematic headings and a **Cross Reference** section linking related documents
- Mermaid diagrams where appropriate

Prohibited: duplicated data, duplicated entity names, and the same logic/definition living in more than one file — cross-reference instead of repeating.

## Core Principles That Constrain Content

When writing or reviewing any spec, prototype code, or agent prompt here, the AI Contract (`00_MASTER.md` §9) applies:
- Every number/recommendation must carry its reasoning, assumptions, source, and confidence — estimates must be flagged as estimates (`is_estimate` from the core layer up, per `09` §4)
- Never invent crop, livestock, or price data; it must trace to the Knowledge Base (`05`)
- North Star is stable income under acceptable risk, not maximum profit — present trade-offs, don't pick for the user
- Module dependencies flow downward only (ui → api → core/agents → knowledge/database); no upward calls (`09` §2)

## Git Conventions

Work on feature branches and merge via review (`09` §6). Commit messages should explain *why*, not just what. The repo's working language is Thai with English technical terms — match that style in documents.
