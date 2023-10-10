// Armazena o estado da reorganização
let isReorganizationEnabled = false;
let isReorganizationApplied = false;

// Função para enviar uma mensagem para o content.js
function sendMessageToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message);
}

function hideStuff() {
  let reels = Array.from(document.getElementsByTagName("ytd-reel-shelf-renderer"));

  reels.forEach(reel => {
    reel.style.display = "none";
  });

  let others = Array.from(document.getElementsByTagName("ytd-horizontal-card-list-renderer"));

  others.forEach(other => {
    other.style.display = "none";
  });
}

function hideVideosAfter2015() {
  let videoElements = [];

  if (isVideoPlayerPage) {
    videoElements = Array.from(document.getElementsByTagName("ytd-compact-video-renderer"));
  } else if (isSearchResultsPage) {
    hideStuff();
    videoElements = Array.from(document.getElementsByTagName("ytd-video-renderer"));
  } else {
    videoElements = Array.from(document.getElementsByTagName("ytd-rich-grid-media"));
  }

  const hiddenVideos = [];
  const visibleVideos = [];

  videoElements.forEach(videoElement => {
    // Your existing logic for classifying videos goes here
  });

  return { hiddenVideos, visibleVideos };
}

function reorganizeVideoGrid(tabId) {
  if (isReorganizationEnabled) {
    sendMessageToContentScript(tabId, { action: "reorganize" });
  }
}

function resetVideoGrid() {
  const videoElements = Array.from(document.getElementsByTagName("ytd-rich-grid-media"));
  videoElements.forEach(videoElement => {
    location.reload();
  });
}

// Verifica se a reorganização já foi aplicada anteriormente
const isReorganized = localStorage.getItem("reorganized");
if (isReorganized) {
  reorganizeVideoGrid();
  isReorganizationApplied = true;
}

// Listener para o evento 'message' vindo do popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "toggleReorganization") {
    const { tab } = sender;
    isReorganizationEnabled = request.enabled;
    reorganizeVideoGrid(tab.id);
  } else if (request.action === "reorganize") {
    const { hiddenVideos, visibleVideos } = hideVideosAfter2015();
    reorganizeVideoGrid(sender.tab.id);
    localStorage.setItem("reorganized", true);
    isReorganizationApplied = true;
  } else if (request.action === "reset") {
    resetVideoGrid();
    localStorage.removeItem("reorganized");
    isReorganizationApplied = false;
  }
});

// Listener para o evento 'DOMContentLoaded'
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    reorganizeVideoGrid(tabId);
  }
});

// Listener for tab updates (e.g., when a new page is loaded)
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url) {
    // Check if it's a YouTube page (you can modify this pattern as needed)
    const youtubeURLPattern = /^https:\/\/www\.youtube\.com/;
    if (youtubeURLPattern.test(tab.url)) {
      // Send a message to the content script to trigger it
      chrome.tabs.sendMessage(tabId, { action: "reorganize" });
    }
  }
});


// Function to send a message to content.js when a link is clicked
function sendContentScriptMessage(tabId, message) {
  chrome.tabs.sendMessage(tabId, message);
}

// Add an event listener to the webNavigation onCompleted event
chrome.webNavigation.onCompleted.addListener(function (details) {
  // Check if the navigation event corresponds to a link click
  if (details.transitionType === 'link') {
    // Send a message to content.js to trigger its execution
    sendContentScriptMessage(details.tabId, { action: 'linkClicked' });
  }
});

