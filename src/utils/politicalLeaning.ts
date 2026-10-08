import { PoliticalLeaning, SourceChannel } from '../types/watch';

export interface LeaningMeta {
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
  barColor: string;
  spectrumPosition: 'gauche_radicale' | 'gauche' | 'centre' | 'droite' | 'extreme_droite' | 'independant';
  description: string;
  groundNewsTag: string;
}

/**
 * Cartographie stricte des couleurs politiques :
 * - GAUCHE = ROUGE (Rouge franc bg-red-600 text-white / Bordeaux foncé bg-red-950 pour la gauche radicale)
 * - CENTRE = GRIS / BLANC (bg-slate-100 text-slate-800 border-slate-300)
 * - DROITE = BLEU (Bleu franc bg-blue-600 text-white / Bleu nuit très foncé bg-blue-950 pour l'extrême droite)
 */
export const POLITICAL_LEANING_MAP: Record<PoliticalLeaning, LeaningMeta> = {
  gauche_radicale: {
    label: 'Gauche radicale',
    shortLabel: 'G. radicale',
    badgeClass: 'bg-red-950 text-red-100 border-red-900 font-bold shadow-2xs',
    dotClass: 'bg-red-400',
    barColor: '#7f1d1d', // Rouge bordeaux très foncé
    spectrumPosition: 'gauche_radicale',
    description: 'Orientation éditoriale : Gauche radicale • Critique anticapitaliste, remise en cause structurelle des pouvoirs établis',
    groundNewsTag: 'Far Left / Rad.',
  },
  gauche: {
    label: 'Plutôt de gauche',
    shortLabel: 'Gauche',
    badgeClass: 'bg-red-600 text-white border-red-700 font-bold shadow-2xs',
    dotClass: 'bg-white',
    barColor: '#dc2626', // Rouge franc
    spectrumPosition: 'gauche',
    description: 'Orientation éditoriale : Plutôt de gauche • Défense des droits sociaux, des services publics et justice fiscale',
    groundNewsTag: 'Left Leaning',
  },
  centre: {
    label: 'Du centre / Pluraliste',
    shortLabel: 'Centre',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
    dotClass: 'bg-slate-500',
    barColor: '#94a3b8', // Blanc ou gris
    spectrumPosition: 'centre',
    description: 'Orientation éditoriale : Du centre • Presse quotidienne pluraliste, service public ou neutralité institutionnelle',
    groundNewsTag: 'Center / Neutral',
  },
  droite: {
    label: 'De droite',
    shortLabel: 'Droite',
    badgeClass: 'bg-blue-600 text-white border-blue-700 font-bold shadow-2xs',
    dotClass: 'bg-white',
    barColor: '#2563eb', // Bleu franc
    spectrumPosition: 'droite',
    description: 'Orientation éditoriale : De droite • Ligne libérale économique, conservatrice républicaine ou financière',
    groundNewsTag: 'Right Leaning',
  },
  extreme_droite: {
    label: 'Extrême droite',
    shortLabel: 'Extr. droite',
    badgeClass: 'bg-blue-950 text-blue-100 border-blue-900 font-bold shadow-2xs',
    dotClass: 'bg-blue-400',
    barColor: '#172554', // Bleu nuit très foncé
    spectrumPosition: 'extreme_droite',
    description: 'Orientation éditoriale : Extrême droite • Ligne nationaliste et identitaire',
    groundNewsTag: 'Far Right',
  },
  independant_non_aligne: {
    label: 'Non aligné / Citoyen',
    shortLabel: 'Non aligné',
    badgeClass: 'bg-slate-200 text-slate-800 border-slate-300 font-bold',
    dotClass: 'bg-slate-600',
    barColor: '#64748b', // Gris
    spectrumPosition: 'independant',
    description: 'Orientation éditoriale : Non aligné / Transpartisan • Vigie citoyenne, zététique ou transparence administrative',
    groundNewsTag: 'Watchdog / Indep.',
  },
};

export function getPoliticalLeaningMeta(leaning?: PoliticalLeaning): LeaningMeta {
  if (!leaning || !POLITICAL_LEANING_MAP[leaning]) {
    return POLITICAL_LEANING_MAP.independant_non_aligne;
  }
  return POLITICAL_LEANING_MAP[leaning];
}

/**
 * Normalizes source name for consistent key storage in user custom overrides
 */
export function normalizeSourceName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9à-ÿ]/g, '');
}

/**
 * Gets all user custom political leanings stored in localStorage
 * Includes default user preferences: La Libre = Droite, PTB = Gauche radicale!
 */
export function getCustomSourceLeanings(): Record<string, PoliticalLeaning> {
  const baseDefaults: Record<string, PoliticalLeaning> = {
    'lalibre': 'droite',
    'lalibrebelgique': 'droite',
    'lavenir': 'droite',
    'sudinfo': 'droite',
    'dhnet': 'droite',
    'lecho': 'droite',
    'lecho.be': 'droite',
    'trendstendances': 'droite',
    'partidutravaildebelgique': 'gauche_radicale',
    'partidutravail': 'gauche_radicale',
    'ptb': 'gauche_radicale',
    'solidaire': 'gauche_radicale',
    'basta': 'gauche',
    'mediapart': 'gauche',
    'blast': 'gauche_radicale',
    'liguedesdroitshumains': 'gauche',
  };

  try {
    const saved = localStorage.getItem('veillepulse_custom_source_leanings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure defaults like PTB and La Libre are present if not explicitly set
      return { ...baseDefaults, ...parsed };
    }
    localStorage.setItem('veillepulse_custom_source_leanings', JSON.stringify(baseDefaults));
    return baseDefaults;
  } catch {
    return baseDefaults;
  }
}

