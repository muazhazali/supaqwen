export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    // Reserved for future features like right-click screenshot/send
    // Currently no-op to keep permissions minimal
  },
});


