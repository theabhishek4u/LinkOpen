'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, Search, Copy, Check, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ChainNode {
  url: string
  statusCode: number | null
  responseTime: number | null
  redirectType: number | null
  headers?: Record<string, string>
}

function truncateUrl(url: string, maxLen: number = 45): string {
  if (url.length <= maxLen) return url
  try {
    const parsed = new URL(url)
    const path = parsed.pathname + parsed.search
    const host = parsed.host
    if (host.length + path.length > maxLen) {
      return host + path.slice(0, maxLen - host.length - 3) + '...'
    }
    return url
  } catch {
    return url.slice(0, maxLen) + '...'
  }
}

function getStatusColor(statusCode: number | null): string {
  if (!statusCode) return 'text-red-400'
  if (statusCode >= 200 && statusCode < 300) return 'text-emerald-400'
  if (statusCode >= 300 && statusCode < 400) return 'text-amber-400'
  return 'text-red-400'
}

function getStatusBg(statusCode: number | null): string {
  if (!statusCode) return 'bg-red-500/10 border-red-500/20'
  if (statusCode >= 200 && statusCode < 300) return 'bg-emerald-500/10 border-emerald-500/20'
  if (statusCode >= 300 && statusCode < 400) return 'bg-amber-500/10 border-amber-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

function getStatusIcon(statusCode: number | null) {
  if (!statusCode) return AlertCircle
  if (statusCode >= 200 && statusCode < 300) return CheckCircle2
  if (statusCode >= 300 && statusCode < 400) return AlertTriangle
  return AlertCircle
}

export function RedirectChain() {
  const [url, setUrl] = useState('')
  const [isTracing, setIsTracing] = useState(false)
  const [chain, setChain] = useState<ChainNode[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set())
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrace = useCallback(async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL')
      return
    }

    setIsTracing(true)
    setError(null)
    setChain([])

    try {
      const normalizedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`
      const nodes: ChainNode[] = []
      let currentUrl: string | null = normalizedUrl
      const maxRedirects = 10

      for (let i = 0; i < maxRedirects && currentUrl; i++) {
        const startTime = Date.now()
        let statusCode: number | null = null
        let redirectLocation: string | null = null
        let responseHeaders: Record<string, string> = {}
        let responseTime: number

        try {
          const response = await fetch('/api/health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentUrl }),
          })

          responseTime = Date.now() - startTime

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              statusCode = data.data.status
              redirectLocation = data.data.redirectUrl || null
              responseHeaders = {
                'content-type': 'text/html',
                'server': 'detected',
              }
            }
          } else {
            responseTime = Date.now() - startTime
            statusCode = response.status
          }
        } catch {
          responseTime = Date.now() - startTime
          statusCode = null
        }

        const isRedirect = statusCode !== null && statusCode >= 300 && statusCode < 400

        nodes.push({
          url: currentUrl,
          statusCode,
          responseTime,
          redirectType: isRedirect ? statusCode : null,
          headers: Object.keys(responseHeaders).length > 0 ? responseHeaders : undefined,
        })

        if (isRedirect && redirectLocation) {
          // Resolve relative redirects
          if (redirectLocation.startsWith('/')) {
            try {
              const base = new URL(currentUrl)
              currentUrl = `${base.protocol}//${base.host}${redirectLocation}`
            } catch {
              currentUrl = null
            }
          } else if (redirectLocation.startsWith('http')) {
            currentUrl = redirectLocation
          } else {
            currentUrl = null
          }
        } else {
          currentUrl = null
        }
      }

      setChain(nodes)
    } catch (err) {
      setError('Failed to trace redirect chain. Please try again.')
    } finally {
      setIsTracing(false)
    }
  }, [url])

  const toggleExpand = useCallback((index: number) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  const handleCopyUrl = useCallback(async (nodeUrl: string, index: number) => {
    try {
      await navigator.clipboard.writeText(nodeUrl)
      setCopiedIndex(index)
      toast.success('URL copied!', { duration: 1500 })
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error('Failed to copy URL')
    }
  }, [])

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <GitBranch className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Redirect Chain Tracer</h3>
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrace()}
            placeholder="Enter URL to trace redirects..."
            className="w-full rounded-lg bg-background/50 border border-border/40 text-sm text-foreground pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors font-mono"
          />
        </div>
        <Button
          size="sm"
          onClick={handleTrace}
          disabled={isTracing || !url.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shrink-0"
        >
          {isTracing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GitBranch className="h-3.5 w-3.5" />
          )}
          Trace
        </Button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="rounded-lg bg-red-500/10 border border-red-500/20 p-3"
          >
            <p className="text-xs text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chain Visualization */}
      <AnimatePresence>
        {chain.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-0"
          >
            {chain.map((node, index) => {
              const StatusIcon = getStatusIcon(node.statusCode)
              const isLast = index === chain.length - 1
              const isFinalDestination = isLast && node.statusCode !== null && node.statusCode >= 200 && node.statusCode < 300
              const isExpanded = expandedNodes.has(index)

              return (
                <div key={index}>
                  {/* Node */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <div
                      className={`rounded-lg border p-3 ${getStatusBg(node.statusCode)} ${
                        isFinalDestination ? 'ring-1 ring-emerald-500/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Status Icon */}
                        <StatusIcon className={`h-4 w-4 shrink-0 mt-0.5 ${getStatusColor(node.statusCode)}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Status Code Badge */}
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${getStatusColor(node.statusCode)} bg-background/50`}>
                              {node.statusCode || 'ERR'}
                            </span>

                            {/* URL */}
                            <Tooltip>
                              <p className="text-xs font-mono text-foreground/80 break-all">
                                {truncateUrl(node.url, 60)}
                              </p>
                            </Tooltip>

                            {/* Final destination checkmark */}
                            {isFinalDestination && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-400 font-medium">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Final
                              </span>
                            )}

                            {/* Redirect type label */}
                            {node.redirectType && (
                              <span className="text-[10px] text-amber-400 font-mono font-medium">
                                {node.redirectType === 301 ? '301 Permanent' :
                                 node.redirectType === 302 ? '302 Found' :
                                 node.redirectType === 307 ? '307 Temporary' :
                                 node.redirectType === 308 ? '308 Permanent' :
                                 `${node.redirectType} Redirect`}
                              </span>
                            )}
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 mt-1.5">
                            {node.responseTime !== null && (
                              <span className="text-[10px] text-muted-foreground">
                                {node.responseTime}ms
                              </span>
                            )}
                            <button
                              onClick={() => toggleExpand(index)}
                              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors focus-visible-ring rounded"
                            >
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {isExpanded ? 'Less' : 'Details'}
                            </button>
                            <button
                              onClick={() => handleCopyUrl(node.url, index)}
                              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors focus-visible-ring rounded"
                            >
                              {copiedIndex === index ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              {copiedIndex === index ? 'Copied' : 'Copy'}
                            </button>
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 rounded-md bg-background/30 p-2 space-y-1">
                                  <div>
                                    <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Full URL</span>
                                    <p className="text-[11px] font-mono text-foreground/70 break-all">{node.url}</p>
                                  </div>
                                  {node.headers && Object.keys(node.headers).length > 0 && (
                                    <div>
                                      <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Headers</span>
                                      <div className="space-y-0.5">
                                        {Object.entries(node.headers).map(([key, val]) => (
                                          <p key={key} className="text-[11px] font-mono text-foreground/50">
                                            <span className="text-amber-400/70">{key}:</span> {val}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Connection arrow between nodes */}
                  {!isLast && chain[index + 1]?.redirectType && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.15 + 0.1 }}
                      className="flex items-center justify-center py-1"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-px h-3 bg-amber-500/30" />
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-mono text-amber-400/70 font-bold">
                            {chain[index + 1].redirectType}
                          </span>
                          <span className="text-[9px] text-muted-foreground/40">→</span>
                        </div>
                        <div className="w-px h-3 bg-amber-500/30" />
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {chain.length === 0 && !isTracing && !error && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/30 mb-2">
            <GitBranch className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-xs text-muted-foreground/60">Enter a URL and click Trace to visualize redirects</p>
        </div>
      )}
    </div>
  )
}

// Simple Tooltip inline since we may not have it imported
function Tooltip({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 flex-1">{children}</div>
}
