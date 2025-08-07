# Qwen Chat Enhancer – Product Requirements Document (PRD)

_Last updated: 2025-08-07_

## 1 Overview
The **Qwen Chat Enhancer** is a browser extension that upgrades the user experience on Qwen Chat by adding powerful organisation, productivity and automation features.  
This PRD captures the product vision, scope and phased delivery plan. It will serve as the primary reference for engineering, design and QA throughout development.

## 2 Goals & Non-Goals
### 2.1 Goals
1. Provide advanced chat organisation (folders, search, pinning, archiving).  
2. Boost user productivity with prompt history, slash menu, smart-replace, and quick actions.  
3. Simplify knowledge retrieval through conversation referencing and export.  
4. Maintain a **100 % local-only** data model—no external database, everything stored in the browser (IndexedDB / `chrome.storage`).  
5. Ship an MVP within three weeks, followed by incremental feature drops.

### 2.2 Non-Goals
* Cloud sync, multi-device sync.  
* Collaboration / real-time sharing.  
* Mobile browsers (v1 will target desktop Chromium + Firefox).

## 3 User Stories & Features
| ID | User Story | Feature(s) | Priority |
|----|------------|------------|----------|
| F-01 | *As a power-user I want to group chats in folders* | Manual & automatic folder creation; drag-drop; colour coding | P0 |
| F-02 | *As a user I want to run saved prompts anywhere* | Right-click context-menu → Run Prompt | P0 |
| F-03 | *I need to capture my screen for the chat* | “Send Screenshot” right-click action | P0 |
| F-04 | *I want to reference past chats inside the current chat* | Conversation reference picker | P0 |
| F-05 | *Old chats clutter my sidebar* | Auto-archive / auto-delete after N days | P1 |
| F-06 | *I must quickly find a message* | Global search + highlight | P1 |
| F-07 | *I wish to export chats* | Export selected convos to PDF / txt / json / md | P1 |
| F-08 | *I need prompt productivity* | Slash menu, prompt history, favourites, templates | P0 |
| F-09 | *I want message utilities* | Pin, timestamps, word/char count, copy modes | P2 |
| F-10 | *I need automation* | Prompt chains, auto-splitter, smart-replace | P2 |

## 4 Architecture
```
┌──────────────────────────────┐
│   Background Service-Worker  │
│  • Context-menus             │
│  • Alarms (auto-cleanup)     │
│  • Screenshot capture        │
└─────────────┬────────────────┘
              │ runtime.sendMessage
┌─────────────▼────────────────┐  shadow-DOM root
│     Content-Script(s)        │  + React UI mounts
│  • Sidebar (folders, search) │
│  • Prompt enhancer           │
│  • DOM adapters              │
└─────────────┬────────────────┘
              │ Dexie / storage.local
┌─────────────▼────────────────┐
│          IndexedDB           │ (local-only, no cloud)
└──────────────────────────────┘
```
* **Framework** – React + UnoCSS, bundled via **WXT** (already in repo).  
* **State** – Dexie (IndexedDB wrapper). For lightweight keys (settings) we mirror to `browser.storage.local`.
* **Sync across tabs** – `BroadcastChannel`.

## 5 Data Schema (v1)
```ts
Conversations { id, title, createdAt, updatedAt, folderId?, archived }
Messages      { id, convId, role, content, createdAt, pinned }
Folders       { id, parentId?, name, color, order, pinned }
Prompts       { id, title, template, favorite, createdAt }
PromptHistory { id, content, createdAt, favorite }
Settings      { key, value }
```

## 6 Phased Delivery Plan
| Phase | Duration | Scope |
|-------|----------|-------|
| 0 – Kick-off | 1 day | Scaffold `packages/qwen-enhancer`, CI, lint, test harness |
| 1 – Core Productivity | 1 week | Slash menu, prompt history, right-click prompt runner |
| 2 – Organisation | 1 week | Folder sidebar, drag-drop, auto-folder for Custom GPTs, timestamps |
| 3 – Search & Export | 1 week | Global search, highlight, export, screenshot action |
| 4 – Maintenance Automations | 1 week | Auto-archive/delete, prompt chains, auto-splitter, smart-replace |
| 5 – Polish & QA | 1 week | Model switcher, word count, copy modes, resizable sidebar, exhaustive testing |

Total MVP (Phases 0-3) ≈ **3 weeks**. Full v1 ≈ **6 weeks**.

## 7 Success Metrics
* <200 ms content-script injection time (cold).  
* Bundle ≤150 kB gzip.  
* No console errors on Qwen Chat.  
* Unit test coverage ≥80 % for utilities.  
* 0 P0 bugs during 1-week beta.

## 8 Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Qwen DOM changes | Medium | High | Keep selectors centralised; E2E alerts |
| IndexedDB quota | Low | Medium | Purge when archived/deleted |
| Manifest v3 API limits | Low | Medium | Performance budgets, code-splitting |

## 9 Open Questions
1. Will Qwen expose a public conversation export API? If not, we will rely on DOM scraping.  
2. Does Qwen block `tabs.captureVisibleTab` on the main domain? If yes, fallback: use off-screen `chrome.tabCapture`?

---
_End of PRD._

