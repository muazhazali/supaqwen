# Qwen Chat with Superpowers!
Folders, Search, Qwen Store, Image Gallery, Voice Qwen, Export, Custom Prompts, Prompt Chains, Hidden Models

⭐️⭐️⭐️⭐️⭐️

### Local-First, Privacy-First Architecture

All core features work 100 % locally inside your browser. No data ever leaves your machine unless **you** explicitly decide to export or share it. Conversation history, notes, prompt libraries, and settings are saved in `IndexedDB` / `localStorage`, allowing Qwen Chat to function fully offline. Any cloud-based services (e.g., Public Prompts, Qwen Store) are strictly optional and disabled by default.

## New Pro Features

📚 **Advanced Prompt Manager** – Manage all your prompts in one place with **NO LIMIT**

📝 **Notes** – Save notes for each chat and access them later. Stored locally and fully searchable.

🌉 **Image Gallery** – View all generated images in one place. Read the prompt, search images, download all images, and more.

🔄 **Automatic Folder Creation** – Automatically generate folders for conversations created with Custom Qwen Apps.

🔊 **Side-by-Side Voice Mode** – Use Qwen Chat advanced voice mode while keeping the full conversation in view.

🖱️ **Right-Click Menu** – Instantly access and run your custom prompts on any website from the right-click menu.

🌉 **Send Screenshot with Right-Click** – Quickly send a screenshot of any page to Qwen Chat via the context menu.

🤑 **Enhanced Qwen Store** – Discover tens of thousands of custom Qwen Apps and try them with one click!

🔗 **Reference Conversations** – Effortlessly reference one or more past conversations inside the current conversation.

🔁 **Auto Delete & Auto Archive** – Optionally delete or archive old messages automatically after a set number of days.

⭐️⭐️⭐️⭐️⭐️

---

## ★ Chat Management for Qwen Chat

• 🗂 **Folders & Subfolders** – Create folders and subfolders to organise your chats. Assign colours, drag-and-drop to reorder, pin important folders, and drop chats into the Trash to delete.

• 🗺️ **Minimap** – A reduced overview of the entire conversation on the right edge of the screen.

• 📥 **Export** – Select and export any number of chats into multiple formats (PDF, TXT, JSON, MD).

• 🔎 **Search & Highlight** – Search through all previous chats and highlight results for quick review.

• 📌 **Pinned Messages** – Pin important messages and access them instantly via a quick-navigation sidebar.

• 🗑️ **Group Deletion** – Select and delete multiple chats at once.

• 🕰️ **Timestamps** – Precise timestamps for all chats and individual messages.

## ★ Prompt Management for Qwen Chat

• ⛓️ **Prompt Chains** – Save and run a series of prompts as a chain.

• ⚡️ **Auto-Complete Menu** – Type `/` to open a menu of all your prompts right above the input box.

• 🔙 **Prompt History** – Every prompt you use is saved privately on your device. Browse, favourite, or export them at any time.

• 🔼🔽 **Quick Access** – Navigate your prompt history with the Up/Down arrow keys.

• ⭐ **Favourite Prompts** – Mark any prompt as a favourite to access it faster.

• 📄 **Prompt Templates** – Use `{{double curly brackets}}` to create variables in your prompts.

• 🔍 **Search Function** – Search your prompt history and thousands of public prompts from the community.

• 📜 **Public Prompts** – Discover, upvote, and share prompts. Filter by category, language, and popularity.

• 🔗 **Prompt Sharing** – Share a direct link to a community prompt with one click.

## ★ Language & Style Controls

• 🌍 **Language Selection** – Change the response language with one click (supports 190+ languages).

• 🎭 **Tone & Writing Style** – Instantly adjust tone and writing style of Qwen’s responses.

## ★ Utilities for Qwen Chat

• ⮐ **Disable Enter to Send** – Require Ctrl/Cmd + Enter to submit a prompt.

• 👥 **Custom Instruction Profiles** – Create multiple instruction profiles and switch between them with a click.

• ✂️ **Auto Splitter** – Automatically split long inputs into smaller chunks and send them sequentially.

• 🗒 **Auto Summarise** – Summarise long text automatically so you can ask questions quickly.

• 📏 **Custom Conversation Width** – Adjust the conversation width to your preference.

• 🔄 **Smart Replace** – Automatically replace predefined phrases with longer text while typing.

• 🖱️ **Auto Click** – Auto-click your favourite prompt button after each response.

• 📊 **Word & Character Count** – Live counters for both user inputs and Qwen’s responses.

• 🎛 **Model Switcher** – Switch models (Qwen-Plus, Qwen-Lite, etc.) mid-conversation and see which model was used for each response.

• 📋 **Copy & Paste** – Copy chats with one click while preserving formatting (plain text, Markdown, or HTML).

• 🕶️ **Copy Mode** – Choose to copy both user input and response or only the response.

• ⌨️ **Short Keys** – Access popular features via keyboard shortcuts.

• ⏫⏬ **Scroll Controls** – Jump to the top/bottom or scroll one message at a time.

• 📐 **Resizable Sidebar** – Resize the sidebar for a better overview of long conversation titles.

• 📐 **Resizable Chat Window** – Resize the chat size for a better overview of long conversation chat.

• 🗄️ **Newsletter Archive** – Browse the full newsletter archive directly inside Qwen Chat.

---

> **Note:** All features are subject to change as we continue to improve Qwen Chat. Your feedback is invaluable—please let us know which superpowers you’d like to see next!

---

## Implementation Phases (Roadmap)

| Phase | Name | Goal & Key Deliverables |
|-------|------|-------------------------|
| **0** | Technical Spike & Scaffold | • Decide on browser-extension framework (Manifest V3, Vite + React + TypeScript).<br>• Integrate local Qwen model API or remote endpoint behind a feature flag.<br>• Set up linting, testing, CI, and release pipeline. |
| **1** | MVP – Local Chat Core | • Basic chat UI (single conversation).<br>• Local storage (IndexedDB) for conversations.<br>• Settings page (theme, language, model selection).<br>• Minimal notes per message.<br>• Offline-first operation verified. |
| **2** | Local Superpowers | • Folder & sub-folder management.<br>• Export (PDF/TXT/JSON/MD).<br>• Search & highlight across chats.<br>• Pinned messages, timestamps, minimap.<br>• Group deletion & trash bin. |
| **3** | Prompt Management Suite | • Prompt history (local).<br>• Prompt autocomplete menu (`/`).<br>• Prompt templates & variables.<br>• Favourite & search prompts.<br>• Prompt chains (save & execute). |
| **4** | Utilities & UX Polish | • Auto splitter & auto summarise.<br>• Custom conversation width & resizable sidebar.<br>• Word/character count, smart replace.<br>• Keyboard shortcuts, scroll controls, copy modes.<br>• Model switcher UI. |
| **5** | Optional Online Integrations | • Qwen Store (discover & install custom Qwen Apps).<br>• Public prompts library (opt-in).<br>• Newsletter archive fetcher.<br>• Cloud sync option (end-to-end encrypted, opt-in). |

Each phase should be completed **before** moving to the next. Non-local features (Phase 5) are disabled by default and must never block local-first functionality.


