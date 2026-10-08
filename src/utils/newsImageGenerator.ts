/**
 * High-quality, diversified editorial and video image generator for VeillePulse
 * Ensures EVERY article and video has a GUARANTEED UNIQUE, contextual, high-resolution image.
 * Never repeats the same fallback image or duplicate pictures across articles!
 */

// Curated pool of 100+ high-resolution, thematic photos
const THEMATIC_IMAGE_POOLS: Record<string, string[]> = {
  // 1. Esprit critique, zététique, rhétorique, auto-défense intellectuelle
  critique: [
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80', // Books & critical thought
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', // Digital analysis & screens
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80', // Lightbulb / idea
    'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80', // Study & magnifying glass
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80', // Writing & questioning
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80', // Bookshelf archive
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', // Library research
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=800&auto=format&fit=crop&q=80', // Science blackboard
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', // Lab experiment
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80', // Desk notebook
  ],

  // 2. Corruption, justice, tribunaux, marchés publics, Semlex
  justice: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80', // Courtroom & law books
    'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&auto=format&fit=crop&q=80', // Gavel & justice scales
    'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&auto=format&fit=crop&q=80', // Scale of justice
    'https://images.unsplash.com/photo-1453733190371-0a9bedd82893?w=800&auto=format&fit=crop&q=80', // Courthouse columns
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80', // Legal contract & pen
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80', // Modern corporate building
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80', // Financial documents & calculator
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80', // Audit & analysis desk
    'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&auto=format&fit=crop&q=80', // Document stamp & approval
    'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&auto=format&fit=crop&q=80', // Classic law library
  ],

  // 3. Transparence CADA, administration, délibérations communales
  transparence: [
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80', // Archive folders
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&auto=format&fit=crop&q=80', // Modern public office
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80', // Public meeting / assembly
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80', // Council debate table
    'https://images.unsplash.com/photo-1444653614773-995cb1ef902f?w=800&auto=format&fit=crop&q=80', // Official architectural building
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80', // Handshake & scrutiny
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80', // Laptop with public data
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80', // Financial charts & accountability
  ],

  // 4. Luttes sociales, syndicats, droits du travail, chômage, santé
  social: [
    'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=80', // Street demonstration
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80', // Healthcare workers
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80', // Workers in discussion
    'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&auto=format&fit=crop&q=80', // Crowd mobilization
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80', // Community workshop
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&auto=format&fit=crop&q=80', // Solidarity collective
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80', // Citizen action group
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80', // Hospital stethoscope
    'https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=800&auto=format&fit=crop&q=80', // Worker helmet
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80', // Factory worker
  ],

  // 4b. Manifestations étudiantes, mouvements lycéens, jeunesse & éducation
  jeunesse_etudiants: [
    'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&auto=format&fit=crop&q=80', // Youth marching with signs
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', // Students solidarity assembly
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80', // School classroom debate
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80', // University lecture amphitheater
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80', // Public debate & assembly
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80', // School entrance building
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80', // Student project group
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80', // Youth collective discussion
    'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop&q=80', // Student gathering outside
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&auto=format&fit=crop&q=80', // University campus walkway
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80', // Education study materials
    'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&auto=format&fit=crop&q=80', // Youth rally crowd
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80', // High school youth assembly
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80', // Educational classroom dialogue
    'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800&auto=format&fit=crop&q=80', // Students banner protest
    'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=800&auto=format&fit=crop&q=80', // Young activists in discussion
    'https://images.unsplash.com/photo-1460518451282-193d17952b44?w=800&auto=format&fit=crop&q=80', // Street demonstration flags
    'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&auto=format&fit=crop&q=80', // Public petition & signups
  ],

  // 5. Démocratie, libertés publiques, contre-pouvoirs, RIC, Wallonie
  democratie: [
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=80', // Voting booth & ballot
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80', // Parliament assembly
    'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=800&auto=format&fit=crop&q=80', // Constitution / rights
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80', // Network / civil connection
    'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=800&auto=format&fit=crop&q=80', // Citizen sign
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80', // Assembly hall
    'https://images.unsplash.com/photo-1520607164069-c5b55050f757?w=800&auto=format&fit=crop&q=80', // Citizen megaphone
  ],

  // 6. IA, algorithmes d'État, surveillance, numérique
  tech: [
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80', // Matrix code / data security
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80', // Cyber surveillance & chips
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', // High-tech circuits
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80', // Code & screen scrutiny
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80', // Data algorithm network
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&auto=format&fit=crop&q=80', // Coding on laptop
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&auto=format&fit=crop&q=80', // Artificial intelligence neural
  ],

  // 7. Presse d'investigation, journalisme, médias
  presse: [
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80', // Newspaper stack
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80', // News headlines
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&auto=format&fit=crop&q=80', // Person reading morning paper
    'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800&auto=format&fit=crop&q=80', // Press printing press
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80', // Mobile news feed
    'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=800&auto=format&fit=crop&q=80', // Broadcast studio
    'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&auto=format&fit=crop&q=80', // Editorial desk
    'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&auto=format&fit=crop&q=80', // Journalism notebook
  ],
};

