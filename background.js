chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainPaperMind",
    title: "PaperMind AI로 이 문장 쉽게 설명 듣기",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainPaperMind" && info.selectionText) {
    chrome.storage.local.set({ papermindSelectedText: info.selectionText }, () => {
      chrome.windows.create({
        url: "http://localhost:3000/index.html?ext=true",
        type: "popup",
        width: 1200,
        height: 800
      });
    });
  }
});
