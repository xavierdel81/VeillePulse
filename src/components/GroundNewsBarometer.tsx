import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Scale,
  ArrowRight,
  ShieldCheck,
  X,
  Calendar,
} from 'lucide-react';
import { NewsAlert, PoliticalLeaning } from '../types/watch';
import {
  getEffectivePoliticalLeaning,
  getSourceOwnership,
  getSourceCountry,
} from '../utils/politicalLeaning';
import { formatArticleDateWithYear } from '../utils/dateHelper';
import { GroundNewsPerspectiveModal, StoryClusterData } from './GroundNewsPerspectiveModal';
import { MediaLogo } from './MediaLogo';

interface GroundNewsBarometerProps {
  alerts: NewsAlert[];
  selectedClusterId: string | null;
  onSelectCluster: (clusterId: string | null) => void;
  onOpenAlertInReader?: (alert: NewsAlert) => void;
  onFilterBySource?: (sourceName: string) => void;
}

export interface StoryCluster extends StoryClusterData {
  sourcesCount: number;
  sources: { name: string; leaning: PoliticalLeaning; ownership: string; country: { country: string; flag: string } }[];
  independentSourcesCount: number;
  conglomerateSourcesCount: number;
}

// Curated reference neutral sources and institutions
const REFERENCE_NEUTRAL_SOURCES = [
  { name: 'AFP (Agence France-Presse)', short: 'AFP', role: 'Agence de presse mondiale factuelle', tag: 'Presse d\'agence' },
  { name: 'Belga News Agency', short: 'Belga', role: 'Agence nationale de presse belge', tag: 'Presse d\'agence' },
  { name: 'CADA', short: 'CADA', role: 'Commission d\'Accès aux Documents Administratifs', tag: 'Institution publique' },
  { name: 'Les Décodeurs', short: 'Décodeurs', role: 'Vérification des faits & zététique', tag: 'Fact-checking' },
  { name: 'CheckNews', short: 'CheckNews', role: 'Fact-checking citoyen indépendant', tag: 'Fact-checking' },
  { name: 'Hygiène Mentale', short: 'H. Mentale', role: 'Épistémologie & auto-défense intellectuelle', tag: 'Zététique' },
  { name: 'Defakator', short: 'Defakator', role: 'Démystification de deepfakes et trucages', tag: 'Fact-checking' },
  { name: 'Courrier International', short: 'Courrier Int.', role: 'Revue de presse mondiale pluraliste', tag: 'Revue internationale' },
];

