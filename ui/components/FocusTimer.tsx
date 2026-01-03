import { useState, useEffect } from 'react'
import type { Website } from '@/types'

interface TimerState {
    isActive: boolean
    endTime: number | null
    duration: number | null
    whitelist: Website[]
}

export default function FocusTimer() {
    const [timerState, setTimerState] = useState<TimerState>({
        isActive: false,
        endTime: null,
        duration: null,
        whitelist: []
    })
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(10)
    const [whitelistUrl, setWhitelistUrl] = useState<string>('')

    const durations = [
        { label: '5 min', minutes: 5 },
        { label: '10 min', minutes: 10 },
        { label: '30 min', minutes: 30 },
        { label: '1 hour', minutes: 60 },
        { label: '1 day', minutes: 1440 }
    ]

    useEffect(() => {
        const isProd = chrome?.storage

        if (isProd !== undefined) {
            chrome.storage.local.get(['focux-timer-2m31'], (result) => {
                const stored = result['focux-timer-2m31'] as TimerState | undefined
                if (stored) {
                    setTimerState(stored)
                    if (stored.isActive && stored.endTime) {
                        const remaining = Math.max(0, stored.endTime - Date.now())
                        setTimeLeft(remaining)
                    }
                }
            })
        } else {
            const stored = localStorage.getItem('focux-timer-2m31')
            if (stored) {
                const parsed = JSON.parse(stored) as TimerState
                setTimerState(parsed)
                if (parsed.isActive && parsed.endTime) {
                    const remaining = Math.max(0, parsed.endTime - Date.now())
                    setTimeLeft(remaining)
                }
            }
        }
    }, [])

    useEffect(() => {
        if (timerState.isActive && timerState.endTime) {
            const interval = setInterval(() => {
                const remaining = Math.max(0, timerState.endTime! - Date.now())
                setTimeLeft(remaining)

                if (remaining === 0) {
                    const newState: TimerState = {
                        isActive: false,
                        endTime: null,
                        duration: null,
                        whitelist: timerState.whitelist
                    }
                    setTimerState(newState)
                    setTimeLeft(0)

                    const isProd = chrome?.storage
                    if (isProd !== undefined) {
                        chrome.storage.local.set({ 'focux-timer-2m31': newState }, () => {
                            chrome.runtime
                                .sendMessage({ action: 'broadcastUpdate' })
                                .catch(() => {})
                        })
                    } else {
                        localStorage.setItem('focux-timer-2m31', JSON.stringify(newState))
                    }
                }
            }, 1000)

            return () => clearInterval(interval)
        }
    }, [timerState.isActive, timerState.endTime])

    useEffect(() => {
        const isProd = chrome?.storage

        if (isProd !== undefined) {
            chrome.storage.local.set({ 'focux-timer-2m31': timerState }, () => {
                chrome.runtime
                    .sendMessage({ action: 'broadcastUpdate' })
                    .catch(() => {})
            })
        } else {
            localStorage.setItem('focux-timer-2m31', JSON.stringify(timerState))
        }
    }, [timerState])

    const startTimer = (minutes: number) => {
        const endTime = Date.now() + minutes * 60 * 1000
        const newState: TimerState = {
            isActive: true,
            endTime: endTime,
            duration: minutes,
            whitelist: timerState.whitelist
        }
        setTimerState(newState)
        setTimeLeft(minutes * 60 * 1000)
    }

    const stopTimer = () => {
        const newState: TimerState = {
            isActive: false,
            endTime: null,
            duration: null,
            whitelist: timerState.whitelist
        }
        setTimerState(newState)
        setTimeLeft(0)
        setSelectedDuration(null)

        const isProd = chrome?.storage
        if (isProd !== undefined) {
            chrome.storage.local.set({ 'focux-timer-2m31': newState }, () => {
                chrome.runtime
                    .sendMessage({ action: 'broadcastUpdate' })
                    .catch(() => {})
            })
        } else {
            localStorage.setItem('focux-timer-2m31', JSON.stringify(newState))
        }
    }

    const formatTime = (ms: number): string => {
        const totalSeconds = Math.floor(ms / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    const isValidDomain = (formattedUrl: string): boolean => {
        try {
            if (!formattedUrl || formattedUrl.trim() === '') return false

            const specialProtocols =
                /^(chrome|about|edge|file|moz-extension|chrome-extension|opera|arc):/i
            if (specialProtocols.test(formattedUrl)) return false

            if (formattedUrl.includes(':')) return false

            const regex = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i
            if (!regex.test(formattedUrl)) return false

            let formattedNew = formattedUrl.replace(/^(https?:\/\/)/, '')
            if (!formattedNew.includes('.')) return false

            return Boolean(new URL(`https://${formattedNew}`))
        } catch (e) {
            return false
        }
    }

    const addToWhitelist = () => {
        let formattedUrl = whitelistUrl
        formattedUrl = formattedUrl.replace(/^(https?:\/\/)/, '')
        formattedUrl = formattedUrl.replace(/^www\./, '')
        formattedUrl = formattedUrl.replace(/\/.*$/, '')

        if (!isValidDomain(formattedUrl)) return

        const exists = timerState.whitelist.find((w) => {
            const normalizedStoredUrl = w.url.replace(/^www\./, '')
            return normalizedStoredUrl === formattedUrl
        })

        if (exists) return

        const newWebsite: Website = {
            id: Math.random().toString(36).substring(2, 6),
            url: formattedUrl,
            active: true
        }

        const updatedWhitelist = [...timerState.whitelist, newWebsite]
        setTimerState({
            ...timerState,
            whitelist: updatedWhitelist
        })
        setWhitelistUrl('')
    }

    const removeFromWhitelist = (id: string) => {
        const updatedWhitelist = timerState.whitelist.filter((w) => w.id !== id)
        setTimerState({
            ...timerState,
            whitelist: updatedWhitelist
        })
    }

    if (timerState.isActive && timerState.endTime) {
        const displayTime = timeLeft > 0 ? timeLeft : Math.max(0, timerState.endTime - Date.now())
        if (displayTime > 0) {
            return (
                <div className='focus-timer-container'>
                    <div className='focus-timer-active'>
                        <div className='focus-timer-display'>
                            <div className='focus-timer-time'>{formatTime(displayTime)}</div>
                            <div className='focus-timer-label'>Time Remaining</div>
                        </div>
                        {timerState.whitelist.length > 0 && (
                            <div className='focus-timer-whitelist'>
                                <div className='focus-timer-whitelist-title'>Whitelisted Sites</div>
                                <div className='focus-timer-whitelist-items'>
                                    {timerState.whitelist.map((site) => (
                                        <div key={site.id} className='focus-timer-whitelist-item'>
                                            <span>{site.url}</span>
                                            <button
                                                className='focus-timer-whitelist-remove'
                                                onClick={() => removeFromWhitelist(site.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            className='focus-timer-stop-btn'
                            onClick={stopTimer}
                        >
                            Stop Timer
                        </button>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className='focus-timer-container'>
            <div className='focus-timer-selection'>
                <div className='focus-timer-title'>Select Focus Duration</div>
                <div className='focus-timer-options'>
                    {durations.map((duration) => (
                        <button
                            key={duration.minutes}
                            className={`focus-timer-option ${
                                selectedDuration === duration.minutes
                                    ? 'focus-timer-option-selected'
                                    : ''
                            }`}
                            onClick={() => setSelectedDuration(duration.minutes)}
                        >
                            {duration.label}
                        </button>
                    ))}
                </div>
                <div className='focus-timer-whitelist-section'>
                    <div className='focus-timer-whitelist-label'>Whitelist (optional)</div>
                    <div className='focus-timer-whitelist-input'>
                        <input
                            type='text'
                            placeholder='example.com'
                            value={whitelistUrl}
                            onChange={(e) => setWhitelistUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addToWhitelist()
                                }
                            }}
                            className='focus-timer-whitelist-input-field'
                        />
                        <button
                            className='focus-timer-whitelist-add'
                            onClick={addToWhitelist}
                        >
                            +
                        </button>
                    </div>
                    {timerState.whitelist.length > 0 && (
                        <div className='focus-timer-whitelist-items'>
                            {timerState.whitelist.map((site) => (
                                <div key={site.id} className='focus-timer-whitelist-item'>
                                    <span>{site.url}</span>
                                    <button
                                        className='focus-timer-whitelist-remove'
                                        onClick={() => removeFromWhitelist(site.id)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    className='focus-timer-start-btn'
                    onClick={() => {
                        if (selectedDuration) {
                            startTimer(selectedDuration)
                        }
                    }}
                >
                    Start
                </button>
            </div>
        </div>
    )
}

