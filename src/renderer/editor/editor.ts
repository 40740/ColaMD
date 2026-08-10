import { Editor, rootCtx, defaultValueCtx, editorViewCtx, serializerCtx, parserCtx, remarkPluginsCtx, remarkStringifyOptionsCtx } from '@milkdown/kit/core'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { DecorationSet, type EditorView } from '@milkdown/kit/prose/view'
import { toggleMark, exitCode } from '@milkdown/kit/prose/commands'
import { textblockTypeInputRule } from '@milkdown/kit/prose/inputrules'
import type { Node as PMNode } from '@milkdown/kit/prose/model'
import remarkBreaks from 'remark-breaks'
import { commonmark, headingSchema, codeBlockSchema } from '@milkdown/kit/preset/commonmark'
import { gfm } from '@milkdown/kit/preset/gfm'
import { history } from '@milkdown/kit/plugin/history'
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener'
import { clipboard } from '@milkdown/kit/plugin/clipboard'
import { replaceAll, $prose, $inputRule } from '@milkdown/kit/utils'
import { remarkMathPlugin, katexOptionsCtx, mathInlineSchema, mathBlockSchema } from '@milkdown/plugin-math'
import { htmlView } from './html-view'
import { mathModal } from './math-modal'
import { highlight, remarkHighlight, highlightStringifyHandler } from './highlight'

import 'katex/dist/katex.min.css'
import '@milkdown/kit/prose/view/style/prosemirror.css'

export const searchPluginKey = new PluginKey('search-highlight')

const searchHighlight = $prose(() => {
  return new Plugin({
    key: searchPluginKey,
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, old) {
        const meta = tr.getMeta(searchPluginKey)
        if (meta !== undefined) return meta
        return old.map(tr.mapping, tr.doc)
      }
    },
    props: {
      decorations(state) {
        return searchPluginKey.getState(state)
      }
    }
  })
})

const mathEditorPlugin = $prose(() => {
  return new Plugin({
    props: {
      handleClickOn(_view, _pos, node, nodePos) {
        if (node.type.name === 'math_inline' || node.type.name === 'math_block') {
          const isBlock = node.type.name === 'math_block'
          const currentValue = isBlock ? node.attrs.value : node.textContent
          mathModal.show(currentValue, isBlock, nodePos)
          return true
        }
        return false
      }
    }
  })
})

// 全角 ＃(中文输入法打出的)加空格也能转换为标题。
// 注意:不做“# 后直接跟中文”的无空格转换——那会在输入法拼音组合时触发
// 替换事务,导致拼音直接上屏或丢字。标题仍需 # + 空格。
const fullwidthHeadingInputRule = $inputRule((ctx) =>
  textblockTypeInputRule(/^(?<hashes>[#＃]+)\s$/, headingSchema.type(ctx), (match) => ({
    level: match.groups?.hashes?.length || 1,
  }))
)

// ~ / ～ + 空格 → 代码块,与 “# + 空格 → 标题” 统一。
// 三个反引号 + 空格由 Milkdown 内置规则处理。
const tildeCodeBlockInputRule = $inputRule((ctx) =>
  textblockTypeInputRule(/^(?<fence>[~～])\s$/, codeBlockSchema.type(ctx), () => ({ language: '' }))
)