export const GroundNewsBarometer: React.FC<GroundNewsBarometerProps> = ({
  alerts,
  selectedClusterId,
  onSelectCluster,
  onOpenAlertInReader,
  onFilterBySource,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [comparingCluster, setComparingCluster] = useState<StoryCluster | null>(null);

  // Group alerts into Ground News story clusters
  const clusters: StoryCluster[] = useMemo(() => {
    const map = new Map<string, NewsAlert[]>();

    alerts.forEach((alert) => {
      let clusterKey = alert.storyClusterId;
      if (!clusterKey) {
        const titleLower = alert.title.toLowerCase();
        const summaryLower = alert.summary.toLowerCase();
        const combined = `${titleLower} ${summaryLower}`;

        if (combined.includes('chômage') || combined.includes('chomeur') || combined.includes('emploi') || combined.includes('allocataire') || combined.includes('bouchez')) {
          clusterKey = 'cluster-reforme-chomage';
        } else if (combined.includes('semlex') || combined.includes('corruption') || combined.includes('marché public') || combined.includes('intercommunale')) {
          clusterKey = 'cluster-corruption-marches';
        } else if (combined.includes('cada') || combined.includes('délibération') || combined.includes('transparence') || combined.includes('secret des affaires')) {
          clusterKey = 'cluster-cada-transparence';
        } else if (combined.includes('ia') || combined.includes('algorithme') || combined.includes('surveillance') || combined.includes('profilage')) {
          clusterKey = 'cluster-ia-surveillance';
        } else if (combined.includes('defakator') || combined.includes('hygiène mentale') || combined.includes('sophisme') || combined.includes('rhétorique') || combined.includes('esprit critique') || combined.includes('média')) {
          clusterKey = 'cluster-esprit-critique';
        } else if (combined.includes('thunder power') || combined.includes('sogepa') || combined.includes('gosselies')) {
          clusterKey = 'cluster-thunder-power';
        } else if (combined.includes('santé') || combined.includes('soignant') || combined.includes('hôpital') || combined.includes('médical')) {
          clusterKey = 'cluster-sante-solidarite';
        } else {
          clusterKey = `cluster-${alert.topicId}`;
        }
      }

      if (!map.has(clusterKey)) {
        map.set(clusterKey, []);
      }
      map.get(clusterKey)!.push(alert);
    });

    const result: StoryCluster[] = [];

    map.forEach((clusterAlerts, key) => {
      const sourcesMap = new Map<string, { leaning: PoliticalLeaning; ownership: string; country: { country: string; flag: string } }>();
      let leftCount = 0;
      let centerCount = 0;
      let rightCount = 0;
      let independentCount = 0;
      let conglomerateCount = 0;

      clusterAlerts.forEach((a) => {
        const eff = getEffectivePoliticalLeaning(a.source, a.politicalLeaning, a.sourceUrl, a.title, a.summary);
        const ownership = getSourceOwnership(a.source);
        const country = getSourceCountry(a.source);

        if (!sourcesMap.has(a.source)) {
          sourcesMap.set(a.source, { leaning: eff, ownership, country });
          if (ownership.includes('🌱') || ownership.includes('⚖️') || ownership.includes('🎓') || ownership.includes('🧠')) {
            independentCount += 1;
          } else {
            conglomerateCount += 1;
          }
        }

        // Gauche = ROUGE, Centre = GRIS, Droite = BLEU
        if (eff === 'gauche_radicale' || eff === 'gauche') {
          leftCount += 1;
        } else if (eff === 'droite' || eff === 'extreme_droite') {
          rightCount += 1;
        } else {
          centerCount += 1;
        }
      });

      const total = clusterAlerts.length || 1;
      const leftPercent = Math.round((leftCount / total) * 100);
      const centerPercent = Math.round((centerCount / total) * 100);
      const rightPercent = 100 - leftPercent - centerPercent;

      // Determine Ground News blindspot
      let blindspot: 'gauche' | 'droite' | 'centre' | 'equilibre' = 'equilibre';
      let blindspotLabel = '⚖️ Couverture équilibrée';
      let blindspotBadgeClass = 'bg-slate-100 text-slate-800 border-slate-200';

      if (leftPercent >= 60 && rightPercent <= 20) {
        blindspot = 'droite';
        blindspotLabel = '🎯 Angle mort Droite (60%+ Gauche)';
        blindspotBadgeClass = 'bg-red-50 text-red-900 border-red-200';
      } else if (rightPercent >= 50 && leftPercent <= 25) {
        blindspot = 'gauche';
        blindspotLabel = '🎯 Angle mort Gauche (50%+ Droite)';
        blindspotBadgeClass = 'bg-blue-50 text-blue-900 border-blue-200';
      } else if (centerPercent <= 20 && leftPercent >= 35 && rightPercent >= 35) {
        blindspot = 'centre';
        blindspotLabel = '⚡ Débat polarisé Gauche / Droite';
        blindspotBadgeClass = 'bg-purple-50 text-purple-900 border-purple-200';
      }

      const sourcesList = Array.from(sourcesMap.entries()).map(([name, data]) => ({
        name,
        leaning: data.leaning,
        ownership: data.ownership,
        country: data.country,
      }));

      const clusterTitle =
        clusterAlerts[0]?.storyClusterTitle ||
        (key === 'cluster-reforme-chomage'
          ? 'Réforme du chômage, sanctions et attaques contre les allocataires'
          : key === 'cluster-corruption-marches'
          ? 'Marchés publics, intercommunales wallonnes & Semlex'
          : key === 'cluster-cada-transparence'
          ? 'Transparence administrative CADA & accès aux délibérations'
          : key === 'cluster-ia-surveillance'
          ? 'IA, algorithmes d\'État & profilage numérique des citoyens'
          : key === 'cluster-esprit-critique'
          ? 'Zététique, auto-défense intellectuelle & décodage des sophismes'
          : key === 'cluster-thunder-power'
          ? 'Affaire Sogepa & débâcle financière Thunder Power à Gosselies'
          : key === 'cluster-sante-solidarite'
          ? 'Hôpitaux publics, déserts médicaux & santé solidaire'
          : clusterAlerts[0]?.topicTitle || 'Dossier d\'actualité');

      result.push({
        id: key,
        title: clusterTitle,
        topicTitle: clusterAlerts[0]?.topicTitle || 'Veille',
        alerts: clusterAlerts,
        sourcesCount: sourcesList.length,
        sources: sourcesList,
        independentSourcesCount: independentCount,
        conglomerateSourcesCount: conglomerateCount,
        leftPercent,
        centerPercent,
        rightPercent: Math.max(0, rightPercent),
        blindspot,
        blindspotLabel,
        blindspotBadgeClass,
      });
    });

    return result.sort((a, b) => b.alerts.length - a.alerts.length);
  }, [alerts]);

  // Overall feed spectrum breakdown (Total Pluralism Barometer)
  const overallBreakdown = useMemo(() => {
    let l = 0;
    let c = 0;
    let r = 0;
    alerts.forEach((a) => {
      const eff = getEffectivePoliticalLeaning(a.source, a.politicalLeaning, a.sourceUrl, a.title, a.summary);
      if (eff === 'gauche_radicale' || eff === 'gauche') l++;
      else if (eff === 'droite' || eff === 'extreme_droite') r++;
      else c++;
    });
    const total = alerts.length || 1;
    const leftP = Math.round((l / total) * 100);
    const centerP = Math.round((c / total) * 100);
    const rightP = 100 - leftP - centerP;
    return {
      leftP,
      centerP,
      rightP: Math.max(0, rightP),
      totalAlerts: alerts.length,
    };
  }, [alerts]);

  // Helper to extract the most recent timestamp for a cluster so newest topics appear first
  const getClusterLatestTimestamp = (cluster: StoryCluster): number => {
    let latest = 0;
    for (const a of cluster.alerts) {
      if (a.publishedDateExact) {
        const t = new Date(a.publishedDateExact).getTime();
        if (!isNaN(t) && t > latest) latest = t;
      }
      if (a.detectedAt) {
        const t = new Date(a.detectedAt).getTime();
        if (!isNaN(t) && t > latest) latest = t;
      }
    }
    if (latest === 0 && cluster.alerts[0]?.publishedAt) {
      const p = cluster.alerts[0].publishedAt;
      const m = p.match(/\b(19\d\d|20\d\d)\b/);
      if (m) {
        latest = parseInt(m[1], 10) * 100000000;
      }
    }
    return latest;
  };

  // 3 distinct lists for the 3 columns:
  // 1. Left column: Subjects treated by the Left (ROUGE), sorted most recent first
  const leftTreatedClusters = useMemo(() => {
    return [...clusters]
      .filter((c) => c.leftPercent >= 25 || c.blindspot === 'droite')
      .sort((a, b) => {
        const timeDiff = getClusterLatestTimestamp(b) - getClusterLatestTimestamp(a);
        if (timeDiff !== 0) return timeDiff;
        return b.leftPercent - a.leftPercent;
      });
  }, [clusters]);

  // 2. Right column: Subjects treated by the Right (BLEU), sorted most recent first
  const rightTreatedClusters = useMemo(() => {
    return [...clusters]
      .filter((c) => c.rightPercent >= 20 || c.blindspot === 'gauche')
      .sort((a, b) => {
        const timeDiff = getClusterLatestTimestamp(b) - getClusterLatestTimestamp(a);
        if (timeDiff !== 0) return timeDiff;
        return b.rightPercent - a.rightPercent;
      });
  }, [clusters]);

  // 3. Center column: Balanced/neutral subjects (GRIS), sorted most recent first
  const neutralTreatedClusters = useMemo(() => {
    return [...clusters]
      .filter((c) => c.centerPercent >= 20 || c.blindspot === 'equilibre' || c.id.includes('cada') || c.id.includes('esprit-critique'))
      .sort((a, b) => {
        const timeDiff = getClusterLatestTimestamp(b) - getClusterLatestTimestamp(a);
        if (timeDiff !== 0) return timeDiff;
        return b.centerPercent - a.centerPercent;
      });
  }, [clusters]);

  // Compute alert counts for reference neutral sources
  const neutralSourceCounts = useMemo(() => {
    const map = new Map<string, number>();
    alerts.forEach((a) => {
      const eff = getEffectivePoliticalLeaning(a.source, a.politicalLeaning, a.sourceUrl, a.title, a.summary);
      if (eff === 'centre' || eff === 'independant_non_aligne') {
        const key = a.source.toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [alerts]);

  return (
    <>
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all">
        
        {/* Barometer Global Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Baromètre du Pluralisme</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    3 Colonnes
                  </span>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Analyse comparative des {overallBreakdown.totalAlerts} signaux surveillés : <strong className="text-red-700 font-bold">Gauche (Rouge)</strong> · <strong className="text-slate-700 font-bold">Neutre (Gris)</strong> · <strong className="text-blue-700 font-bold">Droite (Bleu)</strong>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Toggle */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {/* 3 Pills: Gauche = ROUGE, Centre = GRIS, Droite = BLEU */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-black">
                {overallBreakdown.leftP}% Gauche (Rouge)
              </span>
              <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-black">
                {overallBreakdown.centerP}% Neutre (Gris)
              </span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-black">
                {overallBreakdown.rightP}% Droite (Bleu)
              </span>
            </div>

            {selectedClusterId && (
              <button
                onClick={() => onSelectCluster(null)}
                className="text-xs px-2.5 py-1.5 rounded-lg font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition inline-flex items-center gap-1"
                title="Afficher tous les sujets"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tous les sujets</span>
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition inline-flex items-center gap-1.5"
            >
              <span>{isExpanded ? 'Réduire' : 'Déplier les 3 colonnes'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Global Multi-Color Ground News Spectrum Bar: GAUCHE (ROUGE) - NEUTRE (GRIS) - DROITE (BLEU) */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50/80 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Médias de Gauche (Rouge : {overallBreakdown.leftP}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Sources Neutres &amp; Fact-check (Gris : {overallBreakdown.centerP}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Médias de Droite (Bleu : {overallBreakdown.rightP}%)</span>
            </span>
          </div>

          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
            <div
              style={{ width: `${overallBreakdown.leftP}%` }}
              className="bg-red-600 transition-all duration-500"
              title={`Gauche (Rouge) : ${overallBreakdown.leftP}%`}
            />
            <div
              style={{ width: `${overallBreakdown.centerP}%` }}
              className="bg-slate-400 transition-all duration-500"
              title={`Sources Neutres (Gris) : ${overallBreakdown.centerP}%`}
            />
            <div
              style={{ width: `${overallBreakdown.rightP}%` }}
              className="bg-blue-600 transition-all duration-500"
              title={`Droite (Bleu) : ${overallBreakdown.rightP}%`}
            />
          </div>
        </div>

        {/* 3 COLUMNS SECTION: GAUCHE (ROUGE) | SOURCES NEUTRES (GRIS) | DROITE (BLEU) */}
        {isExpanded && (
          <div className="p-4 sm:p-6 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-start">
              
              {/* ======================================================== */}
              {/* COLONNE 1 : SUJETS LES PLUS TRAITÉS PAR LA GAUCHE (ROUGE) */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border-2 border-red-200 shadow-xs flex flex-col overflow-hidden">
                <div className="px-4 py-3 bg-red-50/90 border-b border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 ring-2 ring-red-200" />
                      <h3 className="text-sm font-black text-red-950 uppercase tracking-wider">
                        Sujets traités à Gauche
                      </h3>
                    </div>
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                      Rouge
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-red-900 mt-1 leading-snug">
                    Dossiers prioritaires dans les médias de gauche, progressistes &amp; coopératifs
                  </p>
                </div>

                <div className="p-3.5 space-y-3.5 max-h-[640px] overflow-y-auto">
                  {leftTreatedClusters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Aucun sujet fortement couvert par la gauche actuellement.
                    </div>
                  ) : (
                    leftTreatedClusters.slice(0, 6).map((cluster) => {
                      const isSelected = selectedClusterId === cluster.id;
                      return (
                        <div
                          key={cluster.id}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-red-50/80 border-red-500 ring-2 ring-red-400/40 shadow-sm'
                              : 'newspaper-texture-card hover:border-red-300 hover:shadow-xs'
                          }`}
                          onClick={() => onSelectCluster(isSelected ? null : cluster.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-900 border border-red-200">
                              {cluster.leftPercent}% Couverture Gauche (Rouge)
                            </span>
                            <span className="text-xs font-bold text-slate-600 shrink-0">
                              {cluster.alerts.length} articles
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug hover:text-red-700 transition">
                            {cluster.title}
                          </h4>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatArticleDateWithYear(cluster.alerts[0]?.publishedAt, cluster.alerts[0]?.publishedDateExact)}</span>
                          </div>

                          {/* Ground News mini-bar: Left = Red (Gauche), Center = Slate (Neutre), Right = Blue (Droite) */}
                          <div className="my-2.5 h-2 w-full rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
                            <div style={{ width: `${cluster.leftPercent}%` }} className="bg-red-600" />
                            <div style={{ width: `${cluster.centerPercent}%` }} className="bg-slate-300" />
                            <div style={{ width: `${cluster.rightPercent}%` }} className="bg-blue-600" />
                          </div>

                          {/* Media logos row with enlarged readable text */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-xs font-bold text-slate-500 mr-0.5">Médias :</span>
                              {cluster.sources.slice(0, 4).map((s, idx) => (
                                <MediaLogo key={idx} sourceName={s.name} size="sm" />
                              ))}
                              {cluster.sources.length > 4 && (
                                <span className="text-xs text-slate-600 font-extrabold">
                                  +{cluster.sources.length - 4}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setComparingCluster(cluster);
                              }}
                              className="text-red-600 hover:text-red-800 font-black text-xs inline-flex items-center gap-1 shrink-0"
                            >
                              <span>Comparer</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* COLONNE 2 : SOURCES NEUTRES & FACT-CHECKING (GRIS)      */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border-2 border-slate-300 shadow-xs flex flex-col overflow-hidden">
                <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Sources Neutres &amp; Fact-check
                      </h3>
                    </div>
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-700 text-white">
                      Gris
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-1 leading-snug">
                    Agences de presse, institutions publiques et décryptage zététique indépendant
                  </p>
                </div>

                <div className="p-3.5 space-y-3.5 max-h-[640px] overflow-y-auto">
                  {/* Reference neutral sources cards */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-slate-500" />
                      <span>Médias &amp; Vigies citoyennes de référence</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {REFERENCE_NEUTRAL_SOURCES.map((source, idx) => {
                        const count = neutralSourceCounts.get(source.name.toLowerCase()) || 
                          neutralSourceCounts.get(source.short.toLowerCase()) || 
                          alerts.filter(a => a.source.toLowerCase().includes(source.short.toLowerCase())).length;

                        return (
                          <div
                            key={idx}
                            onClick={() => onFilterBySource && onFilterBySource(source.name)}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <MediaLogo sourceName={source.name} size="sm" />
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                  {source.name}
                                </div>
                                <div className="text-xs text-slate-500 truncate">
                                  {source.role}
                                </div>
                              </div>
                            </div>

                            <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                              {count > 0 ? `${count} signaux` : 'Actif'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Neutral & Fact-checked Dossiers */}
                  {neutralTreatedClusters.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Sujets traités de manière neutre / factuelle
                      </div>

                      {neutralTreatedClusters.slice(0, 3).map((cluster) => {
                        const isSelected = selectedClusterId === cluster.id;
                        return (
                          <div
                            key={cluster.id}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-100 border-slate-500 ring-2 ring-slate-300'
                                : 'newspaper-texture-card hover:border-slate-300 hover:shadow-xs'
                            }`}
                            onClick={() => onSelectCluster(isSelected ? null : cluster.id)}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                                {cluster.centerPercent}% Neutre (Gris)
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {cluster.alerts.length} signaux
                              </span>
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {cluster.title}
                            </h5>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{formatArticleDateWithYear(cluster.alerts[0]?.publishedAt, cluster.alerts[0]?.publishedDateExact)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* COLONNE 3 : SUJETS LES PLUS TRAITÉS PAR LA DROITE (BLEU) */}
              {/* ======================================================== */}
              <div className="bg-white rounded-xl border-2 border-blue-200 shadow-xs flex flex-col overflow-hidden">
                <div className="px-4 py-3 bg-blue-50/90 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                      <h3 className="text-sm font-black text-blue-950 uppercase tracking-wider">
                        Sujets traités à Droite
                      </h3>
                    </div>
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                      Bleu
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-900 mt-1 leading-snug">
                    Dossiers prioritaires dans les médias de droite, économiques &amp; libéraux
                  </p>
                </div>

                <div className="p-3.5 space-y-3.5 max-h-[640px] overflow-y-auto">
                  {rightTreatedClusters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      Aucun sujet fortement couvert par la droite actuellement.
                    </div>
                  ) : (
                    rightTreatedClusters.slice(0, 6).map((cluster) => {
                      const isSelected = selectedClusterId === cluster.id;
                      return (
                        <div
                          key={cluster.id}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/40 shadow-sm'
                              : 'newspaper-texture-card hover:border-blue-300 hover:shadow-xs'
                          }`}
                          onClick={() => onSelectCluster(isSelected ? null : cluster.id)}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                              {cluster.rightPercent}% Couverture Droite (Bleu)
                            </span>
                            <span className="text-xs font-bold text-slate-600 shrink-0">
                              {cluster.alerts.length} articles
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 leading-snug hover:text-blue-700 transition">
                            {cluster.title}
                          </h4>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formatArticleDateWithYear(cluster.alerts[0]?.publishedAt, cluster.alerts[0]?.publishedDateExact)}</span>
                          </div>

                          {/* Ground News mini-bar: Left = Red (Gauche), Center = Slate (Neutre), Right = Blue (Droite) */}
                          <div className="my-2.5 h-2 w-full rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
                            <div style={{ width: `${cluster.leftPercent}%` }} className="bg-red-600" />
                            <div style={{ width: `${cluster.centerPercent}%` }} className="bg-slate-300" />
                            <div style={{ width: `${cluster.rightPercent}%` }} className="bg-blue-600" />
                          </div>

                          {/* Media logos row with enlarged readable text */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <span className="text-xs font-bold text-slate-500 mr-0.5">Médias :</span>
                              {cluster.sources.slice(0, 4).map((s, idx) => (
                                <MediaLogo key={idx} sourceName={s.name} size="sm" />
                              ))}
                              {cluster.sources.length > 4 && (
                                <span className="text-xs text-slate-600 font-extrabold">
                                  +{cluster.sources.length - 4}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setComparingCluster(cluster);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-black text-xs inline-flex items-center gap-1 shrink-0"
                            >
                              <span>Comparer</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </section>

      {/* Perspective Comparison Modal */}
      {comparingCluster && (
        <GroundNewsPerspectiveModal
          cluster={comparingCluster}
          isOpen={true}
          onClose={() => setComparingCluster(null)}
          onOpenAlertInReader={onOpenAlertInReader}
        />
      )}
    </>
  );
};
