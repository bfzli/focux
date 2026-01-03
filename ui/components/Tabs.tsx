import type { TabsProps } from '@/types'

export default function Tabs({
    activeTab,
    onTabChange
}: TabsProps) {
    return (
        <div className='tabs-container'>
            <div className='tabs'>
                <button
                    className={`tab ${activeTab === 'blocklist' ? 'tab-active' : 'tab-inactive'}`}
                    onClick={() => onTabChange('blocklist')}
                >
                    Blocked Sites
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
                    Timer
                </button>
            </div>
        </div>
    )
}
