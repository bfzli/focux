import { useState, useEffect } from 'react'
import type { TabsProps, TimerState } from '@/types'

export default function Tabs({
    activeTab,
    onTabChange
}: TabsProps) {
    const [remainingTime, setRemainingTime] = useState<string | null>(null)

    useEffect(() => {
        const checkTimerState = () => {
            chrome.storage.local.get(['focux-timer-2m31'], (result) => {
                const timerState: TimerState | null = result['focux-timer-2m31']
                if (timerState?.isActive && timerState.endTime) {
                    const remaining = timerState.endTime - Date.now()
                    if (remaining > 0) {
                        setRemainingTime(formatTime(remaining))
                    } else {
                        setRemainingTime(null)
                    }
                } else {
                    setRemainingTime(null)
                }
            })
        }

        checkTimerState()
        const interval = setInterval(checkTimerState, 1000)

        const handleMessage = (message: { action: string }) => {
            if (message.action === 'broadcastUpdate') {
                checkTimerState()
            }
        }

        chrome.runtime.onMessage.addListener(handleMessage)
        return () => {
            clearInterval(interval)
            chrome.runtime.onMessage.removeListener(handleMessage)
        }
    }, [])

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

    const showTimerInTab = activeTab !== 'focustimer' && remainingTime

    return (
        <div className='tabs-container'>
            <div className='tabs'>
                <button
                    className={`tab ${activeTab === 'blocklist' ? 'tab-active' : 'tab-inactive'}`}
                    onClick={() => onTabChange('blocklist')}
                >
                    Websites
                </button>
                <button
                    className={`tab ${activeTab === 'recommendations' ? 'tab-active' : 'tab-inactive'}`}
                    onClick={() => onTabChange('recommendations')}
                >
                    Popular
                </button>
                <button
                    className={`tab ${activeTab === 'focustimer' ? 'tab-active' : 'tab-inactive'}`}
                    onClick={() => onTabChange('focustimer')}
                >
                    Timer{showTimerInTab ? ` (${remainingTime})` : ''}
                </button>
            </div>
        </div>
    )
}