// Editing conveniences: remove formatting the WYSIWYG view otherwise hides.
// Registered last so its key handling runs before Milkdown's base keymap.
const editingKeymap = $prose(() => {
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        const { state } = view
        const { selection } = state
        const mod = event.metaKey || event.ctrlKey

        // ⌘/Ctrl+Shift+H — toggle ==highlight== on the selection
        // (removes the mark when already highlighted, text is kept)
        if (mod && event.shiftKey && !event.altKey && event.key.toLowerCase() === 'h') {
          const markType = state.schema.marks.highlight
          if (markType) {
            toggleMark(markType)(state, view.dispatch)
            return true
          }
        }

        // Backspace / Delete at the very start of a heading — turn it back into a paragraph
        if ((event.key === 'Backspace' || event.key === 'Delete') && selection.empty) {
          const $from = selection.$from
          if ($from.parentOffset === 0 && $from.parent.type.name === 'heading') {
            view.dispatch(state.tr.setNodeMarkup($from.before(), state.schema.nodes.paragraph, {}))
            return true
          }
        }

        // Exit a code block: ⌘/Ctrl+Enter, or Enter when the cursor sits on an
        // empty line inside the block — so pressing Enter twice after the code
        // gets out, just like headings drop back to a paragraph.
        if (event.key === 'Enter' && selection.empty) {
          const $from = selection.$from
          const parent = $from.parent
          if (parent.type.name === 'code_block') {
            const text = parent.textContent
            const before = text.slice(0, $from.parentOffset)
            const after = text.slice($from.parentOffset)
            const onEmptyLine =
              (before.length === 0 || before.endsWith('\n')) &&
              (after.length === 0 || after.startsWith('\n'))
            if (mod || parent.textContent.length === 0 || onEmptyLine) {
              exitCode(state, view.dispatch)
              return true
            }
          }
        }

        return false
      }
    }
  })
})

export function showMathModal(): void {
  mathModal.show()
}

let editorInstance: Editor | null = null

const inlineStyles: Record<string, string> = {
  'h1': 'font-size:1.8em;font-weight:700;margin:1em 0 .5em;padding-bottom:.3em;border-bottom:1px solid #eee;',
  'h2': 'font-size:1.4em;font-weight:600;margin:1em 0 .5em;padding-bottom:.25em;border-bottom:1px solid #eee;',
  'h3': 'font-size:1.2em;font-weight:600;margin:.8em 0 .4em;',
  'h4': 'font-weight:600;margin:.8em 0 .4em;',
  'h5': 'font-weight:600;margin:.8em 0 .4em;',
  'h6': 'font-weight:600;margin:.8em 0 .4em;',
  'p': 'margin:.5em 0;line-height:1.75;',
  'strong': 'font-weight:600;',
  'a': 'color:#0969da;text-decoration:none;',
  'code': 'background:rgba(175,184,193,0.2);padding:2px 6px;border-radius:3px;font-size:.875em;font-family:Menlo,Monaco,monospace;',
  'pre': 'background:#f6f8fa;padding:16px;border-radius:6px;overflow-x:auto;margin:1em 0;',
  'blockquote': 'border-left:4px solid #ddd;padding-left:16px;margin:1em 0;color:#666;',
  'ul': 'padding-left:24px;margin:.5em 0;',
  'ol': 'padding-left:24px;margin:.5em 0;',
  'li': 'margin:.25em 0;',
  'table': 'border-collapse:collapse;width:100%;margin:1em 0;',
  'th': 'border:1px solid #ddd;padding:8px 12px;text-align:left;font-weight:600;background:#f6f8fa;',
  'td': 'border:1px solid #ddd;padding:8px 12px;text-align:left;',
  'hr': 'border:none;border-top:2px solid #ddd;margin:2em 0;',
  'img': 'max-width:100%;',
}

function enhanceClipboard(e: ClipboardEvent): void {
  const html = e.clipboardData?.getData('text/html')
  if (!html) return

  const doc = new DOMParser().parseFromString(html, 'text/html')

  for (const [tag, style] of Object.entries(inlineStyles)) {
    doc.querySelectorAll(tag).forEach((el) => {
      ;(el as HTMLElement).setAttribute('style', style)
    })
  }

  // pre > code: override code style inside code blocks
  doc.querySelectorAll('pre code').forEach((el) => {
    ;(el as HTMLElement).setAttribute('style', 'background:none;padding:0;font-size:.875em;line-height:1.6;font-family:Menlo,Monaco,monospace;')
  })

  e.clipboardData?.setData('text/html', doc.body.innerHTML)
}

const defaultContent = `# 老大，准备好月入10w了吗？\n\n从这里开始吧....\n`