/**
 * Allows user to customize and override the political leaning of any source on the fly
 */
export function setCustomSourceLeaning(sourceName: string, leaning: PoliticalLeaning): void {
  try {
    const current = getCustomSourceLeanings();
    const key = normalizeSourceName(sourceName);
    current[key] = leaning;
    localStorage.setItem('veillepulse_custom_source_leanings', JSON.stringify(current));
    // Dispatch custom event to notify all components to re-render immediately
    window.dispatchEvent(new CustomEvent('custom-source-leanings-updated', { detail: { sourceName, leaning } }));
  } catch (e) {
    console.error('Failed to save custom source leaning:', e);
  }
}

/**
 * Resets a source's leaning override back to its default detected leaning
 */
export function resetCustomSourceLeaning(sourceName: string): void {
  try {
    const current = getCustomSourceLeanings();
    const key = normalizeSourceName(sourceName);
    delete current[key];
    localStorage.setItem('veillepulse_custom_source_leanings', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('custom-source-leanings-updated', { detail: { sourceName, leaning: null } }));
  } catch (e) {
    console.error('Failed to reset custom source leaning:', e);
  }
}

/**
 * Returns effective political leaning taking into account user custom overrides first!
 */
export function getEffectivePoliticalLeaning(
  sourceName: string,
  defaultLeaning?: PoliticalLeaning,
  sourceUrl?: string,
  title?: string,
  summary?: string
): PoliticalLeaning {
  const customOverrides = getCustomSourceLeanings();
  const key = normalizeSourceName(sourceName);
  if (customOverrides[key]) {
    return customOverrides[key];
  }
  // Check if source is explicitly mapped or evaluate based on content framing
  return inferPoliticalLeaningFromSource(sourceName, sourceUrl, defaultLeaning, title, summary);
}

/**
 * Determines whether a source is an independent medium or citizen watchdog
 * (from Precisement.org list and citizen watchdogs)
 */
export function isSourceIndependent(sourceName: string, sourceUrl?: string): boolean {
  const s = (sourceName + ' ' + (sourceUrl || '')).toLowerCase();
  return (
    s.includes('still pissing') ||
    s.includes('transparencia') ||
    s.includes('matribune') ||
    s.includes('ma tribune') ||
    s.includes('basta') ||
    s.includes('chronik') ||
    s.includes('chronique') ||
    s.includes('mediapart') ||
    s.includes('blast') ||
    s.includes('médor') ||
    s.includes('medor') ||
    s.includes('pour.press') ||
    s.includes('acrimed') ||
    s.includes('cumuleo') ||
    s.includes('anticor') ||
    s.includes('transparency international') ||
    s.includes('hygiène mentale') ||
    s.includes('hygienementale') ||
    s.includes('viktorovitch') ||
    s.includes('clemovitch') ||
    s.includes('disclose') ||
    s.includes('les jours') ||
    s.includes('reflets.info') ||
    s.includes('reflets') ||
    s.includes('marsactu') ||
    s.includes('mediacites') ||
    s.includes('médiacités') ||
    s.includes('arrêt sur images') ||
    s.includes('arret sur images') ||
    s.includes('politis') ||
    s.includes('reporterre') ||
    s.includes('splann') ||
    s.includes('streetpress') ||
    s.includes('l\'informé') ||
    s.includes('linforme') ||
    s.includes('la lettre') ||
    s.includes('le courrier') ||
    s.includes('le canard') ||
    s.includes('alter échos') ||
    s.includes('alter echos') ||
    s.includes('orientxxi') ||
    s.includes('street press')
  );
}

/**
 * Infers the baseline political leaning of any francophone source
 * (strictly placing Gauche in 'Rouge', Droite in 'Bleu', Centre in 'Gris/Blanc')
 */
