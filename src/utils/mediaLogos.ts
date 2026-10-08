import React from 'react';

export interface MediaLogoInfo {
  name: string;
  domain: string;
  shortName: string;
  bgColor: string;
  textColor: string;
  svgIcon?: React.ReactNode;
}

/**
 * Curated registry of media brand logos, domains, and color schemes.
 * Uses high-resolution official SVG brand marks or transparent web logos,
 * with reliable domain fallback (Google S2 / DuckDuckGo icons) and styled initials.
 */
export const MEDIA_REGISTRY: Record<string, {
  domain: string;
  shortName: string;
  brandColor: string;
  textColor: string;
  customLogoUrl?: string;
}> = {
  // Belgian Media
  'rtbf': {
    domain: 'rtbf.be',
    shortName: 'RTBF',
    brandColor: '#E2001A',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/RTBF_logo.svg/320px-RTBF_logo.svg.png',
  },
  'rtbf info': {
    domain: 'rtbf.be',
    shortName: 'RTBF',
    brandColor: '#E2001A',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/RTBF_logo.svg/320px-RTBF_logo.svg.png',
  },
  'le soir': {
    domain: 'lesoir.be',
    shortName: 'Le Soir',
    brandColor: '#002B49',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Le_Soir_logo_2016.svg/320px-Le_Soir_logo_2016.svg.png',
  },
  'la libre': {
    domain: 'lalibre.be',
    shortName: 'La Libre',
    brandColor: '#D3141E',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/La_Libre_Belgique_logo.svg/320px-La_Libre_Belgique_logo.svg.png',
  },
  'la libre belgique': {
    domain: 'lalibre.be',
    shortName: 'La Libre',
    brandColor: '#D3141E',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/La_Libre_Belgique_logo.svg/320px-La_Libre_Belgique_logo.svg.png',
  },
  'l\'écho': {
    domain: 'lecho.be',
    shortName: 'L\'Écho',
    brandColor: '#E84A27',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/L%27Echo_logo.svg/320px-L%27Echo_logo.svg.png',
  },
  'lecho': {
    domain: 'lecho.be',
    shortName: 'L\'Écho',
    brandColor: '#E84A27',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/L%27Echo_logo.svg/320px-L%27Echo_logo.svg.png',
  },
  'sudinfo': {
    domain: 'sudinfo.be',
    shortName: 'Sudinfo',
    brandColor: '#005494',
    textColor: '#FFFFFF',
  },
  'dh les sports': {
    domain: 'dhnet.be',
    shortName: 'DH',
    brandColor: '#E30613',
    textColor: '#FFFFFF',
  },
  'l\'avenir': {
    domain: 'lavenir.net',
    shortName: 'L\'Avenir',
    brandColor: '#00579F',
    textColor: '#FFFFFF',
  },
  'le vif': {
    domain: 'levif.be',
    shortName: 'Le Vif',
    brandColor: '#C41230',
    textColor: '#FFFFFF',
  },
  'ptb': {
    domain: 'ptb.be',
    shortName: 'PTB',
    brandColor: '#E30613',
    textColor: '#FFFFFF',
  },
  'solidaire': {
    domain: 'solidaire.org',
    shortName: 'Solidaire',
    brandColor: '#D6001C',
    textColor: '#FFFFFF',
  },
  'alter echos': {
    domain: 'alterechos.be',
    shortName: 'Alter Échos',
    brandColor: '#1B998B',
    textColor: '#FFFFFF',
  },
  'alter échos': {
    domain: 'alterechos.be',
    shortName: 'Alter Échos',
    brandColor: '#1B998B',
    textColor: '#FFFFFF',
  },
  'belga': {
    domain: 'belga.be',
    shortName: 'Belga',
    brandColor: '#002B49',
    textColor: '#FFFFFF',
  },
  'belga news agency': {
    domain: 'belga.be',
    shortName: 'Belga',
    brandColor: '#002B49',
    textColor: '#FFFFFF',
  },
  'cada': {
    domain: 'cada.gouv.fr',
    shortName: 'CADA',
    brandColor: '#002664',
    textColor: '#FFFFFF',
  },
  'still pissing': {
    domain: 'stillpissing.be',
    shortName: 'StillPissing',
    brandColor: '#3B82F6',
    textColor: '#FFFFFF',
  },

  // French Investigative & Independent Media
  'mediapart': {
    domain: 'mediapart.fr',
    shortName: 'Mediapart',
    brandColor: '#C80815',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Mediapart_logo.svg/320px-Mediapart_logo.svg.png',
  },
  'blast': {
    domain: 'blast-info.fr',
    shortName: 'Blast',
    brandColor: '#FFDF00',
    textColor: '#000000',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Blast%2C_le_souffle_de_l%27info.svg/320px-Blast%2C_le_souffle_de_l%27info.svg.png',
  },
  'blast, le souffle de l\'info': {
    domain: 'blast-info.fr',
    shortName: 'Blast',
    brandColor: '#FFDF00',
    textColor: '#000000',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Blast%2C_le_souffle_de_l%27info.svg/320px-Blast%2C_le_souffle_de_l%27info.svg.png',
  },
  'basta!': {
    domain: 'basta.media',
    shortName: 'Basta!',
    brandColor: '#E60000',
    textColor: '#FFFFFF',
  },
  'le média': {
    domain: 'lemediatv.fr',
    shortName: 'Le Média',
    brandColor: '#F54030',
    textColor: '#FFFFFF',
  },
  'thinkerview': {
    domain: 'thinkerview.com',
    shortName: 'ThinkerView',
    brandColor: '#111827',
    textColor: '#F59E0B',
  },
  'clément viktorovitch': {
    domain: 'youtube.com',
    shortName: 'Viktorovitch',
    brandColor: '#1E3A8A',
    textColor: '#FFFFFF',
  },
  'clemovitch': {
    domain: 'youtube.com',
    shortName: 'Viktorovitch',
    brandColor: '#1E3A8A',
    textColor: '#FFFFFF',
  },
  'defakator': {
    domain: 'youtube.com',
    shortName: 'Defakator',
    brandColor: '#374151',
    textColor: '#F3F4F6',
  },
  'hygiène mentale': {
    domain: 'hygienementale.fr',
    shortName: 'H. Mentale',
    brandColor: '#059669',
    textColor: '#FFFFFF',
  },
  'mr phi': {
    domain: 'youtube.com',
    shortName: 'Mr Phi',
    brandColor: '#7C3AED',
    textColor: '#FFFFFF',
  },
  'fouloscopie': {
    domain: 'youtube.com',
    shortName: 'Fouloscopie',
    brandColor: '#0284C7',
    textColor: '#FFFFFF',
  },
  'heu?reka': {
    domain: 'youtube.com',
    shortName: 'Heu?reka',
    brandColor: '#D97706',
    textColor: '#FFFFFF',
  },
  'osons causer': {
    domain: 'youtube.com',
    shortName: 'Osons Causer',
    brandColor: '#EA580C',
    textColor: '#FFFFFF',
  },

  // French National Media
  'le monde': {
    domain: 'lemonde.fr',
    shortName: 'Le Monde',
    brandColor: '#1F2937',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Le_Monde_Logo.svg/320px-Le_Monde_Logo.svg.png',
  },
  'le figaro': {
    domain: 'lefigaro.fr',
    shortName: 'Le Figaro',
    brandColor: '#004A8B',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Le_Figaro_logo.svg/320px-Le_Figaro_logo.svg.png',
  },
  'libération': {
    domain: 'liberation.fr',
    shortName: 'Libération',
    brandColor: '#E01E26',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Lib%C3%A9ration_logo.svg/320px-Lib%C3%A9ration_logo.svg.png',
  },
  'les échos': {
    domain: 'lesechos.fr',
    shortName: 'Les Échos',
    brandColor: '#BA0C2F',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Les_Echos_logo.svg/320px-Les_Echos_logo.svg.png',
  },
  'les echos': {
    domain: 'lesechos.fr',
    shortName: 'Les Échos',
    brandColor: '#BA0C2F',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Les_Echos_logo.svg/320px-Les_Echos_logo.svg.png',
  },
  'marianne': {
    domain: 'marianne.net',
    shortName: 'Marianne',
    brandColor: '#E20613',
    textColor: '#FFFFFF',
  },
  'le point': {
    domain: 'lepoint.fr',
    shortName: 'Le Point',
    brandColor: '#C8102E',
    textColor: '#FFFFFF',
  },
  'l\'express': {
    domain: 'lexpress.fr',
    shortName: 'L\'Express',
    brandColor: '#E30613',
    textColor: '#FFFFFF',
  },
  'valeurs actuelles': {
    domain: 'valeursactuelles.com',
    shortName: 'V. Actuelles',
    brandColor: '#1E293B',
    textColor: '#F87171',
  },
  'l\'humanité': {
    domain: 'humanite.fr',
    shortName: 'L\'Humanité',
    brandColor: '#D81920',
    textColor: '#FFFFFF',
  },
  'france info': {
    domain: 'francetvinfo.fr',
    shortName: 'France Info',
    brandColor: '#F59E0B',
    textColor: '#000000',
  },
  'france inter': {
    domain: 'radiofrance.fr/franceinter',
    shortName: 'France Inter',
    brandColor: '#E30022',
    textColor: '#FFFFFF',
  },
  'afp': {
    domain: 'afp.com',
    shortName: 'AFP',
    brandColor: '#003366',
    textColor: '#FFFFFF',
    customLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Agence_France-Presse_logo.svg/320px-Agence_France-Presse_logo.svg.png',
  },
  'courrier international': {
    domain: 'courrierinternational.com',
    shortName: 'Courrier Int.',
    brandColor: '#E30613',
    textColor: '#FFFFFF',
  },
  'les décodeurs': {
    domain: 'lemonde.fr/les-decodeurs',
    shortName: 'Décodeurs',
    brandColor: '#2563EB',
    textColor: '#FFFFFF',
  },
  'checknews': {
    domain: 'liberation.fr/checknews',
    shortName: 'CheckNews',
    brandColor: '#E01E26',
    textColor: '#FFFFFF',
  },
};

/**
 * Returns media brand data including domain and clean logo source
 */
export function getMediaBrand(sourceName: string) {
  const norm = sourceName.trim().toLowerCase().replace(/[^a-z0-9à-ÿ]/g, ' ').replace(/\s+/g, ' ');
  
  // Direct match or partial match
  for (const [key, data] of Object.entries(MEDIA_REGISTRY)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return data;
    }
  }

  // Fallback domain extraction
  const simpleName = sourceName.trim().split(' ')[0] || 'Media';
  const guessedDomain = `${simpleName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

  return {
    domain: guessedDomain,
    shortName: simpleName,
    brandColor: '#475569',
    textColor: '#FFFFFF',
  };
}

/**
 * Provides primary and fallback favicon / icon URLs for a given domain
 */
export function getMediaLogoUrls(domain: string, customUrl?: string): string[] {
  const urls: string[] = [];
  if (customUrl) {
    urls.push(customUrl);
  }
  urls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  urls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  return urls;
}