export async function createEditor(
  rootId: string,
  onChange?: (markdown: string) => void
): Promise<Editor> {
  const root = document.getElementById(rootId)
  if (!root) throw new Error(`Element #${rootId} not found`)

  editorInstance = await Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, defaultContent)
      ctx.set(remarkPluginsCtx, [
        { plugin: remarkBreaks, options: {} },
        { plugin: remarkHighlight, options: {} },
      ])
      ctx.set(katexOptionsCtx.key, { throwOnError: false })
      // Teach remark-stringify how to emit our custom ==highlight== node
      const stringifyOptions = ctx.get(remarkStringifyOptionsCtx)
      ctx.set(remarkStringifyOptionsCtx, {
        ...stringifyOptions,
        // 'mark' is a custom node type, not part of the typed Handlers map
        handlers: { ...stringifyOptions.handlers, mark: highlightStringifyHandler } as typeof stringifyOptions.handlers,
      })
      if (onChange) {
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown) => {
          onChange(markdown)
        })
      }
    })
    .use(commonmark)
    .use(gfm)
    .use(fullwidthHeadingInputRule)
    .use(tildeCodeBlockInputRule)
    .use(highlight)
    .use(history)
    .use(listener)
    .use(clipboard)
    .use(htmlView)
    .use([remarkMathPlugin, katexOptionsCtx, mathInlineSchema, mathBlockSchema].flat())
    .use(mathEditorPlugin)
    .use(searchHighlight)
    .use(editingKeymap)
    .create()

  // Enhance clipboard with inline styles for rich text paste (e.g. WeChat)
  root.addEventListener('copy', enhanceClipboard)
  root.addEventListener('cut', enhanceClipboard)

  setupCodeCopyButton(root)
  setupBlockSourceEditor(root)

  // Cmd+click (Mac) / Ctrl+click (Win/Linux) to open links in browser
  root.addEventListener('click', (e) => {
    if (!(e.metaKey || e.ctrlKey)) return
    const link = (e.target as HTMLElement).closest('a')
    if (!link) return
    const href = link.getAttribute('href')
    if (href) {
      e.preventDefault()
      window.electronAPI.openExternal(href)
    }
  })

  // Click the checkbox of a task list item to toggle its checked state
  root.addEventListener('click', (e) => {
    if (!(e.target instanceof HTMLElement)) return
    const li = e.target.closest('li[data-item-type="task"]') as HTMLElement | null
    if (!li) return
    // Only the checkbox area toggles — clicks on the text still place the cursor
    const rect = li.getBoundingClientRect()
    if (e.clientX - rect.left > 24) return
    e.preventDefault()
    toggleTaskListItem(e)
  })

  // Cmd/Ctrl+Enter toggles the task list item under the cursor
  root.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey) || e.key !== 'Enter') return
    e.preventDefault()
    if (!editorInstance) return
    editorInstance.action((ctx) => {
      const view = ctx.get(editorViewCtx)
      const $pos = view.state.doc.resolve(view.state.selection.from)
      for (let d = $pos.depth; d >= 0; d--) {
        const node = $pos.node(d)
        if (node.type.name === 'list_item' && node.attrs.checked != null) {
          const tr = view.state.tr.setNodeMarkup($pos.before(d), undefined, {
            ...node.attrs,
            checked: !node.attrs.checked,
          })
          view.dispatch(tr)
          return
        }
      }
    })
  })

  return editorInstance
}

function toggleTaskListItem(e: MouseEvent): void {
  if (!editorInstance) return
  editorInstance.action((ctx) => {
    const view = ctx.get(editorViewCtx)
    // posAtDOM(li, 0) lands inside the li (on its first child), not on the
    // list_item node itself — locate by click coordinates instead and walk up
    // the tree, same as the ⌘+Enter path.
    const coords = view.posAtCoords({ left: e.clientX, top: e.clientY })
    if (!coords) return
    const $pos = view.state.doc.resolve(coords.pos)
    for (let d = $pos.depth; d >= 0; d--) {
      const node = $pos.node(d)
      if (node.type.name === 'list_item' && node.attrs.checked != null) {
        const tr = view.state.tr.setNodeMarkup($pos.before(d), undefined, {
          ...node.attrs,
          checked: !node.attrs.checked,
        })
        view.dispatch(tr)
        return
      }
    }
  })
}