export function inferPoliticalLeaningFromSource(
  sourceName: string,
  sourceUrl?: string,
  fallbackLeaning?: PoliticalLeaning,
  title?: string,
  summary?: string
): PoliticalLeaning {
  // 0. Si l'article ou le signal dispose d'un bord politique explicite fort (non indéterminé), le respecter en priorité !
  if (
    fallbackLeaning &&
    (fallbackLeaning === 'gauche' ||
      fallbackLeaning === 'gauche_radicale' ||
      fallbackLeaning === 'droite' ||
      fallbackLeaning === 'extreme_droite')
  ) {
    return fallbackLeaning;
  }

  const s = (sourceName + ' ' + (sourceUrl || '')).toLowerCase();

  // 1. Extrême droite (Bleu nuit très foncé)
  if (
    s.includes('boulevard voltaire') ||
    s.includes('bvoltaire') ||
    s.includes('frontières') ||
    s.includes('frontieres') ||
    s.includes('livre noir') ||
    s.includes('fdesouche') ||
    s.includes('breizh-info')
  ) {
    return 'extreme_droite';
  }

  // 2. Gauche radicale (Rouge bordeaux très foncé)
  if (
    s.includes('parti du travail') ||
    s.includes('ptb') ||
    s.includes('solidaire') ||
    s.includes('pvda') ||
    s.includes('blast') ||
    s.includes('acrimed') ||
    s.includes('le média') ||
    s.includes('le media') ||
    s.includes('frustration') ||
    s.includes('contretemps') ||
    s.includes('usul') ||
    s.includes('humanité') ||
    s.includes('lutte ouvrière') ||
    s.includes('npa') ||
    s.includes('la france insoumise') ||
    s.includes('lfi')
  ) {
    return 'gauche_radicale';
  }

  // 3. De droite (Bleu franc) - Presse libérale, conservatrice, économique & groupes privés belges
  if (
    s.includes('la libre') ||
    s.includes('lalibre') ||
    s.includes('l\'avenir') ||
    s.includes('lavenir') ||
    s.includes('dhnet') ||
    s.includes('la dernière heure') ||
    s.includes('la derniere heure') ||
    s.includes('dh net') ||
    s.includes('dh ') ||
    s.includes('sudinfo') ||
    s.includes('sudpresse') ||
    s.includes('la meuse') ||
    s.includes('la province') ||
    s.includes('nouvelle gazette') ||
    s.includes('l\'écho') ||
    s.includes('lecho.be') ||
    s.includes('lecho') ||
    s.includes('trends') ||
    s.includes('mediafin') ||
    s.includes('rtl') ||
    s.includes('7sur7') ||
    s.includes('hln') ||
    s.includes('ln24') ||
    s.includes('figaro') ||
    s.includes('les échos') ||
    s.includes('lesechos') ||
    s.includes('le point') ||
    s.includes('l\'express') ||
    s.includes('lexpress') ||
    s.includes('l\'opinion') ||
    s.includes('lopinion') ||
    s.includes('valeurs actuelles') ||
    s.includes('atlantico') ||
    s.includes('causeur') ||
    s.includes('agefi') ||
    s.includes('journal de montréal')
  ) {
    return 'droite';
  }

  // 4. De gauche (Rouge franc) - Enquêtes sociales, syndicats, contre-pouvoirs & médias engagés
  if (
    s.includes('médor') ||
    s.includes('medor') ||
    s.includes('alter échos') ||
    s.includes('alter echos') ||
    s.includes('alterechos') ||
    s.includes('pour.press') ||
    s.includes('pour presse') ||
    s.includes('matribune') ||
    s.includes('ma tribune') ||
    s.includes('chronik') ||
    s.includes('chronique') ||
    s.includes('basta') ||
    s.includes('mediapart') ||
    s.includes('transparencia') ||
    s.includes('ligue des droits humains') ||
    s.includes('liguedh') ||
    s.includes('ldh') ||
    s.includes('fgtb') ||
    s.includes('csc') ||
    s.includes('syndicat') ||
    s.includes('setca') ||
    s.includes('cgsp') ||
    s.includes('cne') ||
    s.includes('cepag') ||
    s.includes('clément viktorovitch') ||
    s.includes('viktorovitch') ||
    s.includes('clemovitch') ||
    s.includes('osons causer') ||
    s.includes('reporterre') ||
    s.includes('politis') ||
    s.includes('streetpress') ||
    s.includes('street press') ||
    s.includes('les jours') ||
    s.includes('reflets') ||
    s.includes('libération') ||
    s.includes('le devoir') ||
    s.includes('le courrier') ||
    s.includes('monde diplomatique') ||
    s.includes('still pissing') ||
    s.includes('élucid') ||
    s.includes('elucid') ||
    s.includes('réseau wallon de lutte contre la pauvreté') ||
    s.includes('rwlp')
  ) {
    return 'gauche';
  }

  // 5. Institutions officielles & Agences de presse neutres (Gris / Blanc)
  if (
    s.includes('cada') ||
    s.includes('commission d\'accès') ||
    s.includes('cour des comptes') ||
    s.includes('conseil d\'état') ||
    s.includes('belga') ||
    s.includes('afp') ||
    s.includes('reuters') ||
    s.includes('décodeurs') ||
    s.includes('decodeurs') ||
    s.includes('checknews') ||
    s.includes('hygiène mentale') ||
    s.includes('hygienementale') ||
    s.includes('defakator') ||
    s.includes('fouloscopie') ||
    s.includes('heu?reka') ||
    s.includes('mr phi') ||
    s.includes('cumuleo') ||
    s.includes('transparency international') ||
    s.includes('courrier international')
  ) {
    return 'centre';
  }

  // 6. Analyse éditoriale contextuelle pour les médias généralistes ou régionaux (RTBF, Le Soir, télévisions locales)
  const textContext = `${title || ''} ${summary || ''}`.toLowerCase();
  if (textContext) {
    // Si l'article traite d'une mobilisation sociale, défense syndicale, contestation étudiante, précarité ou lutte contre l'austérité
    if (
      textContext.includes('grève') ||
      textContext.includes('greve') ||
      textContext.includes('lycéen') ||
      textContext.includes('lyceen') ||
      textContext.includes('étudiant') ||
      textContext.includes('syndicat') ||
      textContext.includes('fgtb') ||
      textContext.includes('csc') ||
      textContext.includes('précarité') ||
      textContext.includes('droits sociaux') ||
      textContext.includes('allocataire') ||
      textContext.includes('sanction') ||
      textContext.includes('manifestation') ||
      textContext.includes('services publics') ||
      textContext.includes('droit de manifester') ||
      textContext.includes('violences policières')
    ) {
      return 'gauche';
    }

    // Si l'article aborde le sujet sous l'angle du coût économique, des réformes budgétaires ou des déclarations patronales
    if (
      textContext.includes('patronat') ||
      textContext.includes('feb') ||
      textContext.includes('uwe') ||
      textContext.includes('bouchez') ||
      textContext.includes('clarinval') ||
      textContext.includes('rigueur') ||
      textContext.includes('compétitivité') ||
      textContext.includes('blocage économique') ||
      textContext.includes('ordre public')
    ) {
      return 'droite';
    }
  }

  // 7. Presse quotidienne généraliste pluraliste
  if (
    s.includes('rtbf') ||
    s.includes('le soir') ||
    s.includes('le vif') ||
    s.includes('marianne') ||
    s.includes('bx1') ||
    s.includes('télésambre') ||
    s.includes('rtc') ||
    s.includes('notele') ||
    s.includes('notélé') ||
    s.includes('matele') ||
    s.includes('canal zoom') ||
    s.includes('tv com') ||
    s.includes('tv lux') ||
    s.includes('actv')
  ) {
    return 'centre';
  }

  // Fallback si explicite
  if (fallbackLeaning && POLITICAL_LEANING_MAP[fallbackLeaning]) {
    return fallbackLeaning;
  }

  return 'centre';
}

