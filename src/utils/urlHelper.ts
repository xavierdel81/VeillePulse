/**
 * URL sanitizer for VeillePulse
 * Prevents broken URLs, Google Fonts stylesheet leaks, and generic root pages
 */
export function isRootHomepageUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '');
    return path === '' || path === '/' || path.length === 0;
  } catch {
    return false;
  }
}

export function getSafeArticleUrl(url: string | undefined | null, title: string, source: string): string {
  const cleanTitle = (title || '').replace(/[:"«»]/g, ' ').trim().slice(0, 65);
  const searchFallback = `https://www.google.com/search?q=${encodeURIComponent('"' + cleanTitle + '" ' + (source || 'Presse'))}`;

  if (
    !url ||
    typeof url !== 'string' ||
    url.includes('fonts.googleapis') ||
    url.includes('fonts.gstatic') ||
    url.endsWith('.css') ||
    url.includes('stylesheet') ||
    url.trim() === ''
  ) {
    return searchFallback;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('googleapis') || parsed.pathname.endsWith('.css')) {
      return searchFallback;
    }
    // If the URL is just the bare domain root (e.g. https://www.telesambre.be/ or https://www.lalibre.be/)
    // and we have a specific article title, provide a targeted search or keep the deep link
    const path = parsed.pathname.replace(/\/+$/, '');
    if ((path === '' || path === '/') && cleanTitle.length > 5) {
      // Direct the reader directly to the specific article via Google Search index on the target domain
      return `https://www.google.com/search?q=${encodeURIComponent('site:' + parsed.hostname + ' "' + cleanTitle + '"')}`;
    }
    return url;
  } catch {
    return searchFallback;
  }
}
