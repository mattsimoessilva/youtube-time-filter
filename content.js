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

  isSearchResultsPage = window.location.pathname == "/results";
  isVideoPlayerPage = window.location.pathname == "/watch";
  isMainPage = window.location.pathname == "/";

  if (isVideoPlayerPage) {
    videoElements = Array.from(document.getElementsByTagName("ytd-compact-video-renderer"));
  } else if (isSearchResultsPage) {
    videoElements = Array.from(document.getElementsByTagName("ytd-video-renderer"));
  } else {
    videoElements = Array.from(document.getElementsByTagName("ytd-rich-grid-media"));
  }

  console.log(videoElements);

  var visibleVideos = [];

  videoElements.forEach(videoElement => {
    const publishedDateElements = videoElement.querySelectorAll(".inline-metadata-item.style-scope.ytd-video-meta-block");
    const publishedDateElement = publishedDateElements[1];
  
    if (publishedDateElement) {
      const publishedDate = publishedDateElement.innerText;
      console.log(publishedDate);
  
      if (publishedDate.includes("ago")) {
        if (publishedDate.includes("day") || publishedDate.includes("days")) {
          videoElement.remove();
        } else if (publishedDate.includes("month") || publishedDate.includes("months")) {
          videoElement.remove();
        } else if (publishedDate.includes("hour") || publishedDate.includes("hours")) {
          videoElement.remove();
        } else if (publishedDate.includes("minute") || publishedDate.includes("minutes")) {
          videoElement.remove();
        } else if (publishedDate.includes("year") || publishedDate.includes("years")) {
          const yearsAgo = parseInt(publishedDate.match(/\d+/));
          if (yearsAgo < 8) {
            videoElement.remove();
          } else if (yearsAgo >= 8) {
            visibleVideos.push(videoElement);
          }
        } else if (publishedDate.includes("week") || publishedDate.includes("weeks")) {
          videoElement.remove();
        } else if (publishedDate.includes("second") || publishedDate.includes("seconds")) {
          videoElement.remove();
        }
      } else {
        const publishedYear = parseInt(publishedDate.match(/\d+/));
        if (publishedYear > 2015) {
          videoElement.remove();
        } else {
          visibleVideos.push(videoElement);
        }
      }
    }
  });  

  if (visibleVideos.length == 0) {
    const nothingFoundDiv = document.createElement("div");
    nothingFoundDiv.textContent = "Nothing found";
    nothingFoundDiv.id = "nothingfound";
    // You can add any additional styling or class names to nothingFoundDiv here if needed.
    visibleVideos.push(nothingFoundDiv);
  }  

  return visibleVideos;
}