/**
 * Returns a direct Wayback Machine (Internet Archive) URL for any article
 */
export function getWaybackMachineUrl(url?: string): string {
  if (!url) return 'https://web.archive.org';
  return `https://web.archive.org/web/*/${url}`;
}

/**
 * Returns an Archive.today mirror URL as secondary archive fallback
 */
export function getArchiveTodayUrl(url?: string): string {
  if (!url) return 'https://archive.today';
  return `https://archive.today/newest/${encodeURIComponent(url)}`;
}

/**
 * Returns a concrete, nuanced evaluation of the source's political tendency and editorial line
 * Highlighting whether it is independent AND its political leaning
 */
export function getSourceTendencyDescription(sourceName: string, leaning?: PoliticalLeaning): string {
  const s = sourceName.toLowerCase();
  
  if (s.includes('parti du travail') || s.includes('ptb') || s.includes('solidaire') || s.includes('pvda')) {
    return 'Parti & média ouvrier belge • Gauche radicale : Ligne marxiste et syndicale contestatrice défendant la justice fiscale et les allocataires sociaux.';
  }
  if (s.includes('la libre')) {
    return 'Presse belge d\'opinion • De droite : Ligne éditoriale libérale et chrétienne conservatrice axée sur l\'économie, les affaires et les institutions.';
  }
  if (s.includes('transparency international')) {
    return 'ONG d\'enquête indépendante • Non alignée : Révélations sur la corruption transnationale, les poursuites pénales d\'entreprises (ex: Semlex) et le blanchiment.';
  }
  if (s.includes('l\'écho') || s.includes('lecho')) {
    return 'Presse économique belge • De droite : Quotidien financier et d\'affaires de référence défendant l\'économie de marché et l\'orthodoxie budgétaire.';
  }
  if (s.includes('le figaro')) {
    return 'Presse nationale française • De droite : Grand quotidien républicain libéral et conservateur.';
  }
  if (s.includes('pour.press')) {
    return 'Média indépendant • Plutôt de gauche : Presse libre belge sans publicité, focalisée sur la santé publique, l\'écologie et l\'émancipation sociale.';
  }
  if (s.includes('matribune') || s.includes('ma tribune')) {
    return 'Média indépendant • Plutôt de gauche : Collectif citoyen belge engagé pour la défense des travailleurs et des allocataires sociaux en Wallonie.';
  }
  if (s.includes('chronik') || s.includes('chronique')) {
    return 'Revue indépendante • Gauche radicale : Analyse critique belge du néolibéralisme, des dérives sécuritaires et du monde du travail.';
  }
  if (s.includes('acrimed')) {
    return 'Observatoire indépendant • Gauche radicale : Critique rigoureuse des médias, dénonciation des monopoles économiques et dérives autoritaires.';
  }
  if (s.includes('blast')) {
    return 'Média indépendant • Gauche radicale : Investigation vidéo de contre-pouvoir traquant les collusions d\'État et les conflits d\'intérêts.';
  }
  if (s.includes('mediapart')) {
    return 'Média indépendant • Plutôt de gauche : Journalisme d\'investigation sans publicité, pionnier des révélations politico-financières et judiciaires.';
  }
  if (s.includes('reflets')) {
    return 'Média indépendant • Plutôt de gauche : Enquêtes sur la surveillance d\'État, les algorithmes de contrôle social (IA) et la criminalité financière.';
  }
  if (s.includes('transparencia')) {
    return 'Plateforme citoyenne indépendante • Non alignée : Vigie transpartisane pour la publicité active et les recours CADA en Wallonie et FWB.';
  }
  if (s.includes('still pissing')) {
    return 'Lanceur d\'alerte indépendant • Vigie citoyenne carolo : Surveillance critique de la gouvernance locale et des intercommunales carolos.';
  }
  if (s.includes('le soir')) {
    return 'Presse de référence • Du centre : Quotidien généraliste belge pluraliste axé sur l\'actualité institutionnelle et politique.';
  }
  if (s.includes('rtbf')) {
    return 'Service public • Du centre : Audiovisuel public belge tenu par une charte déontologique d\'impartialité et de pluralisme démocratique.';
  }
  if (s.includes('la dernière heure') || s.includes('dhnet')) {
    return 'Presse populaire régionale • Du centre : Quotidien d\'information générale et de faits de société en Wallonie et à Bruxelles.';
  }
  if (s.includes('l\'avenir')) {
    return 'Presse régionale wallonne • Du centre : Quotidien de proximité couvrant Namur, Liège, le Brabant wallon, le Hainaut et le Luxembourg.';
  }
  if (s.includes('sudinfo') || s.includes('nouvelle gazette') || s.includes('la meuse') || s.includes('la province')) {
    return 'Presse quotidienne régionale • Du centre : Réseau d\'information locale (Charleroi, Liège, Mons, Tournai, Bruxelles).';
  }
  if (s.includes('le vif')) {
    return 'Presse hebdomadaire d\'investigation • Centre-droit / Pluraliste : Magazine d\'actualité belge réputé pour sa cellule d\'investigation sur les affaires publiques (dont Thunder Power, Nethys).';
  }
  if (s.includes('trends')) {
    return 'Presse économique et financière • De droite : Hebdomadaire d\'affaires libéral analysant la fiscalité et les entreprises belges.';
  }
  if (s.includes('les échos') || s.includes('lesechos')) {
    return 'Presse économique de référence • De droite : Quotidien financier et d\'entreprises français.';
  }
  if (s.includes('viktorovitch') || s.includes('clemovitch')) {
    return 'Canal indépendant • Plutôt de gauche : Analyse universitaire de la rhétorique politique, décodage des éléments de langage et esprit critique.';
  }
  if (s.includes('hygiène mentale')) {
    return 'Canal indépendant • Non aligné : Zététique et épistémologie appliquée, éducation populaire à l\'esprit critique et détection des sophismes.';
  }
  if (s.includes('basta')) {
    return 'Média indépendant • Plutôt de gauche : Journalisme sur les mouvements sociaux, la justice fiscale et les alternatives écologiques.';
  }
  if (s.includes('médor') || s.includes('medor')) {
    return 'Média coopératif indépendant • Non aligné : Journalisme d\'investigation belge d\'intérêt général financé par ses lecteurs.';
  }
  if (s.includes('alter échos') || s.includes('alter echos')) {
    return 'Média indépendant • Plutôt de gauche : Mensuel de journalisme social analysant la précarité, le travail et l\'action sociale en Belgique.';
  }
  if (s.includes('cumuleo')) {
    return 'Baromètre citoyen indépendant • Non aligné : Surveillance transpartisane des mandats, fonctions et rémunérations des mandataires belges.';
  }
  if (s.includes('anticor')) {
    return 'Association indépendante • Non alignée : Lutte citoyenne transpartisane contre la corruption et réhabilitation de l\'éthique en politique.';
  }
  if (s.includes('disclose')) {
    return 'Média indépendant d\'investigation • Non aligné : Révélations sur les lobbies d\'affaires, la surveillance algorithmique et les marchés d\'armement.';
  }

  const meta = getPoliticalLeaningMeta(leaning);
  const indep = isSourceIndependent(sourceName) ? 'Média indépendant • ' : '';
  return `${indep}${meta.label} : ${meta.description}`;
}

