/**
 * URL sanitizer for VeillePulse
 * Prevents broken URLs, Google Fonts stylesheet leaks, and generic root pages
 */
export function getSafeArticleUrl(url: string | undefined | null, title: string, source: string): string {
  if (
    !url ||
    typeof url !== 'string' ||
    url.includes('fonts.googleapis') ||
    url.includes('fonts.gstatic') ||
    url.endsWith('.css') ||
    url.includes('stylesheet') ||
    url.trim() === ''
  ) {
    const cleanTitle = (title || '').replace(/[:"«»]/g, ' ').trim().slice(0, 65);
    return `https://www.google.com/search?q=${encodeURIComponent('"' + cleanTitle + '" ' + (source || 'Presse'))}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('googleapis') || parsed.pathname.endsWith('.css')) {
      const cleanTitle = (title || '').replace(/[:"«»]/g, ' ').trim().slice(0, 65);
      return `https://www.google.com/search?q=${encodeURIComponent('"' + cleanTitle + '" ' + (source || 'Presse'))}`;
    }
    return url;
  } catch {
    const cleanTitle = (title || '').replace(/[:"«»]/g, ' ').trim().slice(0, 65);
    return `https://www.google.com/search?q=${encodeURIComponent('"' + cleanTitle + '" ' + (source || 'Presse'))}`;
  }
}