function reorganizeVideoGrid() {
  const body = document.getElementsByTagName("body")[0];
  body.style.visibility = "hidden";
  if (window.location.pathname == "/" && document.getElementsByClassName("new-bar").length > 0){
    console.log("hehe");
    document.getElementsByClassName("new-bar")[0].remove();
    body.style.visibility = "visible";
  }
  var visibleVideos = hideVideosAfter2015();
  const barContainer = document.getElementById("secondary");
  const gridContainer = document.querySelector("ytd-rich-grid-renderer");
  const resultsBar = document.getElementById("page-manager");

  isSearchResultsPage = window.location.pathname == "/results";
  isVideoPlayerPage = window.location.pathname == "/watch";
  isMainPage = window.location.pathname == "/";

  if (!isVideoPlayerPage && !isSearchResultsPage) {
    console.log("EPA");
    
    if (visibleVideos.length > 0 && visibleVideos.every(videoElement => videoElement.tagName.toLowerCase() === "ytd-rich-grid-media")) {
      gridContainer.innerHTML = "";

      const rowContainer = document.createElement("div");
      rowContainer.style.display = "flex";
      rowContainer.style.flexWrap = "wrap";
      rowContainer.style.justifyContent = "space-between";
      gridContainer.appendChild(rowContainer);

      const totalVideos = visibleVideos.length;
      const numColumns = Math.max(Math.min(totalVideos, 3), 2);

      // Filter out the element with id "nothingfound"
      visibleVideos = visibleVideos.filter((videoElement) => {
        return videoElement.id !== "nothingfound";
      });

      visibleVideos.forEach((videoElement) => {
        const videoWrapper = createVideoWrapper(videoElement);
        videoWrapper.style.width = `calc(${100 / numColumns}% - 20px)`;
        rowContainer.appendChild(videoWrapper);
      });

    }

    if (document.getElementsByClassName("new-bar").length == 0) {
      body.style.visibility = "visible";
    } else {
      body.style.visibility = "hidden";
    }
  }
  
  if (isVideoPlayerPage) {
    console.log("UEPA");

    if (visibleVideos.length > 0 && visibleVideos.every(videoElement => videoElement.tagName.toLowerCase() === "ytd-compact-video-renderer")) {
      const parentContainer = barContainer.parentNode; // Get the parent of barContainer
      const listContainer = document.createElement("div"); // Create a container for the vertical list
      listContainer.classList.add("new-bar");
      
      parentContainer.replaceChild(listContainer, barContainer); // Replace the old sidebar with the new one
      
      const totalVideos = visibleVideos.length;
    
      // Filter out the element with id "nothingfound"
      visibleVideos = visibleVideos.filter((videoElement) => {
        return videoElement.id !== "nothingfound";
      });

      visibleVideos.forEach((videoElement) => {
        const videoWrapper = createVideoWrapper(videoElement);
        listContainer.appendChild(videoWrapper); // Append each video to the list container
      });
    
    }    

    if (visibleVideos.length > 0 && visibleVideos.every(videoElement => videoElement.id.toLowerCase() === "nothingfound")) {
      const parentContainer = barContainer.parentNode; // Get the parent of barContainer
      const listContainer = document.createElement("div"); // Create a container for the vertical list
      listContainer.classList.add("new-bar");
      
      parentContainer.replaceChild(listContainer, barContainer); // Replace the old sidebar with the new one
      
      const totalVideos = visibleVideos.length;
    
      visibleVideos.forEach((videoElement) => {
        const videoWrapper = createVideoWrapper(videoElement);
        listContainer.appendChild(videoWrapper); // Append each video to the list container
      });
    }

    if (document.getElementsByClassName("new-bar").length > 0) {
      body.style.visibility = "visible";
    }
  }

  if(isSearchResultsPage) {
    console.log("LULU");
    
    if (visibleVideos.length > 0 && visibleVideos.every(videoElement => videoElement.tagName.toLowerCase() === "ytd-video-renderer")) {
      console.log("NENE")
      const parentContainer = resultsBar.parentNode; // Get the parent of barContainer
      const listContainer = document.createElement("div"); // Create a container for the vertical list
      listContainer.classList.add("results-bar");
      
      parentContainer.replaceChild(listContainer, resultsBar); // Replace the old sidebar with the new one
      
      const totalVideos = visibleVideos.length;
    
      // Filter out the element with id "nothingfound"
      visibleVideos = visibleVideos.filter((videoElement) => {
        return videoElement.id !== "nothingfound";
      });

      visibleVideos.forEach((videoElement) => {
        const videoWrapper = createResultVideoWrapper(videoElement);
        listContainer.appendChild(videoWrapper); // Append each video to the list container
      });
    
    }   
    
    if (visibleVideos.length > 0 && visibleVideos.every(videoElement => videoElement.id.toLowerCase() === "nothingfound")) {
      console.log("NENE")
      const parentContainer = resultsBar.parentNode; // Get the parent of barContainer
      const listContainer = document.createElement("div"); // Create a container for the vertical list
      listContainer.classList.add("results-bar");
      
      parentContainer.replaceChild(listContainer, resultsBar); // Replace the old sidebar with the new one
      
      const totalVideos = visibleVideos.length;
    
      visibleVideos.forEach((videoElement) => {
        const videoWrapper = createResultVideoWrapper(videoElement);
        listContainer.appendChild(videoWrapper); // Append each video to the list container
      });
    
    }

    if (document.getElementsByClassName("results-bar").length > 0) {
      body.style.visibility = "visible";
    }
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

function createResultVideoWrapper(videoElement) {
  const videoWrapper = document.createElement("div");
  videoWrapper.style.width = "calc(33.33% - 20px)";
  videoWrapper.style.marginBottom = "20px";
  videoWrapper.style.marginTop = "60px";
  videoWrapper.style.marginLeft = "300px";

  const videoCard = document.createElement("div");
  videoCard.style.width = "1000px";
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
    var visibleVideos = hideVideosAfter2015();
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
      const videoRenderers = addedNodes.filter(node =>
        node.tagName && node.tagName.toLowerCase() === "ytd-video-renderer"
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

      if (videoRenderers.length > 0) {
        console.log("Os videorenderer apareceram!")
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


