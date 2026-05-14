'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/store/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { setUser, clearUser } = useAuthStore()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const authUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        plan: session.user.plan,
        avatar: session.user.avatar,
      }
      setUser(authUser)
    } else if (status === 'unauthenticated') {
      clearUser()
    }
  }, [session, status, setUser, clearUser])

  return <>{children}</>
}
