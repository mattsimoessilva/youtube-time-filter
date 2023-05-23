function hideVideosAfter2015() {
    console.log("oi");

    const videoElements = Array.from(document.getElementsByTagName("ytd-rich-grid-media"));
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
              console.log("banana")  
              videoElement.style.display = "none";
              hiddenVideos.push(videoElement);
            } else {
              console.log("cenoura")
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
  }
  
  // Manipula a mensagem recebida do popup.js
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "reorganize") {
      const { hiddenVideos, visibleVideos } = hideVideosAfter2015();
      reorganizeVideoGrid();
      localStorage.setItem("reorganized", true);
    } else if (request.action === "reset") {
      resetVideoGrid();
      localStorage.removeItem("reorganized");
    }
  });