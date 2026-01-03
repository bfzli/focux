import { useState, useEffect } from 'react'
import type { Website, RecommendationsProps } from '@/types'

const RECOMMENDED_SITES = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'x.com',
    'tiktok.com',
    'youtube.com',
    'reddit.com',
    'pinterest.com',
    'linkedin.com',
    'snapchat.com',
    'twitch.tv',
    'discord.com',
    'netflix.com',
    'amazon.com',
    'ebay.com',
    'imgur.com',
    'tumblr.com',
    'quora.com',
    '9gag.com',
    'buzzfeed.com'
]

export default function Recommendations({
    websites,
    setWebsites
}: RecommendationsProps) {
    const [addedSites, setAddedSites] = useState<Set<string>>(
        new Set(websites.map((w) => w.url))
    )

    useEffect(() => {
        setAddedSites(new Set(websites.map((w) => w.url)))
    }, [websites])

    const handleAddSite = (siteUrl: string) => {
        if (addedSites.has(siteUrl)) {
            return
        }

        const newWebsite: Website = {
            id: Math.random().toString(36).substring(2, 6),
            url: siteUrl,
            active: true
        }

        const newWebsites = [newWebsite, ...websites]
        setWebsites(newWebsites)
        setAddedSites(new Set([...addedSites, siteUrl]))

        const isProd = chrome?.storage
        if (isProd !== undefined) {
            chrome.storage.local.set(
                { 'focux-websites-2m31': newWebsites },
                () => {
                    chrome.runtime
                        .sendMessage({ action: 'broadcastUpdate' })
                        .catch(() => {})
                }
            )
        } else {
            localStorage.setItem(
                'focux-websites-2m31',
                JSON.stringify(newWebsites)
            )
        }
    }

    return (
        <div className='recommendations'>
            <div className='recommendations-list'>
                {RECOMMENDED_SITES.map((site, index) => {
                    const isAdded = addedSites.has(site)
                    return (
                        <div
                            key={site}
                            className={`recommendation-item ${isAdded ? 'recommendation-added' : ''}`}
                            style={
                                index === RECOMMENDED_SITES.length - 1
                                    ? { marginBottom: 0 }
                                    : undefined
                            }
                        >
                            <div className='website-info'>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${site}`}
                                    alt={`${site} favicon`}
                                    className='favicon'
                                    onError={(e) => {
                                        ;(e.target as HTMLImageElement).src =
                                            `https://www.google.com/s2/favicons?domain=https://example.com`
                                    }}
                                />
                                <div className='websiteText'>
                                    <span className='entry'>https://</span>
                                    <span className='url'>{site}</span>
                                </div>
                            </div>
                            <button
                                className={`recommendation-button ${isAdded ? 'recommendation-button-added' : ''}`}
                                onClick={() => !isAdded && handleAddSite(site)}
                                disabled={isAdded}
                            >
                                {isAdded ? 'Added' : 'Add'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
