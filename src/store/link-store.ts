import { create } from 'zustand'

export interface LinkHistoryItem {
  id: string
  originalUrl: string
  platform: {
    id: string
    name: string
    icon: string
    color: string
  }
  deepLink: string
  shortCode?: string
  isFavorite: boolean
  openCount: number
  createdAt: string
}

export interface AnalyticsData {
  totalLinks: number
  totalOpens: number
  nativeOpens: number
  browserOpens: number
  topPlatforms: { platform: string; count: number; color: string }[]
  recentActivity: { date: string; opens: number }[]
  deviceBreakdown: { device: string; count: number }[]
}

interface LinkState {
  inputUrl: string
  setInputUrl: (url: string) => void
  detectedPlatform: {
    id: string
    name: string
    icon: string
    color: string
    deepLinkScheme: string
  } | null
  setDetectedPlatform: (platform: LinkState['detectedPlatform']) => void
  deepLinkResult: {
    originalUrl: string
    deepLink: string
    webUrl: string
    fallbackUrl: string
    shortCode?: string
  } | null
  setDeepLinkResult: (result: LinkState['deepLinkResult']) => void
  qrCodeDataUrl: string | null
  setQrCodeDataUrl: (url: string | null) => void
  history: LinkHistoryItem[]
  addToHistory: (item: LinkHistoryItem) => void
  removeFromHistory: (id: string) => void
  toggleFavorite: (id: string) => void
  clearHistory: () => void
  analytics: AnalyticsData
  setAnalytics: (data: AnalyticsData) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  showQRCode: boolean
  setShowQRCode: (show: boolean) => void
  activeView: 'landing' | 'dashboard'
  setActiveView: (view: 'landing' | 'dashboard') => void
}

const defaultAnalytics: AnalyticsData = {
  totalLinks: 0,
  totalOpens: 0,
  nativeOpens: 0,
  browserOpens: 0,
  topPlatforms: [],
  recentActivity: [],
  deviceBreakdown: [],
}

function loadHistory(): LinkHistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('linkverse-history')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveHistory(history: LinkHistoryItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-history', JSON.stringify(history))
  } catch {
    // Ignore storage errors
  }
}

export const useLinkStore = create<LinkState>((set, get) => ({
  inputUrl: '',
  setInputUrl: (url) => set({ inputUrl: url }),
  detectedPlatform: null,
  setDetectedPlatform: (platform) => set({ detectedPlatform: platform }),
  deepLinkResult: null,
  setDeepLinkResult: (result) => set({ deepLinkResult: result }),
  qrCodeDataUrl: null,
  setQrCodeDataUrl: (url) => set({ qrCodeDataUrl: url }),
  history: loadHistory(),
  addToHistory: (item) => {
    const newHistory = [item, ...get().history].slice(0, 100)
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  removeFromHistory: (id) => {
    const newHistory = get().history.filter((item) => item.id !== id)
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  toggleFavorite: (id) => {
    const newHistory = get().history.map((item) =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  clearHistory: () => {
    saveHistory([])
    set({ history: [] })
  },
  analytics: defaultAnalytics,
  setAnalytics: (data) => set({ analytics: data }),
  isProcessing: false,
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  showQRCode: false,
  setShowQRCode: (show) => set({ showQRCode: show }),
  activeView: 'landing',
  setActiveView: (view) => set({ activeView: view }),
}))
