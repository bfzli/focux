let scrollPreventers = []

function injectBlockingOverlay() {
    if (document.getElementById('focux-overlay-2m31')) {
        return
    }

    const xhr = new XMLHttpRequest()
    xhr.open('GET', chrome.runtime.getURL('blocked.html'), true)

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const parser = new DOMParser()
            const doc = parser.parseFromString(xhr.responseText, 'text/html')
            const wrapperContent = doc.querySelector('.focux-wrapper')

            if (wrapperContent) {
                const overlay = document.createElement('div')
                overlay.id = 'focux-overlay-2m31'
                overlay.className = 'focux-wrapper'
                overlay.innerHTML = wrapperContent.innerHTML
                document.body.appendChild(overlay)

                const style = document.createElement('style')
                style.id = 'focux-style-2m31'
                const styleElement = doc.querySelector('style')
                if (styleElement) {
                    style.textContent = styleElement.textContent
                    document.head.appendChild(style)
                }

                const preventScroll = function (e) {
                    e.preventDefault()
                    e.stopPropagation()
                    return false
                }

                const preventKeyScroll = function (e) {
                    if (
                        [32, 33, 34, 35, 36, 37, 38, 39, 40].indexOf(
                            e.keyCode
                        ) > -1
                    ) {
                        e.preventDefault()
                        return false
                    }
                }

                document.addEventListener('wheel', preventScroll, {
                    passive: false
                })
                document.addEventListener('touchmove', preventScroll, {
                    passive: false
                })
                document.addEventListener('keydown', preventKeyScroll)

                scrollPreventers = [
                    { type: 'wheel', handler: preventScroll },
                    { type: 'touchmove', handler: preventScroll },
                    { type: 'keydown', handler: preventKeyScroll }
                ]
            }
        }
    }

    xhr.send()
}

function removeBlockingOverlay() {
    const overlay = document.getElementById('focux-overlay-2m31')
    const style = document.getElementById('focux-style-2m31')

    if (overlay) {
        overlay.remove()
    }

    if (style) {
        style.remove()
    }

    scrollPreventers.forEach(({ type, handler }) => {
        document.removeEventListener(type, handler)
    })
    scrollPreventers = []
}

function checkAndUpdateBlocking() {
    chrome.storage.local.get('focux-websites-2m31', function (result) {
        const blockedWebsites = result['focux-websites-2m31'] || []
        const currentUrl = window.location.href
        let shouldBlock = false

        try {
            const currentUrlObj = new URL(currentUrl)
            let currentHostname = currentUrlObj.hostname

            currentHostname = currentHostname.replace(/^www\./, '')

            for (const website of blockedWebsites) {
                if (!website.active) continue

                let blockedUrl = website.url
                blockedUrl = blockedUrl.replace(/^www\./, '')

                if (currentHostname === blockedUrl) {
                    shouldBlock = true
                    break
                }
            }
        } catch (e) {
        }

        if (shouldBlock) {
            injectBlockingOverlay()
        } else {
            removeBlockingOverlay()
        }
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateBlocking') {
        checkAndUpdateBlocking()
        sendResponse({ success: true })
    }
    return true
})

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes['focux-websites-2m31']) {
        checkAndUpdateBlocking()
    }
})

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndUpdateBlocking)
} else {
    checkAndUpdateBlocking()
}

// Check blocking status when user switches to this tab
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        checkAndUpdateBlocking()
    }
})
