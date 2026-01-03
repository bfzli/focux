import { Empty, Website, Input } from '@/ui/components'
import type { WebsitesProps } from '@/types'

export default function Websites({
    websites,
    setWebsites,
    url,
    setUrl
}: WebsitesProps) {
    const sortedWebsites = [...websites].sort((a, b) => {
        if (url && a.url === url) return -1
        if (url && b.url === url) return 1
        return 0
    })

    const allActive = websites.length > 0 && websites.every((w) => w.active)

    const onToggleAll = () => {
        const shouldActivate = !allActive
        const updatedWebsites = websites.map((w) => ({
            ...w,
            active: shouldActivate
        }))

        setWebsites(updatedWebsites)

        const isProd = chrome?.storage
        if (isProd !== undefined) {
            chrome.storage.local.set(
                { 'focux-websites-2m31': updatedWebsites },
                () => {
                    chrome.runtime
                        .sendMessage({ action: 'broadcastUpdate' })
                        .catch(() => {})
                }
            )
        } else {
            localStorage.setItem(
                'focux-websites-2m31',
                JSON.stringify(updatedWebsites)
            )
        }
    }

    return (
        <div className='websites'>
            {websites.length > 2 && (
                <div className='toggle-all-container'>
                    <span className='toggle-all-label'>
                        {allActive ? 'Disable all' : 'Enable all'}
                    </span>
                    <label className='toggle-all-checkbox'>
                        <input
                            type='checkbox'
                            checked={allActive}
                            onChange={onToggleAll}
                            className='sr-only peer'
                        />
                        <div className="relative w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[17px] after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-white peer-checked:after:bg-[#212331]"></div>
                    </label>
                </div>
            )}

            <Input
                url={url}
                setUrl={setUrl}
                setWebsites={setWebsites}
                websites={websites}
            />

            {sortedWebsites.length !== 0 &&
                sortedWebsites.map((website, index) => (
                    <Website
                        key={website.id}
                        website={website}
                        setWebsites={setWebsites}
                        websites={websites}
                        isLast={index === sortedWebsites.length - 1}
                        isCurrent={url === website.url}
                    />
                ))}

            {sortedWebsites.length === 0 && <Empty />}
        </div>
    )
}
