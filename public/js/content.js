chrome.storage.local.get("focux-websites-2m31", function (result) {
  const blockedWebsites = result["focux-websites-2m31"] || [];
  const currentUrl = window.location.href;

  for (const website of blockedWebsites) {
    if (currentUrl.includes(website.url) && website.active) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", chrome.runtime.getURL("blocked.html"), true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          document.documentElement.innerHTML = xhr.responseText;
        }
      };

      xhr.send();

      break;
    }
  }
});