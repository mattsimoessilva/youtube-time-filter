const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.example.com/data', true);

xhr.onerror = function() {
 location.reload();
};

// Armazena o estado da reorganização
let isReorganizationEnabled = false;

// Verifica se a reorganização já foi aplicada na página inicial
let isReorganizationApplied = false;

// Função para enviar uma mensagem para o background.js
function sendMessageToBackgroundScript(message) {
  chrome.runtime.sendMessage(message);
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

  // Verificar se é a página de resultado de pesquisa ou o player de vídeo
  const isSearchResultsPage = window.location.pathname.startsWith("/results");
  const isVideoPlayerPage = window.location.pathname.startsWith("/watch");

  if (isVideoPlayerPage) {
    videoElements = Array.from(document.getElementsByTagName("ytd-miniplayer-compact-autoplay-renderer"));
  } else if (isSearchResultsPage) {
    hideStuff();
    videoElements = Array.from(document.getElementsByTagName("ytd-video-renderer"));
  } else {
    videoElements = Array.from(document.getElementsByTagName("ytd-rich-grid-media"));
  }

  console.log(videoElements);

  const hiddenVideos = [];
  const visibleVideos = [];

  videoElements.forEach(videoElement => {
    const publishedDateElements = videoElement.querySelectorAll(".inline-metadata-item.style-scope.ytd-video-meta-block");
    const publishedDateElement = publishedDateElements[1];

    if (publishedDateElement) {
      const publishedDate = publishedDateElement.innerText;
      console.log(publishedDate);

      if (publishedDate.includes("ago")) {
        if (publishedDate.includes("day")) {
          const daysAgo = parseInt(publishedDate.match(/\d+/));
          if (daysAgo < 30) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("month")) {
          const monthsAgo = parseInt(publishedDate.match(/\d+/));
          if (monthsAgo < 12) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("hour")) {
          const hoursAgo = parseInt(publishedDate.match(/\d+/));
          if (hoursAgo < 24) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("minute")) {
          const minutesAgo = parseInt(publishedDate.match(/\d+/));
          if (minutesAgo < 60) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("year")) {
          const yearsAgo = parseInt(publishedDate.match(/\d+/));
          if (yearsAgo < 8) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("week")) {
          const weeksAgo = parseInt(publishedDate.match(/\d+/));
          if (weeksAgo < 5) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("second")) {
          const secondsAgo = parseInt(publishedDate.match(/\d+/));
          if (secondsAgo < 60) {
            videoElement.style.display = "none";
            hiddenVideos.push(videoElement);
          } else {
            visibleVideos.push(videoElement);
          }
        }
      } else {
        const publishedYear = parseInt(publishedDate.match(/\d+/));
        if (publishedYear > 2015) {
          videoElement.style.display = "none";
          hiddenVideos.push(videoElement);
        } else {
          visibleVideos.push(videoElement);
        }
      }
    }
  });

  return { hiddenVideos, visibleVideos };
}

function reorganizeVideoGrid() {
  const { hiddenVideos, visibleVideos } = hideVideosAfter2015();
  const gridContainer = document.querySelector("ytd-rich-grid-renderer");

  if (gridContainer) {
    gridContainer.innerHTML = "";

    const rowContainer = document.createElement("div");
    rowContainer.style.display = "flex";
    rowContainer.style.flexWrap = "wrap";
    rowContainer.style.justifyContent = "space-between";
    gridContainer.appendChild(rowContainer);

    const totalVideos = visibleVideos.length + hiddenVideos.length;
    const numColumns = Math.max(Math.min(totalVideos, 3), 2);

    visibleVideos.forEach((videoElement) => {
      const videoWrapper = createVideoWrapper(videoElement);
      videoWrapper.style.width = `calc(${100 / numColumns}% - 20px)`;
      rowContainer.appendChild(videoWrapper);
    });

    hiddenVideos.forEach((videoElement) => {
      const videoWrapper = createVideoWrapper(videoElement);
      videoWrapper.style.width = `calc(${100 / numColumns}% - 20px)`;
      rowContainer.appendChild(videoWrapper);
    });
  }
}

function createVideoWrapper(videoElement) {
  const videoWrapper = document.createElement("div");
  videoWrapper.style.width = "calc(33.33% - 20px)";
  videoWrapper.style.marginBottom = "20px";
  videoWrapper.style.marginTop = "20px";

  const videoCard = document.createElement("div");
  videoCard.style.width = "500px";
  videoCard.appendChild(videoElement);
  videoWrapper.appendChild(videoCard);

  return videoWrapper;
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

// Manipula a mensagem recebida do popup.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "reorganize") {
    const { hiddenVideos, visibleVideos } = hideVideosAfter2015();
    reorganizeVideoGrid();
    localStorage.setItem("reorganized", true);
    isReorganizationApplied = true;
  } else if (request.action === "reset") {
    resetVideoGrid();
    localStorage.removeItem("reorganized");
    isReorganizationApplied = false;
  } else if (request.action === "pageScrolled") {
    if (!isReorganizationApplied) {
      reorganizeVideoGrid();
      isReorganizationApplied = true;
    }
  } else if (request.action === "updateResults") {
    detectLoadAndNewVideos();
  }
});

// Executa a reorganização inicial
if (isReorganizationEnabled) {
  reorganizeVideoGrid();
}

function detectLoadAndNewVideos() {
  // Função para chamar hideVideosAfter2015()
  function handleVideos() {
    hideVideosAfter2015();
  }

  // Verificar se é a página de resultado de pesquisa
  const isSearchResultsPage = window.location.pathname.startsWith("/results");

  if (isSearchResultsPage) {
    // Chamar hideVideosAfter2015() no load da página
    window.addEventListener("load", hideVideosAfter2015);
    window.addEventListener("DOMContentLoaded", hideVideosAfter2015);

    // Configurar Mutation Observer para detectar o surgimento de novos elementos ytd-video-renderer
    const searchResultsContainer = document.getElementById("contents");

    if (searchResultsContainer) {
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            const addedNodes = Array.from(mutation.addedNodes);
            const newVideoRenderers = addedNodes.filter(node => node.tagName === "ytd-video-renderer");
           
            hideVideosAfter2015();
            break;
          }
        }
      });

      observer.observe(searchResultsContainer, { childList: true, subtree: true });
    }
  }
}





