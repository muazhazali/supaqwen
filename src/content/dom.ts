export function findChatInput(): HTMLTextAreaElement | HTMLElement | null {
  // Try common patterns: textarea with placeholder, contenteditable areas near bottom
  const textareas = Array.from(document.querySelectorAll<HTMLTextAreaElement>("textarea"));
  const candidateByPlaceholder = textareas.find((t) => /help you today|message|ask/i.test(t.placeholder ?? ""));
  if (candidateByPlaceholder) return candidateByPlaceholder;

  const editables = Array.from(document.querySelectorAll<HTMLElement>("[contenteditable='true']"));
  // Prefer visible and larger width elements
  const visibleEditable = editables
    .filter((el) => isVisible(el) && el.offsetWidth > 200 && el.offsetHeight > 30)
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0];
  if (visibleEditable) return visibleEditable;

  return null;
}

export function findMainScrollable(): HTMLElement | null {
  // Heuristic: largest scrollable container in viewport with significant text
  const allDivs = Array.from(document.querySelectorAll<HTMLElement>("div"));
  const candidates = allDivs
    .filter((el) => isVisible(el))
    .filter((el) => el.scrollHeight > el.clientHeight && el.clientHeight > 200)
    .map((el) => ({ el, score: (el.innerText || "").length * el.clientHeight }))
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.el ?? null;
}

export function isVisible(el: HTMLElement): boolean {
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function insertIntoInput(target: HTMLElement | HTMLTextAreaElement, text: string) {
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

export function captureVisibleTranscript(container: HTMLElement): string {
  // Minimal sanitization: capture innerText from the scrollable container
  return container.innerText || "";
}

export function highlightInContainer(container: HTMLElement, query: string) {
  // Simple highlighter using mark elements inside a shadow root safe wrapper
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig");
  const nodes: Text[] = [];
  // Collect first to avoid modifying while iterating
  while (walker.nextNode()) {
    const n = walker.currentNode as Text;
    if (re.test(n.nodeValue || "")) nodes.push(n);
  }
  for (const n of nodes) {
    const span = document.createElement("span");
    span.innerHTML = (n.nodeValue || "").replace(re, (m) => `<mark style="background: #ffee58">${m}</mark>`);
    n.parentElement?.replaceChild(span, n);
  }
}


