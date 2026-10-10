import React, { useState } from 'react';
import { WatchSource, TopicScope, SourceCategory, PoliticalLeaning, SourceChannel } from '../types/watch';
import {
  Globe,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  RotateCcw,
  Zap,
  Filter,
  CheckCircle2,
  Rss,
  MapPin,
  Flag,
  Share2,
  Loader2,
  Sparkles,
  Play,
  Compass,
} from 'lucide-react';
import {
  getPoliticalLeaningMeta,
  getChannelBadge,
  getEffectivePoliticalLeaning,
} from '../utils/politicalLeaning';

interface SourceManagerProps {
  sources: WatchSource[];
  onToggleSourceActive: (id: string) => void;
  onScanSingleSource: (source: WatchSource) => void;
  onOpenAddModal: () => void;
  onEditSource: (source: WatchSource) => void;
  onDeleteSource: (id: string) => void;
  onResetToDefaults: () => void;
  onActivateOnlySources?: (ids: string[]) => void;
  onSetAllSourcesActive?: (active: boolean) => void;
  scanningSourceId?: string | null;
}

export const SourceManager: React.FC<SourceManagerProps> = ({
  sources,
  onToggleSourceActive,
  onScanSingleSource,
  onOpenAddModal,
  onEditSource,
  onDeleteSource,
  onResetToDefaults,
  onActivateOnlySources,
  onSetAllSourcesActive,
  scanningSourceId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<TopicScope | 'all' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<SourceCategory | 'all'>('all');
  const [selectedLeaning, setSelectedLeaning] = useState<PoliticalLeaning | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<SourceChannel | 'all'>('all');

  // Counts
  const totalCount = sources.length;
  const activeCount = sources.filter((s) => s.isActive).length;
  const localCount = sources.filter((s) => s.scope === 'local').length;
  const nationalCount = sources.filter((s) => s.scope === 'national').length;
  const internationalCount = sources.filter((s) => s.scope === 'international').length;
  const customCount = sources.filter((s) => s.isCustom).length;
  const youtubeCount = sources.filter((s) => s.channel === 'youtube' || s.category === 'chaine_youtube').length;

  // Filter logic
  const filteredSources = sources.filter((source) => {
    // Scope filter
    if (selectedScope === 'custom' && !source.isCustom) return false;
    if (selectedScope !== 'all' && selectedScope !== 'custom' && source.scope !== selectedScope) return false;

    // Category filter
    if (selectedCategory !== 'all' && source.category !== selectedCategory) return false;

    // Channel filter
    if (selectedChannel !== 'all') {
      const ch = source.channel || (source.category === 'chaine_youtube' ? 'youtube' : 'presse');
      if (ch !== selectedChannel) return false;
    }

    // Political Leaning filter
    if (selectedLeaning !== 'all') {
      const eff = getEffectivePoliticalLeaning(source.name, source.politicalLeaning, source.url);
      if (selectedLeaning === 'extreme_droite') {
        if (source.politicalLeaning !== 'extreme_droite' && eff !== 'extreme_droite') {
          return false;
        }
        if (eff === 'centre' || eff === 'gauche' || eff === 'gauche_radicale') {
          return false;
        }
      } else if (selectedLeaning === 'gauche_radicale') {
        if (source.politicalLeaning !== 'gauche_radicale' && eff !== 'gauche_radicale') {
          return false;
        }
        if (eff === 'droite' || eff === 'extreme_droite' || eff === 'centre') {
          return false;
        }
      } else if (source.politicalLeaning !== selectedLeaning && eff !== selectedLeaning) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = source.name.toLowerCase().includes(q);
      const matchesDesc = source.description.toLowerCase().includes(q);
      const matchesUrl = source.url.toLowerCase().includes(q);
      const matchesTags = source.tags?.some((t) => t.toLowerCase().includes(q)) || false;
      const matchesHub = source.portalHub?.toLowerCase().includes(q) || false;
      if (!matchesName && !matchesDesc && !matchesUrl && !matchesTags && !matchesHub) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Banner / Introduction Header with Basta! Portal & YouTube highlight */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <Play className="w-3.5 h-3.5 fill-red-600" />
                <span>Chaînes YouTube ({youtubeCount})</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Presse d'Investigation & Réseaux</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span>Charleroi / Local</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Flag className="w-3.5 h-3.5 text-amber-600" />
                <span>Belgique & Wallonie</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Répertoire Élargi des Sources, Chaînes YouTube & Réseaux
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Consultez l'ensemble des sources surveillées avec leur <strong className="text-blue-700 font-bold">orientation politique supposée</strong> (gauche radicale, plutôt de gauche, du centre, de droite, extrême droite, indépendant). Le catalogue intègre les chaînes YouTube de référence (<strong className="text-slate-800 font-semibold">Blast, Clément Viktorovitch, Hygiène Mentale, Osons Causer, Trouble Fait, Thinkerview</strong>), la presse d'investigation (<strong className="text-slate-800 font-semibold">Mediapart, Disclose, L'Écho, Le Soir, Médor</strong>), et les vigies citoyennes (<strong className="text-slate-800 font-semibold">Still Pissing, Transparencia, Ma Tribune, Chronik</strong>).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span><strong className="text-slate-800 font-bold">{activeCount}</strong> sources actives interrogées en continu</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Rss className="w-3.5 h-3.5 text-amber-600" />
                <span>Flux RSS, XML Atom YouTube et détection continue</span>
              </span>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-2.5 shrink-0">
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 min-w-[85px]">
                <div className="text-lg font-black text-cyan-700">{localCount}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Charleroi</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 min-w-[85px]">
                <div className="text-lg font-black text-amber-700">{nationalCount}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Belgique</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 min-w-[85px]">
                <div className="text-lg font-black text-purple-700">{internationalCount}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Monde</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onOpenAddModal}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une source</span>
              </button>

              <button
                onClick={onResetToDefaults}
                title="Recharger le catalogue complet avec Still Pissing, YouTube, Chronik, Ma Tribune et l'investigation"
                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        
        {/* Top Search Line */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer les sources (ex: Still Pissing, YouTube, Blast, CADA, Mediapart)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Quick Clear Button */}
          {(searchQuery || selectedScope !== 'all' || selectedCategory !== 'all' || selectedLeaning !== 'all' || selectedChannel !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedScope('all');
                setSelectedCategory('all');
                setSelectedLeaning('all');
                setSelectedChannel('all');
              }}
              className="text-xs text-slate-500 hover:text-blue-600 underline font-medium self-center"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>

        {/* Filter Badges Row 1: Geographic Scope & Channel */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedScope('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedScope === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              Toutes les sources ({totalCount})
            </button>
            <button
              onClick={() => setSelectedScope('local')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedScope === 'local'
                  ? 'bg-cyan-700 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-cyan-800 bg-slate-100'
              }`}
            >
              <span>📍 Charleroi / Local ({localCount})</span>
            </button>
            <button
              onClick={() => setSelectedScope('national')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedScope === 'national'
                  ? 'bg-amber-700 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-amber-800 bg-slate-100'
              }`}
            >
              <span>🇧🇪 Belgique ({nationalCount})</span>
            </button>
            <button
              onClick={() => setSelectedScope('international')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedScope === 'international'
                  ? 'bg-purple-700 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-purple-800 bg-slate-100'
              }`}
            >
              <span>🌍 International ({internationalCount})</span>
            </button>
            {customCount > 0 && (
              <button
                onClick={() => setSelectedScope('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  selectedScope === 'custom'
                    ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-emerald-800 bg-slate-100'
                }`}
              >
                <span>✍️ Ajouts Manuels ({customCount})</span>
              </button>
            )}
          </div>

          {/* Channel Filter Pill */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Canal :</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value as SourceChannel | 'all')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">Tous canaux</option>
              <option value="presse">📰 Presse & Revues</option>
              <option value="youtube">▶️ Chaînes YouTube</option>
              <option value="reseaux_sociaux">📱 Réseaux Citoyens</option>
              <option value="rapport_officiel">⚖️ Vigie & CADA</option>
            </select>
          </div>
        </div>

        {/* Filter Badges Row 2: Political Leaning & Category */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              Orientation :
            </span>
            <button
              onClick={() => setSelectedLeaning('all')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'all'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedLeaning('gauche_radicale')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'gauche_radicale'
                  ? 'bg-fuchsia-700 text-white border-fuchsia-700'
                  : 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200 hover:bg-fuchsia-100'
              }`}
            >
              Gauche radicale
            </button>
            <button
              onClick={() => setSelectedLeaning('gauche')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'gauche'
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              Plutôt de gauche
            </button>
            <button
              onClick={() => setSelectedLeaning('centre')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'centre'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              Du centre
            </button>
            <button
              onClick={() => setSelectedLeaning('droite')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'droite'
                  ? 'bg-sky-700 text-white border-sky-700'
                  : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
              }`}
            >
              De droite
            </button>
            <button
              onClick={() => setSelectedLeaning('extreme_droite')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'extreme_droite'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Extrême droite
            </button>
            <button
              onClick={() => setSelectedLeaning('independant_non_aligne')}
              className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold transition ${
                selectedLeaning === 'independant_non_aligne'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Indépendant / Vigie
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Thématique :</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SourceCategory | 'all')}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">Toutes thématiques</option>
              <option value="investigation">Investigation & Enquêtes</option>
              <option value="chaine_youtube">Chaînes YouTube / Vidéos</option>
              <option value="transparence">Transparence & CADA</option>
              <option value="presse_independante">Presse Indépendante</option>
              <option value="citoyen_local">Médias Citoyens & Réseau</option>
              <option value="analyse_critique">Auto-Défense Intellectuelle</option>
            </select>
          </div>
        </div>

        {/* Quick Batch Selection Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-600">
              {filteredSources.length} source(s) affichée(s) :
            </span>
            {onActivateOnlySources && filteredSources.length > 0 && (
              <button
                onClick={() => onActivateOnlySources(filteredSources.map((s) => s.id))}
                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 font-bold transition flex items-center gap-1 shadow-2xs"
                title="Active uniquement les sources affichées et désactive toutes les autres"
              >
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                <span>Activer uniquement cette sélection ({filteredSources.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onSetAllSourcesActive && (
              <>
                <button
                  onClick={() => onSetAllSourcesActive(true)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Tout activer
                </button>
                <button
                  onClick={() => onSetAllSourcesActive(false)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  Tout désactiver
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Sources Grid */}
      {filteredSources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Aucune source ne correspond à votre recherche</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Aucune source trouvée pour ces critères. Vous pouvez réinitialiser vos filtres ou ajouter une nouvelle source manuellement.
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                setSelectedScope('all');
                setSelectedCategory('all');
                setSelectedLeaning('all');
                setSelectedChannel('all');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              Réinitialiser les filtres
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter manuellement</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((source) => {
            const isScanning = scanningSourceId === source.id;
            const leaningMeta = getPoliticalLeaningMeta(source.politicalLeaning);
            const channelMeta = getChannelBadge(
              source.channel || (source.category === 'chaine_youtube' ? 'youtube' : 'presse')
            );
            const isVideo = source.channel === 'youtube' || source.category === 'chaine_youtube';

            return (
              <div
                key={source.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                  source.isActive
                    ? 'border-slate-200 hover:border-blue-400'
                    : 'border-slate-200/60 opacity-60 bg-slate-50/70'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Top Bar: Badges & Switch */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      
                      {/* Political Leaning Badge */}
                      <span
                        title={leaningMeta.description}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${leaningMeta.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${leaningMeta.dotClass}`} />
                        <span>{leaningMeta.label}</span>
                      </span>

                      {/* Channel Badge */}
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 border ${channelMeta.badgeClass}`}>
                        {isVideo && <Play className="w-3 h-3 fill-current text-red-600" />}
                        <span>{channelMeta.label}</span>
                      </span>

                      {/* Scope Badge */}
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${
                          source.scope === 'local'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                            : source.scope === 'national'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {source.scope === 'local' && '📍 Charleroi'}
                        {source.scope === 'national' && '🇧🇪 Belgique'}
                        {source.scope === 'international' && '🌍 International'}
                      </span>

                      {/* Custom User Tag */}
                      {source.isCustom && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          ✍️ Manuel
                        </span>
                      )}

                    </div>

                    {/* Active Toggle Switch */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold ${source.isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                        {source.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={source.isActive}
                          onChange={() => onToggleSourceActive(source.id)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Thumbnail + Name & Portal Hub */}
                  <div className="flex items-start gap-3">
                    {source.imageUrl && (
                      <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                        <img
                          src={source.imageUrl}
                          alt={source.name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <Play className="w-4 h-4 fill-white text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition flex items-baseline gap-1.5">
                        <span>{source.name}</span>
                      </h3>
                      {source.portalHub && (
                        <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                          <Share2 className="w-3 h-3 text-blue-500" />
                          <span>{source.portalHub}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {source.description}
                  </p>

                  {/* Tags */}
                  {source.tags && source.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5 text-[11px] text-slate-500">
                      {source.tags.slice(0, 4).map((tag, idx) => (
                        <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* RSS feed status indicator */}
                  <div className="flex items-center gap-1.5 pt-0.5 text-xs text-slate-500">
                    <Rss className={`w-3.5 h-3.5 ${source.rssUrl ? 'text-amber-600' : 'text-slate-400'}`} />
                    <span>
                      {source.rssUrl ? (
                        <a
                          href={source.rssUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 hover:underline font-medium"
                        >
                          Flux direct actif
                        </a>
                      ) : (
                        'Veille continue des parutions et réseaux'
                      )}
                    </span>
                  </div>

                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-3 border-t border-slate-200 text-xs">
                  
                  {/* Website / YouTube link */}
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                    title={`Consulter ${source.name}`}
                  >
                    <span>{isVideo ? 'Ouvrir chaîne' : 'Ouvrir source'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>

                  {/* Scan now button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onScanSingleSource(source)}
                      disabled={isScanning}
                      title="Interroger cette source immédiatement et intégrer les articles détectés au flux"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold transition disabled:opacity-50"
                    >
                      {isScanning ? (
                        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      ) : (
                        <Zap className="w-3 h-3 text-blue-600" />
                      )}
                      <span>{isScanning ? 'Scan...' : 'Scanner'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => onEditSource(source)}
                      title="Modifier les informations de la source"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (for custom or disable) */}
                    {source.isCustom && (
                      <button
                        onClick={() => onDeleteSource(source.id)}
                        title="Supprimer cette source personnalisée"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