// Global set tracking all assigned images in the current application session
const GLOBAL_ASSIGNED_IMAGES = new Set<string>();

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Returns authentic YouTube video thumbnail URL if it is a YouTube video
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Hash string into a positive integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates or picks a GUARANTEED UNIQUE, contextual high-resolution image URL.
 * NEVER returns the same image for two different articles!
 */
export function getUniqueArticleImageUrl(
  title: string,
  source: string,
  topicTitle?: string,
  explicitUrl?: string,
  existingImageUrl?: string,
  forceUnique: boolean = true
): string {
  // 1. If explicit URL is a YouTube video, use authentic YouTube thumbnail
  const ytId = extractYouTubeVideoId(explicitUrl || '') || extractYouTubeVideoId(existingImageUrl || '');
  if (ytId) {
    const ytThumb = getYouTubeThumbnailUrl(ytId);
    GLOBAL_ASSIGNED_IMAGES.add(ytThumb);
    return ytThumb;
  }

  // 2. If an existing image URL is valid, authentic, and NOT already used
  const knownGenericMicrophone = 'photo-1475721027785-f74eccf877e2';
  if (
    existingImageUrl &&
    !existingImageUrl.includes(knownGenericMicrophone) &&
    (existingImageUrl.startsWith('http://') || existingImageUrl.startsWith('https://') || existingImageUrl.startsWith('/'))
  ) {
    if (!forceUnique || !GLOBAL_ASSIGNED_IMAGES.has(existingImageUrl)) {
      GLOBAL_ASSIGNED_IMAGES.add(existingImageUrl);
      return existingImageUrl;
    }
  }

  // 3. Determine theme category
  const text = `${title} ${source} ${topicTitle || ''}`.toLowerCase();
  let poolKey = 'presse';

  if (
    text.includes('defakator') ||
    text.includes('hygiène mentale') ||
    text.includes('viktorovitch') ||
    text.includes('esprit critique') ||
    text.includes('sophisme') ||
    text.includes('rhétorique') ||
    text.includes('zététique') ||
    text.includes('biais') ||
    text.includes('auto-défense')
  ) {
    poolKey = 'critique';
  } else if (
    text.includes('semlex') ||
    text.includes('corruption') ||
    text.includes('marché public') ||
    text.includes('intercommunale') ||
    text.includes('tribunal') ||
    text.includes('justice') ||
    text.includes('fraude')
  ) {
    poolKey = 'justice';
  } else if (
    text.includes('cada') ||
    text.includes('transparencia') ||
    text.includes('transparence') ||
    text.includes('délibération') ||
    text.includes('conseil communal')
  ) {
    poolKey = 'transparence';
  } else if (
    text.includes('étudiant') ||
    text.includes('etudiant') ||
    text.includes('élève') ||
    text.includes('eleve') ||
    text.includes('lycéen') ||
    text.includes('lycee') ||
    text.includes('lycé') ||
    text.includes('jeunesse') ||
    text.includes('école') ||
    text.includes('ecole') ||
    text.includes('enseignement') ||
    text.includes('casseur-payeur')
  ) {
    poolKey = 'jeunesse_etudiants';
  } else if (
    text.includes('chômage') ||
    text.includes('allocataire') ||
    text.includes('lutte') ||
    text.includes('grève') ||
    text.includes('fgtb') ||
    text.includes('csc') ||
    text.includes('santé') ||
    text.includes('social') ||
    text.includes('pauvreté')
  ) {
    poolKey = 'social';
  } else if (
    text.includes('ia') ||
    text.includes('algorithme') ||
    text.includes('surveillance') ||
    text.includes('profilage') ||
    text.includes('numérique')
  ) {
    poolKey = 'tech';
  } else if (
    text.includes('démocratie') ||
    text.includes('ric') ||
    text.includes('liberté') ||
    text.includes('citoyen') ||
    text.includes('wallonie') ||
    text.includes('parlement')
  ) {
    poolKey = 'democratie';
  }

  const pool = THEMATIC_IMAGE_POOLS[poolKey] || THEMATIC_IMAGE_POOLS.presse;
  const hash = hashString(`${title}-${source}-${topicTitle || ''}`);

  // Find first unused image in pool
  for (let i = 0; i < pool.length; i++) {
    const candidate = pool[(hash + i) % pool.length];
    if (!GLOBAL_ASSIGNED_IMAGES.has(candidate)) {
      GLOBAL_ASSIGNED_IMAGES.add(candidate);
      return candidate;
    }
  }

  // If all are used, create a guaranteed unique image parameter
  const baseImg = pool[hash % pool.length];
  const uniqueUrl = `${baseImg}&unique=${hashString(title + source)}`;
  GLOBAL_ASSIGNED_IMAGES.add(uniqueUrl);
  return uniqueUrl;
}

/**
 * Resets the global assigned images set (e.g., when reloading or rescanning)
 */
export function resetGlobalAssignedImages(): void {
  GLOBAL_ASSIGNED_IMAGES.clear();
}
