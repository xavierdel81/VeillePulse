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

  const now = new Date();
  const day = now.getDate();
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();
  const todayStr = `${day} ${monthName} ${year}`;

  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = `${yesterday.getDate()} ${months[yesterday.getMonth()]} ${yesterday.getFullYear()}`;

  if (!publishedAt) {
    return todayStr;
  }

  const p = publishedAt.trim();

  // If already contains a 4-digit year (e.g. 2021, 2023, 2026), keep it intact!
  if (/\b(19\d\d|20\d\d)\b/.test(p)) {
    return p;
  }

  // If relative like 'Aujourd'hui', 'Hier', 'Il y a 2 jours' -> compute relative to today
  if (p.toLowerCase().includes("aujourd'hui")) {
    return `Aujourd'hui (${todayStr})`;
  }
  if (p.toLowerCase().includes('hier')) {
    return `Hier (${yesterdayStr})`;
  }
  if (p.toLowerCase().includes('1 jour')) {
    return yesterdayStr;
  }
  if (p.toLowerCase().includes('2 jours')) {
    const d2 = new Date(Date.now() - 2 * 86400000);
    return `${d2.getDate()} ${months[d2.getMonth()]} ${d2.getFullYear()}`;
  }
  if (p.toLowerCase().includes('3 jours')) {
    const d3 = new Date(Date.now() - 3 * 86400000);
    return `${d3.getDate()} ${months[d3.getMonth()]} ${d3.getFullYear()}`;
  }
  if (p.toLowerCase().includes('4 jours')) {
    const d4 = new Date(Date.now() - 4 * 86400000);
    return `${d4.getDate()} ${months[d4.getMonth()]} ${d4.getFullYear()}`;
  }
  if (p.toLowerCase().includes('heure') || p.toLowerCase().includes('min')) {
    return `${todayStr} (${p})`;
  }

  return `${p} ${year}`;
}
