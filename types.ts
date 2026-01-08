export interface Website {
    id: string
    url: string
    active: boolean
}

export interface InputProps {
    url: string
    setUrl: (url: string) => void
    setWebsites: (
        websites: Website[] | ((prev: Website[]) => Website[])
    ) => void
    websites: Website[]
}

export interface WebsiteProps {
    website: Website
    websites: Website[]
    setWebsites: (
        websites: Website[] | ((prev: Website[]) => Website[])
    ) => void
    isLast?: boolean
    isCurrent?: boolean
}

export interface WebsitesProps {
    websites: Website[]
    setWebsites: (
        websites: Website[] | ((prev: Website[]) => Website[])
    ) => void
    url: string
    setUrl: (url: string) => void
}

export interface TabsProps {
    activeTab: 'blocklist' | 'recommendations' | 'focustimer'
    onTabChange: (tab: 'blocklist' | 'recommendations' | 'focustimer') => void
}

export interface RecommendationsProps {
    websites: Website[]
    setWebsites: (
        websites: Website[] | ((prev: Website[]) => Website[])
    ) => void
}

export interface DeleteIconProps {
    onClick?: () => void
}

export interface TimerState {
    isActive: boolean
    endTime: number | null
    duration: number | null
    whitelist: string[]
}

export interface FocusTimerProps {
    websites: Website[]
    setWebsites?: (websites: Website[] | ((prev: Website[]) => Website[])) => void
}
