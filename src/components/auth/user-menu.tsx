'use client'

import { useAuthStore } from '@/store/auth-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Settings, Shield, Crown, Rocket } from 'lucide-react'

function getPlanBadge(plan: string) {
  switch (plan) {
    case 'pro':
      return { label: 'Pro', icon: Crown, className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' }
    case 'enterprise':
      return { label: 'Enterprise', icon: Rocket, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    default:
      return { label: 'Free', icon: Shield, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  }
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

export function UserMenu() {
  const { user, logout } = useAuthStore()

  if (!user) return null

  const planBadge = getPlanBadge(user.plan)
  const PlanIcon = planBadge.icon
  const initials = getInitials(user.name, user.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 gap-2 px-2 hover:bg-accent/50 transition-colors rounded-xl"
        >
          <Avatar className="h-7 w-7 border border-emerald-500/20">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
            {user.name || user.email}
          </span>
          <span className={`hidden md:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${planBadge.className}`}>
            <PlanIcon className="w-2.5 h-2.5" />
            {planBadge.label}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 glass-card">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
            <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${planBadge.className}`}>
                <PlanIcon className="w-2.5 h-2.5" />
                {planBadge.label} Plan
              </span>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <Shield className="w-2.5 h-2.5" />
                  Admin
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer rounded-lg">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer rounded-lg">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer rounded-lg text-red-400 focus:text-red-400 focus:bg-red-500/10"
          onSelect={async () => {
            await logout()
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
