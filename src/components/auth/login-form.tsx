'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onClose?: () => void
}

export function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email.trim()) {
      setLocalError('Email is required')
      return
    }
    if (!password.trim()) {
      setLocalError('Password is required')
      return
    }

    const result = await login(email, password)
    if (result.success && onClose) {
      onClose()
    }
  }

  const displayError = localError || error

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-card rounded-2xl p-8 border border-emerald-500/10 shadow-xl shadow-emerald-500/5">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold gradient-text">Welcome Back</h2>
          <p className="text-muted-foreground text-sm mt-1">Sign in to access your LinkVerse dashboard</p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {displayError && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
            >
              {displayError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLocalError(''); clearError() }}
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(''); clearError() }}
                className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 group"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform" />
            )}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors hover:underline underline-offset-4"
              disabled={isLoading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
