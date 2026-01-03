let scrollPreventers = []
let mutedMediaElements = []
let mediaObserver = null
let originalTitle = null
let originalFavicon = null
let faviconLink = null
let titleObserver = null
let faviconTimeout = null

function isExtensionContextValid() {
    try {
        if (typeof chrome === 'undefined' || !chrome.runtime) {
            return false
        }
        const id = chrome.runtime.id
        return id !== undefined && id !== null
    } 
    
    catch (e) {
        return false
    }
}

function hasChromeError() {
    try {
        return chrome.runtime.lastError !== undefined && chrome.runtime.lastError !== null
    } 
    
    catch (e) {
        return true
    }
}

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

    const svgString = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M3.23641 2.832C5.02568 1.12369 7.4553 0.12654 9.91778 0.00253282C10.7606 0.00253282 11.6058 0.00759429 12.4486 0C12.4056 0.903506 12.4486 1.80956 12.4233 2.71303C12.3044 4.73263 11.5578 6.70667 10.2999 8.29097C8.66503 10.422 6.16457 11.8518 3.50974 12.2214C2.35062 12.4086 1.17378 12.2897 0.00707354 12.3226C0.0273202 11.328 -0.0359505 10.3308 0.0425053 9.33874C0.270279 6.87879 1.43193 4.52259 3.23641 2.832Z" fill="#1D3540"/><path d="M11.5156 0C12.4191 0.0101229 13.3227 -0.00506151 14.2287 0.00506134C16.4837 0.164503 18.7083 1.03005 20.4064 2.53084C22.2792 4.1379 23.5624 6.4359 23.8914 8.8908C24.0357 10.0296 23.9445 11.1812 24.0002 12.3251C23.2106 12.3226 22.4235 12.3201 21.6339 12.3251C19.6927 12.272 17.7845 11.6443 16.1597 10.5864C15.4106 10.0499 14.6412 9.5058 14.0794 8.76171C12.8469 7.38497 12.0092 5.65641 11.6928 3.83421C11.4549 2.56877 11.5511 1.27807 11.5156 0Z" fill="#1D3540"/><path d="M0.00935525 11.3346C0.811629 11.3801 1.61643 11.2966 2.41617 11.3852C5.84036 11.4585 9.16337 13.382 10.9374 16.3101C11.9549 17.9501 12.5015 19.8938 12.4307 21.8248C12.4281 22.4575 12.4383 23.0877 12.4205 23.7179C11.1501 23.6799 9.86691 23.7837 8.6091 23.5382C5.81507 23.0675 3.24628 21.4047 1.69995 19.0308C0.528176 17.3048 -0.0564463 15.1966 0.0042936 13.1137C0.0042936 12.519 0.0042936 11.9268 0.00935525 11.3346Z" fill="#1D3540"/><path d="M19.7225 11.6027C21.0993 11.2965 22.5191 11.3471 23.9186 11.3471L23.9794 11.4078C23.949 12.7314 24.0527 14.0703 23.787 15.3787C23.2277 18.3144 21.284 20.9364 18.6697 22.3764C17.0424 23.2824 15.1746 23.7279 13.3145 23.7076C12.7197 23.7102 12.1224 23.6975 11.5277 23.7152C11.5277 22.6194 11.4821 21.5185 11.6062 20.4277C11.8947 17.788 13.322 15.3306 15.3746 13.6704C16.645 12.6682 18.1382 11.9418 19.7225 11.6027Z" fill="#1D3540"/></g></svg>'
    const blockedFaviconSvg = 'data:image/svg+xml,' + encodeURIComponent(svgString)
    faviconLink.href = blockedFaviconSvg
    faviconLink.type = 'image/svg+xml'
}

