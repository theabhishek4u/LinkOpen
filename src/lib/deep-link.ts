// ============================================================================
// Deep Link Generation Library
// Generates platform-specific deep links from web URLs
// ============================================================================

import type { PlatformInfo } from './platform-detect';

// Re-export PlatformInfo so consumers only need to import from this module
export type { PlatformInfo };

/**
 * Result of deep link generation
 */
export interface DeepLinkResult {
  originalUrl: string;
  platform: PlatformInfo;
  deepLink: string;
  webUrl: string;
  fallbackUrl: string;
  shortCode?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Safely parse a URL, returning null on failure instead of throwing.
 */
function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/**
 * Extract the pathname segments, filtering out empty strings.
 */
function getPathSegments(url: URL): string[] {
  return url.pathname.split('/').filter((s) => s.length > 0);
}

// ============================================================================
// Platform-specific path extraction
// ============================================================================

/**
 * Extract the relevant deep-link path/parameters from a web URL for a given
 * platform.
 *
 * Each platform has its own URL structure, so we handle them individually.
 * Returns the path component that should be appended to the platform's
 * deep-link scheme (e.g. "user/profile" from instagram.com/user/profile
 * becomes "user/profile" which is then combined with "instagram://").
 */
export function extractPathFromUrl(url: string, platform: PlatformInfo): string {
  const parsed = safeParseUrl(url);
  if (!parsed) {
    return '';
  }

  const segments = getPathSegments(parsed);
  const params = parsed.searchParams;

  switch (platform.id) {
    // ---- Instagram ----
    case 'instagram': {
      // instagram.com/{username} → user?username={username}
      // instagram.com/p/{shortcode} → media?shortcode={shortcode}
      // instagram.com/reel/{shortcode} → media?shortcode={shortcode}
      if (segments.length >= 2 && (segments[0] === 'p' || segments[0] === 'reel')) {
        return `media?shortcode=${encodeURIComponent(segments[1])}`;
      }
      if (segments.length >= 1) {
        return `user?username=${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- YouTube ----
    case 'youtube': {
      // youtube.com/watch?v={id} → video/{id}
      // youtu.be/{id} → video/{id}
      // youtube.com/shorts/{id} → video/{id}
      const videoId =
        params.get('v') ??
        (parsed.hostname === 'youtu.be' ? segments[0] : undefined) ??
        (segments[0] === 'shorts' && segments[1] ? segments[1] : undefined) ??
        (segments[0] === 'watch' && segments[1] ? segments[1] : undefined);

      if (videoId) {
        return `video/${encodeURIComponent(videoId)}`;
      }
      // Channel: youtube.com/@{handle} or youtube.com/c/{name}
      if (segments.length >= 1) {
        const handle = segments[0].startsWith('@') ? segments[0] : segments[0];
        return `channel/${encodeURIComponent(handle)}`;
      }
      return '';
    }

    // ---- Facebook ----
    case 'facebook': {
      // facebook.com/{profile} → profile/{profile}
      // facebook.com/{profile}/posts/{id} → post/{id}
      if (segments.length >= 3 && segments[1] === 'posts') {
        return `post/${encodeURIComponent(segments[2])}`;
      }
      if (segments.length >= 1 && segments[0] !== 'watch' && segments[0] !== 'login') {
        return `profile/${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- TikTok ----
    case 'tiktok': {
      // tiktok.com/@{user}/video/{id} → user?username={user}&video={id}
      // tiktok.com/@{user} → user?username={user}
      // vm.tiktok.com/{shortId} → video?id={shortId}
      if (parsed.hostname === 'vm.tiktok.com' && segments.length >= 1) {
        return `video?id=${encodeURIComponent(segments[0])}`;
      }
      if (segments.length >= 3 && segments[1] === 'video') {
        const user = segments[0].startsWith('@') ? segments[0].slice(1) : segments[0];
        return `user?username=${encodeURIComponent(user)}&video=${encodeURIComponent(segments[2])}`;
      }
      if (segments.length >= 1 && segments[0].startsWith('@')) {
        return `user?username=${encodeURIComponent(segments[0].slice(1))}`;
      }
      return '';
    }

    // ---- Telegram ----
    case 'telegram': {
      // t.me/{username} → resolve?domain={username}
      // t.me/{username}/{messageId} → resolve?domain={username}&post={messageId}
      // telegram.me/{username} → same as above
      if (segments.length >= 2) {
        return `resolve?domain=${encodeURIComponent(segments[0])}&post=${encodeURIComponent(segments[1])}`;
      }
      if (segments.length >= 1) {
        return `resolve?domain=${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- WhatsApp ----
    case 'whatsapp': {
      // wa.me/{phone} → send?phone={phone}
      // whatsapp.com/send → send (with query params preserved)
      if (segments.length >= 1) {
        return `send?phone=${encodeURIComponent(segments[0])}`;
      }
      return 'send';
    }

    // ---- X / Twitter ----
    case 'x': {
      // x.com/{user}/status/{id} → user?screen_name={user}&status_id={id}
      // x.com/{user} → user?screen_name={user}
      if (segments.length >= 3 && segments[1] === 'status') {
        return `user?screen_name=${encodeURIComponent(segments[0])}&status_id=${encodeURIComponent(segments[2])}`;
      }
      if (segments.length >= 1) {
        return `user?screen_name=${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- Snapchat ----
    case 'snapchat': {
      // snapchat.com/add/{username} → add/{username}
      // snapchat.com/u/{username} → add/{username}
      if (segments.length >= 2 && (segments[0] === 'add' || segments[0] === 'u')) {
        return `add/${encodeURIComponent(segments[1])}`;
      }
      if (segments.length >= 1) {
        return `add/${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- LinkedIn ----
    case 'linkedin': {
      // linkedin.com/in/{username} → profile?username={username}
      // linkedin.com/company/{name} → company?name={name}
      if (segments.length >= 2) {
        if (segments[0] === 'in') {
          return `profile?username=${encodeURIComponent(segments[1])}`;
        }
        if (segments[0] === 'company') {
          return `company?name=${encodeURIComponent(segments[1])}`;
        }
      }
      return '';
    }

    // ---- Pinterest ----
    case 'pinterest': {
      // pinterest.com/pin/{id} → pin/{id}
      // pinterest.com/{username} → user?username={username}
      if (segments.length >= 2 && segments[0] === 'pin') {
        return `pin/${encodeURIComponent(segments[1])}`;
      }
      if (segments.length >= 1) {
        return `user?username=${encodeURIComponent(segments[0])}`;
      }
      return '';
    }

    // ---- Reddit ----
    case 'reddit': {
      // reddit.com/r/{subreddit} → r/{subreddit}
      // reddit.com/r/{subreddit}/comments/{id} → r/{subreddit}/comments/{id}
      // redd.it/{id} → comments/{id}
      if (parsed.hostname === 'redd.it' && segments.length >= 1) {
        return `comments/${encodeURIComponent(segments[0])}`;
      }
      if (segments.length >= 4 && segments[0] === 'r' && segments[2] === 'comments') {
        return `r/${encodeURIComponent(segments[1])}/comments/${encodeURIComponent(segments[3])}`;
      }
      if (segments.length >= 2 && segments[0] === 'r') {
        return `r/${encodeURIComponent(segments[1])}`;
      }
      return '';
    }

    // ---- Discord ----
    case 'discord': {
      // discord.gg/{code} → invite/{code}
      // discord.com/invite/{code} → invite/{code}
      // discord.com/channels/{guild}/{channel} → channels/{guild}/{channel}
      if (parsed.hostname.includes('discord.gg') && segments.length >= 1) {
        return `invite/${encodeURIComponent(segments[0])}`;
      }
      if (segments.length >= 2 && segments[0] === 'invite') {
        return `invite/${encodeURIComponent(segments[1])}`;
      }
      if (segments.length >= 3 && segments[0] === 'channels') {
        return `channels/${encodeURIComponent(segments[1])}/${encodeURIComponent(segments[2])}`;
      }
      return '';
    }

    // ---- Threads ----
    case 'threads': {
      // threads.net/@{username} → user?username={username}
      // threads.net/@{username}/post/{id} → user?username={username}&post={id}
      if (segments.length >= 3 && segments[1] === 'post') {
        const user = segments[0].startsWith('@') ? segments[0].slice(1) : segments[0];
        return `user?username=${encodeURIComponent(user)}&post=${encodeURIComponent(segments[2])}`;
      }
      if (segments.length >= 1) {
        const user = segments[0].startsWith('@') ? segments[0].slice(1) : segments[0];
        return `user?username=${encodeURIComponent(user)}`;
      }
      return '';
    }

    default:
      return '';
  }
}

// ============================================================================
// Core functions
// ============================================================================

/**
 * Build the full deep link URL from a scheme and a path.
 *
 * @param scheme - The deep link scheme (e.g. "instagram://")
 * @param path   - The path/query component (e.g. "user?username=johndoe")
 * @returns The fully-qualified deep link URL
 */
export function buildDeepLinkUrl(scheme: string, path: string): string {
  const cleanScheme = scheme.endsWith('://') ? scheme : `${scheme}://`;
  if (!path) {
    return cleanScheme;
  }
  return `${cleanScheme}${path}`;
}

/**
 * Generate a unique 7-character short code suitable for use in short URLs.
 *
 * Uses a cryptographically-secure random generator when available
 * (crypto.getRandomValues), falling back to Math.random().
 *
 * The alphabet is base62 (a-z, A-Z, 0-9) for URL-friendliness.
 */
export function generateShortCode(): string {
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const CODE_LENGTH = 7;

  // Try crypto.getRandomValues for better randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(CODE_LENGTH);
    crypto.getRandomValues(bytes);
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += ALPHABET[bytes[i] % ALPHABET.length];
    }
    return code;
  }

  // Fallback to Math.random
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Generate a deep link result for a given URL and platform.
 *
 * @param url      - The original web URL
 * @param platform - The detected platform info
 * @returns A DeepLinkResult containing the deep link, web URL, and fallback
 */
export function generateDeepLink(url: string, platform: PlatformInfo): DeepLinkResult {
  const originalUrl = url.trim();

  // Normalise the web URL – ensure it has a protocol
  let webUrl = originalUrl;
  if (!/^https?:\/\//i.test(webUrl)) {
    webUrl = `https://${webUrl}`;
  }

  // Extract the platform-specific path from the URL
  const path = extractPathFromUrl(webUrl, platform);

  // Build the deep link
  const deepLink = buildDeepLinkUrl(platform.deepLinkScheme, path);

  // The fallback URL is the original web URL (for when the deep link
  // cannot be opened, e.g. the app is not installed)
  const fallbackUrl = webUrl;

  return {
    originalUrl,
    platform,
    deepLink,
    webUrl,
    fallbackUrl,
  };
}
