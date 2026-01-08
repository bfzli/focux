// Background service worker for Focux extension
// Handles broadcasting updates to all tabs when focus mode state changes

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'broadcastUpdate') {
        // Query all tabs and send update message to each
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                // Only send to valid http/https URLs
                if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateBlocking' }).catch(() => {
                        // Ignore errors for tabs without content scripts
                        // This is normal for tabs that haven't loaded yet
                    })
                }
            })
        })
        sendResponse({ success: true })
        return true
    }
})

// Listen for storage changes and broadcast to all tabs
// This provides a backup mechanism in case messages fail
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (changes['focux-websites-2m31'] || changes['focux-timer-2m31'])) {
        // Broadcast to all tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.id && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateBlocking' }).catch(() => {
                        // Ignore errors for tabs without content scripts
                    })
                }
            })
        })
    }
})

// When a tab is activated (user switches to it), send update message
// This ensures the tab gets the latest state immediately
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
            // Small delay to ensure content script is ready
            setTimeout(() => {
                chrome.tabs.sendMessage(activeInfo.tabId, { action: 'updateBlocking' }).catch(() => {
                    // Ignore errors - content script may not be ready yet
                })
            }, 100)
        }
    })
})

// When a tab is updated (page load, navigation), send update message
// This ensures newly loaded pages immediately check if they should be blocked
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only act when the page has finished loading
    if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        chrome.tabs.sendMessage(tabId, { action: 'updateBlocking' }).catch(() => {
            // Ignore errors
        })
    }
})
