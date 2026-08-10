# ColaMD

**Language / 语言: [English](README.md) · [中文](README_CN.md)**

**一个开源、免费、轻量、优雅的 Markdown 编辑器。**

Markdown 已经成为写作、记录和协作的事实标准。ColaMD 想做一款简单、专注、可靠的桌面编辑器，成为每个人都可以使用的 Markdown 基础设施。同时，它也是一款对 AI Agent 友好的编辑器：当 Agent 修改正在打开的 `.md` 文件时，ColaMD 会实时同步改动。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/marswaveai/colamd.svg)](https://github.com/marswaveai/colamd/releases)

[下载](#下载) | [为什么做 ColaMD](#为什么做-colamd) | [功能](#功能) | [开发](#开发)

---

## 为什么做 ColaMD？

Markdown 无处不在：文档、笔记、项目计划，以及各种 AI 工具生成的文件。我们需要一款简单、快速、可靠的 Markdown 编辑器，作为每个人都能使用的基础设施。

ColaMD 先专注于做好编辑器本身，再为 AI 协作增加一个重要能力：**实时同步**。当 AI Agent 修改正在打开的 `.md` 文件时，ColaMD 会自动检测变化并实时刷新内容。不需要关闭文件、重新打开，也不需要手动刷新。

## 功能

### 实时同步

- **实时 Agent 同步** — AI Agent（Claude Code、Cursor、Copilot 等）修改 `.md` 文件时，ColaMD 自动检测并即时刷新。
- **Agent 活动指示器** — 标题栏的小圆点告诉你 Agent 的状态：橙色呼吸闪烁表示正在写入，绿色闪现表示写入完成。
- **Cmd+点击链接** — 点击编辑器中的链接直接在浏览器打开。

### 编辑器

- **真正的所见即所得** — 输入 Markdown，直接看到富文本，无需分屏预览。
- **智能换行** — 单个换行即渲染为换行，匹配 AI Agent 写 Markdown 的习惯。
- **富文本复制** — 复制内容后可直接粘贴到公众号、邮件等富文本编辑器，格式完整保留。
- **极简设计** — 没有工具栏，没有侧边栏，没有干扰。只有你的内容。

### 主题与导出

- **主题** — 4 个内置主题 + [可下载主题](themes/) + 自定义 CSS 导入。
- **导出** — PDF。
- **跨平台** — macOS、Windows、Linux。

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