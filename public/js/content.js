let scrollPreventers = []
let mutedMediaElements = []
let mediaObserver = null
let originalTitle = null
let originalFavicon = null
let faviconLink = null
let titleObserver = null

function muteAllMedia() {
    const mediaElements = document.querySelectorAll('audio, video')
    mediaElements.forEach((element) => {
        if (!mutedMediaElements.find((m) => m.element === element)) {
            mutedMediaElements.push({
                element: element,
                originalVolume: element.volume,
                wasMuted: element.muted
            })
            element.volume = 0
            element.muted = true
        }
    })

    if (!mediaObserver) {
        mediaObserver = new MutationObserver(() => {
            const newMediaElements = document.querySelectorAll('audio, video')
            newMediaElements.forEach((element) => {
                if (!mutedMediaElements.find((m) => m.element === element)) {
                    mutedMediaElements.push({
                        element: element,
                        originalVolume: element.volume,
                        wasMuted: element.muted
                    })
                    element.volume = 0
                    element.muted = true
                }
            })
        })

        mediaObserver.observe(document.body, {
            childList: true,
            subtree: true
        })
    }
}

function restoreMediaVolume() {
    mutedMediaElements.forEach(({ element, originalVolume, wasMuted }) => {
        if (element && element.parentNode) {
            element.volume = originalVolume
            element.muted = wasMuted
        }
    })
    mutedMediaElements = []

    if (mediaObserver) {
        mediaObserver.disconnect()
        mediaObserver = null
    }
}

function setBlockedFavicon() {
    if (!originalFavicon) {
        const existingFavicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
        if (existingFavicon) {
            originalFavicon = existingFavicon.href
        } else {
            originalFavicon = ''
        }
    }

    if (!faviconLink) {
        faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
        if (!faviconLink) {
            faviconLink = document.createElement('link')
            faviconLink.rel = 'icon'
            document.head.appendChild(faviconLink)
        }
    }

    const blockedFaviconSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23FF6B6B"/><path d="M50 20 L50 50 M30 50 L70 50" stroke="white" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="50" r="30" fill="none" stroke="white" stroke-width="6"/></svg>'
    faviconLink.href = blockedFaviconSvg
    faviconLink.type = 'image/svg+xml'
}

function setBlockedTitle() {
    if (originalTitle === null) {
        originalTitle = document.title
    }
    document.title = `Focus Mode - ${originalTitle}`

    if (!titleObserver) {
        const titleElement = document.querySelector('title')
        if (titleElement) {
            titleObserver = new MutationObserver(() => {
                if (originalTitle !== null) {
                    const currentTitle = document.title
                    if (!currentTitle.startsWith('Focus Mode - ')) {
                        document.title = `Focus Mode - ${currentTitle}`
                    }
                }
            })
            titleObserver.observe(titleElement, {
                childList: true,
                subtree: true,
                characterData: true
            })
        }
    }
}

function restoreFavicon() {
    if (faviconLink && originalFavicon !== null) {
        if (originalFavicon) {
            faviconLink.href = originalFavicon
        } else {
            faviconLink.remove()
            faviconLink = null
        }
    }
}

function restoreTitle() {
    if (titleObserver) {
        titleObserver.disconnect()
        titleObserver = null
    }
    if (originalTitle !== null) {
        document.title = originalTitle
    }
}

