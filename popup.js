document.addEventListener("DOMContentLoaded", function() {
    const toggleSwitch = document.getElementById("toggleSwitch");
  
    // Carrega o estado atual do switch ao abrir o popup
    const isReorganized = localStorage.getItem("reorganized");
    toggleSwitch.checked = isReorganized ? true : false;
  
    toggleSwitch.addEventListener("change", function() {
      if (toggleSwitch.checked) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "reorganize" });
        });
        localStorage.setItem("reorganized", true);
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "reset" });
        });
        localStorage.removeItem("reorganized");
      }
    });
  });
  