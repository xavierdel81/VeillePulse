/**
 * Authentic visual branding and emblems for Belgian & International Francophone Press & Citizen Watchdogs
 */

export interface SourceBranding {
  name: string;
  shortName: string;
  badgeBg: string;
  badgeTextColor: string;
  borderColor: string;
  logoUrl?: string;
  initials: string;
  accentColor: string;
}

export const SOURCE_BRANDINGS: Record<string, SourceBranding> = {
  'rtbf': {
    name: 'RTBF Info',
    shortName: 'RTBF',
    badgeBg: 'bg-blue-600',
    badgeTextColor: 'text-white',
    borderColor: 'border-blue-700',
    initials: 'RTBF',
    accentColor: '#0055a5',
  },
  'le soir': {
    name: 'Le Soir',
    shortName: 'Le Soir',
    badgeBg: 'bg-red-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-red-800',
    initials: 'SOIR',
    accentColor: '#b91c1c',
  },
  'la libre': {
    name: 'La Libre Belgique',
    shortName: 'La Libre',
    badgeBg: 'bg-sky-800',
    badgeTextColor: 'text-white',
    borderColor: 'border-sky-900',
    initials: 'LIBRE',
    accentColor: '#075985',
  },
  'l\'écho': {
    name: 'L\'Écho',
    shortName: 'L\'Écho',
    badgeBg: 'bg-amber-600',
    badgeTextColor: 'text-white',
    borderColor: 'border-amber-700',
    initials: 'ECHO',
    accentColor: '#d97706',
  },
  'sudinfo': {
    name: 'Sudinfo / Nouvelle Gazette',
    shortName: 'Sudinfo',
    badgeBg: 'bg-yellow-500',
    badgeTextColor: 'text-slate-900',
    borderColor: 'border-yellow-600',
    initials: 'SUD',
    accentColor: '#eab308',
  },
  'dhnet': {
    name: 'La Dernière Heure (DHnet)',
    shortName: 'DHnet',
    badgeBg: 'bg-red-600',
    badgeTextColor: 'text-white',
    borderColor: 'border-red-700',
    initials: 'DH',
    accentColor: '#dc2626',
  },
  'l\'avenir': {
    name: 'L\'Avenir',
    shortName: 'L\'Avenir',
    badgeBg: 'bg-blue-800',
    badgeTextColor: 'text-white',
    borderColor: 'border-blue-900',
    initials: 'AVENIR',
    accentColor: '#1e40af',
  },
  'transparencia': {
    name: 'Transparencia Belgique',
    shortName: 'Transparencia',
    badgeBg: 'bg-cyan-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-cyan-800',
    initials: 'CADA',
    accentColor: '#0e7490',
  },
  'still pissing': {
    name: 'Still Pissing',
    shortName: 'Still Pissing',
    badgeBg: 'bg-amber-500',
    badgeTextColor: 'text-slate-950',
    borderColor: 'border-amber-600',
    initials: 'SP',
    accentColor: '#f59e0b',
  },
  'transparency international': {
    name: 'Transparency International',
    shortName: 'TI Belgium',
    badgeBg: 'bg-blue-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-blue-800',
    initials: 'TI',
    accentColor: '#1d4ed8',
  },
  'mediapart': {
    name: 'Mediapart',
    shortName: 'Mediapart',
    badgeBg: 'bg-stone-900',
    badgeTextColor: 'text-white',
    borderColor: 'border-stone-950',
    initials: 'MP',
    accentColor: '#1c1917',
  },
  'basta': {
    name: 'Basta!',
    shortName: 'Basta!',
    badgeBg: 'bg-emerald-800',
    badgeTextColor: 'text-white',
    borderColor: 'border-emerald-900',
    initials: 'BASTA',
    accentColor: '#065f46',
  },
  'blast': {
    name: 'Blast le souffle de l\'info',
    shortName: 'Blast',
    badgeBg: 'bg-red-800',
    badgeTextColor: 'text-white',
    borderColor: 'border-red-950',
    initials: 'BLAST',
    accentColor: '#991b1b',
  },
  'acrimed': {
    name: 'Acrimed',
    shortName: 'Acrimed',
    badgeBg: 'bg-purple-900',
    badgeTextColor: 'text-white',
    borderColor: 'border-purple-950',
    initials: 'ACRIMED',
    accentColor: '#581c87',
  },
  'chronik': {
    name: 'Chronik.be',
    shortName: 'Chronik',
    badgeBg: 'bg-slate-900',
    badgeTextColor: 'text-white',
    borderColor: 'border-black',
    initials: 'CHRONIK',
    accentColor: '#0f172a',
  },
  'matribune': {
    name: 'Ma Tribune',
    shortName: 'Ma Tribune',
    badgeBg: 'bg-rose-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-rose-800',
    initials: 'TRIBUNE',
    accentColor: '#be123c',
  },
  'pour.press': {
    name: 'Pour.press',
    shortName: 'Pour.press',
    badgeBg: 'bg-amber-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-amber-800',
    initials: 'POUR',
    accentColor: '#b45309',
  },
  'viktorovitch': {
    name: 'Clément Viktorovitch',
    shortName: 'C. Viktorovitch',
    badgeBg: 'bg-indigo-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-indigo-800',
    initials: 'VIKTO',
    accentColor: '#4338ca',
  },
  'hygiène mentale': {
    name: 'Hygiène Mentale',
    shortName: 'Hygiène Mentale',
    badgeBg: 'bg-teal-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-teal-800',
    initials: 'HM',
    accentColor: '#0f766e',
  },
  'le figaro': {
    name: 'Le Figaro',
    shortName: 'Le Figaro',
    badgeBg: 'bg-sky-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-sky-800',
    initials: 'FIGARO',
    accentColor: '#0369a1',
  },
  'les échos': {
    name: 'Les Échos',
    shortName: 'Les Échos',
    badgeBg: 'bg-amber-700',
    badgeTextColor: 'text-white',
    borderColor: 'border-amber-800',
    initials: 'ECHOS',
    accentColor: '#b45309',
  },
  'le monde': {
    name: 'Le Monde',
    shortName: 'Le Monde',
    badgeBg: 'bg-slate-900',
    badgeTextColor: 'text-white',
    borderColor: 'border-black',
    initials: 'MONDE',
    accentColor: '#0f172a',
  },
  'libération': {
    name: 'Libération',
    shortName: 'Libération',
    badgeBg: 'bg-red-600',
    badgeTextColor: 'text-white',
    borderColor: 'border-red-700',
    initials: 'LIBÉ',
    accentColor: '#dc2626',
  },
};

