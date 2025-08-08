var content = function() {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  var _a, _b;
  function defineContentScript(definition2) {
    return definition2;
  }
  function findChatInput() {
    const textareas = Array.from(document.querySelectorAll("textarea"));
    const candidateByPlaceholder = textareas.find((t) => /help you today|message|ask/i.test(t.placeholder ?? ""));
    if (candidateByPlaceholder) return candidateByPlaceholder;
    const editables = Array.from(document.querySelectorAll("[contenteditable='true']"));
    const visibleEditable = editables.filter((el) => isVisible(el) && el.offsetWidth > 200 && el.offsetHeight > 30).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
    if (visibleEditable) return visibleEditable;
    return null;
  }
  function findMainScrollable() {
    var _a2;
    const allDivs = Array.from(document.querySelectorAll("div"));
    const candidates = allDivs.filter((el) => isVisible(el)).filter((el) => el.scrollHeight > el.clientHeight && el.clientHeight > 200).map((el) => ({ el, score: (el.innerText || "").length * el.clientHeight })).sort((a, b) => b.score - a.score);
    return ((_a2 = candidates[0]) == null ? void 0 : _a2.el) ?? null;
  }
  function isVisible(el) {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  function insertIntoInput(target, text) {
    if (target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const before = target.value.slice(0, start);
      const after = target.value.slice(end);
      target.value = before + text + after;
      target.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
    if (target.isContentEditable) {
      target.focus();
      document.execCommand("insertText", false, text);
      return;
    }
  }
  function captureVisibleTranscript(container) {
    return container.innerText || "";
  }
  function highlightInContainer(container, query) {
    var _a2;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (re.test(n.nodeValue || "")) nodes.push(n);
    }
    for (const n of nodes) {
      const span = document.createElement("span");
      span.innerHTML = (n.nodeValue || "").replace(re, (m) => `<mark style="background: #ffee58">${m}</mark>`);
      (_a2 = n.parentElement) == null ? void 0 : _a2.replaceChild(span, n);
    }
  }
  content;
  function downloadText(filename, content2) {
    const blob = new Blob([content2], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  content;
  const definition = defineContentScript({
    matches: ["https://chat.qwen.ai/*", "https://www.qwen.ai/*", "https://qwen.ai/*"],
    main() {
      const root = document.createElement("div");
      Object.assign(root.style, {
        position: "fixed",
        right: "12px",
        bottom: "12px",
        zIndex: "2147483647"
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
      const toggle = root.querySelector("#qwen-toggle");
      const panel = root.querySelector("#qwen-tools");
      const searchInput = root.querySelector("#qwen-search");
      const searchBtn = root.querySelector("#qwen-search-run");
      const insertBtn = root.querySelector("#qwen-insert-prompt");
      const exportMdBtn = root.querySelector("#qwen-export-md");
      const exportJsonBtn = root.querySelector("#qwen-export-json");
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
        const md = `# Qwen Chat Export

${transcript}`;
        downloadText(`qwen-chat-${Date.now()}.md`, md);
      });
      exportJsonBtn.addEventListener("click", () => {
        const container = findMainScrollable();
        if (!container) return alert("Could not locate conversation area.");
        const transcript = captureVisibleTranscript(container);
        const json = JSON.stringify({ title: document.title, url: location.href, exportedAt: Date.now(), transcript }, null, 2);
        downloadText(`qwen-chat-${Date.now()}.json`, json);
      });
    }
  });
  content;
  const browser$1 = ((_b = (_a = globalThis.browser) == null ? void 0 : _a.runtime) == null ? void 0 : _b.id) ? globalThis.browser : globalThis.chrome;
  const browser = browser$1;
  function print$1(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger$1 = {
    debug: (...args) => print$1(console.debug, ...args),
    log: (...args) => print$1(console.log, ...args),
    warn: (...args) => print$1(console.warn, ...args),
    error: (...args) => print$1(console.error, ...args)
  };
  const _WxtLocationChangeEvent = class _WxtLocationChangeEvent extends Event {
    constructor(newUrl, oldUrl) {
      super(_WxtLocationChangeEvent.EVENT_NAME, {});
      this.newUrl = newUrl;
      this.oldUrl = oldUrl;
    }
  };
  __publicField(_WxtLocationChangeEvent, "EVENT_NAME", getUniqueEventName("wxt:locationchange"));
  let WxtLocationChangeEvent = _WxtLocationChangeEvent;
  function getUniqueEventName(eventName) {
    var _a2;
    return `${(_a2 = browser == null ? void 0 : browser.runtime) == null ? void 0 : _a2.id}:${"content"}:${eventName}`;
  }
  function createLocationWatcher(ctx) {
    let interval;
    let oldUrl;
    return {
      /**
       * Ensure the location watcher is actively looking for URL changes. If it's already watching,
       * this is a noop.
       */
      run() {
        if (interval != null) return;
        oldUrl = new URL(location.href);
        interval = ctx.setInterval(() => {
          let newUrl = new URL(location.href);
          if (newUrl.href !== oldUrl.href) {
            window.dispatchEvent(new WxtLocationChangeEvent(newUrl, oldUrl));
            oldUrl = newUrl;
          }
        }, 1e3);
      }
    };
  }
  const _ContentScriptContext = class _ContentScriptContext {
    constructor(contentScriptName, options) {
      __publicField(this, "isTopFrame", window.self === window.top);
      __publicField(this, "abortController");
      __publicField(this, "locationWatcher", createLocationWatcher(this));
      __publicField(this, "receivedMessageIds", /* @__PURE__ */ new Set());
      this.contentScriptName = contentScriptName;
      this.options = options;
      this.abortController = new AbortController();
      if (this.isTopFrame) {
        this.listenForNewerScripts({ ignoreFirstEvent: true });
        this.stopOldScripts();
      } else {
        this.listenForNewerScripts();
      }
    }
    get signal() {
      return this.abortController.signal;
    }
    abort(reason) {
      return this.abortController.abort(reason);
    }
    get isInvalid() {
      if (browser.runtime.id == null) {
        this.notifyInvalidated();
      }
      return this.signal.aborted;
    }
    get isValid() {
      return !this.isInvalid;
    }
    /**
     * Add a listener that is called when the content script's context is invalidated.
     *
     * @returns A function to remove the listener.
     *
     * @example
     * browser.runtime.onMessage.addListener(cb);
     * const removeInvalidatedListener = ctx.onInvalidated(() => {
     *   browser.runtime.onMessage.removeListener(cb);
     * })
     * // ...
     * removeInvalidatedListener();
     */
    onInvalidated(cb) {
      this.signal.addEventListener("abort", cb);
      return () => this.signal.removeEventListener("abort", cb);
    }
    /**
     * Return a promise that never resolves. Useful if you have an async function that shouldn't run
     * after the context is expired.
     *
     * @example
     * const getValueFromStorage = async () => {
     *   if (ctx.isInvalid) return ctx.block();
     *
     *   // ...
     * }
     */
    block() {
      return new Promise(() => {
      });
    }
    /**
     * Wrapper around `window.setInterval` that automatically clears the interval when invalidated.
     */
    setInterval(handler, timeout) {
      const id = setInterval(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearInterval(id));
      return id;
    }
    /**
     * Wrapper around `window.setTimeout` that automatically clears the interval when invalidated.
     */
    setTimeout(handler, timeout) {
      const id = setTimeout(() => {
        if (this.isValid) handler();
      }, timeout);
      this.onInvalidated(() => clearTimeout(id));
      return id;
    }
    /**
     * Wrapper around `window.requestAnimationFrame` that automatically cancels the request when
     * invalidated.
     */
    requestAnimationFrame(callback) {
      const id = requestAnimationFrame((...args) => {
        if (this.isValid) callback(...args);
      });
      this.onInvalidated(() => cancelAnimationFrame(id));
      return id;
    }
    /**
     * Wrapper around `window.requestIdleCallback` that automatically cancels the request when
     * invalidated.
     */
    requestIdleCallback(callback, options) {
      const id = requestIdleCallback((...args) => {
        if (!this.signal.aborted) callback(...args);
      }, options);
      this.onInvalidated(() => cancelIdleCallback(id));
      return id;
    }
    addEventListener(target, type, handler, options) {
      var _a2;
      if (type === "wxt:locationchange") {
        if (this.isValid) this.locationWatcher.run();
      }
      (_a2 = target.addEventListener) == null ? void 0 : _a2.call(
        target,
        type.startsWith("wxt:") ? getUniqueEventName(type) : type,
        handler,
        {
          ...options,
          signal: this.signal
        }
      );
    }
    /**
     * @internal
     * Abort the abort controller and execute all `onInvalidated` listeners.
     */
    notifyInvalidated() {
      this.abort("Content script context invalidated");
      logger$1.debug(
        `Content script "${this.contentScriptName}" context invalidated`
      );
    }
    stopOldScripts() {
      window.postMessage(
        {
          type: _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE,
          contentScriptName: this.contentScriptName,
          messageId: Math.random().toString(36).slice(2)
        },
        "*"
      );
    }
    verifyScriptStartedEvent(event) {
      var _a2, _b2, _c;
      const isScriptStartedEvent = ((_a2 = event.data) == null ? void 0 : _a2.type) === _ContentScriptContext.SCRIPT_STARTED_MESSAGE_TYPE;
      const isSameContentScript = ((_b2 = event.data) == null ? void 0 : _b2.contentScriptName) === this.contentScriptName;
      const isNotDuplicate = !this.receivedMessageIds.has((_c = event.data) == null ? void 0 : _c.messageId);
      return isScriptStartedEvent && isSameContentScript && isNotDuplicate;
    }
    listenForNewerScripts(options) {
      let isFirst = true;
      const cb = (event) => {
        if (this.verifyScriptStartedEvent(event)) {
          this.receivedMessageIds.add(event.data.messageId);
          const wasFirst = isFirst;
          isFirst = false;
          if (wasFirst && (options == null ? void 0 : options.ignoreFirstEvent)) return;
          this.notifyInvalidated();
        }
      };
      addEventListener("message", cb);
      this.onInvalidated(() => removeEventListener("message", cb));
    }
  };
  __publicField(_ContentScriptContext, "SCRIPT_STARTED_MESSAGE_TYPE", getUniqueEventName(
    "wxt:content-script-started"
  ));
  let ContentScriptContext = _ContentScriptContext;
  function initPlugins() {
  }
  function print(method, ...args) {
    if (typeof args[0] === "string") {
      const message = args.shift();
      method(`[wxt] ${message}`, ...args);
    } else {
      method("[wxt]", ...args);
    }
  }
  const logger = {
    debug: (...args) => print(console.debug, ...args),
    log: (...args) => print(console.log, ...args),
    warn: (...args) => print(console.warn, ...args),
    error: (...args) => print(console.error, ...args)
  };
  const result = (async () => {
    try {
      initPlugins();
      const { main, ...options } = definition;
      const ctx = new ContentScriptContext("content", options);
      return await main(ctx);
    } catch (err) {
      logger.error(
        `The content script "${"content"}" crashed on startup!`,
        err
      );
      throw err;
    }
  })();
  return result;
}();
content;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjdfQHR5cGVzK25vZGVAMjQuMi4wX2ppdGlAMi41LjFfcm9sbHVwQDQuNDYuMi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvZGVmaW5lLWNvbnRlbnQtc2NyaXB0Lm1qcyIsIi4uLy4uLy4uL3NyYy9jb250ZW50L2RvbS50cyIsIi4uLy4uLy4uL3NyYy91dGlscy9leHBvcnQudHMiLCIuLi8uLi8uLi9lbnRyeXBvaW50cy9jb250ZW50LnRzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL0B3eHQtZGV2K2Jyb3dzZXJAMC4wLjMyNi9ub2RlX21vZHVsZXMvQHd4dC1kZXYvYnJvd3Nlci9zcmMvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjdfQHR5cGVzK25vZGVAMjQuMi4wX2ppdGlAMi41LjFfcm9sbHVwQDQuNDYuMi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvYnJvd3Nlci5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuN19AdHlwZXMrbm9kZUAyNC4yLjBfaml0aUAyLjUuMV9yb2xsdXBANC40Ni4yL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3d4dEAwLjIwLjdfQHR5cGVzK25vZGVAMjQuMi4wX2ppdGlAMi41LjFfcm9sbHVwQDQuNDYuMi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3h0QDAuMjAuN19AdHlwZXMrbm9kZUAyNC4yLjBfaml0aUAyLjUuMV9yb2xsdXBANC40Ni4yL25vZGVfbW9kdWxlcy93eHQvZGlzdC91dGlscy9pbnRlcm5hbC9sb2NhdGlvbi13YXRjaGVyLm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93eHRAMC4yMC43X0B0eXBlcytub2RlQDI0LjIuMF9qaXRpQDIuNS4xX3JvbGx1cEA0LjQ2LjIvbm9kZV9tb2R1bGVzL3d4dC9kaXN0L3V0aWxzL2NvbnRlbnQtc2NyaXB0LWNvbnRleHQubWpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBkZWZpbmVDb250ZW50U2NyaXB0KGRlZmluaXRpb24pIHtcbiAgcmV0dXJuIGRlZmluaXRpb247XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZmluZENoYXRJbnB1dCgpOiBIVE1MVGV4dEFyZWFFbGVtZW50IHwgSFRNTEVsZW1lbnQgfCBudWxsIHtcclxuICAvLyBUcnkgY29tbW9uIHBhdHRlcm5zOiB0ZXh0YXJlYSB3aXRoIHBsYWNlaG9sZGVyLCBjb250ZW50ZWRpdGFibGUgYXJlYXMgbmVhciBib3R0b21cclxuICBjb25zdCB0ZXh0YXJlYXMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTFRleHRBcmVhRWxlbWVudD4oXCJ0ZXh0YXJlYVwiKSk7XHJcbiAgY29uc3QgY2FuZGlkYXRlQnlQbGFjZWhvbGRlciA9IHRleHRhcmVhcy5maW5kKCh0KSA9PiAvaGVscCB5b3UgdG9kYXl8bWVzc2FnZXxhc2svaS50ZXN0KHQucGxhY2Vob2xkZXIgPz8gXCJcIikpO1xyXG4gIGlmIChjYW5kaWRhdGVCeVBsYWNlaG9sZGVyKSByZXR1cm4gY2FuZGlkYXRlQnlQbGFjZWhvbGRlcjtcclxuXHJcbiAgY29uc3QgZWRpdGFibGVzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxFbGVtZW50PihcIltjb250ZW50ZWRpdGFibGU9J3RydWUnXVwiKSk7XHJcbiAgLy8gUHJlZmVyIHZpc2libGUgYW5kIGxhcmdlciB3aWR0aCBlbGVtZW50c1xyXG4gIGNvbnN0IHZpc2libGVFZGl0YWJsZSA9IGVkaXRhYmxlc1xyXG4gICAgLmZpbHRlcigoZWwpID0+IGlzVmlzaWJsZShlbCkgJiYgZWwub2Zmc2V0V2lkdGggPiAyMDAgJiYgZWwub2Zmc2V0SGVpZ2h0ID4gMzApXHJcbiAgICAuc29ydCgoYSwgYikgPT4gYi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCAtIGEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgpWzBdO1xyXG4gIGlmICh2aXNpYmxlRWRpdGFibGUpIHJldHVybiB2aXNpYmxlRWRpdGFibGU7XHJcblxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE1haW5TY3JvbGxhYmxlKCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XHJcbiAgLy8gSGV1cmlzdGljOiBsYXJnZXN0IHNjcm9sbGFibGUgY29udGFpbmVyIGluIHZpZXdwb3J0IHdpdGggc2lnbmlmaWNhbnQgdGV4dFxyXG4gIGNvbnN0IGFsbERpdnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEVsZW1lbnQ+KFwiZGl2XCIpKTtcclxuICBjb25zdCBjYW5kaWRhdGVzID0gYWxsRGl2c1xyXG4gICAgLmZpbHRlcigoZWwpID0+IGlzVmlzaWJsZShlbCkpXHJcbiAgICAuZmlsdGVyKChlbCkgPT4gZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0ICYmIGVsLmNsaWVudEhlaWdodCA+IDIwMClcclxuICAgIC5tYXAoKGVsKSA9PiAoeyBlbCwgc2NvcmU6IChlbC5pbm5lclRleHQgfHwgXCJcIikubGVuZ3RoICogZWwuY2xpZW50SGVpZ2h0IH0pKVxyXG4gICAgLnNvcnQoKGEsIGIpID0+IGIuc2NvcmUgLSBhLnNjb3JlKTtcclxuICByZXR1cm4gY2FuZGlkYXRlc1swXT8uZWwgPz8gbnVsbDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVmlzaWJsZShlbDogSFRNTEVsZW1lbnQpOiBib29sZWFuIHtcclxuICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG4gIGlmIChzdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiB8fCBzdHlsZS52aXNpYmlsaXR5ID09PSBcImhpZGRlblwiIHx8IE51bWJlcihzdHlsZS5vcGFjaXR5KSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICByZXR1cm4gcmVjdC53aWR0aCA+IDAgJiYgcmVjdC5oZWlnaHQgPiAwO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaW5zZXJ0SW50b0lucHV0KHRhcmdldDogSFRNTEVsZW1lbnQgfCBIVE1MVGV4dEFyZWFFbGVtZW50LCB0ZXh0OiBzdHJpbmcpIHtcclxuICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSFRNTFRleHRBcmVhRWxlbWVudCkge1xyXG4gICAgY29uc3Qgc3RhcnQgPSB0YXJnZXQuc2VsZWN0aW9uU3RhcnQgPz8gdGFyZ2V0LnZhbHVlLmxlbmd0aDtcclxuICAgIGNvbnN0IGVuZCA9IHRhcmdldC5zZWxlY3Rpb25FbmQgPz8gdGFyZ2V0LnZhbHVlLmxlbmd0aDtcclxuICAgIGNvbnN0IGJlZm9yZSA9IHRhcmdldC52YWx1ZS5zbGljZSgwLCBzdGFydCk7XHJcbiAgICBjb25zdCBhZnRlciA9IHRhcmdldC52YWx1ZS5zbGljZShlbmQpO1xyXG4gICAgdGFyZ2V0LnZhbHVlID0gYmVmb3JlICsgdGV4dCArIGFmdGVyO1xyXG4gICAgdGFyZ2V0LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiaW5wdXRcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgaWYgKHRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSkge1xyXG4gICAgdGFyZ2V0LmZvY3VzKCk7XHJcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZChcImluc2VydFRleHRcIiwgZmFsc2UsIHRleHQpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNhcHR1cmVWaXNpYmxlVHJhbnNjcmlwdChjb250YWluZXI6IEhUTUxFbGVtZW50KTogc3RyaW5nIHtcclxuICAvLyBNaW5pbWFsIHNhbml0aXphdGlvbjogY2FwdHVyZSBpbm5lclRleHQgZnJvbSB0aGUgc2Nyb2xsYWJsZSBjb250YWluZXJcclxuICByZXR1cm4gY29udGFpbmVyLmlubmVyVGV4dCB8fCBcIlwiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGlnaGxpZ2h0SW5Db250YWluZXIoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgcXVlcnk6IHN0cmluZykge1xyXG4gIC8vIFNpbXBsZSBoaWdobGlnaHRlciB1c2luZyBtYXJrIGVsZW1lbnRzIGluc2lkZSBhIHNoYWRvdyByb290IHNhZmUgd3JhcHBlclxyXG4gIGNvbnN0IHdhbGtlciA9IGRvY3VtZW50LmNyZWF0ZVRyZWVXYWxrZXIoY29udGFpbmVyLCBOb2RlRmlsdGVyLlNIT1dfVEVYVCk7XHJcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHF1ZXJ5LnJlcGxhY2UoL1suKis/XiR7fSgpfFtcXF1cXFxcXS9nLCBcIlxcXFwkJlwiKSwgXCJpZ1wiKTtcclxuICBjb25zdCBub2RlczogVGV4dFtdID0gW107XHJcbiAgLy8gQ29sbGVjdCBmaXJzdCB0byBhdm9pZCBtb2RpZnlpbmcgd2hpbGUgaXRlcmF0aW5nXHJcbiAgd2hpbGUgKHdhbGtlci5uZXh0Tm9kZSgpKSB7XHJcbiAgICBjb25zdCBuID0gd2Fsa2VyLmN1cnJlbnROb2RlIGFzIFRleHQ7XHJcbiAgICBpZiAocmUudGVzdChuLm5vZGVWYWx1ZSB8fCBcIlwiKSkgbm9kZXMucHVzaChuKTtcclxuICB9XHJcbiAgZm9yIChjb25zdCBuIG9mIG5vZGVzKSB7XHJcbiAgICBjb25zdCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICBzcGFuLmlubmVySFRNTCA9IChuLm5vZGVWYWx1ZSB8fCBcIlwiKS5yZXBsYWNlKHJlLCAobSkgPT4gYDxtYXJrIHN0eWxlPVwiYmFja2dyb3VuZDogI2ZmZWU1OFwiPiR7bX08L21hcms+YCk7XHJcbiAgICBuLnBhcmVudEVsZW1lbnQ/LnJlcGxhY2VDaGlsZChzcGFuLCBuKTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4iLCJpbXBvcnQgeyBDb252ZXJzYXRpb24sIE1lc3NhZ2UgfSBmcm9tIFwiLi4vdHlwZXNcIjtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRDb252ZXJzYXRpb25Bc0pTT04oY29udmVyc2F0aW9uOiBDb252ZXJzYXRpb24sIG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBzdHJpbmcge1xyXG4gIGNvbnN0IGRhdGEgPSB7IGNvbnZlcnNhdGlvbiwgbWVzc2FnZXMgfTtcclxuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHBvcnRDb252ZXJzYXRpb25Bc01hcmtkb3duKGNvbnZlcnNhdGlvbjogQ29udmVyc2F0aW9uLCBtZXNzYWdlczogTWVzc2FnZVtdKTogc3RyaW5nIHtcclxuICBjb25zdCBsaW5lczogc3RyaW5nW10gPSBbXTtcclxuICBsaW5lcy5wdXNoKGAjICR7Y29udmVyc2F0aW9uLnRpdGxlfWApO1xyXG4gIGxpbmVzLnB1c2goXCJcIik7XHJcbiAgZm9yIChjb25zdCBtIG9mIG1lc3NhZ2VzKSB7XHJcbiAgICBsaW5lcy5wdXNoKGAjIyAke20ucm9sZX0gKCR7bmV3IERhdGUobS5jcmVhdGVkQXQpLnRvTG9jYWxlU3RyaW5nKCl9KWApO1xyXG4gICAgbGluZXMucHVzaChcIlwiKTtcclxuICAgIGxpbmVzLnB1c2gobS5jb250ZW50KTtcclxuICAgIGlmIChtLm5vdGVzKSB7XHJcbiAgICAgIGxpbmVzLnB1c2goXCJcIik7XHJcbiAgICAgIGxpbmVzLnB1c2goYD4gTm90ZXM6ICR7bS5ub3Rlc31gKTtcclxuICAgIH1cclxuICAgIGxpbmVzLnB1c2goXCJcIik7XHJcbiAgfVxyXG4gIHJldHVybiBsaW5lcy5qb2luKFwiXFxuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZG93bmxvYWRUZXh0KGZpbGVuYW1lOiBzdHJpbmcsIGNvbnRlbnQ6IHN0cmluZykge1xyXG4gIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY29udGVudF0sIHsgdHlwZTogXCJ0ZXh0L3BsYWluO2NoYXJzZXQ9dXRmLThcIiB9KTtcclxuICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICBhLmhyZWYgPSB1cmw7XHJcbiAgYS5kb3dubG9hZCA9IGZpbGVuYW1lO1xyXG4gIGEuY2xpY2soKTtcclxuICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XHJcbn1cclxuXHJcblxyXG4iLCJpbXBvcnQgeyBjYXB0dXJlVmlzaWJsZVRyYW5zY3JpcHQsIGZpbmRDaGF0SW5wdXQsIGZpbmRNYWluU2Nyb2xsYWJsZSwgaW5zZXJ0SW50b0lucHV0LCBoaWdobGlnaHRJbkNvbnRhaW5lciB9IGZyb20gXCIuLi9zcmMvY29udGVudC9kb21cIjtcclxuaW1wb3J0IHsgZG93bmxvYWRUZXh0LCBleHBvcnRDb252ZXJzYXRpb25Bc0pTT04sIGV4cG9ydENvbnZlcnNhdGlvbkFzTWFya2Rvd24gfSBmcm9tIFwiLi4vc3JjL3V0aWxzL2V4cG9ydFwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29udGVudFNjcmlwdCh7XHJcbiAgbWF0Y2hlczogW1wiaHR0cHM6Ly9jaGF0LnF3ZW4uYWkvKlwiLCBcImh0dHBzOi8vd3d3LnF3ZW4uYWkvKlwiLCBcImh0dHBzOi8vcXdlbi5haS8qXCJdLFxyXG4gIG1haW4oKSB7XHJcbiAgICAvLyBJbmplY3QgZmxvYXRpbmcgYWN0aW9uIGJ1dHRvbiB3aXRoIG1pbmltYWwgVUlcclxuICAgIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgT2JqZWN0LmFzc2lnbihyb290LnN0eWxlLCB7XHJcbiAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXHJcbiAgICAgIHJpZ2h0OiBcIjEycHhcIixcclxuICAgICAgYm90dG9tOiBcIjEycHhcIixcclxuICAgICAgekluZGV4OiBcIjIxNDc0ODM2NDdcIixcclxuICAgIH0pO1xyXG5cclxuICAgIHJvb3QuaW5uZXJIVE1MID0gYFxyXG4gICAgICA8ZGl2IHN0eWxlPVwiZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6OHB4O2FsaWduLWl0ZW1zOmZsZXgtZW5kO2ZvbnQ6IDEycHggc2Fucy1zZXJpZjtcIj5cclxuICAgICAgICA8ZGl2IGlkPVwicXdlbi10b29sc1wiIHN0eWxlPVwiYmFja2dyb3VuZDojZmZmZmZmOyBib3JkZXI6MXB4IHNvbGlkICNkZGQ7IGJvcmRlci1yYWRpdXM6OHB4OyBwYWRkaW5nOjhweDsgYm94LXNoYWRvdzowIDJweCAxMnB4IHJnYmEoMCwwLDAsMC4xMik7IGRpc3BsYXk6bm9uZTsgbWluLXdpZHRoOiAyNDBweDtcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJkaXNwbGF5OmZsZXg7IGdhcDo2cHg7IG1hcmdpbi1ib3R0b206OHB4O1wiPlxyXG4gICAgICAgICAgICA8aW5wdXQgaWQ9XCJxd2VuLXNlYXJjaFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoICYgaGlnaGxpZ2h0XCIgc3R5bGU9XCJmbGV4OjE7IHBhZGRpbmc6NHB4IDZweDtcIiAvPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwicXdlbi1zZWFyY2gtcnVuXCI+R288L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cImRpc3BsYXk6ZmxleDsgZ2FwOjZweDsgbWFyZ2luLWJvdHRvbTo4cHg7XCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJxd2VuLWluc2VydC1wcm9tcHRcIj5JbnNlcnQgUHJvbXB0PC9idXR0b24+XHJcbiAgICAgICAgICAgIDxidXR0b24gaWQ9XCJxd2VuLWV4cG9ydC1tZFwiPkV4cG9ydCBNRDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8YnV0dG9uIGlkPVwicXdlbi1leHBvcnQtanNvblwiPkV4cG9ydCBKU09OPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8YnV0dG9uIGlkPVwicXdlbi10b2dnbGVcIiB0aXRsZT1cIlF3ZW4gVG9vbHNcIiBzdHlsZT1cIndpZHRoOjQwcHg7aGVpZ2h0OjQwcHg7Ym9yZGVyLXJhZGl1czoyMHB4O2JhY2tncm91bmQ6IzYxNWNlZDtjb2xvcjojZmZmO2JvcmRlcjpub25lO2N1cnNvcjpwb2ludGVyXCI+4pqhPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgYDtcclxuICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5hcHBlbmRDaGlsZChyb290KTtcclxuXHJcbiAgICBjb25zdCB0b2dnbGUgPSByb290LnF1ZXJ5U2VsZWN0b3I8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiI3F3ZW4tdG9nZ2xlXCIpITtcclxuICAgIGNvbnN0IHBhbmVsID0gcm9vdC5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PihcIiNxd2VuLXRvb2xzXCIpITtcclxuICAgIGNvbnN0IHNlYXJjaElucHV0ID0gcm9vdC5xdWVyeVNlbGVjdG9yPEhUTUxJbnB1dEVsZW1lbnQ+KFwiI3F3ZW4tc2VhcmNoXCIpITtcclxuICAgIGNvbnN0IHNlYXJjaEJ0biA9IHJvb3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oXCIjcXdlbi1zZWFyY2gtcnVuXCIpITtcclxuICAgIGNvbnN0IGluc2VydEJ0biA9IHJvb3QucXVlcnlTZWxlY3RvcjxIVE1MQnV0dG9uRWxlbWVudD4oXCIjcXdlbi1pbnNlcnQtcHJvbXB0XCIpITtcclxuICAgIGNvbnN0IGV4cG9ydE1kQnRuID0gcm9vdC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PihcIiNxd2VuLWV4cG9ydC1tZFwiKSE7XHJcbiAgICBjb25zdCBleHBvcnRKc29uQnRuID0gcm9vdC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PihcIiNxd2VuLWV4cG9ydC1qc29uXCIpITtcclxuXHJcbiAgICB0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgcGFuZWwuc3R5bGUuZGlzcGxheSA9IHBhbmVsLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICB9KTtcclxuXHJcbiAgICBzZWFyY2hCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgY29uc3QgY29udGFpbmVyID0gZmluZE1haW5TY3JvbGxhYmxlKCk7XHJcbiAgICAgIGNvbnN0IHEgPSBzZWFyY2hJbnB1dC52YWx1ZS50cmltKCk7XHJcbiAgICAgIGlmIChjb250YWluZXIgJiYgcSkgaGlnaGxpZ2h0SW5Db250YWluZXIoY29udGFpbmVyLCBxKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGluc2VydEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCBpbnB1dCA9IGZpbmRDaGF0SW5wdXQoKTtcclxuICAgICAgaWYgKCFpbnB1dCkgcmV0dXJuIGFsZXJ0KFwiQ291bGQgbm90IGZpbmQgY2hhdCBpbnB1dCBvbiB0aGlzIHBhZ2UuXCIpO1xyXG4gICAgICBpbnNlcnRJbnRvSW5wdXQoaW5wdXQsIFwiXFxuW0ZyaWVuZGx5IEdyZWV0aW5nc11cXG5IZWxsbyEgSG93IGNhbiBJIGFzc2lzdCB5b3UgdG9kYXk/IPCfmIpcXG5cIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBleHBvcnRNZEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBmaW5kTWFpblNjcm9sbGFibGUoKTtcclxuICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybiBhbGVydChcIkNvdWxkIG5vdCBsb2NhdGUgY29udmVyc2F0aW9uIGFyZWEuXCIpO1xyXG4gICAgICBjb25zdCB0cmFuc2NyaXB0ID0gY2FwdHVyZVZpc2libGVUcmFuc2NyaXB0KGNvbnRhaW5lcik7XHJcbiAgICAgIGNvbnN0IG1kID0gYCMgUXdlbiBDaGF0IEV4cG9ydFxcblxcbiR7dHJhbnNjcmlwdH1gO1xyXG4gICAgICBkb3dubG9hZFRleHQoYHF3ZW4tY2hhdC0ke0RhdGUubm93KCl9Lm1kYCwgbWQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZXhwb3J0SnNvbkJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBjb25zdCBjb250YWluZXIgPSBmaW5kTWFpblNjcm9sbGFibGUoKTtcclxuICAgICAgaWYgKCFjb250YWluZXIpIHJldHVybiBhbGVydChcIkNvdWxkIG5vdCBsb2NhdGUgY29udmVyc2F0aW9uIGFyZWEuXCIpO1xyXG4gICAgICBjb25zdCB0cmFuc2NyaXB0ID0gY2FwdHVyZVZpc2libGVUcmFuc2NyaXB0KGNvbnRhaW5lcik7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh7IHRpdGxlOiBkb2N1bWVudC50aXRsZSwgdXJsOiBsb2NhdGlvbi5ocmVmLCBleHBvcnRlZEF0OiBEYXRlLm5vdygpLCB0cmFuc2NyaXB0IH0sIG51bGwsIDIpO1xyXG4gICAgICBkb3dubG9hZFRleHQoYHF3ZW4tY2hhdC0ke0RhdGUubm93KCl9Lmpzb25gLCBqc29uKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbn0pO1xyXG5cclxuXHJcbiIsIi8vICNyZWdpb24gc25pcHBldFxuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBnbG9iYWxUaGlzLmJyb3dzZXI/LnJ1bnRpbWU/LmlkXG4gID8gZ2xvYmFsVGhpcy5icm93c2VyXG4gIDogZ2xvYmFsVGhpcy5jaHJvbWU7XG4vLyAjZW5kcmVnaW9uIHNuaXBwZXRcbiIsImltcG9ydCB7IGJyb3dzZXIgYXMgX2Jyb3dzZXIgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuZXhwb3J0IGNvbnN0IGJyb3dzZXIgPSBfYnJvd3NlcjtcbmV4cG9ydCB7fTtcbiIsImZ1bmN0aW9uIHByaW50KG1ldGhvZCwgLi4uYXJncykge1xuICBpZiAoaW1wb3J0Lm1ldGEuZW52Lk1PREUgPT09IFwicHJvZHVjdGlvblwiKSByZXR1cm47XG4gIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBhcmdzLnNoaWZ0KCk7XG4gICAgbWV0aG9kKGBbd3h0XSAke21lc3NhZ2V9YCwgLi4uYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgbWV0aG9kKFwiW3d4dF1cIiwgLi4uYXJncyk7XG4gIH1cbn1cbmV4cG9ydCBjb25zdCBsb2dnZXIgPSB7XG4gIGRlYnVnOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5kZWJ1ZywgLi4uYXJncyksXG4gIGxvZzogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUubG9nLCAuLi5hcmdzKSxcbiAgd2FybjogKC4uLmFyZ3MpID0+IHByaW50KGNvbnNvbGUud2FybiwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gcHJpbnQoY29uc29sZS5lcnJvciwgLi4uYXJncylcbn07XG4iLCJpbXBvcnQgeyBicm93c2VyIH0gZnJvbSBcInd4dC9icm93c2VyXCI7XG5leHBvcnQgY2xhc3MgV3h0TG9jYXRpb25DaGFuZ2VFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgY29uc3RydWN0b3IobmV3VXJsLCBvbGRVcmwpIHtcbiAgICBzdXBlcihXeHRMb2NhdGlvbkNoYW5nZUV2ZW50LkVWRU5UX05BTUUsIHt9KTtcbiAgICB0aGlzLm5ld1VybCA9IG5ld1VybDtcbiAgICB0aGlzLm9sZFVybCA9IG9sZFVybDtcbiAgfVxuICBzdGF0aWMgRVZFTlRfTkFNRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcInd4dDpsb2NhdGlvbmNoYW5nZVwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRVbmlxdWVFdmVudE5hbWUoZXZlbnROYW1lKSB7XG4gIHJldHVybiBgJHticm93c2VyPy5ydW50aW1lPy5pZH06JHtpbXBvcnQubWV0YS5lbnYuRU5UUllQT0lOVH06JHtldmVudE5hbWV9YDtcbn1cbiIsImltcG9ydCB7IFd4dExvY2F0aW9uQ2hhbmdlRXZlbnQgfSBmcm9tIFwiLi9jdXN0b20tZXZlbnRzLm1qc1wiO1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcihjdHgpIHtcbiAgbGV0IGludGVydmFsO1xuICBsZXQgb2xkVXJsO1xuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIEVuc3VyZSB0aGUgbG9jYXRpb24gd2F0Y2hlciBpcyBhY3RpdmVseSBsb29raW5nIGZvciBVUkwgY2hhbmdlcy4gSWYgaXQncyBhbHJlYWR5IHdhdGNoaW5nLFxuICAgICAqIHRoaXMgaXMgYSBub29wLlxuICAgICAqL1xuICAgIHJ1bigpIHtcbiAgICAgIGlmIChpbnRlcnZhbCAhPSBudWxsKSByZXR1cm47XG4gICAgICBvbGRVcmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgaW50ZXJ2YWwgPSBjdHguc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICBsZXQgbmV3VXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgaWYgKG5ld1VybC5ocmVmICE9PSBvbGRVcmwuaHJlZikge1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBXeHRMb2NhdGlvbkNoYW5nZUV2ZW50KG5ld1VybCwgb2xkVXJsKSk7XG4gICAgICAgICAgb2xkVXJsID0gbmV3VXJsO1xuICAgICAgICB9XG4gICAgICB9LCAxZTMpO1xuICAgIH1cbiAgfTtcbn1cbiIsImltcG9ydCB7IGJyb3dzZXIgfSBmcm9tIFwid3h0L2Jyb3dzZXJcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCIuLi91dGlscy9pbnRlcm5hbC9sb2dnZXIubWpzXCI7XG5pbXBvcnQge1xuICBnZXRVbmlxdWVFdmVudE5hbWVcbn0gZnJvbSBcIi4vaW50ZXJuYWwvY3VzdG9tLWV2ZW50cy5tanNcIjtcbmltcG9ydCB7IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlciB9IGZyb20gXCIuL2ludGVybmFsL2xvY2F0aW9uLXdhdGNoZXIubWpzXCI7XG5leHBvcnQgY2xhc3MgQ29udGVudFNjcmlwdENvbnRleHQge1xuICBjb25zdHJ1Y3Rvcihjb250ZW50U2NyaXB0TmFtZSwgb3B0aW9ucykge1xuICAgIHRoaXMuY29udGVudFNjcmlwdE5hbWUgPSBjb250ZW50U2NyaXB0TmFtZTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuYWJvcnRDb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpO1xuICAgIGlmICh0aGlzLmlzVG9wRnJhbWUpIHtcbiAgICAgIHRoaXMubGlzdGVuRm9yTmV3ZXJTY3JpcHRzKHsgaWdub3JlRmlyc3RFdmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuc3RvcE9sZFNjcmlwdHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5saXN0ZW5Gb3JOZXdlclNjcmlwdHMoKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIFNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSA9IGdldFVuaXF1ZUV2ZW50TmFtZShcbiAgICBcInd4dDpjb250ZW50LXNjcmlwdC1zdGFydGVkXCJcbiAgKTtcbiAgaXNUb3BGcmFtZSA9IHdpbmRvdy5zZWxmID09PSB3aW5kb3cudG9wO1xuICBhYm9ydENvbnRyb2xsZXI7XG4gIGxvY2F0aW9uV2F0Y2hlciA9IGNyZWF0ZUxvY2F0aW9uV2F0Y2hlcih0aGlzKTtcbiAgcmVjZWl2ZWRNZXNzYWdlSWRzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZ2V0IHNpZ25hbCgpIHtcbiAgICByZXR1cm4gdGhpcy5hYm9ydENvbnRyb2xsZXIuc2lnbmFsO1xuICB9XG4gIGFib3J0KHJlYXNvbikge1xuICAgIHJldHVybiB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydChyZWFzb24pO1xuICB9XG4gIGdldCBpc0ludmFsaWQoKSB7XG4gICAgaWYgKGJyb3dzZXIucnVudGltZS5pZCA9PSBudWxsKSB7XG4gICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNpZ25hbC5hYm9ydGVkO1xuICB9XG4gIGdldCBpc1ZhbGlkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0ludmFsaWQ7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIGxpc3RlbmVyIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgc2NyaXB0J3MgY29udGV4dCBpcyBpbnZhbGlkYXRlZC5cbiAgICpcbiAgICogQHJldHVybnMgQSBmdW5jdGlvbiB0byByZW1vdmUgdGhlIGxpc3RlbmVyLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGNiKTtcbiAgICogY29uc3QgcmVtb3ZlSW52YWxpZGF0ZWRMaXN0ZW5lciA9IGN0eC5vbkludmFsaWRhdGVkKCgpID0+IHtcbiAgICogICBicm93c2VyLnJ1bnRpbWUub25NZXNzYWdlLnJlbW92ZUxpc3RlbmVyKGNiKTtcbiAgICogfSlcbiAgICogLy8gLi4uXG4gICAqIHJlbW92ZUludmFsaWRhdGVkTGlzdGVuZXIoKTtcbiAgICovXG4gIG9uSW52YWxpZGF0ZWQoY2IpIHtcbiAgICB0aGlzLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICAgIHJldHVybiAoKSA9PiB0aGlzLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgY2IpO1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm4gYSBwcm9taXNlIHRoYXQgbmV2ZXIgcmVzb2x2ZXMuIFVzZWZ1bCBpZiB5b3UgaGF2ZSBhbiBhc3luYyBmdW5jdGlvbiB0aGF0IHNob3VsZG4ndCBydW5cbiAgICogYWZ0ZXIgdGhlIGNvbnRleHQgaXMgZXhwaXJlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogY29uc3QgZ2V0VmFsdWVGcm9tU3RvcmFnZSA9IGFzeW5jICgpID0+IHtcbiAgICogICBpZiAoY3R4LmlzSW52YWxpZCkgcmV0dXJuIGN0eC5ibG9jaygpO1xuICAgKlxuICAgKiAgIC8vIC4uLlxuICAgKiB9XG4gICAqL1xuICBibG9jaygpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKCkgPT4ge1xuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldEludGVydmFsYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2xlYXJzIHRoZSBpbnRlcnZhbCB3aGVuIGludmFsaWRhdGVkLlxuICAgKi9cbiAgc2V0SW50ZXJ2YWwoaGFuZGxlciwgdGltZW91dCkge1xuICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhckludGVydmFsKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBXcmFwcGVyIGFyb3VuZCBgd2luZG93LnNldFRpbWVvdXRgIHRoYXQgYXV0b21hdGljYWxseSBjbGVhcnMgdGhlIGludGVydmFsIHdoZW4gaW52YWxpZGF0ZWQuXG4gICAqL1xuICBzZXRUaW1lb3V0KGhhbmRsZXIsIHRpbWVvdXQpIHtcbiAgICBjb25zdCBpZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNWYWxpZCkgaGFuZGxlcigpO1xuICAgIH0sIHRpbWVvdXQpO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjbGVhclRpbWVvdXQoaWQpKTtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgLyoqXG4gICAqIFdyYXBwZXIgYXJvdW5kIGB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKi9cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIGNhbGxiYWNrKC4uLmFyZ3MpO1xuICAgIH0pO1xuICAgIHRoaXMub25JbnZhbGlkYXRlZCgoKSA9PiBjYW5jZWxBbmltYXRpb25GcmFtZShpZCkpO1xuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogV3JhcHBlciBhcm91bmQgYHdpbmRvdy5yZXF1ZXN0SWRsZUNhbGxiYWNrYCB0aGF0IGF1dG9tYXRpY2FsbHkgY2FuY2VscyB0aGUgcmVxdWVzdCB3aGVuXG4gICAqIGludmFsaWRhdGVkLlxuICAgKi9cbiAgcmVxdWVzdElkbGVDYWxsYmFjayhjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIGNvbnN0IGlkID0gcmVxdWVzdElkbGVDYWxsYmFjaygoLi4uYXJncykgPT4ge1xuICAgICAgaWYgKCF0aGlzLnNpZ25hbC5hYm9ydGVkKSBjYWxsYmFjayguLi5hcmdzKTtcbiAgICB9LCBvcHRpb25zKTtcbiAgICB0aGlzLm9uSW52YWxpZGF0ZWQoKCkgPT4gY2FuY2VsSWRsZUNhbGxiYWNrKGlkKSk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGFkZEV2ZW50TGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgaWYgKHR5cGUgPT09IFwid3h0OmxvY2F0aW9uY2hhbmdlXCIpIHtcbiAgICAgIGlmICh0aGlzLmlzVmFsaWQpIHRoaXMubG9jYXRpb25XYXRjaGVyLnJ1bigpO1xuICAgIH1cbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcj8uKFxuICAgICAgdHlwZS5zdGFydHNXaXRoKFwid3h0OlwiKSA/IGdldFVuaXF1ZUV2ZW50TmFtZSh0eXBlKSA6IHR5cGUsXG4gICAgICBoYW5kbGVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBzaWduYWw6IHRoaXMuc2lnbmFsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqIEFib3J0IHRoZSBhYm9ydCBjb250cm9sbGVyIGFuZCBleGVjdXRlIGFsbCBgb25JbnZhbGlkYXRlZGAgbGlzdGVuZXJzLlxuICAgKi9cbiAgbm90aWZ5SW52YWxpZGF0ZWQoKSB7XG4gICAgdGhpcy5hYm9ydChcIkNvbnRlbnQgc2NyaXB0IGNvbnRleHQgaW52YWxpZGF0ZWRcIik7XG4gICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgYENvbnRlbnQgc2NyaXB0IFwiJHt0aGlzLmNvbnRlbnRTY3JpcHROYW1lfVwiIGNvbnRleHQgaW52YWxpZGF0ZWRgXG4gICAgKTtcbiAgfVxuICBzdG9wT2xkU2NyaXB0cygpIHtcbiAgICB3aW5kb3cucG9zdE1lc3NhZ2UoXG4gICAgICB7XG4gICAgICAgIHR5cGU6IENvbnRlbnRTY3JpcHRDb250ZXh0LlNDUklQVF9TVEFSVEVEX01FU1NBR0VfVFlQRSxcbiAgICAgICAgY29udGVudFNjcmlwdE5hbWU6IHRoaXMuY29udGVudFNjcmlwdE5hbWUsXG4gICAgICAgIG1lc3NhZ2VJZDogTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoMilcbiAgICAgIH0sXG4gICAgICBcIipcIlxuICAgICk7XG4gIH1cbiAgdmVyaWZ5U2NyaXB0U3RhcnRlZEV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgaXNTY3JpcHRTdGFydGVkRXZlbnQgPSBldmVudC5kYXRhPy50eXBlID09PSBDb250ZW50U2NyaXB0Q29udGV4dC5TQ1JJUFRfU1RBUlRFRF9NRVNTQUdFX1RZUEU7XG4gICAgY29uc3QgaXNTYW1lQ29udGVudFNjcmlwdCA9IGV2ZW50LmRhdGE/LmNvbnRlbnRTY3JpcHROYW1lID09PSB0aGlzLmNvbnRlbnRTY3JpcHROYW1lO1xuICAgIGNvbnN0IGlzTm90RHVwbGljYXRlID0gIXRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmhhcyhldmVudC5kYXRhPy5tZXNzYWdlSWQpO1xuICAgIHJldHVybiBpc1NjcmlwdFN0YXJ0ZWRFdmVudCAmJiBpc1NhbWVDb250ZW50U2NyaXB0ICYmIGlzTm90RHVwbGljYXRlO1xuICB9XG4gIGxpc3RlbkZvck5ld2VyU2NyaXB0cyhvcHRpb25zKSB7XG4gICAgbGV0IGlzRmlyc3QgPSB0cnVlO1xuICAgIGNvbnN0IGNiID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJpZnlTY3JpcHRTdGFydGVkRXZlbnQoZXZlbnQpKSB7XG4gICAgICAgIHRoaXMucmVjZWl2ZWRNZXNzYWdlSWRzLmFkZChldmVudC5kYXRhLm1lc3NhZ2VJZCk7XG4gICAgICAgIGNvbnN0IHdhc0ZpcnN0ID0gaXNGaXJzdDtcbiAgICAgICAgaXNGaXJzdCA9IGZhbHNlO1xuICAgICAgICBpZiAod2FzRmlyc3QgJiYgb3B0aW9ucz8uaWdub3JlRmlyc3RFdmVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm5vdGlmeUludmFsaWRhdGVkKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBjYik7XG4gICAgdGhpcy5vbkludmFsaWRhdGVkKCgpID0+IHJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGNiKSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJkZWZpbml0aW9uIiwiX2EiLCJjb250ZW50IiwiYnJvd3NlciIsIl9icm93c2VyIiwicHJpbnQiLCJsb2dnZXIiLCJfYiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQU8sV0FBUyxvQkFBb0JBLGFBQVk7QUFDOUMsV0FBT0E7QUFBQSxFQUNUO0FDRk8sV0FBUyxnQkFBMEQ7QUFFeEUsVUFBTSxZQUFZLE1BQU0sS0FB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QUFLLGdCQUFnQixJQUFHO0FBQUEsTUFDNUM7QUFDQSxPQUFBQSxNQUFBLE9BQU8scUJBQVAsZ0JBQUFBLElBQUE7QUFBQTtBQUFBLFFBQ0UsS0FBSyxXQUFXLE1BQU0sSUFBSSxtQkFBbUIsSUFBSSxJQUFJO0FBQUEsUUFDckQ7QUFBQSxRQUNBO0FBQUEsVUFDRSxHQUFHO0FBQUEsVUFDSCxRQUFRLEtBQUs7QUFBQSxRQUNyQjtBQUFBO0FBQUEsSUFFRTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxvQkFBb0I7QUFDbEIsV0FBSyxNQUFNLG9DQUFvQztBQUMvQ0ssZUFBTztBQUFBLFFBQ0wsbUJBQW1CLEtBQUssaUJBQWlCO0FBQUEsTUFDL0M7QUFBQSxJQUNFO0FBQUEsSUFDQSxpQkFBaUI7QUFDZixhQUFPO0FBQUEsUUFDTDtBQUFBLFVBQ0UsTUFBTSxzQkFBcUI7QUFBQSxVQUMzQixtQkFBbUIsS0FBSztBQUFBLFVBQ3hCLFdBQVcsS0FBSyxPQUFNLEVBQUcsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFDO0FBQUEsUUFDckQ7QUFBQSxRQUNNO0FBQUEsTUFDTjtBQUFBLElBQ0U7QUFBQSxJQUNBLHlCQUF5QixPQUFPOztBQUM5QixZQUFNLHlCQUF1QkwsTUFBQSxNQUFNLFNBQU4sZ0JBQUFBLElBQVksVUFBUyxzQkFBcUI7QUFDdkUsWUFBTSx3QkFBc0JNLE1BQUEsTUFBTSxTQUFOLGdCQUFBQSxJQUFZLHVCQUFzQixLQUFLO0FBQ25FLFlBQU0saUJBQWlCLENBQUMsS0FBSyxtQkFBbUIsS0FBSSxXQUFNLFNBQU4sbUJBQVksU0FBUztBQUN6RSxhQUFPLHdCQUF3Qix1QkFBdUI7QUFBQSxJQUN4RDtBQUFBLElBQ0Esc0JBQXNCLFNBQVM7QUFDN0IsVUFBSSxVQUFVO0FBQ2QsWUFBTSxLQUFLLENBQUMsVUFBVTtBQUNwQixZQUFJLEtBQUsseUJBQXlCLEtBQUssR0FBRztBQUN4QyxlQUFLLG1CQUFtQixJQUFJLE1BQU0sS0FBSyxTQUFTO0FBQ2hELGdCQUFNLFdBQVc7QUFDakIsb0JBQVU7QUFDVixjQUFJLGFBQVksbUNBQVMsa0JBQWtCO0FBQzNDLGVBQUssa0JBQWlCO0FBQUEsUUFDeEI7QUFBQSxNQUNGO0FBQ0EsdUJBQWlCLFdBQVcsRUFBRTtBQUM5QixXQUFLLGNBQWMsTUFBTSxvQkFBb0IsV0FBVyxFQUFFLENBQUM7QUFBQSxJQUM3RDtBQUFBLEVBQ0Y7QUFySkUsZ0JBWlcsdUJBWUosK0JBQThCO0FBQUEsSUFDbkM7QUFBQSxFQUNKO0FBZE8sTUFBTSx1QkFBTjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDQsNSw2LDcsOCw5XX0=
