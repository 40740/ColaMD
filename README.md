# ColaMD

**Language / 语言: [English](README.md) · [中文](README_CN.md)**

**ColaMD is an open-source, free, lightweight, and elegant Markdown editor — built to become a dependable foundation for Markdown.**

Markdown has become the de facto standard for writing, note-taking, documentation, and collaboration. Our ambition is simple: make ColaMD the best free Markdown editor, and make it reliable enough to become everyday infrastructure.

ColaMD is also friendly to AI agents. When an agent edits an open `.md` file, ColaMD syncs the changes in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/marswaveai/colamd.svg)](https://github.com/marswaveai/colamd/releases)

[Download](#download) | [Why ColaMD](#why-colamd) | [Features](#features) | [Development](#development)

---

## Why ColaMD?

Most Markdown editors were designed for files edited by one person at a time. Today, Markdown is also the common language of AI tools that generate documentation, notes, plans, and reports.

ColaMD keeps the editor simple for everyone, while making collaboration with AI feel natural. Open a file, let your agent work, and see every change as it happens — without closing the file, reopening it, or manually refreshing the page.

## Features

- **Live Agent Sync** — Changes made by Claude Code, Cursor, Copilot, or other AI agents appear in the editor in real time.
- **Agent Activity Indicator** — A subtle titlebar dot shows when an agent is writing and when it has finished.
- **True WYSIWYG Editing** — Type Markdown and see rich text directly. No split-pane preview.
- **Same-Directory File List** — Discover and switch between Markdown files in the current folder. Files created or removed by your agent appear automatically.
- **Task Lists** — Click checkboxes to complete tasks, or use the keyboard shortcut.
- **Highlights & LaTeX** — Write `==highlighted text==` and render mathematical formulas with KaTeX.
- **Search** — Find anything in the current document with ⌘/Ctrl+F.
- **Smart Line Breaks** — Single newlines render as line breaks, matching how people and AI tools write Markdown.
- **Rich Text Copy** — Copy content with formatting preserved into WeChat, email, and other rich-text editors.
- **Themes** — Four built-in themes, downloadable themes, and custom CSS imports.
- **PDF Export** — Turn your Markdown document into a PDF when you need a finished copy.
- **Minimal by Design** — No toolbar, no permanent sidebar, no distractions.
- **Cross-Platform** — Available for macOS, Windows, and Linux.

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