/**
 * Returns media ownership transparency details inspired by Ground News
 * (Corporate Conglomerate vs Independent Citizen Watchdog / Nonprofit)
 */
export function getSourceOwnership(sourceName: string): string {
  const s = sourceName.toLowerCase();
  if (s.includes('matribune') || s.includes('ma tribune')) {
    return '🌱 Collectif citoyen indépendant sans but lucratif';
  }
  if (s.includes('chronik') || s.includes('chronique')) {
    return '🌱 Revue critique associative sans actionnaire';
  }
  if (s.includes('parti du travail') || s.includes('ptb') || s.includes('solidaire') || s.includes('pvda')) {
    return '🚩 Parti politique & organe syndical militant';
  }
  if (s.includes('la libre') || s.includes('dhnet') || s.includes('dernière heure')) {
    return '🏢 Groupe IPM (Famille le Hodey - Actionnariat privé)';
  }
  if (s.includes('lecho') || s.includes('l\'écho')) {
    return '🏢 Mediafin (Groupe Rossel & Roularta)';
  }
  if (s.includes('le soir') || s.includes('sudinfo') || s.includes('nouvelle gazette')) {
    return '🏢 Groupe Rossel (Famille Hurbain)';
  }
  if (s.includes('pour.press')) {
    return '🌱 Coopérative citoyenne à finalité sociale';
  }
  if (s.includes('transparency')) {
    return '⚖️ ONG internationale d\'utilité publique';
  }
  if (s.includes('transparencia') || s.includes('cada')) {
    return '⚖️ Vigie citoyenne pour la publicité active';
  }
  if (s.includes('still pissing')) {
    return '🌱 Vigie citoyenne carolo indépendante';
  }
  if (s.includes('mediapart')) {
    return '🌱 Fonds de dotation pour une presse libre (sans pub)';
  }
  if (s.includes('blast')) {
    return '🌱 SCIC (Société Coopérative d\'Intérêt Collectif)';
  }
  if (s.includes('reflets')) {
    return '🌱 Média d\'investigation indépendant';
  }
  if (s.includes('basta')) {
    return '🌱 Association loi 1901 à but non lucratif';
  }
  if (s.includes('rtbf')) {
    return '🏛️ Entreprise publique autonome (FWB)';
  }
  if (s.includes('le figaro')) {
    return '🏢 Groupe Dassault';
  }
  if (s.includes('le monde')) {
    return '🏢 Groupe Le Monde (Fonds de dotation / Niel)';
  }
  if (s.includes('viktorovitch') || s.includes('clemovitch')) {
    return '🎓 Production universitaire indépendante';
  }
  if (s.includes('hygiène mentale')) {
    return '🧠 Média associatif d\'éducation populaire';
  }
  if (s.includes('osons causer')) {
    return '🌱 Média vidéo indépendant citoyen';
  }
  if (s.includes('elucid')) {
    return '🌱 Média d\'analyse indépendant citoyen (Olivier Berruyer)';
  }
  if (s.includes('thinkerview')) {
    return '🌱 Média vidéo associatif indépendant sans publicité';
  }
  if (s.includes('heureuka') || s.includes('heu?reka')) {
    return '🎓 Créateur indépendant en économie & finance';
  }
  if (s.includes('defakator')) {
    return '🧠 Vigie citoyenne de fact-checking indépendant';
  }
  if (s.includes('rwlp')) {
    return '✊ Réseau associatif et citoyen wallon de lutte contre la pauvreté';
  }
  if (s.includes('cadtm')) {
    return '⚖️ Réseau citoyen international d\'audit des dettes';
  }
  if (s.includes('barricade')) {
    return '🌱 ASBL d\'éducation permanente et d\'économie sociale (Liège)';
  }
  if (s.includes('solidarité contre l\'exclusion') || s.includes('csce')) {
    return '✊ Collectif citoyen et syndical d\'allocataires sociaux';
  }
  if (s.includes('ln24')) {
    return '🏢 Groupe IPM (Média d\'information continue belge)';
  }
  if (s.includes('wilfried')) {
    return '🗞️ Coopérative de presse belge indépendante';
  }
  if (s.includes('frustration')) {
    return '✊ Média de combat social indépendant';
  }
  if (s.includes('quadrature')) {
    return '⚖️ Association de défense des libertés numériques';
  }
  if (s.includes('technopolice')) {
    return '🧠 Observatoire citoyen des technologies de surveillance';
  }
  if (s.includes('reddit')) {
    return '👥 Communauté de discussion citoyenne participative';
  }
  if (isSourceIndependent(sourceName)) {
    return '🌱 Média citoyen indépendant';
  }
  return '🗞️ Presse d\'information générale';
}

