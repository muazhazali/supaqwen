import { captureVisibleTranscript, findChatInput, findMainScrollable, insertIntoInput, highlightInContainer } from "../src/content/dom";
import { downloadText, exportConversationAsJSON, exportConversationAsMarkdown } from "../src/utils/export";

export default defineContentScript({
  matches: ["https://chat.qwen.ai/*", "https://www.qwen.ai/*", "https://qwen.ai/*"],
  main() {
    // Inject floating action button with minimal UI
    const root = document.createElement("div");
    Object.assign(root.style, {
      position: "fixed",
      right: "12px",
      bottom: "12px",
      zIndex: "2147483647",
    });

    root.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end;font: 12px sans-serif;">
        <div id="qwen-tools" style="background:#ffffff; border:1px solid #ddd; border-radius:8px; padding:8px; box-shadow:0 2px 12px rgba(0,0,0,0.12); display:none; min-width: 240px;">
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <input id="qwen-search" placeholder="Search & highlight" style="flex:1; padding:4px 6px;" />
            <button id="qwen-search-run">Go</button>
          </div>
          <div style="display:flex; gap:6px; margin-bottom:8px;">
            <button id="qwen-insert-prompt">Insert Prompt</button>
            <button id="qwen-export-md">Export MD</button>
            <button id="qwen-export-json">Export JSON</button>
          </div>
        </div>
        <button id="qwen-toggle" title="Qwen Tools" style="width:40px;height:40px;border-radius:20px;background:#615ced;color:#fff;border:none;cursor:pointer">⚡</button>
      </div>
    `;
    document.documentElement.appendChild(root);

    const toggle = root.querySelector<HTMLButtonElement>("#qwen-toggle")!;
    const panel = root.querySelector<HTMLDivElement>("#qwen-tools")!;
    const searchInput = root.querySelector<HTMLInputElement>("#qwen-search")!;
    const searchBtn = root.querySelector<HTMLButtonElement>("#qwen-search-run")!;
    const insertBtn = root.querySelector<HTMLButtonElement>("#qwen-insert-prompt")!;
    const exportMdBtn = root.querySelector<HTMLButtonElement>("#qwen-export-md")!;
    const exportJsonBtn = root.querySelector<HTMLButtonElement>("#qwen-export-json")!;

    toggle.addEventListener("click", () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    });

    searchBtn.addEventListener("click", () => {
      const container = findMainScrollable();
      const q = searchInput.value.trim();
      if (container && q) highlightInContainer(container, q);
    });

    insertBtn.addEventListener("click", () => {
      const input = findChatInput();
      if (!input) return alert("Could not find chat input on this page.");
      insertIntoInput(input, "\n[Friendly Greetings]\nHello! How can I assist you today? 😊\n");
    });

    exportMdBtn.addEventListener("click", () => {
      const container = findMainScrollable();
      if (!container) return alert("Could not locate conversation area.");
      const transcript = captureVisibleTranscript(container);
      const md = `# Qwen Chat Export\n\n${transcript}`;
      downloadText(`qwen-chat-${Date.now()}.md`, md);
    });

    exportJsonBtn.addEventListener("click", () => {
      const container = findMainScrollable();
      if (!container) return alert("Could not locate conversation area.");
      const transcript = captureVisibleTranscript(container);
      const json = JSON.stringify({ title: document.title, url: location.href, exportedAt: Date.now(), transcript }, null, 2);
      downloadText(`qwen-chat-${Date.now()}.json`, json);
    });
  },
});


