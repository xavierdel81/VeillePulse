import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  RotateCcw,
  Check,
  Globe,
  SlidersHorizontal,
  Info,
} from 'lucide-react';
import { PoliticalLeaning, NewsAlert } from '../types/watch';
import {
  FRANCOPHONE_SOURCES_REGISTRY,
  POLITICAL_LEANING_MAP,
  getCustomSourceLeanings,
  setCustomSourceLeaning,
  resetCustomSourceLeaning,
  getEffectivePoliticalLeaning,
  normalizeSourceName,
  getUnifiedSourcesList,
  SourceRegistryItem,
} from '../utils/politicalLeaning';

interface SourceLeaningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaningChanged?: () => void;
  alerts?: NewsAlert[];
}

const LEANING_OPTIONS: { id: PoliticalLeaning; label: string; shortLabel: string; btnClass: string }[] = [
  {
    id: 'gauche_radicale',
    label: 'Gauche radicale',
    shortLabel: 'G. radicale',
    btnClass: 'bg-red-950 text-red-100 hover:bg-red-900 border-red-900',
  },
  {
    id: 'gauche',
    label: 'Plutôt de gauche',
    shortLabel: 'Gauche',
    btnClass: 'bg-red-700 text-white hover:bg-red-800 border-red-800',
  },
  {
    id: 'centre',
    label: 'Du centre',
    shortLabel: 'Centre',
    btnClass: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-300',
  },
  {
    id: 'droite',
    label: 'De droite',
    shortLabel: 'Droite',
    btnClass: 'bg-blue-700 text-white hover:bg-blue-800 border-blue-800',
  },
  {
    id: 'extreme_droite',
    label: 'Extrême droite',
    shortLabel: 'Extr. droite',
    btnClass: 'bg-slate-950 text-blue-200 hover:bg-slate-900 border-blue-900',
  },
  {
    id: 'independant_non_aligne',
    label: 'Non aligné',
    shortLabel: 'Non aligné',
    btnClass: 'bg-slate-200 text-slate-800 hover:bg-slate-300 border-slate-300',
  },
];

export const SourceLeaningModal: React.FC<SourceLeaningModalProps> = ({
  isOpen,
  onClose,
  onLeaningChanged,
  alerts = [],
}) => {
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState<'all' | 'Belgique' | 'France'>('all');
  const [filterIndep, setFilterIndep] = useState<'all' | 'indep' | 'general'>('all');
  const [userOverrides, setUserOverrides] = useState<Record<string, PoliticalLeaning>>(getCustomSourceLeanings);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceLeaning, setNewSourceLeaning] = useState<PoliticalLeaning>('gauche_radicale');

  const allSources = useMemo(() => {
    return getUnifiedSourcesList(alerts);
  }, [alerts, userOverrides]);

  if (!isOpen) return null;

  const handleSetLeaning = (sourceName: string, leaning: PoliticalLeaning) => {
    setCustomSourceLeaning(sourceName, leaning);
    setUserOverrides(getCustomSourceLeanings());
    if (onLeaningChanged) onLeaningChanged();
  };

  const handleResetLeaning = (sourceName: string) => {
    resetCustomSourceLeaning(sourceName);
    setUserOverrides(getCustomSourceLeanings());
    if (onLeaningChanged) onLeaningChanged();
  };

  const handleAddCustomSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    handleSetLeaning(newSourceName.trim(), newSourceLeaning);
    setNewSourceName('');
  };

  const filteredSources = allSources.filter((src: SourceRegistryItem) => {
    if (filterCountry !== 'all' && src.country !== filterCountry) return false;
    if (filterIndep === 'indep' && !src.isIndependent) return false;
    if (filterIndep === 'general' && src.isIndependent) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        src.name.toLowerCase().includes(q) ||
        src.category.toLowerCase().includes(q) ||
        src.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-leaning-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="source-leaning-title" className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Gestion des tendances des sources
              </h2>
              <p className="text-xs text-slate-500">
                Personnalisez librement l'orientation politique de n'importe quel média (ex : La Libre = Droite)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-5 sm:px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold">Code couleur officiel :</span> Rouge foncé pour Gauche radicale • Rouge franc pour Plutôt de gauche • Blanc/Gris pour le Centre • Bleu pour la Droite. Les médias indépendants peuvent aussi porter ces tendances. Toute modification s'applique instantanément à l'ensemble du flux.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrer par nom de source (ex: La Libre, L'Écho, Mediapart, Le Soir...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value as any)}
                aria-label="Filtrer par pays"
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Tous pays (BE / FR)</option>
                <option value="Belgique">🇧🇪 Belgique</option>
                <option value="France">🇫🇷 France</option>
              </select>

              <select
                value={filterIndep}
                onChange={(e) => setFilterIndep(e.target.value as any)}
                aria-label="Filtrer par type de média"
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">Tous types</option>
                <option value="indep">Indépendants / Vigies</option>
                <option value="general">Presse généraliste</option>
              </select>
            </div>
          </div>

          {/* Quick Add Custom Source Bar */}
          <form
            onSubmit={handleAddCustomSource}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2.5 border-t border-slate-100"
          >
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              + Ajouter une source :
            </span>
            <input
              type="text"
              placeholder="Nom du média ou organisation (ex: Parti du Travail de Belgique, RTL...)"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={newSourceLeaning}
              onChange={(e) => setNewSourceLeaning(e.target.value as PoliticalLeaning)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="gauche_radicale">Gauche radicale (Rouge foncé)</option>
              <option value="gauche">Plutôt de gauche (Rouge)</option>
              <option value="centre">Du centre (Gris/Blanc)</option>
              <option value="droite">De droite (Bleu)</option>
              <option value="extreme_droite">Extrême droite (Bleu foncé)</option>
              <option value="independant_non_aligne">Non aligné (Gris)</option>
            </select>
            <button
              type="submit"
              disabled={!newSourceName.trim()}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shrink-0"
            >
              Enregistrer
            </button>
          </form>
        </div>

        {/* Sources List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
          {filteredSources.map((source: SourceRegistryItem) => {
            const normalized = normalizeSourceName(source.name);
            const isOverridden = !!userOverrides[normalized];
            const currentLeaning = getEffectivePoliticalLeaning(source.name, source.defaultLeaning, source.url);
            const meta = POLITICAL_LEANING_MAP[currentLeaning];

            return (
              <div key={source.id} className="pt-3.5 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {source.name}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {source.country === 'Belgique' ? '🇧🇪 Belgique' : '🇫🇷 France'}
                    </span>
                    {source.isIndependent && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        🌱 Indépendant / Vigie
                      </span>
                    )}
                    {isOverridden && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                        Modifié par vous
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-1">
                    {source.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Actuellement :</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                    {isOverridden && (
                      <button
                        onClick={() => handleResetLeaning(source.name)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 underline transition ml-2"
                        title="Rétablir la tendance par défaut"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Rétablir défaut
                      </button>
                    )}
                  </div>
                </div>

                {/* Leaning Selector Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {LEANING_OPTIONS.map((opt) => {
                    const isSelected = currentLeaning === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSetLeaning(source.name, opt.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                          isSelected
                            ? `${opt.btnClass} ring-2 ring-offset-1 ring-slate-900 shadow-xs scale-102`
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        title={`Définir ${source.name} comme : ${opt.label}`}
                      >
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                        {opt.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {filteredSources.length} sources référencées
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition"
          >
            Terminé & Appliquer
          </button>
        </div>

      </div>
    </div>
  );
};
