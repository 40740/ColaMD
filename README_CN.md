# ColaMD

**Language / 语言: [English](README.md) · [中文](README_CN.md)**

**ColaMD 是一款开源、免费、轻量、优雅的 Markdown 编辑器，目标是成为 Markdown 世界可靠的基础设施。**

Markdown 已经成为写作、记录、文档和协作的事实标准。我们的目标很明确：把 ColaMD 做成最好用的免费 Markdown 编辑器，成为每个人日常都能依赖的基础工具。

ColaMD 同时也是一款对 AI Agent 友好的编辑器：当 Agent 修改正在打开的 `.md` 文件时，ColaMD 会实时同步改动。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/marswaveai/colamd.svg)](https://github.com/marswaveai/colamd/releases)

[下载](#下载) | [为什么做 ColaMD](#为什么做-colamd) | [功能](#功能) | [开发](#开发)

---

## 为什么选择 ColaMD？

过去的 Markdown 编辑器，大多默认文件由一个人独立编辑。今天，Markdown 也已经成为 AI 工具生成文档、笔记、计划和报告时共同使用的语言。

ColaMD 先把编辑器本身做得简单、专注、可靠，再让 AI 协作变得自然：打开文件，让 Agent 工作，所有改动实时出现在编辑器里。不需要关闭文件、重新打开，也不需要手动刷新。

## 功能

- **实时 Agent 同步** — Claude Code、Cursor、Copilot 或其他 AI Agent 修改文件后，内容实时出现在编辑器中。
- **Agent 活动指示器** — 标题栏小圆点显示 Agent 正在写入或已经完成。
- **真正的所见即所得** — 输入 Markdown，直接看到富文本，无需分屏预览。
- **同目录文件列表** — 发现并切换当前目录下的 Markdown 文件；Agent 新建或删除文件后自动更新。
- **待办列表** — 直接点击复选框完成任务，也支持快捷键。
- **高亮与 LaTeX** — 使用 `==高亮文本==`，并通过 KaTeX 渲染数学公式。
- **文档搜索** — 使用 ⌘/Ctrl+F 快速查找内容。
- **智能换行** — 单个换行直接渲染为换行，符合人类和 AI 工具写 Markdown 的习惯。
- **富文本复制** — 复制后粘贴到公众号、微信、邮件等富文本编辑器，格式完整保留。
- **主题** — 4 个内置主题、可下载主题，以及自定义 CSS 导入。
- **PDF 导出** — 在需要交付时，将 Markdown 文档导出为 PDF。
- **极简设计** — 没有工具栏，没有永久侧边栏，专注于内容本身。
- **跨平台** — 支持 macOS、Windows 和 Linux。

## 下载

> 查看 [Releases](https://github.com/marswaveai/colamd/releases) 获取最新构建。

| 平台 | 格式 |
|------|------|
| macOS | `.dmg` |
| Windows | `.exe` |
| Linux | `.AppImage` / `.deb` |

## 工作原理

```
┌─────────────┐     写入      ┌──────────────┐
│  AI Agent   │ ──────────────▶│  .md 文件    │
│ (Claude,    │                │              │
│  Cursor...) │                └──────┬───────┘
└─────────────┘                       │
                              fs.watch 检测变化
                                      │
                              ┌───────▼───────┐
                              │    ColaMD     │
                              │   自动刷新    │
                              │   ✨ 实时！   │
                              └───────────────┘
```

1. 用 ColaMD 打开任意 `.md` 文件
2. 让 AI Agent 编辑这个文件
3. 看着内容实时更新 — 标题栏的指示器会在 Agent 写入时亮起橙色脉冲

不需要任何配置，开箱即用。

## ColaMD 不做的事

ColaMD 有意保持简单：

- 没有跨目录文件树或工作区（仅支持打开文件所在目录的 Markdown 文件列表）
- 没有云同步或协作编辑
- 没有内置 AI 功能 — 它是 AI 生成内容的**查看器/编辑器**
- 没有插件系统

一件事，做到极致。

## 自定义主题

ColaMD 支持自定义 CSS 主题。从 [`themes/`](themes/) 文件夹下载主题，或自己创建后通过 **Theme > Import Theme** 导入。

导入的主题会保存到 `~/.colamd/themes/`，重启后仍然可用。

## 开发

```bash
git clone https://github.com/marswaveai/colamd.git
cd colamd
npm install
npm run dev
```

### 构建

```bash
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### 技术栈

- **Electron** — 跨平台桌面
- **Milkdown** — 所见即所得 Markdown（基于 ProseMirror）
- **TypeScript** — 严格模式
- **electron-vite** — 快速构建

## 路线图

ColaMD 将随 Agent 生态一起演进：

- v1.1 — 实时文件热更新、文件关联、拖拽打开、主题系统
- v1.2 — 新图标
- v1.3 — Agent 活动指示器、Cmd+点击链接、富文本复制、智能换行、PDF 导出、主题持久化
- v1.6 — 更稳的实时同步：原子保存（rename）检测、watcher 自愈、关闭拼写检查
- v1.6.1 — 可勾选的待办列表（点击 / ⌘+Enter）、`==高亮==` 语法、Markdown 语法速查
- v1.6.2 — 移除 HTML 导出
- v1.7 — 同目录文件列表：就地切换文件，Agent 新建/删除文件实时更新；搜索（⌘F）+ LaTeX（⌘⇧E），来自社区 PR #14
- v1.7.1 — 待办点击修复、居中的 SVG 对勾、标题栏文件面板开关按钮
- v1.7.2 — 可玩演示页：Help → 新功能演示（⌘⇧D），用真实目录展示每个版本的新功能
- v1.7.3 — 演示页升级为累积式 changelog：resources/demo/changelog.md 记录每个版本，打开即见（当前版本）
- 未来 — 更多模板、双向同步、跨目录文件浏览

## 开源协议

[MIT](LICENSE) — 永久免费。

---

由 [marswave.ai](https://marswave.ai) 为更简单的 Markdown 未来而造。
