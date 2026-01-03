import { useState, useEffect, useRef } from 'react'
import type { Website } from '@/types'
import { EmptyIcon } from '@/ui/icons'

interface TimerState {
    isActive: boolean
    endTime: number | null
    duration: number | null
    whitelist: string[]
}

interface FocusTimerProps {
    websites: Website[]
    setWebsites?: (websites: Website[] | ((prev: Website[]) => Website[])) => void
}

export default function FocusTimer({ websites, setWebsites }: FocusTimerProps) {
    const [timerState, setTimerState] = useState<TimerState>({
        isActive: false,
        endTime: null,
        duration: null,
        whitelist: []
    })
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [selectedDuration, setSelectedDuration] = useState<number | null>(10)
    const isInitialLoad = useRef(true)

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
                    const cleanedWhitelist = stored.whitelist.filter((id) =>
                        websites.some((w) => w.id === id)
                    )
                    const finalState = {
                        ...stored,
                        whitelist: cleanedWhitelist
                    }
                    isInitialLoad.current = true
                    setTimerState(finalState)
                    if (stored.isActive && stored.endTime) {
                        const remaining = Math.max(0, stored.endTime - Date.now())
                        setTimeLeft(remaining)
                    }
                } else {
                    isInitialLoad.current = false
                }
                setTimeout(() => {
                    isInitialLoad.current = false
                }, 50)
            })
        } else {
            const stored = localStorage.getItem('focux-timer-2m31')
            if (stored) {
                const parsed = JSON.parse(stored) as TimerState
                const cleanedWhitelist = parsed.whitelist.filter((id) =>
                    websites.some((w) => w.id === id)
                )
                const finalState = {
                    ...parsed,
                    whitelist: cleanedWhitelist
                }
                isInitialLoad.current = true
                setTimerState(finalState)
                if (parsed.isActive && parsed.endTime) {
                    const remaining = Math.max(0, parsed.endTime - Date.now())
                    setTimeLeft(remaining)
                }
            } else {
                isInitialLoad.current = false
            }
            setTimeout(() => {
                isInitialLoad.current = false
            }, 50)
        }
    }, [])

    useEffect(() => {
        const cleanedWhitelist = timerState.whitelist.filter((id) =>
            websites.some((w) => w.id === id)
        )
        if (cleanedWhitelist.length !== timerState.whitelist.length) {
            setTimerState({
                ...timerState,
                whitelist: cleanedWhitelist
            })
        }
    }, [websites])

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
        if (isInitialLoad.current) {
            isInitialLoad.current = false
            return
        }

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
        isInitialLoad.current = false
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

    const toggleWhitelist = (websiteId: string) => {
        const isWhitelisted = timerState.whitelist.includes(websiteId)
        const updatedWhitelist = isWhitelisted
            ? timerState.whitelist.filter((id) => id !== websiteId)
            : [...timerState.whitelist, websiteId]
        setTimerState({
            ...timerState,
            whitelist: updatedWhitelist
        })
    }

    const WhitelistWebsiteItem = ({ website, isWhitelisted, onToggle, isLast }: { website: Website; isWhitelisted: boolean; onToggle: () => void; isLast: boolean }) => {
        const [favicon, setFavicon] = useState<string | null>(null)
        const onError = () => {
            const example = `https://www.google.com/s2/favicons?domain=https://example.com`
            setFavicon(example)
        }
        return (
            <div
                className='focus-timer-website-item'
                style={isLast ? { marginBottom: 0 } : undefined}
            >
                <div className='website-info'>
                    <img
                        src={
                            favicon !== null
                                ? favicon
                                : `https://www.google.com/s2/favicons?domain=${website?.url}`
                        }
                        onError={onError}
                        alt='website favicon'
                        className='favicon'
                    />
                    <div className='websiteText'>
                        <span className='entry'>https://</span>
                        <span className='url'>
                            {website?.url?.trim()?.length < 15
                                ? website?.url?.trim()
                                : website?.url?.trim()?.substring(0, 15) + '...'}
                        </span>
                    </div>
                </div>
                <label className='focus-timer-whitelist-toggle'>
                    <input
                        type='checkbox'
                        checked={isWhitelisted}
                        onChange={onToggle}
                        className='sr-only peer'
                    />
                    <div className="relative w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[17px] after:content-[''] after:absolute after:top-px after:left-px after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#212331]"></div>
                </label>
            </div>
        )
    }

    const websitesList = (
        <div className='focus-timer-websites'>
            {websites.length > 0 && (
                <div className='focus-timer-websites-title'>Whitelisted Websites</div>
            )}
            {websites.length > 0 ? (
                <div className='websites'>
                    {websites.map((website, index) => (
                        <WhitelistWebsiteItem
                            key={website.id}
                            website={website}
                            isWhitelisted={timerState.whitelist.includes(website.id)}
                            onToggle={() => toggleWhitelist(website.id)}
                            isLast={index === websites.length - 1}
                        />
                    ))}
                </div>
            ) : (
                <div className='focus-timer-empty'>
                    <div className='empty'>
                        <EmptyIcon />
                        <p className='empty-text'>
                            No websites in the list to whitelist for timer.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )

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
                        <button
                            className='focus-timer-stop-btn'
                            onClick={stopTimer}
                        >
                            Stop Timer
                        </button>
                        <div className='focus-timer-breakline'></div>
                        {websitesList}
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
                <div className='focus-timer-breakline'></div>
                {websitesList}
            </div>
        </div>
    )
}
