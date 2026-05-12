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
  expiry?: string | null
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

export interface HealthCheckResult {
  url: string
  status: 'healthy' | 'warning' | 'broken'
  httpStatus: number | null
  responseTime: number | null
  redirectChain: string[]
  message: string
  checkedAt: string
}

export interface LinkVerseNotification {
  id: string
  type: 'link_generated' | 'link_expired' | 'health_check' | 'milestone'
  title: string
  description: string
  timestamp: string
  read: boolean
}

export interface LinkVerseSettings {
  compactMode: boolean
  animationsEnabled: boolean
  defaultOpenMethod: 'native' | 'browser'
  autoCopyOnGenerate: boolean
  showQrAfterGenerate: boolean
  toastNotifications: boolean
  soundEffects: boolean
}

const defaultSettings: LinkVerseSettings = {
  compactMode: false,
  animationsEnabled: true,
  defaultOpenMethod: 'native',
  autoCopyOnGenerate: false,
  showQrAfterGenerate: false,
  toastNotifications: true,
  soundEffects: false,
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
  // Link Scheduler
  linkExpiry: string | null
  setLinkExpiry: (expiry: string | null) => void
  // Health Checker
  healthCheckResults: HealthCheckResult[]
  addHealthCheckResult: (result: HealthCheckResult) => void
  clearHealthCheckResults: () => void
  // Notifications
  notifications: LinkVerseNotification[]
  addNotification: (notification: Omit<LinkVerseNotification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  unreadNotificationCount: () => number
  // Settings
  settings: LinkVerseSettings
  updateSettings: (settings: Partial<LinkVerseSettings>) => void
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

function loadNotifications(): LinkVerseNotification[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('linkverse-notifications')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveNotifications(notifications: LinkVerseNotification[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-notifications', JSON.stringify(notifications))
  } catch {
    // Ignore storage errors
  }
}

function loadSettings(): LinkVerseSettings {
  if (typeof window === 'undefined') return defaultSettings
  try {
    const stored = localStorage.getItem('linkverse-settings')
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

function saveSettings(settings: LinkVerseSettings) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-settings', JSON.stringify(settings))
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
  // Link Scheduler
  linkExpiry: null,
  setLinkExpiry: (expiry) => set({ linkExpiry: expiry }),
  // Health Checker
  healthCheckResults: [],
  addHealthCheckResult: (result) => set((state) => ({
    healthCheckResults: [result, ...state.healthCheckResults].slice(0, 20),
  })),
  clearHealthCheckResults: () => set({ healthCheckResults: [] }),
  // Notifications
  notifications: loadNotifications(),
  addNotification: (notification) => {
    const newNotification: LinkVerseNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    const updated = [newNotification, ...get().notifications].slice(0, 50)
    saveNotifications(updated)
    set({ notifications: updated })
  },
  markNotificationRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    )
    saveNotifications(updated)
    set({ notifications: updated })
  },
  markAllNotificationsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }))
    saveNotifications(updated)
    set({ notifications: updated })
  },
  clearNotifications: () => {
    saveNotifications([])
    set({ notifications: [] })
  },
  unreadNotificationCount: () => get().notifications.filter((n) => !n.read).length,
  // Settings
  settings: loadSettings(),
  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial }
    saveSettings(updated)
    set({ settings: updated })
  },
}))