/**
 * Returns geographic origin flag and country name
 */
export function getSourceCountry(sourceName: string): { country: string; flag: string } {
  const s = sourceName.toLowerCase();
  if (
    s.includes('la libre') ||
    s.includes('l\'écho') ||
    s.includes('lecho') ||
    s.includes('le soir') ||
    s.includes('sudinfo') ||
    s.includes('rtbf') ||
    s.includes('l\'avenir') ||
    s.includes('médor') ||
    s.includes('medor') ||
    s.includes('pour.press') ||
    s.includes('matribune') ||
    s.includes('chronik') ||
    s.includes('chronique') ||
    s.includes('ptb') ||
    s.includes('parti du travail') ||
    s.includes('solidaire') ||
    s.includes('pvda') ||
    s.includes('still pissing') ||
    s.includes('transparencia') ||
    s.includes('rwlp') ||
    s.includes('cadtm') ||
    s.includes('barricade') ||
    s.includes('solidarité contre l\'exclusion') ||
    s.includes('csce') ||
    s.includes('ln24') ||
    s.includes('wilfried') ||
    s.includes('technopolice') ||
    s.includes('de tijd') ||
    s.includes('voka') ||
    s.includes('uwe') ||
    s.includes('alter échos')
  ) {
    return { country: 'Belgique', flag: '🇧🇪' };
  }
  if (
    s.includes('mediapart') ||
    s.includes('blast') ||
    s.includes('le monde') ||
    s.includes('le figaro') ||
    s.includes('libération') ||
    s.includes('basta') ||
    s.includes('reflets') ||
    s.includes('humanité') ||
    s.includes('viktorovitch') ||
    s.includes('hygiène mentale') ||
    s.includes('osons causer') ||
    s.includes('elucid') ||
    s.includes('thinkerview') ||
    s.includes('heureuka') ||
    s.includes('defakator') ||
    s.includes('frustration') ||
    s.includes('regards') ||
    s.includes('quadrature') ||
    s.includes('causeur')
  ) {
    return { country: 'France', flag: '🇫🇷' };
  }
  return { country: 'International', flag: '🌍' };
}

export function getChannelBadge(channel: SourceChannel) {
  switch (channel) {
    case 'youtube':
      return {
        label: 'Vidéo YouTube',
        shortLabel: 'YouTube',
        badgeClass: 'bg-red-50 text-red-800 border-red-200',
        iconName: 'youtube',
      };
    case 'reseaux_sociaux':
      return {
        label: 'Réseau Citoyen',
        shortLabel: 'Réseau',
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
        iconName: 'share2',
      };
    case 'rapport_officiel':
      return {
        label: 'Vigie & CADA',
        shortLabel: 'CADA',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        iconName: 'fileText',
      };
    case 'presse':
    default:
      return {
        label: 'Presse d\'Investigation',
        shortLabel: 'Presse',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        iconName: 'newspaper',
      };
  }
}

/**
 * Directory of all notable francophone sources from Press Directory, Wikipedia & Précisément
 * with their default baseline leaning and category
 */
export interface SourceRegistryItem {
  id: string;
  name: string;
  country: 'Belgique' | 'France' | 'International';
  defaultLeaning: PoliticalLeaning;
  isIndependent: boolean;
  category: string;
  url: string;
  description: string;
}

