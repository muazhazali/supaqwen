export default defineBackground(() => {
  console.log("Qwen Chat background ready");

  // Context menu: send selected text as screenshot/text to Qwen (placeholder)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "qwen-send-selection",
      title: "Send selection to Qwen Chat",
      contexts: ["selection"],
    });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "qwen-send-selection" && info.selectionText) {
      // Open popup or send a runtime message for UI to append
      chrome.runtime.sendMessage({ type: "qwen/append", text: info.selectionText });
    }
  });
});