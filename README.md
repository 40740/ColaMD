# ColaMD

**Language / 语言: [English](README.md) · [中文](README_CN.md)**

**An open-source, free, lightweight, and elegant Markdown editor.**

Markdown has become the de facto standard for writing, note-taking, and collaboration. ColaMD is a clean, focused desktop editor built to be a simple foundation for working with Markdown. It is also friendly to AI agents: when an agent edits an open `.md` file, ColaMD syncs the changes in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/marswaveai/colamd.svg)](https://github.com/marswaveai/colamd/releases)

[Download](#download) | [Why ColaMD](#why-colamd) | [Features](#features) | [Development](#development)

---

## Why ColaMD?

Markdown is everywhere: documentation, notes, project plans, and the files created by AI tools. We need a Markdown editor that stays simple, fast, and dependable — a piece of basic infrastructure anyone can use.

ColaMD is designed around that idea. It gives you a focused writing experience first, then adds one important difference for AI-assisted work: **Live Agent Sync**. When an AI agent edits an open `.md` file, ColaMD detects the change and refreshes the content in real time. No closing and reopening files, no manual refresh, no friction.

## Features

### Live Agent Sync

- **Live Agent Sync** — When an AI agent (Claude Code, Cursor, Copilot, etc.) modifies your `.md` file, ColaMD detects the change and refreshes instantly.
- **Agent Activity Indicator** — A subtle dot in the titlebar shows you when an agent is writing: orange breathing pulse while active, green flash when done. You always know if your agent is working.
- **Cmd+Click Links** — Click any link in the editor to open it in your browser.

### Editor

- **True WYSIWYG** — Type Markdown, see rich text. No split-pane preview.
- **Smart Line Breaks** — Single newlines render as line breaks, matching how AI agents write Markdown.
- **Rich Text Copy** — Copy content and paste into WeChat, email, or any rich text editor with formatting preserved.
- **Search & LaTeX** — ⌘/Ctrl+F to search; ⌘/Ctrl+Shift+E to insert formulas (KaTeX rendering).
- **Same-Directory File List** — When a file is open, a slim left panel lists the Markdown files in the same directory. Click to switch; files created or removed by your agent appear instantly. Hide with ⌘/Ctrl+Shift+B.
- **Minimal by Design** — No toolbar, no persistent sidebar, no distractions. Just your content.

### Themes & Export

- **Themes** — 4 built-in themes + [downloadable themes](themes/) + import custom CSS.
- **Export** — PDF.
- **Cross-platform** — macOS, Windows, Linux.

## Download

> Check [Releases](https://github.com/marswaveai/colamd/releases) for the latest builds.

| Platform | Format |
|----------|--------|
| macOS    | `.dmg` |
| Windows  | `.exe` |
| Linux    | `.AppImage` / `.deb` |

## How It Works

```
┌─────────────┐     writes     ┌──────────────┐
│  AI Agent   │ ──────────────▶│  .md file    │
│ (Claude,    │                │              │
│  Cursor...) │                └──────┬───────┘
└─────────────┘                       │
                              fs.watch detects
                                      │
                              ┌───────▼───────┐
                              │    ColaMD     │
                              │  auto-refresh │
                              │   ✨ live!    │
                              └───────────────┘
```

1. Open any `.md` file in ColaMD
2. Let your AI agent edit that file
3. Watch the content update in real-time — the indicator dot pulses orange while the agent writes

No configuration needed. It just works.

## What ColaMD Does NOT Do

ColaMD is intentionally simple:

- No cross-directory file tree or workspace (same-directory Markdown file list only)
- No cloud sync or collaboration
- No AI features built in — it's a **viewer/editor** for AI-generated content
- No plugin system

One thing, done well.

## Custom Themes

ColaMD supports custom CSS themes. Download themes from the [`themes/`](themes/) folder, or create your own and import via **Theme > Import Theme**.

Imported themes are saved to `~/.colamd/themes/` and persist across sessions.

## Development

```bash
git clone https://github.com/marswaveai/colamd.git
cd colamd
npm install
npm run dev
```

### Build

```bash
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### Tech Stack

- **Electron** — Cross-platform desktop
- **Milkdown** — WYSIWYG Markdown (ProseMirror-based)
- **TypeScript** — Strict mode
- **electron-vite** — Fast builds

## Roadmap

ColaMD will evolve alongside the agent ecosystem:

- v1.1 — Live file reload, file associations, drag & drop, themes
- v1.2 — New icon
- v1.3 — Agent activity indicator, Cmd+click links, rich text copy, smart line breaks, PDF export, theme persistence
- v1.6 — Robust live sync: atomic-save (rename) detection, watcher self-recovery, spellcheck off
- v1.6.1 — Editable task lists (click / ⌘+Enter), ==highlight== syntax, Markdown cheatsheet
- v1.6.2 — Remove HTML export
- v1.7 — Same-directory file list: switch files in place, live updates when agents create/remove files; search (⌘F) + LaTeX (⌘⇧E) from community PR #14
- v1.7.1 — Task checkbox click fix, centered SVG checkmark, titlebar file-panel toggle button
- v1.7.2 — Playable demo page: Help → 新功能演示 (⌘⇧D), a real directory showcasing each release's features
- v1.7.3 — Demo page becomes a cumulative changelog: resources/demo/changelog.md records every release, opening straight into it (current)
- Future — More templates, bidirectional sync, cross-directory file browsing

## License

[MIT](LICENSE) — Free forever.

---

Built by [marswave.ai](https://marswave.ai) for a simpler Markdown future.