export const FRANCOPHONE_SOURCES_REGISTRY: SourceRegistryItem[] = [
  // --- BELGIQUE : DROITE ---
  {
    id: 'src-la-libre',
    name: 'La Libre Belgique',
    country: 'Belgique',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse nationale d\'opinion',
    url: 'https://www.lalibre.be/',
    description: 'Grand quotidien belge d\'opinion de droite / centre-droit libéral et chrétien conservateur.',
  },
  {
    id: 'src-lecho',
    name: 'L\'Écho',
    country: 'Belgique',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse économique et financière',
    url: 'https://www.lecho.be/',
    description: 'Quotidien belge de l\'économie, de la finance et des entreprises.',
  },
  {
    id: 'src-trends',
    name: 'Trends-Tendances',
    country: 'Belgique',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse économique',
    url: 'https://trends.levif.be/',
    description: 'Magazine économique et financier libéral belge.',
  },

  // --- BELGIQUE : CENTRE / SERVICE PUBLIC / RÉGIONAL ---
  {
    id: 'src-le-soir',
    name: 'Le Soir',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse généraliste de référence',
    url: 'https://www.lesoir.be/',
    description: 'Quotidien belge généraliste et pluraliste de référence.',
  },
  {
    id: 'src-rtbf',
    name: 'RTBF Info',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Service public audiovisuel',
    url: 'https://www.rtbf.be/info',
    description: 'Média de service public de la Fédération Wallonie-Bruxelles.',
  },
  {
    id: 'src-le-vif',
    name: 'Le Vif / L\'Express',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse hebdomadaire d\'investigation',
    url: 'https://www.levif.be/',
    description: 'Hebdomadaire belge réputé pour ses révélations d\'investigation politique et économique.',
  },
  {
    id: 'src-lavenir',
    name: 'L\'Avenir',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse régionale wallonne',
    url: 'https://www.lavenir.net/',
    description: 'Quotidien de proximité en Wallonie (Namur, Liège, Hainaut, Brabant, Luxembourg).',
  },
  {
    id: 'src-dh',
    name: 'DH Les Sports+',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse populaire',
    url: 'https://www.dhnet.be/',
    description: 'Quotidien d\'information générale et populaire en Wallonie et à Bruxelles.',
  },
  {
    id: 'src-sudinfo',
    name: 'Sudinfo (La Meuse, La Nouvelle Gazette)',
    country: 'Belgique',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse quotidienne régionale',
    url: 'https://www.sudinfo.be/',
    description: 'Réseau de presse quotidienne locale à Charleroi, Liège, Mons, Namur.',
  },

  // --- BELGIQUE : INDÉPENDANTS & VIGIES ---
  {
    id: 'src-transparency-belgium',
    name: 'Transparency International Belgium',
    country: 'Belgique',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'ONG & Enquêtes anti-corruption',
    url: 'https://transparencybelgium.be/',
    description: 'Section belge de l\'ONG internationale enquêtant sur la corruption (ex: procès pénal Semlex).',
  },
  {
    id: 'src-transparencia',
    name: 'Transparencia.be',
    country: 'Belgique',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'Plateforme citoyenne & CADA',
    url: 'https://transparencia.be/',
    description: 'Plateforme citoyenne d\'accès public aux documents administratifs et recours CADA.',
  },
  {
    id: 'src-cumuleo',
    name: 'Cumuleo',
    country: 'Belgique',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'Baromètre citoyen',
    url: 'https://www.cumuleo.be/',
    description: 'Baromètre indépendant des mandats, fonctions et rémunérations des mandataires belges.',
  },
  {
    id: 'src-still-pissing',
    name: 'Still Pissing',
    country: 'Belgique',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'Lanceur d\'alerte citoyen',
    url: 'https://www.facebook.com/stillpissingcharleroi/',
    description: 'Vigie citoyenne carolo satirique et indépendante surveillant les marchés et intercommunales.',
  },
  {
    id: 'src-matribune',
    name: 'Ma Tribune',
    country: 'Belgique',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Média citoyen engagé',
    url: 'https://matribune.be/',
    description: 'Collectif belge défendant les droits des allocataires sociaux et des travailleurs.',
  },
  {
    id: 'src-pour-press',
    name: 'Pour.press',
    country: 'Belgique',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Média indépendant d\'opinion',
    url: 'https://pour.press/',
    description: 'Média indépendant sans publicité traitant des enjeux sociaux, écologiques et de santé publique.',
  },
  {
    id: 'src-chronik',
    name: 'Chronik.be',
    country: 'Belgique',
    defaultLeaning: 'gauche_radicale',
    isIndependent: true,
    category: 'Revue critique indépendante',
    url: 'https://www.chronik.be/',
    description: 'Revue critique belge déconstruisant les politiques d\'austérité et les réformes de l\'emploi.',
  },
  {
    id: 'src-medor',
    name: 'Médor',
    country: 'Belgique',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'Coopérative d\'investigation',
    url: 'https://medor.coop/',
    description: 'Magazine trimestriel belge d\'enquêtes d\'intérêt public financé par ses lecteurs.',
  },
  {
    id: 'src-alter-echos',
    name: 'Alter Échos',
    country: 'Belgique',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Média social indépendant',
    url: 'https://www.alterechos.be/',
    description: 'Agence de presse sociale belge décortiquant la précarité, le droit au travail et l\'action sociale.',
  },

  // --- FRANCE & INTERNATIONAL : DROITE ---
  {
    id: 'src-le-figaro',
    name: 'Le Figaro',
    country: 'France',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse nationale républicaine',
    url: 'https://www.lefigaro.fr/',
    description: 'Grand quotidien national français libéral et conservateur.',
  },
  {
    id: 'src-les-echos',
    name: 'Les Échos',
    country: 'France',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse économique',
    url: 'https://www.lesechos.fr/',
    description: 'Quotidien français d\'information économique et financière.',
  },
  {
    id: 'src-valeurs-actuelles',
    name: 'Valeurs Actuelles',
    country: 'France',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Presse d\'opinion de droite',
    url: 'https://www.valeursactuelles.com/',
    description: 'Hebdomadaire d\'opinion de droite conservatrice et souverainiste.',
  },
  {
    id: 'src-le-point',
    name: 'Le Point',
    country: 'France',
    defaultLeaning: 'droite',
    isIndependent: false,
    category: 'Hebdomadaire d\'actualité',
    url: 'https://www.lepoint.fr/',
    description: 'Hebdomadaire d\'information libéral de centre-droit.',
  },

  // --- FRANCE & INTERNATIONAL : CENTRE ---
  {
    id: 'src-le-monde',
    name: 'Le Monde',
    country: 'France',
    defaultLeaning: 'centre',
    isIndependent: false,
    category: 'Presse de référence',
    url: 'https://www.lemonde.fr/',
    description: 'Quotidien français de référence internationale.',
  },

  // --- FRANCE & INTERNATIONAL : INDÉPENDANTS (PRÉCISÉMENT.ORG) ---
  {
    id: 'src-mediapart',
    name: 'Mediapart',
    country: 'France',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Presse d\'investigation indépendante',
    url: 'https://www.mediapart.fr/',
    description: 'Pionnier du journalisme d\'investigation indépendant financé sans pub ni subventions.',
  },
  {
    id: 'src-basta',
    name: 'Basta!',
    country: 'France',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Média indépendant sur les mouvements sociaux',
    url: 'https://basta.media/',
    description: 'Journalisme en ligne d\'intérêt public sur les luttes sociales, le travail et l\'écologie.',
  },
  {
    id: 'src-reflets',
    name: 'Reflets.info',
    country: 'France',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Enquêtes & Surveillance citoyenne',
    url: 'https://reflets.info/',
    description: 'Journal d\'investigation sur les dérives technologiques, l\'IA de contrôle social et la finance.',
  },
  {
    id: 'src-disclose',
    name: 'Disclose',
    country: 'France',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'ONG de journalisme d\'investigation',
    url: 'https://disclose.ngo/',
    description: 'Média d\'investigation associatif et transpartisan d\'intérêt général.',
  },
  {
    id: 'src-acrimed',
    name: 'Acrimed',
    country: 'France',
    defaultLeaning: 'gauche_radicale',
    isIndependent: true,
    category: 'Observatoire critique des médias',
    url: 'https://www.acrimed.org/',
    description: 'Action Critique Médias : décryptage des monopoles médiatiques et des propagandes d\'État.',
  },
  {
    id: 'src-blast',
    name: 'Blast',
    country: 'France',
    defaultLeaning: 'gauche_radicale',
    isIndependent: true,
    category: 'WebTV d\'investigation de contre-pouvoir',
    url: 'https://www.blast-info.fr/',
    description: 'Télévision en ligne indépendante traquant la corruption financière et les collusions d\'État.',
  },
  {
    id: 'src-viktorovitch',
    name: 'Clément Viktorovitch',
    country: 'France',
    defaultLeaning: 'gauche',
    isIndependent: true,
    category: 'Chaîne d\'auto-défense intellectuelle',
    url: 'https://www.youtube.com/@Clemovitch',
    description: 'Analyse rhétorique et décodage des éléments de langage et sophismes politiques.',
  },
  {
    id: 'src-hygiene-mentale',
    name: 'Hygiène Mentale',
    country: 'France',
    defaultLeaning: 'independant_non_aligne',
    isIndependent: true,
    category: 'Chaîne de pensée critique & zététique',
    url: 'https://www.youtube.com/@HygieneMentale',
    description: 'Zététique, méthode scientifique et détection des biais cognitifs vulgarisés.',
  },
  {
    id: 'src-ptb',
    name: 'Parti du Travail de Belgique',
    country: 'Belgique',
    defaultLeaning: 'gauche_radicale',
    isIndependent: false,
    category: 'Parti & Média ouvrier',
    url: 'https://www.ptb.be/',
    description: 'Parti politique et organe d\'analyse ouvrier belge de gauche radicale / marxiste.',
  },
];

