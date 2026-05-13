'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus, Check, X } from 'lucide-react'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onClose?: () => void
}

function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
  checks: { label: string; passed: boolean }[]
} {
  const checks = [
    { label: 'At least 6 characters', passed: password.length >= 6 },
    { label: 'Contains a number', passed: /\d/.test(password) },
    { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Contains special character', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ]

  const score = checks.filter((c) => c.passed).length

  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-500']

  return {
    score,
    label: labels[Math.max(0, score - 1)] || 'Too short',
    color: colors[Math.max(0, score - 1)] || 'bg-red-500',
    checks,
  }
}

export function RegisterForm({ onSwitchToLogin, onClose }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!name.trim()) {
      setLocalError('Name is required')
      return
    }
    if (!email.trim()) {
      setLocalError('Email is required')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setLocalError('Invalid email format')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    const result = await register(email, password, name)
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
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
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
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold gradient-text">Create Account</h2>
          <p className="text-muted-foreground text-sm mt-1">Start your journey with LinkVerse</p>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name" className="text-sm font-medium">Full Name</Label>
            <Input
              id="register-name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setLocalError(''); clearError() }}
              className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
              disabled={isLoading}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="register-email"
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
            <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLocalError(''); clearError() }}
                className="pl-10 pr-10 h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                disabled={isLoading}
                autoComplete="new-password"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 mt-2"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= level
                          ? passwordStrength.color
                          : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs font-medium ${
                  passwordStrength.score <= 1 ? 'text-red-400' :
                  passwordStrength.score === 2 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {passwordStrength.label}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {passwordStrength.checks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5 text-xs">
                      {check.passed ? (
                        <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                      )}
                      <span className={check.passed ? 'text-emerald-400' : 'text-muted-foreground/50'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password" className="text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); clearError() }}
                className="pl-10 h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {confirmPassword.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </div>
              )}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
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

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors hover:underline underline-offset-4"
              disabled={isLoading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
