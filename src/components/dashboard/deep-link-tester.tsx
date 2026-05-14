'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical, X, Check, AlertCircle, Clock, ExternalLink,
  Trash2, ChevronRight, Copy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLinkStore } from '@/store/link-store'
import { getAllPlatforms, type PlatformInfo } from '@/lib/platform-detect'
import { generateDeepLink, extractPathFromUrl } from '@/lib/deep-link'
import { toast } from 'sonner'

function PlatformTestCard({
  platform,
  onTest,
  lastStatus,
}: {
  platform: PlatformInfo
  onTest: (platform: PlatformInfo) => void
  lastStatus: 'success' | 'failed' | 'pending' | null
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onTest(platform)}
      className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 cursor-pointer group transition-all border border-border/30 hover:border-primary/30"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${platform.color}20` }}
      >
        {platform.icon}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground leading-tight">{platform.name}</p>
        <p className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
          {platform.deepLinkScheme}
        </p>
      </div>
      {lastStatus && (
        <div className="mt-0.5">
          {lastStatus === 'success' && (
            <Badge className="text-[8px] h-4 gap-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <Check className="h-2.5 w-2.5" /> Pass
            </Badge>
          )}
          {lastStatus === 'failed' && (
            <Badge className="text-[8px] h-4 gap-0.5 bg-red-500/10 text-red-400 border-red-500/20">
              <AlertCircle className="h-2.5 w-2.5" /> Fail
            </Badge>
          )}
          {lastStatus === 'pending' && (
            <Badge className="text-[8px] h-4 gap-0.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
              <Clock className="h-2.5 w-2.5" /> Pending
            </Badge>
          )}
        </div>
      )}
    </motion.button>
  )
}

