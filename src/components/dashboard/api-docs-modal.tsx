'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, X, Copy, Check, ChevronRight, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ApiEndpoint {
  method: 'GET' | 'POST'
  path: string
  description: string
  requestExample?: string
  responseExample: string
  queryParams?: { name: string; type: string; required: boolean; description: string }[]
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'POST',
    path: '/api/links',
    description: 'Generate a deep link from a social media URL. Detects the platform automatically and returns the native deep link, web URL, fallback URL, and a short code.',
    requestExample: JSON.stringify({
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      customAlias: 'my-video',
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      data: {
        originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: {
          id: 'youtube',
          name: 'YouTube',
          icon: '📺',
          color: '#FF0000',
          deepLinkScheme: 'youtube://',
          category: 'video',
        },
        deepLink: 'youtube://watch?v=dQw4w9WgXcQ',
        webUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        fallbackUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        shortCode: 'my-video',
      },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/links',
    description: 'Retrieve a paginated list of all generated links from the database.',
    queryParams: [
      { name: 'limit', type: 'number', required: false, description: 'Number of results per page (default: 20)' },
      { name: 'offset', type: 'number', required: false, description: 'Number of results to skip (default: 0)' },
    ],
    responseExample: JSON.stringify({
      success: true,
      data: [
        {
          id: 'cm3x...',
          originalUrl: 'https://youtube.com/watch?v=abc',
          platform: 'youtube',
          deepLink: 'youtube://watch?v=abc',
          shortCode: 'xK9mP2',
          openCount: 42,
          createdAt: '2024-01-15T10:30:00Z',
        },
      ],
      pagination: { total: 150, limit: 20, offset: 0 },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/analytics',
    description: 'Retrieve comprehensive analytics data including platform distribution, conversion rates, hourly breakdown, top performing links, and device breakdown.',
    queryParams: [
      { name: 'days', type: 'number', required: false, description: 'Number of days to look back (default: 30)' },
      { name: 'range', type: 'string', required: false, description: 'Predefined range: "7d", "30d", "90d"' },
    ],
    responseExample: JSON.stringify({
      success: true,
      data: {
        totalLinks: 150,
        totalOpens: 1247,
        nativeOpens: 892,
        browserOpens: 355,
        conversionRate: 71.53,
        topPlatforms: [
          { platform: 'youtube', count: 45, percentage: 30.0, color: '#FF0000' },
        ],
        hourlyBreakdown: [
          { hour: 9, label: '09:00', opens: 12, nativeOpens: 8 },
        ],
        topPerformingLinks: [
          { id: 'cm3x...', originalUrl: 'https://...', openCount: 42, nativeOpenRate: 85.0 },
        ],
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/analytics',
    description: 'Record an analytics event when a link is opened. Tracks device, browser, OS, and whether it was a native app open.',
    requestExample: JSON.stringify({
      linkId: 'cm3x...',
      platform: 'youtube',
      device: 'mobile',
      browser: 'safari',
      os: 'ios',
      isNative: true,
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/qrcode',
    description: 'Generate a QR code image for any URL. Returns a base64-encoded data URL that can be used directly in an img tag.',
    requestExample: JSON.stringify({
      url: 'youtube://watch?v=dQw4w9WgXcQ',
      size: 256,
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      data: {
        qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgo...',
        url: 'youtube://watch?v=dQw4w9WgXcQ',
        size: 256,
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/health',
    description: 'Check if a URL is reachable. Returns HTTP status, response time, redirect information, and SSL validity. Updates the link health status in the database.',
    requestExample: JSON.stringify({
      url: 'https://www.youtube.com',
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      data: {
        url: 'https://www.youtube.com',
        status: 200,
        responseTime: 142,
        isReachable: true,
        sslValid: true,
        lastChecked: '2024-01-15T10:30:00Z',
      },
    }, null, 2),
  },
  {
    method: 'POST',
    path: '/api/export',
    description: 'Export link history or analytics data as CSV or JSON format. Returns the file content directly with appropriate Content-Type and Content-Disposition headers.',
    requestExample: JSON.stringify({
      format: 'json',
      data: 'links',
    }, null, 2),
    responseExample: '// Response: JSON or CSV file download\n// Content-Type: application/json or text/csv\n// Content-Disposition: attachment; filename="linkverse-links.json"',
  },
  {
    method: 'POST',
    path: '/api/bulk',
    description: 'Process multiple URLs in bulk (max 50). Each URL is independently validated and processed. Returns individual results and a summary with success/failure counts.',
    requestExample: JSON.stringify({
      urls: [
        'https://www.youtube.com/watch?v=abc',
        'https://t.me/channel',
        'https://x.com/user/status/123',
      ],
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      data: {
        results: [
          {
            originalUrl: 'https://www.youtube.com/watch?v=abc',
            platform: 'youtube',
            deepLink: 'youtube://watch?v=abc',
            shortCode: 'xK9mP2',
            success: true,
          },
          {
            originalUrl: 'https://invalid-url.xyz',
            platform: null,
            deepLink: null,
            shortCode: null,
            success: false,
            error: 'Unsupported platform',
          },
        ],
        summary: { total: 2, successful: 1, failed: 1 },
      },
    }, null, 2),
  },
  {
    method: 'GET',
    path: '/api/resolve/:code',
    description: 'Resolve a short code to its original link data. Tracks the click in analytics and increments the open count. Returns 410 Gone for expired links.',
    queryParams: [
      { name: 'code', type: 'string', required: true, description: 'The short code to resolve (URL parameter)' },
    ],
    responseExample: JSON.stringify({
      success: true,
      data: {
        originalUrl: 'https://www.youtube.com/watch?v=abc',
        deepLink: 'youtube://watch?v=abc',
        platform: {
          id: 'youtube',
          name: 'YouTube',
          icon: '📺',
          color: '#FF0000',
        },
        shortCode: 'xK9mP2',
        title: 'YouTube Link',
        openCount: 43,
      },
    }, null, 2),
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function MethodBadge({ method }: { method: 'GET' | 'POST' }) {
  return (
    <Badge
      variant="outline"
      className={`text-[9px] font-bold px-1.5 py-0 border-0 ${
        method === 'GET'
          ? 'bg-emerald-500/15 text-emerald-400'
          : 'bg-amber-500/15 text-amber-400'
      }`}
    >
      {method}
    </Badge>
  )
}

function EndpointCard({ endpoint, index }: { endpoint: ApiEndpoint; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="rounded-lg border border-border/30 bg-background/40 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-accent/20 transition-colors text-left"
      >
        <MethodBadge method={endpoint.method} />
        <code className="text-xs font-mono text-foreground/80 flex-1 truncate">
          {endpoint.path}
        </code>
        <ChevronRight
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3 border-t border-border/20 pt-3">
              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {endpoint.description}
              </p>

              {/* Query Parameters */}
              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">Parameters</p>
                  <div className="space-y-1">
                    {endpoint.queryParams.map((param) => (
                      <div key={param.name} className="flex items-start gap-2 text-[11px]">
                        <code className="text-primary/80 font-mono shrink-0">{param.name}</code>
                        <Badge variant="outline" className="text-[8px] h-4 px-1 border-0 bg-muted/40">
                          {param.type}
                        </Badge>
                        {param.required && (
                          <Badge variant="outline" className="text-[8px] h-4 px-1 border-red-500/30 text-red-400">
                            required
                          </Badge>
                        )}
                        <span className="text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Example */}
              {endpoint.requestExample && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
                      Request Body
                    </p>
                    <CopyButton text={endpoint.requestExample} />
                  </div>
                  <pre className="code-preview p-2.5 rounded-md text-[10px] font-mono text-foreground/70 overflow-x-auto max-h-40 whitespace-pre-wrap break-all">
                    {endpoint.requestExample}
                  </pre>
                </div>
              )}

              {/* Response Example */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-wider">
                    Response
                  </p>
                  <CopyButton text={endpoint.responseExample} />
                </div>
                <pre className="code-preview p-2.5 rounded-md text-[10px] font-mono text-foreground/70 overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                  {endpoint.responseExample}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function ApiDocsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEndpoints = API_ENDPOINTS.filter(
    (ep) =>
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden glass-card border-border/30">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            API Documentation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            LinkVerse REST API reference. All endpoints accept and return JSON.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search endpoints..."
            className="w-full h-8 bg-background/40 border border-border/30 rounded-md px-3 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Quick Stats */}
        <div className="px-6 pt-2 flex items-center gap-3 text-[10px] text-muted-foreground/60">
          <span>{API_ENDPOINTS.length} endpoints</span>
          <span>•</span>
          <span>Base URL: <code className="text-primary/60">/api</code></span>
          <span>•</span>
          <span>Content-Type: <code className="text-primary/60">application/json</code></span>
        </div>

        {/* Endpoints List */}
        <ScrollArea className="max-h-[55vh] px-6 pb-6">
          <div className="space-y-2 pt-2">
            {filteredEndpoints.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No matching endpoints found
              </div>
            ) : (
              filteredEndpoints.map((endpoint, index) => (
                <EndpointCard key={endpoint.path + endpoint.method} endpoint={endpoint} index={index} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/20 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/40">
            Click an endpoint to expand details
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1.5 text-muted-foreground"
            onClick={() => {
              const allDocs = API_ENDPOINTS.map(ep => `${ep.method} ${ep.path}\n${ep.description}`).join('\n\n')
              navigator.clipboard.writeText(allDocs)
              toast.success('API docs copied to clipboard')
            }}
          >
            <Copy className="h-3 w-3" />
            Copy All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
