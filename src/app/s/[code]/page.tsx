import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getPlatformById } from '@/lib/platform-detect'

// This is a Server Component that handles short link redirects
// When someone visits /s/{code}, we look up the link and redirect
export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  try {
    // Look up the short code in the database
    const link = await db.link.findUnique({
      where: { shortCode: code },
    })

    if (!link) {
      return (
        <html>
          <head>
            <title>Link Not Found - LinkVerse</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>{`
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex; align-items: center; justify-content: center;
                min-height: 100vh; margin: 0; padding: 20px;
                background: #0a0a0a; color: #fafafa;
              }
              .container { text-align: center; max-width: 400px; }
              .icon { font-size: 48px; margin-bottom: 16px; }
              h1 { font-size: 24px; margin: 0 0 8px; }
              p { color: #888; font-size: 14px; margin: 0 0 24px; }
              a { 
                display: inline-block; padding: 10px 24px;
                background: #10b981; color: white; border-radius: 8px;
                text-decoration: none; font-weight: 500; font-size: 14px;
              }
              a:hover { background: #059669; }
            `}</style>
          </head>
          <body>
            <div className="container">
              <div className="icon">🔗</div>
              <h1>Link Not Found</h1>
              <p>{"This short link doesn't exist or has been removed."}</p>
              <a href="/">Go to LinkVerse</a>
            </div>
          </body>
        </html>
      )
    }

    // Check if the link has expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return (
        <html>
          <head>
            <title>Link Expired - LinkVerse</title>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>{`
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex; align-items: center; justify-content: center;
                min-height: 100vh; margin: 0; padding: 20px;
                background: #0a0a0a; color: #fafafa;
              }
              .container { text-align: center; max-width: 400px; }
              .icon { font-size: 48px; margin-bottom: 16px; }
              h1 { font-size: 24px; margin: 0 0 8px; }
              p { color: #888; font-size: 14px; margin: 0 0 24px; }
              a { 
                display: inline-block; padding: 10px 24px;
                background: #10b981; color: white; border-radius: 8px;
                text-decoration: none; font-weight: 500; font-size: 14px;
              }
              a:hover { background: #059669; }
            `}</style>
          </head>
          <body>
            <div className="container">
              <div className="icon">⏰</div>
              <h1>Link Expired</h1>
              <p>{"This link has expired and is no longer available."}</p>
              <a href="/">Go to LinkVerse</a>
            </div>
          </body>
        </html>
      )
    }

    // Increment open count (best effort)
    try {
      await db.link.update({
        where: { id: link.id },
        data: { openCount: { increment: 1 } },
      })
    } catch {
      // Ignore update errors
    }

    // Track analytics (best effort)
    try {
      await db.analytics.create({
        data: {
          linkId: link.id,
          platform: link.platform,
          isOpened: true,
          isNative: !!link.deepLink,
        },
      })
    } catch {
      // Ignore analytics errors
    }

    // Get platform info
    const platform = getPlatformById(link.platform)
    const platformName = platform?.name || 'App'
    const platformIcon = platform?.icon || '🔗'

    // Build redirect URL - prefer deep link, fall back to original URL
    const deepLink = link.deepLink
    const webUrl = link.originalUrl

    return (
      <html>
        <head>
          <title>{`Opening ${platformName} - LinkVerse`}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          {/* Attempt to open deep link via meta refresh + JS */}
          {deepLink && (
            <meta httpEquiv="refresh" content={`0;url=${deepLink}`} />
          )}
        </head>
        <body>
          <style>{`
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0; padding: 20px;
              background: #0a0a0a; color: #fafafa;
            }
            .container { text-align: center; max-width: 400px; }
            .icon { font-size: 48px; margin-bottom: 16px; }
            .spinner {
              width: 40px; height: 40px; border: 3px solid #333;
              border-top-color: #10b981; border-radius: 50%;
              animation: spin 0.8s linear infinite; margin: 0 auto 16px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            h1 { font-size: 20px; margin: 0 0 8px; font-weight: 600; }
            p { color: #888; font-size: 14px; margin: 0 0 8px; }
            .deep-link-btn {
              display: inline-block; padding: 12px 28px; margin: 16px 8px;
              background: #10b981; color: white; border-radius: 8px;
              text-decoration: none; font-weight: 500; font-size: 15px;
              border: none; cursor: pointer;
            }
            .deep-link-btn:hover { background: #059669; }
            .web-link-btn {
              display: inline-block; padding: 12px 28px; margin: 16px 8px;
              background: transparent; color: #888; border-radius: 8px;
              text-decoration: none; font-weight: 500; font-size: 14px;
              border: 1px solid #333;
            }
            .web-link-btn:hover { border-color: #666; color: #ccc; }
            .fallback { margin-top: 20px; font-size: 13px; color: #555; }
            .fallback a { color: #10b981; }
          `}</style>

          <div className="container">
            <div className="spinner" />
            <div className="icon">{platformIcon}</div>
            <h1>Opening {platformName}</h1>
            <p>Attempting to open in the {platformName} app...</p>

            <div>
              {deepLink && (
                <a href={deepLink} className="deep-link-btn">
                  Open in {platformName}
                </a>
              )}
              <a href={webUrl} className="web-link-btn">
                Open in Browser
              </a>
            </div>

            <p className="fallback">
              {"Didn't open? "}<a href={webUrl}>Open in browser instead</a>
            </p>
          </div>

          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              var deepLink = ${JSON.stringify(deepLink)};
              var webUrl = ${JSON.stringify(webUrl)};
              var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
              
              if (deepLink && isMobile) {
                // On mobile, try to open the deep link
                // If the app is not installed, fallback to web URL after a timeout
                var startTime = Date.now();
                window.location.href = deepLink;
                
                setTimeout(function() {
                  // If the page is still visible after 2 seconds, the deep link didn't work
                  if (Date.now() - startTime < 3000) {
                    window.location.href = webUrl;
                  }
                }, 2000);
              } else if (!isMobile) {
                // On desktop, just open the web URL
                window.location.href = webUrl;
              }
            })();
          `}} />
        </body>
      </html>
    )
  } catch (error) {
    console.error('Short link resolution error:', error)
    return (
      <html>
        <head>
          <title>Error - LinkVerse</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <style>{`
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0; padding: 20px;
              background: #0a0a0a; color: #fafafa;
            }
            .container { text-align: center; max-width: 400px; }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h1 { font-size: 24px; margin: 0 0 8px; }
            p { color: #888; font-size: 14px; margin: 0 0 24px; }
            a { 
              display: inline-block; padding: 10px 24px;
              background: #10b981; color: white; border-radius: 8px;
              text-decoration: none; font-weight: 500; font-size: 14px;
            }
          `}</style>
          <div className="container">
            <div className="icon">⚠️</div>
            <h1>Something Went Wrong</h1>
            <p>{"We couldn't process this link. Please try again."}</p>
            <a href="/">Go to LinkVerse</a>
          </div>
        </body>
      </html>
    )
  }
}
