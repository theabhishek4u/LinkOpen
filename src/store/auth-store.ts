import { create } from 'zustand'
import { signIn, signOut } from 'next-auth/react'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
  plan: string
  avatar: string | null
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setUser: (user: AuthUser) => void
  clearUser: () => void
  clearError: () => void
}

function saveUserToStorage(user: AuthUser) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('linkverse-auth-user', JSON.stringify(user))
  } catch {
    // Ignore storage errors
  }
}

function loadUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('linkverse-auth-user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function clearUserFromStorage() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('linkverse-auth-user')
  } catch {
    // Ignore storage errors
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUserFromStorage(),
  isAuthenticated: !!loadUserFromStorage(),
  isLoading: false,
  error: null,

  setUser: (user: AuthUser) => {
    saveUserToStorage(user)
    set({ user, isAuthenticated: true, isLoading: false, error: null })
  },

  clearUser: () => {
    clearUserFromStorage()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const errorMsg = result.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : result.error
        set({ isLoading: false, error: errorMsg })
        return { success: false, error: errorMsg }
      }

      // The AuthProvider will handle updating the user state via useSession
      // But we also manually fetch to ensure immediate update
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          plan: session.user.plan,
          avatar: session.user.avatar,
        }
        saveUserToStorage(authUser)
        set({ user: authUser, isAuthenticated: true, isLoading: false, error: null })
        return { success: true }
      }

      set({ isLoading: false, error: 'Failed to get session' })
      return { success: false, error: 'Failed to get session' }
    } catch {
      const errorMsg = 'Network error. Please try again.'
      set({ isLoading: false, error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Registration failed'
        set({ isLoading: false, error: errorMsg })
        return { success: false, error: errorMsg }
      }

      // After registration, auto-login using next-auth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (!result?.error) {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()

        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            plan: session.user.plan,
            avatar: session.user.avatar,
          }
          saveUserToStorage(authUser)
          set({ user: authUser, isAuthenticated: true, isLoading: false, error: null })
          return { success: true }
        }
      }

      // Registration succeeded but auto-login failed - still return success
      set({ isLoading: false })
      return { success: true }
    } catch {
      const errorMsg = 'Network error. Please try again.'
      set({ isLoading: false, error: errorMsg })
      return { success: false, error: errorMsg }
    }
  },

  logout: async () => {
    try {
      await signOut({ redirect: false })
    } catch {
      // Ignore errors
    }
    clearUserFromStorage()
    set({ user: null, isAuthenticated: false, error: null })
  },

  checkSession: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/auth/session')
      const session = await res.json()

      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
          plan: session.user.plan,
          avatar: session.user.avatar,
        }
        saveUserToStorage(authUser)
        set({ user: authUser, isAuthenticated: true, isLoading: false })
      } else {
        clearUserFromStorage()
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    } catch {
      // On error, try to use cached user
      const cachedUser = loadUserFromStorage()
      if (cachedUser) {
        set({ user: cachedUser, isAuthenticated: true, isLoading: false })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    }
  },

  clearError: () => set({ error: null }),
}))
