chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openPopup') {
        try {
            if (chrome.action && chrome.action.openPopup) {
                chrome.action.openPopup()
                sendResponse({ success: true })
            } else {
                chrome.tabs.create({
                    url: chrome.runtime.getURL('index.html')
                })
                sendResponse({ success: true })
            }
        } catch (error) {
            chrome.tabs.create({
                url: chrome.runtime.getURL('index.html')
            })
            sendResponse({ success: true })
        }
        return true
    }

    if (request.action === 'broadcastUpdate') {
        chrome.tabs.query({}, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                if (
                    tabs[i].id &&
                    tabs[i].url &&
                    (tabs[i].url.startsWith('http://') ||
                        tabs[i].url.startsWith('https://'))
                ) {
                    const tabUrl = tabs[i].url
                    chrome.tabs
                        .sendMessage(tabs[i].id, { action: 'updateBlocking' })
                        .then(() => {
                        })
                        .catch((error) => {
                        })
                }
            }
        })
        sendResponse({ success: true })
        return true
    }
})

// When user switches to a tab, check if it should be blocked
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (
            tab &&
            tab.url &&
            (tab.url.startsWith('http://') || tab.url.startsWith('https://'))
        ) {
            const tabUrl = tab.url
            chrome.tabs
                .sendMessage(activeInfo.tabId, { action: 'updateBlocking' })
                .then(() => {
                })
                .catch((error) => {
                })
        }
    })
})
