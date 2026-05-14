// ============================================================================
// Platform Detection Library
// Detects social media platforms from URLs and provides platform metadata
// ============================================================================

/**
 * Information about a supported social media platform
 */
export interface PlatformInfo {
  id: string;
  name: string;
  icon: string; // lucide icon name or emoji
  color: string; // brand color hex
  deepLinkScheme: string;
  urlPatterns: RegExp[];
  category: 'social' | 'messaging' | 'video' | 'professional' | 'community';
}

// ============================================================================
// Platform Registry — all supported platforms with metadata and URL patterns
// ============================================================================

const PLATFORMS: PlatformInfo[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: '#E4405F',
    deepLinkScheme: 'instagram://',
    urlPatterns: [
      /^https?:\/\/(www\.)?instagram\.com\//i,
      /^https?:\/\/(www\.)?instagr\.am\//i,
    ],
    category: 'social',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '▶️',
    color: '#FF0000',
    deepLinkScheme: 'vnd.youtube://',
    urlPatterns: [
      /^https?:\/\/(www\.)?youtube\.com\//i,
      /^https?:\/\/youtu\.be\//i,
      /^https?:\/\/m\.youtube\.com\//i,
    ],
    category: 'video',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👤',
    color: '#1877F2',
    deepLinkScheme: 'fb://',
    urlPatterns: [
      /^https?:\/\/(www\.)?facebook\.com\//i,
      /^https?:\/\/(www\.)?fb\.com\//i,
      /^https?:\/\/fb\.me\//i,
    ],
    category: 'social',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    deepLinkScheme: 'snssdk1233://',
    urlPatterns: [
      /^https?:\/\/(www\.)?tiktok\.com\//i,
      /^https?:\/\/vm\.tiktok\.com\//i,
    ],
    category: 'video',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#26A5E4',
    deepLinkScheme: 'tg://',
    urlPatterns: [
      /^https?:\/\/t\.me\//i,
      /^https?:\/\/(www\.)?telegram\.me\//i,
    ],
    category: 'messaging',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    deepLinkScheme: 'whatsapp://',
    urlPatterns: [
      /^https?:\/\/wa\.me\//i,
      /^https?:\/\/(www\.)?whatsapp\.com\//i,
    ],
    category: 'messaging',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: '🐦',
    color: '#000000',
    deepLinkScheme: 'twitter://',
    urlPatterns: [
      /^https?:\/\/(www\.)?x\.com\//i,
      /^https?:\/\/(www\.)?twitter\.com\//i,
    ],
    category: 'social',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: '👻',
    color: '#FFFC00',
    deepLinkScheme: 'snapchat://',
    urlPatterns: [
      /^https?:\/\/(www\.)?snapchat\.com\//i,
    ],
    category: 'social',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    deepLinkScheme: 'linkedin://',
    urlPatterns: [
      /^https?:\/\/(www\.)?linkedin\.com\//i,
    ],
    category: 'professional',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    deepLinkScheme: 'pinterest://',
    urlPatterns: [
      /^https?:\/\/(www\.)?pinterest\.com\//i,
      /^https?:\/\/(www\.)?pinterest\.[a-z]{2,}\//i, // pinterest.co.uk, etc.
    ],
    category: 'social',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: '#FF4500',
    deepLinkScheme: 'reddit://',
    urlPatterns: [
      /^https?:\/\/(www\.)?reddit\.com\//i,
      /^https?:\/\/redd\.it\//i,
    ],
    category: 'community',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: '🎮',
    color: '#5865F2',
    deepLinkScheme: 'discord://',
    urlPatterns: [
      /^https?:\/\/(www\.)?discord\.gg\//i,
      /^https?:\/\/(www\.)?discord\.com\//i,
    ],
    category: 'community',
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    color: '#000000',
    deepLinkScheme: 'threads://',
    urlPatterns: [
      /^https?:\/\/(www\.)?threads\.net\//i,
    ],
    category: 'social',
  },
];

// Index for fast lookups by ID
const PLATFORM_BY_ID = new Map<string, PlatformInfo>(
  PLATFORMS.map((p) => [p.id, p])
);

// ============================================================================
// Exported Functions
// ============================================================================

/**
 * Detect which social media platform a URL belongs to.
 *
 * @param url - The URL to analyse
 * @returns The matching PlatformInfo, or null if the URL does not match any
 *          supported platform
 */
export function detectPlatform(url: string): PlatformInfo | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();

  for (const platform of PLATFORMS) {
    for (const pattern of platform.urlPatterns) {
      if (pattern.test(trimmed)) {
        return platform;
      }
    }
  }

  return null;
}

/**
 * Validate and normalise a URL.
 *
 * - Ensures the URL has a valid scheme (adds https:// if missing)
 * - Strips trailing slashes and whitespace
 * - Basic structural validation via the URL constructor
 *
 * @param url - The raw URL string to validate
 * @returns An object with `valid`, `normalizedUrl`, and an optional `error`
 */
export function validateUrl(url: string): {
  valid: boolean;
  normalizedUrl: string;
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return { valid: false, normalizedUrl: '', error: 'URL is required' };
  }

  let normalized = url.trim();

  // Remove tracking parameters early so they don't interfere
  // (we keep them in the normalised URL but note their presence)

  // Add protocol if missing
  if (!/^https?:\/\//i.test(normalized)) {
    // Check if it looks like a domain (contains a dot)
    if (/^[a-zA-Z0-9].*\..+/.test(normalized)) {
      normalized = `https://${normalized}`;
    } else {
      return {
        valid: false,
        normalizedUrl: normalized,
        error: 'URL must include a valid domain',
      };
    }
  }

  // Validate via the URL constructor
  try {
    const parsed = new URL(normalized);

    // Ensure the hostname looks like a domain
    if (!parsed.hostname.includes('.')) {
      return {
        valid: false,
        normalizedUrl: normalized,
        error: 'URL hostname is invalid',
      };
    }

    // Strip trailing slash from pathname (unless it's just "/")
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return {
      valid: true,
      normalizedUrl: parsed.toString(),
    };
  } catch {
    return {
      valid: false,
      normalizedUrl: normalized,
      error: 'URL is malformed',
    };
  }
}

/**
 * Return the full list of supported platforms.
 */
export function getAllPlatforms(): PlatformInfo[] {
  return [...PLATFORMS];
}

/**
 * Look up a platform by its unique identifier.
 *
 * @param id - The platform ID (e.g. "instagram", "youtube")
 * @returns The matching PlatformInfo, or undefined if not found
 */
export function getPlatformById(id: string): PlatformInfo | undefined {
  return PLATFORM_BY_ID.get(id);
}
