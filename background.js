chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "reorganize") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "reorganize" });
      });
    }
  });
  