function verifyAndSetBlockedFavicon() {
    if (!isExtensionContextValid()) {
        return
    }
    
    const overlay = document.getElementById('focux-overlay-2m31')
    if (!overlay || !overlay.isConnected) {
        return
    }
    
    try {
        chrome.storage.local.get(['focux-websites-2m31', 'focux-timer-2m31'], function (result) {
            if (!isExtensionContextValid() || hasChromeError()) {
                return
            }
            
            const overlay = document.getElementById('focux-overlay-2m31')
            if (!overlay || !overlay.isConnected) {
                return
            }
            
            const blockedWebsites = result['focux-websites-2m31'] || []
            const timerState = result['focux-timer-2m31']
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
                setBlockedFavicon()
            }
        })
    } catch (e) {
        return
    }
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
    let existingOverlay = document.getElementById('focux-overlay-2m31')
    let shadowRoot = null
    
    if (existingOverlay && existingOverlay.shadowRoot) {
        shadowRoot = existingOverlay.shadowRoot
        const description = shadowRoot.getElementById('focux-description-2m31')
        const timerDisplay = shadowRoot.getElementById('focux-timer-display-2m31')
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

    const overlay = document.createElement('div')
    overlay.id = 'focux-overlay-2m31'
    overlay.setAttribute('data-focux-overlay', 'true')
    overlay.style.cssText = 'position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: 100% !important; z-index: 2147483647 !important; pointer-events: auto !important; margin: 0 !important; padding: 0 !important; border: none !important; background: transparent !important; font-family: "DM Sans", sans-serif !important; font-size: initial !important; line-height: initial !important; color: initial !important; text-align: initial !important; text-transform: initial !important; letter-spacing: initial !important; word-spacing: initial !important; text-shadow: none !important; box-shadow: none !important; opacity: 1 !important; visibility: visible !important; transform: none !important; filter: none !important; backdrop-filter: none !important; overflow: hidden !important; box-sizing: border-box !important;'
    
    const hostStyle = document.createElement('style')
    hostStyle.id = 'focux-host-style-2m31'
    hostStyle.textContent = `
        #focux-overlay-2m31,
        #focux-overlay-2m31::before,
        #focux-overlay-2m31::after {
            all: initial !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 2147483647 !important;
            pointer-events: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: transparent !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
        }
    `
    if (!document.getElementById('focux-host-style-2m31')) {
        document.head.appendChild(hostStyle)
    }
    
    shadowRoot = overlay.attachShadow({ mode: 'open' })
    
    const fontLink = document.createElement('link')
    fontLink.rel = 'stylesheet'
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=block'
    fontLink.crossOrigin = 'anonymous'
    shadowRoot.appendChild(fontLink)
    
    const style = document.createElement('style')
    style.textContent = `
        :host {
            all: initial;
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            z-index: 2147483647;
            pointer-events: auto;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000;
            box-sizing: border-box;
            overflow: hidden;
        }
        
        *,
        *::before,
        *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: inherit;
            line-height: inherit;
            color: inherit;
            text-align: initial;
            text-transform: initial;
            letter-spacing: initial;
            word-spacing: initial;
            text-shadow: none;
            box-shadow: none;
            opacity: 1;
            visibility: visible;
            transform: none;
            filter: none;
            backdrop-filter: none;
            border: none;
            outline: none;
            list-style: none;
            text-decoration: none;
            vertical-align: baseline;
            background: transparent;
        }
        
        .focux-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            flex-direction: column;
            align-items: center;
            background: rgba(0, 0, 0, 0.85);
            pointer-events: auto;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            border: none;
            box-sizing: border-box;
            overflow: hidden;
        }

        .focux-modal {
            padding-top: 20px;
            padding-right: 30px;
            padding-bottom: 20px;
            padding-left: 30px;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(30px) saturate(180%);
            -webkit-backdrop-filter: blur(30px) saturate(180%);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
            pointer-events: auto;
            width: 290px;
            min-width: 290px;
            max-width: 290px;
            margin: 0;
            box-sizing: border-box;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            flex-shrink: 0;
            flex-grow: 0;
            position: relative;
        }

        .focux-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 14px;
            margin-top: 0;
            margin-left: 0;
            margin-right: 0;
            padding: 0;
            border: none;
            background: transparent;
            box-sizing: border-box;
        }

        .focux-header svg {
            display: block;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            box-sizing: border-box;
        }

        .focux-breakline {
            width: 100%;
            height: 1px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-left: none;
            border-right: none;
            border-bottom: none;
            margin: 0 0 14px 0;
            padding: 0;
            background: transparent;
            box-sizing: border-box;
        }

        .focux-description {
            font-size: 13px;
            max-width: 100%;
            text-align: center;
            font-weight: 400;
            color: white;
            margin: 0;
            padding: 0;
            border: none;
            background: transparent;
            box-sizing: border-box;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.5;
        }

        .focux-timer-display {
            font-size: 48px;
            font-weight: 700;
            color: white;
            margin: 0px 0 10px 0;
            padding: 0;
            border: none;
            background: transparent;
            font-variant-numeric: tabular-nums;
            text-align: center;
            box-sizing: border-box;
            font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            line-height: 1.2;
        }
    `
    shadowRoot.appendChild(style)

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

    const wrapper = document.createElement('div')
    wrapper.className = 'focux-wrapper'
    wrapper.innerHTML = `
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
    shadowRoot.appendChild(wrapper)

    if (isTimer && timerState && timerState.endTime) {
        const updateTimer = () => {
            const timerDisplay = shadowRoot.getElementById('focux-timer-display-2m31')
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
    
    const htmlStyle = document.createElement('style')
    htmlStyle.id = 'focux-html-style-2m31'
    htmlStyle.textContent = 'html { overflow-y: scroll !important; }'
    if (!document.getElementById('focux-html-style-2m31')) {
        document.head.appendChild(htmlStyle)
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

    muteAllMedia()

    if (faviconTimeout) {
        clearTimeout(faviconTimeout)
    }
    faviconTimeout = setTimeout(() => {
        verifyAndSetBlockedFavicon()
        faviconTimeout = null
    }, 1000)
    setBlockedTitle()
}

function removeBlockingOverlay() {
    const overlay = document.getElementById('focux-overlay-2m31')
    const htmlStyle = document.getElementById('focux-html-style-2m31')
    const hostStyle = document.getElementById('focux-host-style-2m31')

    if (faviconTimeout) {
        clearTimeout(faviconTimeout)
        faviconTimeout = null
    }

    if (window.focuxTimerInterval) {
        clearInterval(window.focuxTimerInterval)
        window.focuxTimerInterval = null
    }

    if (overlay) {
        overlay.remove()
    }

    if (htmlStyle) {
        htmlStyle.remove()
    }

    if (hostStyle) {
        hostStyle.remove()
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
    if (!isExtensionContextValid()) {
        return
    }
    
    try {
        chrome.storage.local.get(['focux-websites-2m31', 'focux-timer-2m31'], function (result) {
            if (!isExtensionContextValid() || hasChromeError()) {
                return
            }
            
            const blockedWebsites = result['focux-websites-2m31'] || []
            const timerState = result['focux-timer-2m31']
            
            if (timerState && timerState.whitelist) {
                const cleanedWhitelist = timerState.whitelist.filter((id) =>
                    blockedWebsites.some((w) => w.id === id)
                )
                if (cleanedWhitelist.length !== timerState.whitelist.length) {
                    if (!isExtensionContextValid()) {
                        return
                    }
                    try {
                        chrome.storage.local.set({
                            'focux-timer-2m31': {
                                ...timerState,
                                whitelist: cleanedWhitelist
                            }
                        }, () => {
                            if (!isExtensionContextValid() || hasChromeError()) {
                                return
                            }
                        })
                    } catch (e) {
                        return
                    }
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
                    if (!isExtensionContextValid()) {
                        return
                    }
                    const newState = {
                        isActive: false,
                        endTime: null,
                        duration: null,
                        whitelist: timerState.whitelist || []
                    }
                    try {
                        chrome.storage.local.set({ 'focux-timer-2m31': newState }, () => {
                            if (!isExtensionContextValid() || hasChromeError()) {
                                return
                            }
                            try {
                                if (isExtensionContextValid()) {
                                    chrome.runtime.sendMessage({ action: 'broadcastUpdate' }).catch(() => {})
                                }
                            } catch (e) {
                            }
                            setTimeout(() => {
                                checkAndUpdateBlocking()
                            }, 100)
                        })
                    } catch (e) {
                        return
                    }
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
    } catch (e) {
        return
    }
}

if (isExtensionContextValid()) {
    try {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (!isExtensionContextValid()) {
                return true
            }
            if (request.action === 'updateBlocking') {
                checkAndUpdateBlocking()
                sendResponse({ success: true })
            }
            return true
        })
    } catch (e) {
    }
}

if (isExtensionContextValid()) {
    try {
        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (!isExtensionContextValid()) {
                return
            }
            if (areaName === 'local' && (changes['focux-websites-2m31'] || changes['focux-timer-2m31'])) {
                checkAndUpdateBlocking()
            }
        })
    } catch (e) {
    }
}

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
