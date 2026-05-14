import { create } from 'zustand'

export interface LinkCategory {
  id: string
  name: string
  color: string
}

export const DEFAULT_CATEGORIES: LinkCategory[] = [
  { id: 'social', name: 'Social', color: '#3b82f6' },
  { id: 'work', name: 'Work', color: '#8b5cf6' },
  { id: 'personal', name: 'Personal', color: '#f59e0b' },
  { id: 'favorites', name: 'Favorites', color: '#ef4444' },
]

export interface LinkTag {
  id: string
  name: string
  color: string
}

export const DEFAULT_TAGS: LinkTag[] = [
  { id: 'important', name: 'Important', color: '#ef4444' },
  { id: 'work', name: 'Work', color: '#3b82f6' },
  { id: 'personal', name: 'Personal', color: '#f59e0b' },
  { id: 'client', name: 'Client', color: '#8b5cf6' },
]

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
  category?: string | null
  tags?: string[]
  note?: string | null
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

export interface DeepLinkTest {
  id: string
  platform: string
  url: string
  deepLink: string
  status: 'success' | 'failed' | 'pending'
  testedAt: string
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
  // Categories
  categories: LinkCategory[]
  addCategory: (category: Omit<LinkCategory, 'id'>) => void
  removeCategory: (id: string) => void
  selectedCategory: string | null
  setSelectedCategory: (categoryId: string | null) => void
  // Custom Alias
  customAlias: string
  setCustomAlias: (alias: string) => void
  // Batch Selection
  selectedLinkIds: string[]
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  // Link Tags
  linkTags: LinkTag[]
  addTag: (tag: Omit<LinkTag, 'id'>) => void
  removeTag: (id: string) => void
  updateTag: (id: string, updates: Partial<Omit<LinkTag, 'id'>>) => void
  addTagToLink: (linkId: string, tagId: string) => void
  removeTagFromLink: (linkId: string, tagId: string) => void
  filterByTag: string | null
  setFilterByTag: (tagId: string | null) => void
  // Recent URLs for suggestions
  recentUrls: string[]
  addRecentUrl: (url: string) => void
  clearRecentUrls: () => void
  // Link Notes
  addNoteToLink: (linkId: string, note: string) => void
  removeNoteFromLink: (linkId: string) => void
  updateNoteOnLink: (linkId: string, note: string) => void
  // Search & Filter
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterPlatform: string | null
  setFilterPlatform: (platform: string | null) => void
  filterDateRange: 'today' | '7d' | '30d' | 'all'
  setFilterDateRange: (range: 'today' | '7d' | '30d' | 'all') => void
  sortBy: 'newest' | 'oldest' | 'mostOpened' | 'recentlyOpened'
  setSortBy: (sort: 'newest' | 'oldest' | 'mostOpened' | 'recentlyOpened') => void
  // Deep Link Tests
  deepLinkTests: DeepLinkTest[]
  addDeepLinkTest: (test: Omit<DeepLinkTest, 'id' | 'testedAt'>) => void
  clearDeepLinkTests: () => void
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

function loadCategories(): LinkCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  try {
    const stored = localStorage.getItem('linkverse-categories')
    return stored ? JSON.parse(stored) : DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}

function saveCategories(categories: LinkCategory[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-categories', JSON.stringify(categories))
  } catch {
    // Ignore storage errors
  }
}

function loadRecentUrls(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('linkverse-recent-urls')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentUrls(urls: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-recent-urls', JSON.stringify(urls))
  } catch {
    // Ignore storage errors
  }
}

function loadTags(): LinkTag[] {
  if (typeof window === 'undefined') return DEFAULT_TAGS
  try {
    const stored = localStorage.getItem('linkverse-tags')
    return stored ? JSON.parse(stored) : DEFAULT_TAGS
  } catch {
    return DEFAULT_TAGS
  }
}

function saveTags(tags: LinkTag[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-tags', JSON.stringify(tags))
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
  // Categories
  categories: loadCategories(),
  addCategory: (category) => {
    const newCat: LinkCategory = { ...category, id: category.name.toLowerCase().replace(/[^a-z0-9]/g, '-') }
    const updated = [...get().categories, newCat]
    saveCategories(updated)
    set({ categories: updated })
  },
  removeCategory: (id) => {
    const updated = get().categories.filter((c) => c.id !== id)
    saveCategories(updated)
    set({ categories: updated })
  },
  selectedCategory: null,
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
  // Custom Alias
  customAlias: '',
  setCustomAlias: (alias) => set({ customAlias: alias }),
  // Batch Selection
  selectedLinkIds: [],
  toggleSelect: (id) => set((state) => {
    const isSelected = state.selectedLinkIds.includes(id)
    return {
      selectedLinkIds: isSelected
        ? state.selectedLinkIds.filter((sid) => sid !== id)
        : [...state.selectedLinkIds, id],
    }
  }),
  selectAll: (ids) => set({ selectedLinkIds: ids }),
  clearSelection: () => set({ selectedLinkIds: [] }),
  // Link Tags
  linkTags: loadTags(),
  addTag: (tag) => {
    const newTag: LinkTag = { ...tag, id: tag.name.toLowerCase().replace(/[^a-z0-9]/g, '-') }
    const updated = [...get().linkTags, newTag]
    saveTags(updated)
    set({ linkTags: updated })
  },
  removeTag: (id) => {
    const updated = get().linkTags.filter((t) => t.id !== id)
    saveTags(updated)
    // Also remove this tag from all links
    const newHistory = get().history.map((item) => ({
      ...item,
      tags: item.tags?.filter((t) => t !== id) || [],
    }))
    saveHistory(newHistory)
    set({ linkTags: updated, history: newHistory })
  },
  updateTag: (id, updates) => {
    const updated = get().linkTags.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
    saveTags(updated)
    set({ linkTags: updated })
  },
  addTagToLink: (linkId, tagId) => {
    const newHistory = get().history.map((item) =>
      item.id === linkId
        ? { ...item, tags: [...new Set([...(item.tags || []), tagId])] }
        : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  removeTagFromLink: (linkId, tagId) => {
    const newHistory = get().history.map((item) =>
      item.id === linkId
        ? { ...item, tags: (item.tags || []).filter((t) => t !== tagId) }
        : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  filterByTag: null,
  setFilterByTag: (tagId) => set({ filterByTag: tagId }),
  // Recent URLs
  recentUrls: loadRecentUrls(),
  addRecentUrl: (url) => {
    const trimmed = url.trim()
    if (!trimmed) return
    const existing = get().recentUrls.filter((u) => u !== trimmed)
    const updated = [trimmed, ...existing].slice(0, 20)
    saveRecentUrls(updated)
    set({ recentUrls: updated })
  },
  clearRecentUrls: () => {
    saveRecentUrls([])
    set({ recentUrls: [] })
  },
  // Link Notes
  addNoteToLink: (linkId, note) => {
    const newHistory = get().history.map((item) =>
      item.id === linkId ? { ...item, note } : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  removeNoteFromLink: (linkId) => {
    const newHistory = get().history.map((item) =>
      item.id === linkId ? { ...item, note: null } : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  updateNoteOnLink: (linkId, note) => {
    const newHistory = get().history.map((item) =>
      item.id === linkId ? { ...item, note } : item
    )
    saveHistory(newHistory)
    set({ history: newHistory })
  },
  // Search & Filter
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterPlatform: null,
  setFilterPlatform: (platform) => set({ filterPlatform: platform }),
  filterDateRange: 'all',
  setFilterDateRange: (range) => set({ filterDateRange: range }),
  sortBy: 'newest',
  setSortBy: (sort) => set({ sortBy: sort }),
  // Deep Link Tests
  deepLinkTests: [],
  addDeepLinkTest: (test) => {
    const newTest: DeepLinkTest = {
      ...test,
      id: crypto.randomUUID(),
      testedAt: new Date().toISOString(),
    }
    set((state) => ({ deepLinkTests: [newTest, ...state.deepLinkTests].slice(0, 50) }))
  },
  clearDeepLinkTests: () => set({ deepLinkTests: [] }),
}))
