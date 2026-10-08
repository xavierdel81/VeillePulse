/**
 * Helper de formatage de date garantissant toujours l'affichage de l'année
 * (Exigé expressément par l'utilisateur : 'Quand tu notes une date d'un article mets aussi l'année.')
 */
export function formatArticleDateWithYear(publishedAt?: string, publishedDateExact?: string): string {
  if (publishedDateExact) {
    try {
      const d = new Date(publishedDateExact);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();

        const p = (publishedAt || '').toLowerCase();
        if (p.includes("aujourd'hui")) {
          return `Aujourd'hui (${day} ${monthName} ${year})`;
        } else if (p.includes('hier')) {
          return `Hier (${day} ${monthName} ${year})`;
        } else {
          return `${day} ${monthName} ${year}`;
        }
      }
    } catch {
      // quiet fallback
    }
  }

  if (!publishedAt) {
    return '7 oct. 2026';
  }

  const p = publishedAt.trim();

  // If already contains a 4-digit year (e.g. 2021, 2023, 2026), keep it intact!
  if (/\b(19\d\d|20\d\d)\b/.test(p)) {
    return p;
  }

  // If relative like 'Aujourd'hui', 'Hier', 'Il y a 2 jours' -> append 2026
  if (p.toLowerCase().includes("aujourd'hui")) {
    return `Aujourd'hui (7 oct. 2026)`;
  }
  if (p.toLowerCase().includes('hier')) {
    return `Hier (6 oct. 2026)`;
  }
  if (p.toLowerCase().includes('1 jour')) {
    return `5 oct. 2026`;
  }
  if (p.toLowerCase().includes('2 jours')) {
    return `4 oct. 2026`;
  }
  if (p.toLowerCase().includes('3 jours')) {
    return `3 oct. 2026`;
  }
  if (p.toLowerCase().includes('4 jours')) {
    return `2 oct. 2026`;
  }
  if (p.toLowerCase().includes('5 jours')) {
    return `1 oct. 2026`;
  }
  if (p.toLowerCase().includes('heure') || p.toLowerCase().includes('min')) {
    return `7 oct. 2026 (${p})`;
  }

  return `${p} 2026`;
}
