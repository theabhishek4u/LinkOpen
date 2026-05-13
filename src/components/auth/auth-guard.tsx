'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore()
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verify = async () => {
      await checkSession()
      setIsChecking(false)
    }
    verify()
  }, [checkSession])

  // Loading state while checking session
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 rounded-2xl bg-emerald-500/10 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium gradient-text">LinkVerse</p>
            <p className="text-xs text-muted-foreground">Checking authentication...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // If authenticated, render children
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated, show auth forms
  return (
    <div className="min-h-screen flex items-center justify-center bg-background mesh-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {authMode === 'login' ? (
            <LoginForm
              key="login"
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <RegisterForm
              key="register"
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </AnimatePresence>

        {/* Background decoration */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}