/**
 * Returns a dynamically unified list of all sources:
 * - Preloaded registry items
 * - All sources discovered in live alerts
 * - Any custom source overrides saved by the user
 * Guarantees that any new source in the app can be customized!
 */
export function getUnifiedSourcesList(
  alerts: { source: string; sourceUrl?: string; politicalLeaning?: PoliticalLeaning }[] = []
): SourceRegistryItem[] {
  const customOverrides = getCustomSourceLeanings();
  const knownMap = new Map<string, SourceRegistryItem>();

  // 1. Preload static registry
  FRANCOPHONE_SOURCES_REGISTRY.forEach((item) => {
    const key = normalizeSourceName(item.name);
    knownMap.set(key, item);
  });

  // 2. Discover and merge any sources from alerts dynamically!
  alerts.forEach((alert) => {
    if (!alert.source || !alert.source.trim()) return;
    const key = normalizeSourceName(alert.source);
    if (!knownMap.has(key)) {
      const defaultL = inferPoliticalLeaningFromSource(alert.source, alert.sourceUrl, alert.politicalLeaning);
      const isIndep = isSourceIndependent(alert.source, alert.sourceUrl);
      const sLower = alert.source.toLowerCase();
      const isBelgian =
        sLower.includes('belgique') ||
        sLower.includes('wallonie') ||
        sLower.includes('bruxelles') ||
        sLower.includes('ptb') ||
        sLower.includes('forem') ||
        sLower.includes('onem') ||
        sLower.includes('fgtb') ||
        sLower.includes('csc') ||
        (alert.sourceUrl?.includes('.be') ?? false);

      knownMap.set(key, {
        id: `src-dyn-${key}`,
        name: alert.source,
        country: isBelgian ? 'Belgique' : 'France',
        defaultLeaning: defaultL,
        isIndependent: isIndep,
        category: isIndep ? 'Média indépendant / Vigie' : 'Média / Organisation',
        url: alert.sourceUrl || '#',
        description: getSourceTendencyDescription(alert.source, defaultL),
      });
    }
  });

  // 3. Include any custom overrides that user might have added manually
  Object.keys(customOverrides).forEach((key) => {
    if (!knownMap.has(key)) {
      const storedLeaning = customOverrides[key];
      const displayName = key.charAt(0).toUpperCase() + key.slice(1);
      knownMap.set(key, {
        id: `src-custom-${key}`,
        name: displayName,
        country: 'Belgique',
        defaultLeaning: storedLeaning,
        isIndependent: false,
        category: 'Source personnalisée',
        url: '#',
        description: `Source personnalisée (${POLITICAL_LEANING_MAP[storedLeaning]?.label || storedLeaning})`,
      });
    }
  });

  return Array.from(knownMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
