// Verificar se é a página de resultado de pesquisa ou o player de vídeo
var isSearchResultsPage = window.location.pathname == "/results";
var isVideoPlayerPage = window.location.pathname == "/watch";
var isMainPage = window.location.pathname == "/";

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

  if (isVideoPlayerPage) {
    videoElements = Array.from(document.getElementsByTagName("ytd-compact-video-renderer"));
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
  const barContainer = document.getElementById("secondary");
  const gridContainer = document.querySelector("ytd-rich-grid-renderer");

  if (!isVideoPlayerPage && visibleVideos.length > 0 && !isSearchResultsPage) {
    console.log("EPA");
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
  
  if (isVideoPlayerPage && visibleVideos.length > 0) {
    console.log("UEPA");
    barContainer.innerHTML = "";

    const listContainer = document.createElement("div"); // Create a container for the vertical list
    barContainer.appendChild(listContainer); // Append the list container to the grid container

    const totalVideos = visibleVideos.length + hiddenVideos.length;

    visibleVideos.forEach((videoElement) => {
      const videoWrapper = createVideoWrapper(videoElement);
      listContainer.appendChild(videoWrapper); // Append each video to the list container
    });

    hiddenVideos.forEach((videoElement) => {
      const videoWrapper = createVideoWrapper(videoElement);
      listContainer.appendChild(videoWrapper); // Append each hidden video to the list container
    });

  }
}

function createVideoWrapper(videoElement) {
  const videoWrapper = document.createElement("div");
  videoWrapper.style.width = "calc(33.33% - 20px)";
  videoWrapper.style.marginBottom = "20px";
  videoWrapper.style.marginTop = "20px";

  const videoCard = document.createElement("div");
  videoCard.style.width = "400px";
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

// Configuração do MutationObserver
const observerConfig = { childList: true, subtree: true };

// Função de callback para ser executada quando ocorrerem mutações
const mutationCallback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const addedNodes = Array.from(mutation.addedNodes);
      const compactVideoRenderers = addedNodes.filter(node =>
        node.tagName && node.tagName.toLowerCase() === "ytd-compact-video-renderer"
      );
      const richGridMedia = addedNodes.filter(node =>
        node.tagName && node.tagName.toLowerCase() === "ytd-rich-grid-media"
      );

      if (compactVideoRenderers.length > 0) {
        console.log(window.location.pathname);
        console.log("Os compacts apareceram!")
        // Handle the appearance of ytd-compact-video-renderer elements here
        reorganizeVideoGrid();
        // You can perform actions or trigger functions when these elements appear.
      }

      if (richGridMedia.length > 0) {
        console.log("Os rich apareceram!")
        // Handle the appearance of ytd-compact-video-renderer elements here
        reorganizeVideoGrid();
        // You can perform actions or trigger functions when these elements appear.
      }
    }
  }
};

// Cria o MutationObserver com a função de callback e a configuração
const observer = new MutationObserver(mutationCallback);

// Inicia a observação no documento inteiro (o corpo da página)
observer.observe(document.documentElement, observerConfig);

// Function to check if an element is an iframe
function isIframe(element) {
  return element.tagName === 'iframe';
}

// Function to observe mutations and check for iframes
function observeIframes() {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      for (const addedNode of mutation.addedNodes) {
        if (isIframe(addedNode)) {
          console.log("IPI");
          // An iframe has appeared, call the reorganizeVideoGrid function
          reorganizeVideoGrid();
          return; // Stop observing after the first iframe is found
        }
      }
    }
  });

  // Start observing the entire document for mutations
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

// Call the observeIframes function to start monitoring for iframes
observeIframes();


