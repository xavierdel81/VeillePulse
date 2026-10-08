import React, { useState, useMemo, useEffect } from 'react';
import {
  NewsAlert,
  SentimentType,
  SourceChannel,
  PoliticalLeaning,
} from '../types/watch';
import {
  ExternalLink,
  Sparkles,
  Send,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCheck,
  Copy,
  SlidersHorizontal,
  Search,
  Filter,
  Flame,
  Archive,
  Clock,
  Quote,
  BookOpen,
  X,
  Compass,
  Video,
  Newspaper,
  Edit3,
  Scale,
  Building2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  getPoliticalLeaningMeta,
  getWaybackMachineUrl,
  getSourceTendencyDescription,
  isSourceIndependent,
  getEffectivePoliticalLeaning,
  setCustomSourceLeaning,
  getSourceOwnership,
  getSourceCountry,
} from '../utils/politicalLeaning';
import {
  getDominantIdeologicalBias,
  assessRhetoricAndFallacies,
  assessCrossMediaCoverage,
} from '../utils/rhetoricAndReliability';
import { getSafeArticleUrl } from '../utils/urlHelper';
import { formatArticleDateWithYear } from '../utils/dateHelper';
import { SourceLeaningModal } from './SourceLeaningModal';
import { GroundNewsBarometer } from './GroundNewsBarometer';
import { GroundNewsPerspectiveModal, StoryClusterData } from './GroundNewsPerspectiveModal';
import { MediaLogo } from './MediaLogo';

interface LiveAlertFeedProps {
  alerts: NewsAlert[];
  onToggleBookmark: (id: string) => void;
  onToggleRead?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onSendEmailAlert?: (alert: NewsAlert) => void;
  onSendSingleEmail?: (alert: NewsAlert) => Promise<boolean>;
  onDeepAnalyze?: (alert: NewsAlert) => void;
  recipientEmail?: string;
  isSendingEmailId?: string | null;
  onTriggerGlobalScan?: () => void;
}

/**
 * Resilient Image component with robust error fallback.
 * Prevents broken images from breaking the layout.
 */
const ResilientImage: React.FC<{
  src?: string;
  alt: string;
  source: string;
  topicTitle: string;
  isVideo?: boolean;
}> = ({ src, alt, source, topicTitle, isVideo }) => {
  const [hasError, setHasError] = useState(false);
  const country = getSourceCountry(source);

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-slate-900 p-3.5 flex flex-col justify-between text-white relative select-none">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-bold flex items-center gap-1">
            <span>{country.flag}</span>
            <span>{source}</span>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
            {topicTitle}
          </span>
        </div>
        <div className="my-auto py-1">
          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1">
            <Newspaper className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug">
            {alt}
          </p>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">
          Veille citoyenne
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100">
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        loading="lazy"
      />
      {isVideo && (
        <div className="absolute inset-0 bg-slate-950/25 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
            <Video className="w-4 h-4 fill-current" />
          </div>
        </div>
      )}
      <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs rounded text-[10px] text-white truncate font-medium flex items-center justify-between">
        <span className="truncate">{source}</span>
        <span className="text-slate-300 shrink-0 ml-1">{topicTitle}</span>
      </div>
    </div>
  );
};