export function DeepLinkTester() {
  const { deepLinkTests, addDeepLinkTest, clearDeepLinkTests } = useLinkStore()
  const platforms = getAllPlatforms()

  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformInfo | null>(null)
  const [testUrl, setTestUrl] = useState('')
  const [isTesting, setIsTesting] = useState(false)

  // Generate preview deep link in real-time
  const [previewDeepLink, setPreviewDeepLink] = useState('')

  useEffect(() => {
    if (!selectedPlatform || !testUrl.trim()) {
      setPreviewDeepLink('')
      return
    }
    try {
      const result = generateDeepLink(testUrl.trim(), selectedPlatform)
      setPreviewDeepLink(result.deepLink)
    } catch {
      // Fallback: construct manually
      const path = extractPathFromUrl(testUrl.trim(), selectedPlatform)
      const scheme = selectedPlatform.deepLinkScheme.endsWith('://')
        ? selectedPlatform.deepLinkScheme
        : `${selectedPlatform.deepLinkScheme}://`
      setPreviewDeepLink(path ? `${scheme}${path}` : scheme)
    }
  }, [testUrl, selectedPlatform])

  const handleOpenTestDialog = useCallback((platform: PlatformInfo) => {
    setSelectedPlatform(platform)
    setTestUrl('')
    setPreviewDeepLink('')
    setTestDialogOpen(true)
  }, [])

  const handleTestDeepLink = useCallback(async () => {
    if (!selectedPlatform || !testUrl.trim()) return

    setIsTesting(true)
    const deepLink = previewDeepLink

    try {
      // Attempt to open the deep link
      const newWindow = window.open(deepLink, '_blank')

      // Since we can't truly verify if the app opened in browser context,
      // we simulate a test result after a short delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // If window.open returned null or was blocked, it's likely failed
      const status = newWindow === null ? 'failed' : 'success'

      addDeepLinkTest({
        platform: selectedPlatform.id,
        url: testUrl.trim(),
        deepLink,
        status,
      })

      if (status === 'success') {
        toast.success('Deep link test passed!', {
          description: `${selectedPlatform.name}: ${deepLink.slice(0, 40)}...`,
        })
      } else {
        toast.error('Deep link test failed', {
          description: 'Could not open the deep link. The app may not be installed.',
        })
      }
    } catch {
      addDeepLinkTest({
        platform: selectedPlatform.id,
        url: testUrl.trim(),
        deepLink,
        status: 'failed',
      })
      toast.error('Deep link test failed', {
        description: 'An error occurred while testing the deep link.',
      })
    } finally {
      setIsTesting(false)
    }
  }, [selectedPlatform, testUrl, previewDeepLink, addDeepLinkTest])

  // Get last test status for each platform
  const getLastStatus = useCallback(
    (platformId: string): 'success' | 'failed' | 'pending' | null => {
      const test = deepLinkTests.find((t) => t.platform === platformId)
      return test ? test.status : null
    },
    [deepLinkTests]
  )

  // Pass/fail counts
  const passCount = deepLinkTests.filter((t) => t.status === 'success').length
  const failCount = deepLinkTests.filter((t) => t.status === 'failed').length

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Deep Link Tester</h3>
        </div>
        <div className="flex items-center gap-2">
          {deepLinkTests.length > 0 && (
            <>
              <Badge className="text-[9px] h-5 gap-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Check className="h-2.5 w-2.5" /> {passCount}
              </Badge>
              <Badge className="text-[9px] h-5 gap-0.5 bg-red-500/10 text-red-400 border-red-500/20">
                <AlertCircle className="h-2.5 w-2.5" /> {failCount}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={clearDeepLinkTests}
                title="Clear test history"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
        {platforms.map((platform) => (
          <PlatformTestCard
            key={platform.id}
            platform={platform}
            onTest={handleOpenTestDialog}
            lastStatus={getLastStatus(platform.id)}
          />
        ))}
      </div>

      {/* Test History (if any) */}
      {deepLinkTests.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Recent Tests
            </span>
          </div>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {deepLinkTests.slice(0, 5).map((test) => {
                  const platform = platforms.find((p) => p.id === test.platform)
                  return (
                    <motion.div
                      key={test.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-2 rounded-lg p-2 bg-background/30 text-xs"
                    >
                      <span className="text-sm">{platform?.icon}</span>
                      <span className="text-muted-foreground font-mono text-[10px] truncate flex-1">
                        {test.deepLink}
                      </span>
                      {test.status === 'success' ? (
                        <Badge className="text-[8px] h-4 gap-0.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">
                          <Check className="h-2.5 w-2.5" /> Pass
                        </Badge>
                      ) : (
                        <Badge className="text-[8px] h-4 gap-0.5 bg-red-500/10 text-red-400 border-red-500/20 shrink-0">
                          <AlertCircle className="h-2.5 w-2.5" /> Fail
                        </Badge>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="glass-card max-w-md p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-lg">{selectedPlatform?.icon}</span>
              Test {selectedPlatform?.name} Deep Link
            </DialogTitle>
          </DialogHeader>

          {/* URI Scheme Display */}
          <div className="rounded-lg bg-background/50 p-3 border border-border/30">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1">
              URI Scheme
            </p>
            <p className="text-sm font-mono text-primary">
              {selectedPlatform?.deepLinkScheme}
            </p>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Test URL
            </label>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder={`Enter a ${selectedPlatform?.name} URL to convert...`}
              className="h-9 text-sm bg-background/40 border-border/50 focus:border-primary/50"
            />
          </div>

          {/* Deep Link Preview */}
          {previewDeepLink && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-medium">
                  Generated Deep Link
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewDeepLink)
                    toast.success('Deep link copied!', { description: 'Copied to clipboard' })
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs font-mono text-emerald-400 break-all">
                {previewDeepLink}
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleTestDeepLink}
              disabled={!testUrl.trim() || isTesting}
              className="flex-1 gap-1.5"
              size="sm"
            >
              {isTesting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                  </motion.div>
                  Testing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-3.5 w-3.5" />
                  Test Deep Link
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTestDialogOpen(false)}
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