export function getMarkdown(): string {
  if (!editorInstance) return ''
  let markdown = ''
  editorInstance.action((ctx) => {
    const serializer = ctx.get(serializerCtx)
    const view = ctx.get(editorViewCtx)
    markdown = serializer(view.state.doc)
  })
  return markdown
}

export function setMarkdown(content: string): void {
  if (!editorInstance) return
  editorInstance.action(replaceAll(content))
}

export function getEditorView(): EditorView | null {
  if (!editorInstance) return null
  let view: EditorView | null = null
  editorInstance.action((ctx) => {
    view = ctx.get(editorViewCtx)
  })
  return view
}

// ─── Code block copy button (issue #15) ────────────────────────────────────

const COPY_RESET_MS = 1500

function setupCodeCopyButton(root: HTMLElement): void {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'code-copy-btn'
  btn.textContent = '复制'
  root.appendChild(btn)

  let currentPre: HTMLElement | null = null
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  const hide = (): void => {
    btn.style.display = 'none'
    currentPre = null
  }

  const show = (pre: HTMLElement): void => {
    currentPre = pre
    const preRect = pre.getBoundingClientRect()
    btn.style.display = 'block'
    // Top-right corner of the code block (fixed positioning, viewport coords)
    btn.style.top = `${Math.max(preRect.top + 8, 8)}px`
    btn.style.right = `${Math.max(window.innerWidth - preRect.right + 8, 8)}px`
  }

  // Hovering a code block reveals the copy button at its top-right corner
  root.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement
    const pre = target.closest('pre')
    if (pre && root.contains(pre)) show(pre)
  })

  // Hide when the mouse leaves the code block (except when moving onto the button)
  root.addEventListener('mouseout', (e) => {
    if (!currentPre) return
    const target = e.target as HTMLElement
    if (!target.closest('pre')) return
    const related = e.relatedTarget as HTMLElement | null
    if (related && related.closest('.code-copy-btn')) return
    hide()
  })

  btn.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentPre) return
    // Copy just the code — no line numbers or language marker
    const code = currentPre.querySelector('code')?.textContent ?? currentPre.textContent ?? ''
    if (await copyText(code)) {
      btn.textContent = '已复制 ✓'
      clearTimeout(resetTimer)
      resetTimer = setTimeout(() => { btn.textContent = '复制' }, COPY_RESET_MS)
    }
  })
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for environments where the clipboard API is unavailable
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
    return ok
  }
}

// ─── Per-block source editing ──────────────────────────────────────────────
// Hover a line and click the small 「源码」 button: that block alone switches
// to a raw-Markdown textarea (you see the real ## / == / ``` markers and can
// delete them). ⌘/Ctrl+Enter or clicking away applies it back, Esc cancels.
// Everything else in the document stays as the rendered WYSIWYG preview.

const SOURCE_BLOCK_SELECTOR = 'p, h1, h2, h3, h4, h5, h6, pre, blockquote, li'

