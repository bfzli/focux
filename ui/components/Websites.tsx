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

    return (
        <div className='websites'>
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