export const LiveAlertFeed: React.FC<LiveAlertFeedProps> = ({
  alerts,
  onToggleBookmark,
  onToggleRead,
  onMarkAsRead,
  onSendEmailAlert,
  onSendSingleEmail,
  onDeepAnalyze,
  recipientEmail,
  isSendingEmailId: externalIsSendingEmailId,
}) => {
  // Primary timeframe / channel tab
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'archive' | 'youtube' | 'presse' | 'social'>('all');

  // Ground News story cluster filter (from trending topics)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [leaningFilter, setLeaningFilter] = useState<PoliticalLeaning | 'all'>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Expanded details per card (id -> boolean)
  const [expandedCardDetails, setExpandedCardDetails] = useState<Record<string, boolean>>({});

  // Modals state
  const [readingAlert, setReadingAlert] = useState<NewsAlert | null>(null);
  const [comparingCluster, setComparingCluster] = useState<StoryClusterData | null>(null);
  const [isLeaningModalOpen, setIsLeaningModalOpen] = useState(false);
  const [editingSourceLeaningFor, setEditingSourceLeaningFor] = useState<{ sourceName: string; currentLeaning: PoliticalLeaning } | null>(null);
  const [, setLeaningsVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setLeaningsVersion((v) => v + 1);
    window.addEventListener('custom-source-leanings-updated', handleUpdate);
    return () => window.removeEventListener('custom-source-leanings-updated', handleUpdate);
  }, []);

  const [internalSendingId, setInternalSendingId] = useState<string | null>(null);
  const [sentSuccessId, setSentSuccessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const effectiveSendingId = externalIsSendingEmailId || internalSendingId;

  const handleToggleReadAlert = (id: string) => {
    if (onToggleRead) {
      onToggleRead(id);
    } else if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleCopyLink = (alert: NewsAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    const safeUrl = getSafeArticleUrl(alert.sourceUrl, alert.title, alert.source);
    try {
      navigator.clipboard?.writeText(safeUrl);
    } catch {
      // quiet fallback
    }
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendEmail = async (alert: NewsAlert, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSendEmailAlert) {
      onSendEmailAlert(alert);
      return;
    }
    if (!onSendSingleEmail || effectiveSendingId) return;

    setInternalSendingId(alert.id);
    try {
      const ok = await onSendSingleEmail(alert);
      if (ok) {
        setSentSuccessId(alert.id);
        setTimeout(() => setSentSuccessId(null), 3000);
      }
    } finally {
      setInternalSendingId(null);
    }
  };

  const toggleCardExpansion = (id: string) => {
    setExpandedCardDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Categorize alerts into Recent (< 1 an) vs Archive (> 1 an)
  const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const nowMs = Date.now();

  const isAlertArchive = (alert: NewsAlert): boolean => {
    if (alert.tags?.includes('archive')) return true;
    if (alert.publishedAt?.toLowerCase().includes('archive')) return true;
    if (alert.publishedDateExact) {
      const date = new Date(alert.publishedDateExact).getTime();
      if (!isNaN(date) && nowMs - date > ONE_YEAR_MS) {
        return true;
      }
    }
    return false;
  };

  const recentAlerts = useMemo(() => alerts.filter((a) => !isAlertArchive(a)), [alerts]);
  const archiveAlerts = useMemo(() => alerts.filter((a) => isAlertArchive(a)), [alerts]);
  const youtubeAlerts = useMemo(() => alerts.filter((a) => a.sourceType === 'youtube' || !!a.videoUrl), [alerts]);
  const presseAlerts = useMemo(() => alerts.filter((a) => (a.sourceType || 'presse') === 'presse' && !a.videoUrl), [alerts]);
  const socialAlerts = useMemo(() => alerts.filter((a) => a.sourceType === 'reseaux_sociaux' || a.sourceType === 'rapport_officiel'), [alerts]);
  const bookmarkedAlerts = useMemo(() => alerts.filter((a) => a.isBookmarked), [alerts]);

  // Story Clusters Map for calculating Ground News story distribution
  const storyClustersMap = useMemo(() => {
    const map = new Map<string, StoryClusterData>();
    const grouped = new Map<string, NewsAlert[]>();

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

      if (!grouped.has(clusterKey)) {
        grouped.set(clusterKey, []);
      }
      grouped.get(clusterKey)!.push(alert);
    });

    grouped.forEach((cAlerts, key) => {
      let leftCount = 0;
      let centerCount = 0;
      let rightCount = 0;

      cAlerts.forEach((a) => {
        const eff = getEffectivePoliticalLeaning(a.source, a.politicalLeaning, a.sourceUrl);
        if (eff === 'gauche_radicale' || eff === 'gauche') leftCount++;
        else if (eff === 'droite' || eff === 'extreme_droite') rightCount++;
        else centerCount++;
      });

      const total = cAlerts.length || 1;
      const leftPercent = Math.round((leftCount / total) * 100);
      const centerPercent = Math.round((centerCount / total) * 100);
      const rightPercent = Math.max(0, 100 - leftPercent - centerPercent);

      let blindspot: 'gauche' | 'droite' | 'centre' | 'equilibre' = 'equilibre';
      let blindspotLabel = '⚖️ Couverture équilibrée';
      let blindspotBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';

      if (leftPercent >= 60 && rightPercent <= 20) {
        blindspot = 'droite';
        blindspotLabel = '🎯 Angle mort Droite';
        blindspotBadgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
      } else if (rightPercent >= 60 && leftPercent <= 20) {
        blindspot = 'gauche';
        blindspotLabel = '🎯 Angle mort Gauche';
        blindspotBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
      }

      map.set(key, {
        id: key,
        title: cAlerts[0]?.storyClusterTitle || cAlerts[0]?.title || 'Dossier',
        topicTitle: cAlerts[0]?.topicTitle || 'Veille',
        alerts: cAlerts,
        leftPercent,
        centerPercent,
        rightPercent,
        blindspot,
        blindspotLabel,
        blindspotBadgeClass,
      });
    });

    return map;
  }, [alerts]);

  // Filter alerts based on activeTab, selectedClusterId, search, leaning, bookmarked
  const filteredAlerts = useMemo(() => {
    let list = alerts;

    // 1. Tab filter
    if (activeTab === 'recent') {
      list = recentAlerts;
    } else if (activeTab === 'archive') {
      list = archiveAlerts;
    } else if (activeTab === 'youtube') {
      list = youtubeAlerts;
    } else if (activeTab === 'presse') {
      list = presseAlerts;
    } else if (activeTab === 'social') {
      list = socialAlerts;
    }

    // 2. Selected cluster filter
    if (selectedClusterId) {
      list = list.filter((a) => {
        const cluster = storyClustersMap.get(selectedClusterId);
        return cluster?.alerts.some((ca) => ca.id === a.id);
      });
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q) ||
          a.topicTitle.toLowerCase().includes(q) ||
          (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))) ||
          (a.keyTakeaways && a.keyTakeaways.some((k) => k.toLowerCase().includes(q)))
      );
    }

    // 4. Political Leaning filter
    if (leaningFilter !== 'all') {
      list = list.filter((a) => {
        const eff = getEffectivePoliticalLeaning(a.source, a.politicalLeaning, a.sourceUrl);
        if (leaningFilter === 'gauche') {
          return eff === 'gauche' || eff === 'gauche_radicale';
        }
        if (leaningFilter === 'droite') {
          return eff === 'droite' || eff === 'extreme_droite';
        }
        if (leaningFilter === 'centre') {
          return eff === 'centre' || eff === 'independant_non_aligne';
        }
        return eff === leaningFilter;
      });
    }

    // 5. Bookmarked filter
    if (onlyBookmarked) {
      list = list.filter((a) => a.isBookmarked);
    }

    return list;
  }, [
    alerts,
    activeTab,
    selectedClusterId,
    searchQuery,
    leaningFilter,
    onlyBookmarked,
    recentAlerts,
    archiveAlerts,
    youtubeAlerts,
    presseAlerts,
    socialAlerts,
    storyClustersMap,
  ]);

  const handleApplyInlineLeaning = (sourceName: string, leaning: PoliticalLeaning) => {
    setCustomSourceLeaning(sourceName, leaning);
    setEditingSourceLeaningFor(null);
  };

  const selectedClusterData = selectedClusterId ? storyClustersMap.get(selectedClusterId) : null;

  return (
    <div className="space-y-4">
      
      {/* 1. Baromètre Pluralisme Ground News */}
      <GroundNewsBarometer
        alerts={alerts}
        selectedClusterId={selectedClusterId}
        onSelectCluster={(cId) => setSelectedClusterId(cId)}
        onOpenAlertInReader={(alert) => setReadingAlert(alert)}
      />

      {/* Selected Cluster Active Notification Banner */}
      {selectedClusterData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-blue-700">Dossier sélectionné</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  {selectedClusterData.alerts.length} articles
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {selectedClusterData.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setComparingCluster(selectedClusterData)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 shadow-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Comparer les 3 perspectives</span>
            </button>
            <button
              onClick={() => setSelectedClusterId(null)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition"
            >
              Tous les flux
            </button>
          </div>
        </div>
      )}

      {/* 2. Sleek Ground News Filter & Search Bar */}
      <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs space-y-3">
        
        {/* Row 1: Segmented Primary Tabs - Légèrement agrandi pour lisibilité optimale */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            onClick={() => { setActiveTab('all'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Tous les flux ({alerts.length})
          </button>

          <button
            onClick={() => { setActiveTab('recent'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border flex items-center gap-1.5 ${
              activeTab === 'recent'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Récents &lt; 1 an ({recentAlerts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('archive'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border flex items-center gap-1.5 ${
              activeTab === 'archive'
                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Archive className="w-4 h-4 text-slate-400" />
            <span>Archives &gt; 1 an ({archiveAlerts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('youtube'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border flex items-center gap-1.5 ${
              activeTab === 'youtube'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4 text-red-500" />
            <span>Vidéos YouTube ({youtubeAlerts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('presse'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border ${
              activeTab === 'presse'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Presse ({presseAlerts.length})
          </button>

          <button
            onClick={() => { setActiveTab('social'); setSelectedClusterId(null); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition border ${
              activeTab === 'social'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Vigies &amp; Réseaux ({socialAlerts.length})
          </button>
        </div>

        {/* Row 2: Search Input & Political Bias Filters - Police légèrement agrandie */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, faits, Defakator, CADA, chômage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Political Leaning Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
            <span className="text-slate-500 font-bold mr-1 hidden lg:inline">Spectre :</span>
            
            <button
              onClick={() => setLeaningFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition border ${
                leaningFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tous
            </button>

            <button
              onClick={() => setLeaningFilter('gauche')}
              className={`px-3 py-1.5 rounded-lg font-bold transition border flex items-center gap-1.5 ${
                leaningFilter === 'gauche'
                  ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                  : 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Gauche (Rouge)</span>
            </button>

            <button
              onClick={() => setLeaningFilter('centre')}
              className={`px-3 py-1.5 rounded-lg font-bold transition border flex items-center gap-1.5 ${
                leaningFilter === 'centre'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-2xs'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Centre &amp; Fact-check</span>
            </button>

            <button
              onClick={() => setLeaningFilter('droite')}
              className={`px-3 py-1.5 rounded-lg font-bold transition border flex items-center gap-1.5 ${
                leaningFilter === 'droite'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Droite (Bleu)</span>
            </button>

            {/* Bookmarked Filter */}
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`px-3 py-1.5 rounded-lg font-bold transition border flex items-center gap-1.5 ${
                onlyBookmarked
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Afficher uniquement les articles marqués en signet"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Signets ({bookmarkedAlerts.length})</span>
            </button>

            {/* Leaning Settings Modal Button */}
            <button
              onClick={() => setIsLeaningModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition"
              title="Gérer les attributions politiques des sources"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Ground News Story Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Aucun article ne correspond à votre filtre
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            Modifiez vos mots-clés ou réinitialisez les filtres de tendance.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
              setLeaningFilter('all');
              setOnlyBookmarked(false);
              setSelectedClusterId(null);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAlerts.map((alert) => {
            const isSending = effectiveSendingId === alert.id;
            const waybackUrl = alert.archiveUrl || getWaybackMachineUrl(alert.sourceUrl);
            const effectiveLeaning = getEffectivePoliticalLeaning(alert.source, alert.politicalLeaning, alert.sourceUrl, alert.title, alert.summary);
            const leaningMeta = getPoliticalLeaningMeta(effectiveLeaning);
            const isVideo = alert.sourceType === 'youtube' || !!alert.videoUrl;
            const country = getSourceCountry(alert.source);
            const ownership = getSourceOwnership(alert.source);
            const isExpanded = !!expandedCardDetails[alert.id];

            // Cluster info if available
            const clusterKey = alert.storyClusterId || (
              alert.title.toLowerCase().includes('chômage') || alert.title.toLowerCase().includes('emploi')
                ? 'cluster-reforme-chomage'
                : alert.title.toLowerCase().includes('semlex') || alert.title.toLowerCase().includes('corruption')
                ? 'cluster-corruption-marches'
                : alert.title.toLowerCase().includes('cada') || alert.title.toLowerCase().includes('délibération')
                ? 'cluster-cada-transparence'
                : alert.title.toLowerCase().includes('ia') || alert.title.toLowerCase().includes('algorithme')
                ? 'cluster-ia-surveillance'
                : alert.title.toLowerCase().includes('defakator') || alert.title.toLowerCase().includes('hygiène mentale') || alert.title.toLowerCase().includes('sophisme') || alert.title.toLowerCase().includes('critique')
                ? 'cluster-esprit-critique'
                : alert.title.toLowerCase().includes('thunder power')
                ? 'cluster-thunder-power'
                : `cluster-${alert.topicId}`
            );
            const clusterData = storyClustersMap.get(clusterKey);

            return (
              <article
                key={alert.id}
                className={`newspaper-texture-card rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition ${
                  alert.isRead ? 'opacity-80' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row gap-4 sm:gap-5">
                  
                  {/* Left Column: Unique high-res Thumbnail - Agrandie pour une présence visuelle optimale */}
                  <div className="w-full md:w-64 lg:w-72 h-48 sm:h-52 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200 group shadow-2xs">
                    <ResilientImage
                      src={alert.imageUrl}
                      alt={alert.title}
                      source={alert.source}
                      topicTitle={alert.topicTitle}
                      isVideo={isVideo}
                    />
                  </div>

                  {/* Right Column: Ground News Story Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Top Metadata Line - Agrandie pour une lisibilité parfaite des sources et symboles */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          {/* Source with Logo & Flag - En grand format hautement visible */}
                          <div className="flex items-center gap-3 pr-2">
                            <MediaLogo sourceName={alert.source} size="lg" />
                            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                              {alert.source}
                            </span>
                            <span className="text-xl sm:text-2xl" title={country.country}>
                              {country.flag}
                            </span>
                          </div>

                          {/* Topic Pill */}
                          <span className="font-black text-xs sm:text-sm uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                            {alert.topicTitle}
                          </span>

                          {/* Ownership Icon */}
                          <span className="text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5" title={ownership}>
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span>{ownership}</span>
                          </span>

                          {/* Political Leaning Pill with inline edit button */}
                          <div className="relative inline-flex items-center">
                            <button
                              onClick={() =>
                                setEditingSourceLeaningFor(
                                  editingSourceLeaningFor?.sourceName === alert.source
                                    ? null
                                    : { sourceName: alert.source, currentLeaning: effectiveLeaning }
                                )
                              }
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-sm font-black border transition ${leaningMeta.badgeClass}`}
                              title="Modifier l'orientation de cette source"
                            >
                              <span className={`w-2 h-2 rounded-full ${leaningMeta.dotClass}`} />
                              <span>{leaningMeta.label}</span>
                              <Edit3 className="w-3.5 h-3.5 ml-0.5 opacity-70" />
                            </button>

                            {/* Inline quick popup to switch source leaning: Gauche=Rouge, Droite=Bleu */}
                            {editingSourceLeaningFor?.sourceName === alert.source && (
                              <div className="absolute left-0 top-full mt-2 z-40 bg-white rounded-xl shadow-2xl border border-slate-200 p-2.5 min-w-[240px] animate-in fade-in">
                                <div className="text-xs font-black text-slate-800 mb-1.5 pb-1 border-b border-slate-100 flex items-center justify-between">
                                  <span>Orientation : {alert.source}</span>
                                  <button onClick={() => setEditingSourceLeaningFor(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  <button onClick={() => handleApplyInlineLeaning(alert.source, 'gauche')} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-950 hover:bg-red-100 flex items-center gap-2 border border-red-200">
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                                    Gauche (Rouge)
                                  </button>
                                  <button onClick={() => handleApplyInlineLeaning(alert.source, 'centre')} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center gap-2 border border-slate-300">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                    Centre &amp; Fact-check (Gris)
                                  </button>
                                  <button onClick={() => handleApplyInlineLeaning(alert.source, 'droite')} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-950 hover:bg-blue-100 flex items-center gap-2 border border-blue-200">
                                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                    Droite (Bleu)
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Biais idéologique dominant (Demandé expressément par l'utilisateur) */}
                          {(() => {
                            const domBias = getDominantIdeologicalBias(alert.source, effectiveLeaning, alert.sourceUrl);
                            return (
                              <span
                                className={`text-xs px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${domBias.badgeClass}`}
                                title="Biais idéologique dominant analysé pour cette publication"
                              >
                                <span className={`w-2 h-2 rounded-full ${domBias.colorName === 'Rouge' ? 'bg-red-600' : domBias.colorName === 'Bleu' ? 'bg-blue-600' : 'bg-slate-400'}`} />
                                <span>{domBias.biasLabel}</span>
                              </span>
                            );
                          })()}

                          {/* Fiabilité dimension 1 : Reprise médiatique croisée */}
                          {(() => {
                            const crossCoverage = alert.crossMediaCoverage || assessCrossMediaCoverage(
                              alert.title,
                              clusterData?.alerts.length,
                              alerts.filter((a) => a.topicId === alert.topicId).length
                            );
                            const badgeCls = crossCoverage.badgeClass || (
                              crossCoverage.status === 'forte'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold'
                                : crossCoverage.status === 'moyenne'
                                ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold'
                                : 'bg-slate-100 text-slate-700 border-slate-300 font-semibold'
                            );
                            return (
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${badgeCls}`}
                                title="Fiabilité : Évalue si ce contenu est fortement repris par d'autres médias"
                              >
                                <Newspaper className="w-3 h-3 shrink-0" />
                                <span>{crossCoverage.label}</span>
                              </span>
                            );
                          })()}

                          {/* Fiabilité dimension 2 : Rhétorique & Détection des sophismes */}
                          {(() => {
                            const rhetoric = alert.rhetoricAssessment || assessRhetoricAndFallacies(
                              alert.title,
                              alert.summary,
                              alert.directQuote
                            );
                            const badgeCls = rhetoric.badgeClass || (
                              rhetoric.hasFallacies
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            );
                            return (
                              <span
                                className={`text-[11px] px-2.5 py-0.5 rounded-md border flex items-center gap-1 font-semibold ${badgeCls}`}
                                title={rhetoric.explanation}
                              >
                                {rhetoric.hasFallacies ? (
                                  <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                                ) : (
                                  <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                                )}
                                <span>{rhetoric.label}</span>
                              </span>
                            );
                          })()}

                          <span className="text-slate-300">•</span>

                          {/* Time with mandatory year */}
                          <span className="text-slate-500 flex items-center gap-1 text-xs">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatArticleDateWithYear(alert.publishedAt, alert.publishedDateExact)}</span>
                          </span>
                        </div>

                        {/* Quick action buttons (Bookmark, Read, Email) */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onToggleBookmark(alert.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              alert.isBookmarked
                                ? 'bg-amber-50 text-amber-600 border-amber-300'
                                : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                            }`}
                            title={alert.isBookmarked ? 'Retirer des signets' : 'Mettre de côté'}
                          >
                            {alert.isBookmarked ? (
                              <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                            ) : (
                              <Bookmark className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleReadAlert(alert.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              alert.isRead
                                ? 'bg-slate-100 text-emerald-600 border-slate-300'
                                : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                            }`}
                            title={alert.isRead ? 'Marqué comme lu' : 'Marquer comme lu'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => handleCopyLink(alert, e)}
                            className={`p-1.5 rounded-lg border transition ${
                              copiedId === alert.id
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-400 hover:text-blue-600 border-slate-200'
                            }`}
                            title={copiedId === alert.id ? 'Lien vérifié copié !' : "Copier le lien direct de l'article"}
                          >
                            {copiedId === alert.id ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Story Headline */}
                      {(() => {
                        const safeUrl = getSafeArticleUrl(alert.sourceUrl, alert.title, alert.source);
                        return (
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-1.5 hover:text-blue-600 transition">
                            <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {alert.title}
                            </a>
                          </h3>
                        );
                      })()}

                      {/* Story Excerpt */}
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-2.5">
                        {alert.summary}
                      </p>

                      {/* Direct Quote if available */}
                      {alert.directQuote && (
                        <div className="relative pl-3 py-1 mb-2.5 border-l-2 border-amber-500 text-xs text-slate-700 italic">
                          {alert.directQuote}
                        </div>
                      )}

                      {/* Ground News Bias Distribution Bar */}
                      {clusterData && (
                        <div className="pt-2 pb-1 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 flex-1 max-w-sm">
                            <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                              Biais Ground News :
                            </span>
                            <div className="h-2 w-32 rounded-full overflow-hidden flex bg-slate-100 shrink-0">
                              <div style={{ width: `${clusterData.leftPercent}%` }} className="bg-red-600" />
                              <div style={{ width: `${clusterData.centerPercent}%` }} className="bg-slate-300" />
                              <div style={{ width: `${clusterData.rightPercent}%` }} className="bg-blue-600" />
                            </div>
                            <span className="font-mono text-[11px] text-slate-700">
                              <strong className="text-red-700 font-black">{clusterData.leftPercent}% G (Rouge)</strong> ·{' '}
                              <strong className="text-blue-700 font-black">{clusterData.rightPercent}% D (Bleu)</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {clusterData.blindspot !== 'equilibre' && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${clusterData.blindspotBadgeClass}`}>
                                {clusterData.blindspotLabel}
                              </span>
                            )}
                            <button
                              onClick={() => setComparingCluster(clusterData)}
                              className="text-red-600 hover:text-red-800 font-bold text-xs inline-flex items-center gap-1 hover:underline"
                            >
                              <Scale className="w-3 h-3" />
                              <span>Comparer les {clusterData.alerts.length} sources</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expandable Details: Faits majeurs, Analyse rhétorique & Recoupement médias */}
                      {isExpanded && (
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2.5 animate-fade-in">
                          {/* Faits majeurs */}
                          {alert.keyTakeaways && alert.keyTakeaways.length > 0 && (
                            <div>
                              <div className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Faits majeurs vérifiés :</span>
                              </div>
                              <ul className="space-y-1 pl-4 list-disc text-slate-700">
                                {alert.keyTakeaways.map((takeaway, idx) => (
                                  <li key={idx}>{takeaway}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Analyse de la rhétorique et des sophismes */}
                          {(() => {
                            const rhetoric = alert.rhetoricAssessment || assessRhetoricAndFallacies(
                              alert.title,
                              alert.summary,
                              alert.directQuote
                            );
                            return (
                              <div className="p-2.5 rounded-lg border bg-white border-slate-200 space-y-1">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  {rhetoric.hasFallacies ? (
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                  )}
                                  <span>Analyse rhétorique &amp; Détection des sophismes :</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-xs">{rhetoric.explanation}</p>
                                {rhetoric.hasFallacies && rhetoric.fallaciesList && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {rhetoric.fallaciesList.map((f, idx) => (
                                      <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                        ⚠️ {f}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Recoupement et reprise par d'autres médias */}
                          {(() => {
                            const crossCoverage = alert.crossMediaCoverage || assessCrossMediaCoverage(
                              alert.title,
                              clusterData?.alerts.length,
                              alerts.filter((a) => a.topicId === alert.topicId).length
                            );
                            return (
                              <div className="p-2.5 rounded-lg border bg-white border-slate-200 space-y-1">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <Newspaper className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span>Recoupement médiatique &amp; Pluralisme :</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-xs">
                                  {crossCoverage.status === 'forte'
                                    ? `Cette information fait l'objet d'une large reprise concordante par au moins ${crossCoverage.count} rédactions différentes, renforçant sa fiabilité factuelle.`
                                    : crossCoverage.status === 'moyenne'
                                    ? `Information relayée par ${crossCoverage.count} médias. Couverture modérée en cours de corroboration.`
                                    : `Signal exclusif ou angle spécifique publié par ce média, peu repris pour le moment par la presse généraliste.`}
                                </p>
                              </div>
                            );
                          })()}

                          {alert.suggestedAction && (
                            <div className="pt-1 text-slate-600 border-t border-slate-200">
                              <strong className="text-slate-800">Action citoyenne recommandée :</strong> {alert.suggestedAction}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Action Footer Bar */}
                    <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Direct link */}
                        <a
                          href={getSafeArticleUrl(alert.sourceUrl, alert.title, alert.source)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                        >
                          {isVideo ? (
                            <>
                              <Video className="w-3.5 h-3.5" />
                              <span>Voir la vidéo</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Lire l'article</span>
                            </>
                          )}
                        </a>

                        {/* Wayback Machine Archive Link */}
                        <a
                          href={waybackUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                          title="Consulter la sauvegarde permanente sur Wayback Machine"
                        >
                          <Archive className="w-3.5 h-3.5 text-amber-600" />
                          <span>Wayback Archive</span>
                        </a>

                        {/* Full Reader Modal */}
                        <button
                          onClick={() => setReadingAlert(alert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>Fiche</span>
                        </button>

                        {/* Toggle Key Takeaways */}
                        {alert.keyTakeaways && alert.keyTakeaways.length > 0 && (
                          <button
                            onClick={() => toggleCardExpansion(alert.id)}
                            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium transition px-1 py-1"
                          >
                            <span>{isExpanded ? 'Masquer détails' : 'Détails'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      {/* Impact Score */}
                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        <span className="text-[11px]">Impact :</span>
                        <span className="font-bold text-xs font-mono text-slate-900">
                          {alert.impactScore}/100
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Reader Modal */}
      {readingAlert && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Fiche documentaire • {readingAlert.topicTitle}
              </span>
              <button
                onClick={() => setReadingAlert(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="w-full h-52 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
                <ResilientImage
                  src={readingAlert.imageUrl}
                  alt={readingAlert.title}
                  source={readingAlert.source}
                  topicTitle={readingAlert.topicTitle}
                />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {readingAlert.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">{readingAlert.source}</span>
                <span>•</span>
                <span>{formatArticleDateWithYear(readingAlert.publishedAt, readingAlert.publishedDateExact)}</span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {readingAlert.summary}
              </p>

              {/* Évaluation Transparente : Biais Idéologique Dominant & Fiabilité (Demandé par l'utilisateur) */}
              {(() => {
                const domBias = getDominantIdeologicalBias(
                  readingAlert.source,
                  getEffectivePoliticalLeaning(
                    readingAlert.source,
                    readingAlert.politicalLeaning,
                    readingAlert.sourceUrl,
                    readingAlert.title,
                    readingAlert.summary
                  ),
                  readingAlert.sourceUrl
                );
                const crossCoverage = readingAlert.crossMediaCoverage || assessCrossMediaCoverage(
                  readingAlert.title,
                  undefined,
                  alerts.filter((a) => a.topicId === readingAlert.topicId).length
                );
                const rhetoric = readingAlert.rhetoricAssessment || assessRhetoricAndFallacies(
                  readingAlert.title,
                  readingAlert.summary,
                  readingAlert.directQuote
                );

                return (
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Scale className="w-4 h-4 text-slate-600" />
                        <span>Biais dominant &amp; Fiabilité de l'article</span>
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md border font-extrabold ${domBias.badgeClass}`}>
                        {domBias.biasLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {/* Critère 1 : Reprise par d'autres médias */}
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
                          <Newspaper className="w-3.5 h-3.5 text-blue-600" />
                          <span>1. Reprise par d'autres médias</span>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border mb-1 ${
                            crossCoverage.badgeClass || (
                              crossCoverage.status === 'forte'
                                ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold'
                                : crossCoverage.status === 'moyenne'
                                ? 'bg-sky-50 text-sky-800 border-sky-200 font-bold'
                                : 'bg-slate-100 text-slate-700 border-slate-300 font-semibold'
                            )
                          }`}
                        >
                          <span>{crossCoverage.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {crossCoverage.status === 'forte'
                            ? "Cette information est largement corroborée et couverte par une multitude de rédactions, confirmant sa forte résonance publique."
                            : crossCoverage.status === 'moyenne'
                            ? "Cette actualité est relayée par plusieurs rédactions régionales ou nationales."
                            : "Signal d'investigation ou exclusivité d'un média unique : à recouper avec les documents publics."}
                        </p>
                      </div>

                      {/* Critère 2 : Rhétorique & Détection des sophismes */}
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5 mb-1">
                          {rhetoric.hasFallacies ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>2. Rhétorique &amp; Sophismes</span>
                        </div>
                        <div
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border mb-1 font-semibold ${
                            rhetoric.badgeClass || (
                              rhetoric.hasFallacies
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            )
                          }`}
                        >
                          <span>{rhetoric.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          {rhetoric.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {readingAlert.directQuote && (
                <div className="p-3 bg-amber-50/60 border-l-3 border-amber-500 rounded-r-lg text-xs sm:text-sm text-slate-800 italic">
                  {readingAlert.directQuote}
                </div>
              )}

              {readingAlert.keyTakeaways && readingAlert.keyTakeaways.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Faits majeurs &amp; vérifications :</span>
                  </div>
                  <ul className="space-y-1 list-disc pl-4 text-slate-700">
                    {readingAlert.keyTakeaways.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {readingAlert.suggestedAction && (
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900">
                  <strong className="font-bold">Action citoyenne suggérée :</strong> {readingAlert.suggestedAction}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={getSafeArticleUrl(readingAlert.sourceUrl, readingAlert.title, readingAlert.source)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Consulter sur {readingAlert.source}</span>
                </a>
                <a
                  href={readingAlert.archiveUrl || getWaybackMachineUrl(getSafeArticleUrl(readingAlert.sourceUrl, readingAlert.title, readingAlert.source))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <Archive className="w-3.5 h-3.5 text-amber-600" />
                  <span>Wayback</span>
                </a>
              </div>
              <button
                onClick={() => setReadingAlert(null)}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Perspective Comparison Modal */}
      {comparingCluster && (
        <GroundNewsPerspectiveModal
          cluster={comparingCluster}
          onClose={() => setComparingCluster(null)}
          onOpenAlertInReader={(alert) => setReadingAlert(alert)}
        />
      )}

      {/* Source Leaning Manager Modal */}
      <SourceLeaningModal
        isOpen={isLeaningModalOpen}
        onClose={() => setIsLeaningModalOpen(false)}
        onLeaningChanged={() => setLeaningsVersion((v) => v + 1)}
        alerts={alerts}
      />

    </div>
  );
};