function injectBlockingOverlay(isTimer = false, timerState = null) {
    if (document.getElementById('focux-overlay-2m31')) {
        const description = document.getElementById('focux-description-2m31')
        const timerDisplay = document.getElementById('focux-timer-display-2m31')
            if (description) {
                if (isTimer) {
                    description.textContent = 'Can\'t access this tab because focus timer is enabled for the given period.'
                } else {
                    description.textContent = 'Can\'t access this tab because focus mode is enabled for this domain.'
                }
            }
        if (timerDisplay && isTimer && timerState && timerState.endTime) {
            const updateTimer = () => {
                const remaining = Math.max(0, timerState.endTime - Date.now())
                
                if (remaining <= 0) {
                    if (window.focuxTimerInterval) {
                        clearInterval(window.focuxTimerInterval)
                        window.focuxTimerInterval = null
                    }
                    checkAndUpdateBlocking()
                    return
                }
                
                const totalSeconds = Math.floor(remaining / 1000)
                const hours = Math.floor(totalSeconds / 3600)
                const minutes = Math.floor((totalSeconds % 3600) / 60)
                const seconds = totalSeconds % 60
                let timeStr
                if (hours > 0) {
                    timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                } else {
                    timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
                }
                timerDisplay.textContent = timeStr
            }
            updateTimer()
            const interval = setInterval(updateTimer, 1000)
            if (window.focuxTimerInterval) {
                clearInterval(window.focuxTimerInterval)
            }
            window.focuxTimerInterval = interval
        }
        return
    }

    const style = document.createElement('style')
    style.id = 'focux-style-2m31'
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

        #focux-overlay-2m31 {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2147483647 !important;
            font-family: 'DM Sans', sans-serif !important;
            pointer-events: auto !important;
        }

        #focux-overlay-2m31 * {
            user-select: none !important;
        }

        html {
            overflow-y: scroll !important;
        }

        .focux-wrapper {
            position: fixed !important;
            width: 100vw !important;
            height: 100vh !important;
            top: 0 !important;
            left: 0 !important;
            display: flex !important;
            justify-content: center !important;
            flex-direction: column !important;
            align-items: center !important;
            background: rgba(0, 0, 0, 0.85) !important;
            pointer-events: auto !important;
        }

        .focux-modal {
            padding: 20px 30px 20px 30px !important;
            border-radius: 12px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            flex-direction: column !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            background: rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(30px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(180%) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
            pointer-events: auto !important;
            width: 250px !important;
        }

        .focux-header {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            margin-bottom: 14px !important;
        }

        .focux-breakline {
            width: 100% !important;
            height: 1px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            margin: 0 0 14px 0 !important;
        }

        .focux-description {
            font-size: 13px !important;
            max-width: 100% !important;
            text-align: center !important;
            font-weight: 400 !important;
            color: white !important;
            margin: 0 !important;
        }

        .focux-timer-display {
            font-size: 48px !important;
            font-weight: 700 !important;
            color: white !important;
            margin: 0px 0 10px 0 !important;
            font-variant-numeric: tabular-nums !important;
            text-align: center !important;
        }
    `
    document.head.appendChild(style)

    const overlay = document.createElement('div')
    overlay.id = 'focux-overlay-2m31'
    overlay.className = 'focux-wrapper'
    let timerHtml = ''
    if (isTimer && timerState && timerState.endTime) {
        const remaining = Math.max(0, timerState.endTime - Date.now())
        if (remaining > 0) {
            const totalSeconds = Math.floor(remaining / 1000)
            const hours = Math.floor(totalSeconds / 3600)
            const minutes = Math.floor((totalSeconds % 3600) / 60)
            const seconds = totalSeconds % 60
            let timeStr
            if (hours > 0) {
                timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            } else {
                timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
            }
            timerHtml = `<div id="focux-timer-display-2m31" class="focux-timer-display">${timeStr}</div>`
        }
    }

    overlay.innerHTML = `
        <div class="focux-modal">
            <div class="focux-header">
                <svg
                    width="82"
                    viewBox="0 0 210 68"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M7.55292 12.608C11.7279 8.62194 17.397 6.29526 23.1428 6.00591C25.1093 6.00591 27.0816 6.01772 29.0481 6C28.9477 8.10818 29.0481 10.2223 28.989 12.3304C28.7115 17.0428 26.9694 21.6489 24.0345 25.3456C20.2197 30.3179 14.3853 33.6543 8.19069 34.5165C5.48608 34.9535 2.74013 34.6759 0.0178071 34.7527C0.0650492 32.432 -0.0825823 30.1053 0.100481 27.7904C0.631954 22.0505 3.34247 16.5527 7.55292 12.608Z"
                        fill="#fff"
                    />
                    <path
                        d="M26.8691 6C28.9773 6.02362 31.0855 5.98819 33.1996 6.01181C38.4612 6.38384 43.6519 8.40344 47.6143 11.9053C51.9842 15.6551 54.9782 21.0171 55.7459 26.7452C56.0825 29.4025 55.8699 32.0894 55.9998 34.7586C54.1573 34.7527 52.3208 34.7468 50.4784 34.7586C45.949 34.6346 41.4965 33.1701 37.7053 30.7017C35.9573 29.4498 34.1621 28.1802 32.8512 26.444C29.9753 23.2316 28.0207 19.1983 27.2825 14.9465C26.7274 11.9938 26.9518 8.98216 26.8691 6Z"
                        fill="#fff"
                    />
                    <path
                        d="M0.0218289 32.4473C1.8938 32.5536 3.77167 32.3587 5.63773 32.5654C13.6275 32.7366 21.3812 37.2246 25.5207 44.057C27.8947 47.8836 29.1702 52.4189 29.0049 56.9246C28.9989 58.4009 29.0226 59.8713 28.9812 61.3417C26.0168 61.2531 23.0228 61.4952 20.0879 60.9224C13.5685 59.8241 7.57466 55.9443 3.96654 50.4052C1.23241 46.3778 -0.131708 41.4587 0.0100184 36.5987C0.0100184 35.2109 0.0100184 33.8291 0.0218289 32.4473Z"
                        fill="#fff"
                    />
                    <path
                        d="M46.0221 33.073C49.2346 32.3584 52.5475 32.4765 55.8131 32.4765L55.9548 32.6183C55.8839 35.7067 56.126 38.8306 55.506 41.8836C54.2009 48.7337 49.6657 54.8516 43.5656 58.2117C39.7685 60.3257 35.4104 61.3651 31.07 61.3178C29.6823 61.3237 28.2886 61.2942 26.9009 61.3355C26.9009 58.7786 26.7946 56.2098 27.084 53.6646C27.7572 47.5054 31.0877 41.7714 35.8769 37.8976C38.8413 35.5591 42.3254 33.8643 46.0221 33.073Z"
                        fill="#fff"
                    />
                    <path
                        d="M72.576 52V31.772H69.04V26.208H72.576V23.192C72.576 20.072 73.356 17.8533 74.916 16.536C76.5107 15.2187 78.66 14.56 81.364 14.56H84.224V20.228H82.404C81.26 20.228 80.4453 20.4533 79.96 20.904C79.4747 21.3547 79.232 22.1173 79.232 23.192V26.208H84.796V31.772H79.232V52H72.576ZM101.428 52.624C98.9319 52.624 96.6785 52.052 94.6679 50.908C92.6919 49.764 91.1145 48.1867 89.9359 46.176C88.7919 44.1307 88.2199 41.7733 88.2199 39.104C88.2199 36.4347 88.8092 34.0947 89.9879 32.084C91.1665 30.0387 92.7439 28.444 94.7199 27.3C96.7305 26.156 98.9839 25.584 101.48 25.584C103.941 25.584 106.16 26.156 108.136 27.3C110.147 28.444 111.724 30.0387 112.868 32.084C114.047 34.0947 114.636 36.4347 114.636 39.104C114.636 41.7733 114.047 44.1307 112.868 46.176C111.724 48.1867 110.147 49.764 108.136 50.908C106.125 52.052 103.889 52.624 101.428 52.624ZM101.428 46.852C103.161 46.852 104.669 46.2107 105.952 44.928C107.235 43.6107 107.876 41.6693 107.876 39.104C107.876 36.5387 107.235 34.6147 105.952 33.332C104.669 32.0147 103.179 31.356 101.48 31.356C99.7119 31.356 98.1865 32.0147 96.9039 33.332C95.6559 34.6147 95.0319 36.5387 95.0319 39.104C95.0319 41.6693 95.6559 43.6107 96.9039 44.928C98.1865 46.2107 99.6945 46.852 101.428 46.852ZM133.223 52.624C130.588 52.624 128.266 52.052 126.255 50.908C124.244 49.764 122.65 48.1693 121.471 46.124C120.327 44.0787 119.755 41.7387 119.755 39.104C119.755 36.4693 120.327 34.1293 121.471 32.084C122.65 30.0387 124.244 28.444 126.255 27.3C128.266 26.156 130.588 25.584 133.223 25.584C136.516 25.584 139.29 26.4507 141.543 28.184C143.796 29.8827 145.235 32.24 145.859 35.256H138.839C138.492 34.008 137.799 33.0373 136.759 32.344C135.754 31.616 134.558 31.252 133.171 31.252C131.334 31.252 129.774 31.9453 128.491 33.332C127.208 34.7187 126.567 36.6427 126.567 39.104C126.567 41.5653 127.208 43.4893 128.491 44.876C129.774 46.2627 131.334 46.956 133.171 46.956C134.558 46.956 135.754 46.6093 136.759 45.916C137.799 45.2227 138.492 44.2347 138.839 42.952H145.859C145.235 45.864 143.796 48.204 141.543 49.972C139.29 51.74 136.516 52.624 133.223 52.624ZM161.439 52.624C158.215 52.624 155.719 51.6187 153.951 49.608C152.217 47.5973 151.351 44.6507 151.351 40.768V26.208H157.955V40.144C157.955 42.3627 158.405 44.0613 159.307 45.24C160.208 46.4187 161.629 47.008 163.571 47.008C165.408 47.008 166.916 46.3493 168.095 45.032C169.308 43.7147 169.915 41.8773 169.915 39.52V26.208H176.571V52H170.695L170.175 47.632C169.377 49.1573 168.216 50.3707 166.691 51.272C165.2 52.1733 163.449 52.624 161.439 52.624ZM180.959 52L190.319 39.104L180.959 26.208H188.083L194.635 35.36L201.135 26.208H208.311L198.899 39.104L208.311 52H201.135L194.635 42.848L188.083 52H180.959Z"
                        fill="#fff"
                    />
                </svg>
            </div>
            <div class="focux-breakline"></div>
            ${timerHtml}
            <p class="focux-description" id="focux-description-2m31">
                ${isTimer ? 'Can\'t access this tab because focus timer is enabled for the given period.' : 'Can\'t access this tab because focus mode is enabled for this domain.'}
            </p>
        </div>
    `

    if (isTimer && timerState && timerState.endTime) {
        const updateTimer = () => {
            const timerDisplay = document.getElementById('focux-timer-display-2m31')
            const remaining = Math.max(0, timerState.endTime - Date.now())
            
            if (remaining <= 0) {
                if (window.focuxTimerInterval) {
                    clearInterval(window.focuxTimerInterval)
                    window.focuxTimerInterval = null
                }
                checkAndUpdateBlocking()
                return
            }
            
            if (timerDisplay) {
                const totalSeconds = Math.floor(remaining / 1000)
                const hours = Math.floor(totalSeconds / 3600)
                const minutes = Math.floor((totalSeconds % 3600) / 60)
                const seconds = totalSeconds % 60
                let timeStr
                if (hours > 0) {
                    timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                } else {
                    timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
                }
                timerDisplay.textContent = timeStr
            }
        }
        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        if (window.focuxTimerInterval) {
            clearInterval(window.focuxTimerInterval)
        }
        window.focuxTimerInterval = interval
    }
    document.body.appendChild(overlay)

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

    muteAllMedia()

    setBlockedFavicon()
    setBlockedTitle()
}

function removeBlockingOverlay() {
    const overlay = document.getElementById('focux-overlay-2m31')
    const style = document.getElementById('focux-style-2m31')

    if (window.focuxTimerInterval) {
        clearInterval(window.focuxTimerInterval)
        window.focuxTimerInterval = null
    }

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

    restoreMediaVolume()

    restoreFavicon()
    restoreTitle()
}

function checkAndUpdateBlocking() {
    chrome.storage.local.get(['focux-websites-2m31', 'focux-timer-2m31'], function (result) {
        const blockedWebsites = result['focux-websites-2m31'] || []
        const timerState = result['focux-timer-2m31']
        
        if (timerState && timerState.whitelist) {
            const cleanedWhitelist = timerState.whitelist.filter((id) =>
                blockedWebsites.some((w) => w.id === id)
            )
            if (cleanedWhitelist.length !== timerState.whitelist.length) {
                chrome.storage.local.set({
                    'focux-timer-2m31': {
                        ...timerState,
                        whitelist: cleanedWhitelist
                    }
                })
            }
        }
        const currentUrl = window.location.href
        let shouldBlock = false

        const invalidProtocols = /^(chrome|about|edge|file|moz-extension|chrome-extension|opera|arc):/i
        if (invalidProtocols.test(currentUrl)) {
            return
        }

        if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
            return
        }

        let isTimerBlocking = false
        if (timerState && timerState.isActive && timerState.endTime) {
            const remaining = timerState.endTime - Date.now()
            if (remaining > 0) {
                const whitelistIds = timerState.whitelist || []
                let isWhitelisted = false

                if (whitelistIds.length > 0) {
                    try {
                        const currentUrlObj = new URL(currentUrl)
                        let currentHostname = currentUrlObj.hostname
                        currentHostname = currentHostname.replace(/^www\./, '')

                        for (const website of blockedWebsites) {
                            if (whitelistIds.includes(website.id)) {
                                let whitelistUrl = website.url
                                whitelistUrl = whitelistUrl.replace(/^www\./, '')
                                if (currentHostname === whitelistUrl) {
                                    isWhitelisted = true
                                    break
                                }
                            }
                        }
                    } catch (e) {
                    }
                }

                if (!isWhitelisted) {
                    shouldBlock = true
                    isTimerBlocking = true
                }
            } else {
                const newState = {
                    isActive: false,
                    endTime: null,
                    duration: null,
                    whitelist: timerState.whitelist || []
                }
                chrome.storage.local.set({ 'focux-timer-2m31': newState }, () => {
                    chrome.runtime.sendMessage({ action: 'broadcastUpdate' }).catch(() => {})
                    setTimeout(() => {
                        checkAndUpdateBlocking()
                    }, 100)
                })
            }
        }

        if (!shouldBlock) {
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
        }

        if (shouldBlock) {
            injectBlockingOverlay(isTimerBlocking, timerState)
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
    if (areaName === 'local' && (changes['focux-websites-2m31'] || changes['focux-timer-2m31'])) {
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
