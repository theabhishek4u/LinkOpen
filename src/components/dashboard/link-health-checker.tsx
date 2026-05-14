'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartPulse, Loader2, ExternalLink, Clock, ArrowRight, ShieldCheck, AlertTriangle, XCircle, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLinkStore } from '@/store/link-store'
import { toast } from 'sonner'

type HealthStatus = 'healthy' | 'warning' | 'broken'

interface HealthResult {
  url: string
  finalUrl: string
  status: HealthStatus
  httpStatus: number | null
  responseTime: number | null
  redirectChain: string[]
  message: string
  checkedAt: string
}

const statusConfig: Record<HealthStatus, { color: string; bgColor: string; icon: typeof ShieldCheck; label: string }> = {
  healthy: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck, label: 'Healthy' },
  warning: { color: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle, label: 'Warning' },
  broken: { color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Broken' },
}

export function LinkHealthChecker({ urlToCheck }: { urlToCheck?: string }) {
  const [url, setUrl] = useState(urlToCheck || '')
  const [checking, setChecking] = useState(false)
  const [results, setResults] = useState<HealthResult[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { addHealthCheckResult, addNotification } = useLinkStore()

  const handleCheck = useCallback(async () => {
    const checkUrl = url.trim() || urlToCheck?.trim()
    if (!checkUrl) {
      toast.error('Please enter a URL to check')
      return
    }

    setChecking(true)
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: checkUrl }),
      })

      if (!res.ok) {
        throw new Error('Health check failed')
      }

      const json = await res.json()
      const result: HealthResult = json.data

      setResults((prev) => [result, ...prev].slice(0, 10))
      addHealthCheckResult(result)
      addNotification({
        type: 'health_check',
        title: 'Health Check Complete',
        description: `${new URL(result.url).hostname} — ${result.status === 'healthy' ? '✓ Healthy' : result.status === 'warning' ? '⚠ Warning' : '✗ Broken'}`,
      })

      if (result.status === 'healthy') {
        toast.success('Link is healthy!', { description: result.message })
      } else if (result.status === 'warning') {
        toast.warning('Link has warnings', { description: result.message })
      } else {
        toast.error('Link is broken', { description: result.message })
      }
    } catch {
      toast.error('Failed to check link health')
    } finally {
      setChecking(false)
    }
  }, [url, urlToCheck, addHealthCheckResult, addNotification])

  return (
    <div className="glass-card p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <HeartPulse className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Link Health Checker</h3>
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to check..."
          className="h-8 text-xs bg-background/40 border-border/50 focus:border-primary/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !checking) handleCheck()
          }}
        />
        <Button
          onClick={handleCheck}
          disabled={checking || !url.trim()}
          size="sm"
          className="shrink-0 h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {checking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <HeartPulse className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline">Check</span>
        </Button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {results.map((result, index) => {
                const config = statusConfig[result.status]
                const StatusIcon = config.icon
                const isExpanded = expandedIndex === index

                return (
                  <motion.div
                    key={`${result.url}-${result.checkedAt}`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`rounded-lg border p-3 transition-all cursor-pointer ${config.bgColor}`}
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {result.url}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {config.label} • {result.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {result.httpStatus && (
                          <span className={`text-[10px] font-mono ${config.color}`}>
                            {result.httpStatus}
                          </span>
                        )}
                        {result.responseTime !== null && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {result.responseTime}ms
                          </span>
                        )}
                        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 pt-2 border-t border-border/20 space-y-1.5">
                            {result.finalUrl !== result.url && (
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground/50 uppercase tracking-wider">Final URL</span>
                                <span className="text-foreground truncate">{result.finalUrl}</span>
                              </div>
                            )}
                            {result.redirectChain.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">Redirect Chain</span>
                                {result.redirectChain.map((redirectUrl, i) => (
                                  <div key={i} className="flex items-center gap-1 text-[10px]">
                                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />
                                    <span className="text-foreground truncate">{redirectUrl}</span>
                                    {i < result.redirectChain.length - 1 && (
                                      <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/20 shrink-0" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[10px]">
                              <Clock className="h-2.5 w-2.5 text-muted-foreground/40" />
                              <span className="text-muted-foreground">
                                {new Date(result.checkedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <ShieldCheck className="h-8 w-8 text-muted-foreground/15 mb-2" />
          <p className="text-xs text-muted-foreground">Paste a URL and check its health</p>
          <p className="text-[10px] text-muted-foreground/50 mt-1">Detects broken links, slow redirects, and errors</p>
        </div>
      )}
    </div>
  )
}
