'use client'

import { useAuthStore } from '@/store/auth-store'
import { motion } from 'framer-motion'
import { Shield, Lock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Authentication Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in to access this area.
          </p>
        </motion.div>
      </div>
    )
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground mb-2">
            You don&apos;t have permission to access the admin panel.
          </p>
          <p className="text-xs text-muted-foreground/60 mb-6">
            This area is restricted to administrators only. Your current role is{' '}
            <span className="font-medium text-foreground/80">{user.role}</span>.
          </p>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}