export function getSourceLogoUrl(sourceName: string, sourceUrl?: string): string {
  const s = (sourceName || '').toLowerCase();

  // YouTube / Video creators
  if (
    s.includes('defakator') ||
    s.includes('hygiène mentale') ||
    s.includes('viktorovitch') ||
    s.includes('mr phi') ||
    s.includes('fouloscopie') ||
    s.includes('heureka') ||
    s.includes('heu?reka') ||
    s.includes('thinkerview') ||
    s.includes('youtube')
  ) {
    return 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
  }

  // Belgian Mainstream & Regional Press
  if (s.includes('rtbf')) return 'https://www.google.com/s2/favicons?domain=rtbf.be&sz=128';
  if (s.includes('le soir')) return 'https://www.google.com/s2/favicons?domain=lesoir.be&sz=128';
  if (s.includes('la libre')) return 'https://www.google.com/s2/favicons?domain=lalibre.be&sz=128';
  if (s.includes('écho') || s.includes('echo')) return 'https://www.google.com/s2/favicons?domain=lecho.be&sz=128';
  if (s.includes('telesambre') || s.includes('télésambre')) return 'https://www.google.com/s2/favicons?domain=telesambre.be&sz=128';
  if (s.includes('sudinfo') || s.includes('nouvelle gazette')) return 'https://www.google.com/s2/favicons?domain=sudinfo.be&sz=128';
  if (s.includes('dhnet') || s.includes('dernière heure')) return 'https://www.google.com/s2/favicons?domain=dhnet.be&sz=128';
  if (s.includes('l\'avenir') || s.includes('avenir')) return 'https://www.google.com/s2/favicons?domain=lavenir.net&sz=128';
  if (s.includes('le vif')) return 'https://www.google.com/s2/favicons?domain=levif.be&sz=128';
  if (s.includes('trends')) return 'https://www.google.com/s2/favicons?domain=trends.levif.be&sz=128';

  // Independent, Critical & Investigative Belgian & French Press
  if (s.includes('mediapart')) return 'https://www.google.com/s2/favicons?domain=mediapart.fr&sz=128';
  if (s.includes('blast')) return 'https://www.google.com/s2/favicons?domain=blast-info.fr&sz=128';
  if (s.includes('basta')) return 'https://www.google.com/s2/favicons?domain=basta.media&sz=128';
  if (s.includes('chronik')) return 'https://www.google.com/s2/favicons?domain=chronik.be&sz=128';
  if (s.includes('matribune') || s.includes('ma tribune')) return 'https://www.google.com/s2/favicons?domain=matribune.be&sz=128';
  if (s.includes('pour.press') || s.includes('pour press')) return 'https://www.google.com/s2/favicons?domain=pour.press&sz=128';
  if (s.includes('médor') || s.includes('medor')) return 'https://www.google.com/s2/favicons?domain=medor.coop&sz=128';
  if (s.includes('alter échos') || s.includes('alter echos')) return 'https://www.google.com/s2/favicons?domain=alterechos.be&sz=128';
  if (s.includes('acrimed')) return 'https://www.google.com/s2/favicons?domain=acrimed.org&sz=128';
  if (s.includes('ptb') || s.includes('solidaire')) return 'https://www.google.com/s2/favicons?domain=solidaire.org&sz=128';

  // Watchdogs & Transparency
  if (s.includes('cumuleo')) return 'https://www.google.com/s2/favicons?domain=cumuleo.be&sz=128';
  if (s.includes('transparencia') || s.includes('cada')) return 'https://www.google.com/s2/favicons?domain=transparencia.be&sz=128';
  if (s.includes('still pissing') || s.includes('facebook') || s.includes('réseaux')) return 'https://www.google.com/s2/favicons?domain=facebook.com&sz=128';
  if (s.includes('transparency international')) return 'https://www.google.com/s2/favicons?domain=transparency.org&sz=128';

  // Major French Press
  if (s.includes('monde')) return 'https://www.google.com/s2/favicons?domain=lemonde.fr&sz=128';
  if (s.includes('figaro')) return 'https://www.google.com/s2/favicons?domain=lefigaro.fr&sz=128';
  if (s.includes('libération')) return 'https://www.google.com/s2/favicons?domain=liberation.fr&sz=128';

  // Extract hostname from sourceUrl if available
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.hostname && !parsed.hostname.includes('google.com')) {
        return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
      }
    } catch {}
  }

  return 'https://www.google.com/s2/favicons?domain=rtbf.be&sz=128';
}

export function getSourceBranding(sourceName: string): SourceBranding {
  const s = sourceName.toLowerCase();
  for (const [key, branding] of Object.entries(SOURCE_BRANDINGS)) {
    if (s.includes(key)) {
      return branding;
    }
  }

  // Default clean neutral fallback badge
  const initials = sourceName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return {
    name: sourceName,
    shortName: sourceName.slice(0, 15),
    badgeBg: 'bg-slate-800',
    badgeTextColor: 'text-white',
    borderColor: 'border-slate-900',
    initials: initials || 'INFO',
    accentColor: '#1e293b',
  };
}
