// Armazena o estado da reorganização
let isReorganizationEnabled = false;

// Função para enviar uma mensagem para o content.js
function sendMessageToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message);
}

// Função para reorganizar a grade de vídeos
function reorganizeVideoGrid(tabId) {
  if (isReorganizationEnabled) {
    sendMessageToContentScript(tabId, { action: "reorganize" });
  }
}

// Listener para o evento 'message' vindo do popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleReorganization") {
    const { tab } = sender;
    isReorganizationEnabled = request.enabled;
    reorganizeVideoGrid(tab.id);
  }
});

// Listener para o evento 'DOMContentLoaded'
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    reorganizeVideoGrid(tabId);
  }
});