function setupBlockSourceEditor(root: HTMLElement): void {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'block-source-btn'
  btn.textContent = '源码'
  root.appendChild(btn)

  const ta = document.createElement('textarea')
  ta.className = 'block-source-editor'
  ta.spellcheck = false
  root.appendChild(ta)

  let currentBlock: HTMLElement | null = null
  let editing = false

  const hideBtn = (): void => {
    btn.style.display = 'none'
    currentBlock = null
  }

  root.addEventListener('mouseover', (e) => {
    if (editing) return
    const target = e.target as HTMLElement
    // Moving onto the button/editor itself must not hide the button
    if (target.closest('.block-source-btn') || target.closest('.block-source-editor') || target.closest('.code-copy-btn')) return
    const block = target.closest(SOURCE_BLOCK_SELECTOR) as HTMLElement | null
    if (!block || !root.contains(block)) {
      hideBtn()
      return
    }
    if (block === currentBlock) return
    currentBlock = block
    const rect = block.getBoundingClientRect()
    btn.style.display = 'block'
    btn.style.top = `${Math.max(rect.top + 8, 8)}px`
    // For code blocks, keep clear of the copy button sitting at the far right
    const isPre = block.tagName === 'PRE'
    btn.style.right = `${Math.max(window.innerWidth - rect.right + (isPre ? 60 : 8), 8)}px`
  })

  root.addEventListener('mouseout', (e) => {
    if (editing || !currentBlock) return
    const target = e.target as HTMLElement
    if (!target.closest(SOURCE_BLOCK_SELECTOR)) return
    const related = e.relatedTarget as HTMLElement | null
    if (related && (related.closest('.block-source-btn') || related.closest('.code-copy-btn'))) return
    hideBtn()
  })

  const openEditor = (blockEl: HTMLElement): void => {
    if (editing) return
    const view = getEditorView()
    if (!view) return
    const pos = view.posAtDOM(blockEl, 0)
    if (pos == null) return
    const node = view.state.doc.nodeAt(pos)
    if (!node || !node.isBlock || node.type.name === 'doc') return

    let raw = ''
    editorInstance?.action((ctx) => {
      const serializer = ctx.get(serializerCtx)
      let top: PMNode = node
      // list items aren't valid top-level blocks — wrap in a list to serialize
      if (node.type.name === 'list_item') {
        top = view.state.schema.nodes.bullet_list.create(null, [node])
      }
      const tempDoc = view.state.schema.nodes.doc.create(null, [top])
      raw = serializer(tempDoc)
    })

    editing = true
    btn.style.display = 'none'
    const rect = blockEl.getBoundingClientRect()
    ta.value = raw
    ta.style.display = 'block'
    ta.style.top = `${rect.top}px`
    ta.style.left = `${rect.left}px`
    ta.style.width = `${Math.max(rect.width, 220)}px`
    ta.style.minHeight = `${Math.max(rect.height, 60)}px`
    ta.dataset.pos = String(pos)
    ta.dataset.size = String(node.nodeSize)
    ta.focus()
    ta.setSelectionRange(0, 0)
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Resolve the block fresh at click time — the element cached during hover
    // can go stale (and posAtDOM returns null) if the doc re-rendered between
    // hovering and clicking, which made the button appear dead.
    const prevDisplay = btn.style.display
    btn.style.display = 'none'
    const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    btn.style.display = prevDisplay
    const block = under?.closest(SOURCE_BLOCK_SELECTOR) as HTMLElement | null
    if (block && root.contains(block)) openEditor(block)
  })

  // Single-click a line → open the source editor for that block only
  root.addEventListener('click', (e) => {
    if (editing) return
    const target = e.target as HTMLElement
    if (target.closest('.block-source-btn') || target.closest('.block-source-editor') || target.closest('.code-copy-btn')) return
    // Cmd/Ctrl+click on a link opens it — handled elsewhere
    if ((e.metaKey || e.ctrlKey) && target.closest('a')) return
    // Task checkbox clicks toggle the checkbox — handled elsewhere
    const taskLi = target.closest('li[data-item-type="task"]') as HTMLElement | null
    if (taskLi) {
      const r = taskLi.getBoundingClientRect()
      if (e.clientX - r.left <= 24) return
    }
    const block = target.closest(SOURCE_BLOCK_SELECTOR) as HTMLElement | null
    if (block && root.contains(block)) openEditor(block)
  })

  const closeEditor = (apply: boolean): void => {
    if (!editing) return
    editing = false
    const pos = Number(ta.dataset.pos || 0)
    const size = Number(ta.dataset.size || 0)
    ta.style.display = 'none'
    if (apply) {
      const raw = ta.value
      editorInstance?.action((ctx) => {
        const view = ctx.get(editorViewCtx)
        if (pos > 0 && pos + size <= view.state.doc.content.size) {
          const parsed = ctx.get(parserCtx)(raw)
          if (parsed) {
            const fragment = parsed.content
            const tr = view.state.tr
            if (fragment.size === 0) {
              tr.replaceWith(pos, pos + size, view.state.schema.nodes.paragraph.create())
            } else {
              tr.replaceWith(pos, pos + size, fragment)
            }
            view.dispatch(tr)
          }
        }
        view.focus()
      })
    } else {
      editorInstance?.action((ctx) => ctx.get(editorViewCtx).focus())
    }
  }

  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeEditor(false)
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      closeEditor(true)
    }
  })

  ta.addEventListener('blur', () => closeEditor(true))
}
