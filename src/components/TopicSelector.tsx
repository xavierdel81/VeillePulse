import React from 'react';
import { WatchTopic, TopicScope, NewsAlert } from '../types/watch';
import { Plus, MapPin, Flag, Globe, Layers, Filter } from 'lucide-react';
import pressBg from '../assets/images/printing_press_conveyor_1791464634662.jpg';

interface TopicSelectorProps {
  topics: WatchTopic[];
  alerts: NewsAlert[];
  selectedTopicId: string | 'all';
  onSelectTopic: (id: string | 'all') => void;
  selectedScope: TopicScope | 'all';
  onSelectScope: (scope: TopicScope | 'all') => void;
  onOpenNewTopicModal: () => void;
  onEditTopic: (topic: WatchTopic) => void;
  onToggleTopicActive: (id: string) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  alerts,
  selectedTopicId,
  onSelectTopic,
  selectedScope,
  onSelectScope,
  onOpenNewTopicModal,
}) => {
  // 1. Dynamic alerts counts by territory (scope)
  const totalAlertsCount = alerts.length;
  const localAlertsCount = alerts.filter((a) => (a.scope || 'local') === 'local').length;
  const nationalAlertsCount = alerts.filter((a) => a.scope === 'national').length;
  const internationalAlertsCount = alerts.filter((a) => a.scope === 'international').length;

  // 2. Les 5 piliers de veille citoyenne (Corruption, CADA, Luttes Sociales, Démocratie, Auto-Défense) sont transversaux et toujours visibles dans tous les territoires
  const visibleTopics = topics.filter((t) => {
    if (!t.scope || t.scope === 'all') return true;
    if (selectedScope === 'all') return true;
    return (
      t.scope === selectedScope ||
      ['topic-corruption', 'topic-transparence', 'topic-luttes-sociales', 'topic-democratie-libertes', 'topic-autodefense'].includes(t.id)
    );
  });

  // 3. Alerts in the currently selected scope (so sub-menu count matches the scope perfectly!)
  const alertsInCurrentScope =
    selectedScope === 'all'
      ? alerts
      : alerts.filter((a) => (a.scope || 'local') === selectedScope);

  return (
    <div className="border-b border-slate-700/80 sticky top-16 z-20 shadow-lg relative overflow-hidden bg-slate-950 text-white">
      {/* Background Image: Industrial Newspaper Printing Press Conveyor with crystal clear visibility */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url(${pressBg})`,
        }}
      />
      {/* Ultra-soft, subtle gradient overlay so the printing press machinery and paper flow stand out clearly */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-slate-950/25 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
        
        {/* Row 1: Ground News Territorial Scopes & Add Topic Button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-white font-extrabold mr-1 hidden sm:inline uppercase text-xs tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Territoire :
            </span>

            {/* 1. All Scopes */}
            <button
              onClick={() => {
                onSelectScope('all');
                onSelectTopic('all');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition border flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md backdrop-blur-md ${
                selectedScope === 'all'
                  ? 'bg-white text-slate-950 border-white shadow-xl shadow-black/40 font-black'
                  : 'bg-slate-950/70 text-slate-100 border-slate-600/70 hover:bg-slate-900/90 hover:border-slate-500'
              }`}
            >
              <Layers className={`w-4 h-4 ${selectedScope === 'all' ? 'text-slate-950' : 'text-slate-300'}`} />
              <span>Tous les flux</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-black ${selectedScope === 'all' ? 'bg-slate-200 text-slate-900' : 'bg-slate-900 text-slate-200 border border-slate-700'}`}>
                {totalAlertsCount}
              </span>
            </button>

            {/* 2. Wallonie & FWB */}
            <button
              onClick={() => {
                onSelectScope('local');
                onSelectTopic('all');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition border flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md backdrop-blur-md ${
                selectedScope === 'local'
                  ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/40 font-black'
                  : 'bg-slate-950/70 text-blue-200 border-slate-600/70 hover:bg-slate-900/90 hover:border-blue-400/50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Wallonie &amp; Charleroi</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-black ${selectedScope === 'local' ? 'bg-blue-800 text-white' : 'bg-blue-950/90 text-blue-300 border border-blue-700/60'}`}>
                {localAlertsCount}
              </span>
            </button>

            {/* 3. National (Belgique) */}
            <button
              onClick={() => {
                onSelectScope('national');
                onSelectTopic('all');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition border flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md backdrop-blur-md ${
                selectedScope === 'national'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-xl shadow-amber-600/40 font-black'
                  : 'bg-slate-950/70 text-amber-200 border-slate-600/70 hover:bg-slate-900/90 hover:border-amber-400/50'
              }`}
            >
              <Flag className="w-4 h-4" />
              <span>Belgique</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-black ${selectedScope === 'national' ? 'bg-amber-800 text-white' : 'bg-amber-950/90 text-amber-300 border border-amber-700/60'}`}>
                {nationalAlertsCount}
              </span>
            </button>

            {/* 4. International */}
            <button
              onClick={() => {
                onSelectScope('international');
                onSelectTopic('all');
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-xl transition border flex items-center gap-2 text-xs sm:text-sm font-bold shadow-md backdrop-blur-md ${
                selectedScope === 'international'
                  ? 'bg-purple-600 text-white border-purple-400 shadow-xl shadow-purple-600/40 font-black'
                  : 'bg-slate-950/70 text-purple-200 border-slate-600/70 hover:bg-slate-900/90 hover:border-purple-400/50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>International</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-black ${selectedScope === 'international' ? 'bg-purple-800 text-white' : 'bg-purple-950/90 text-purple-300 border border-purple-700/60'}`}>
                {internationalAlertsCount}
              </span>
            </button>
          </div>

          <button
            onClick={onOpenNewTopicModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border border-blue-400/40 transition shrink-0 backdrop-blur-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau sujet</span>
          </button>
        </div>

        {/* Row 2: Clean Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-white font-extrabold mr-1 shrink-0 uppercase text-xs tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            Sujets :
          </span>

          <button
            onClick={() => onSelectTopic('all')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition border shrink-0 flex items-center gap-1.5 text-xs sm:text-sm shadow-md backdrop-blur-md ${
              selectedTopicId === 'all'
                ? 'bg-white text-slate-950 border-white shadow-xl shadow-black/40 font-black'
                : 'bg-slate-950/70 text-slate-100 border-slate-600/70 hover:bg-slate-900/90 hover:border-slate-500'
            }`}
          >
            <span>Tous les sujets</span>
            <span className={`text-xs font-mono font-bold ${selectedTopicId === 'all' ? 'text-slate-600' : 'text-slate-300'}`}>
              ({alertsInCurrentScope.length})
            </span>
          </button>

          {visibleTopics.map((topic) => {
            const isSelected = selectedTopicId === topic.id;
            const count = alertsInCurrentScope.filter((a) => a.topicId === topic.id).length;

            return (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold transition border shrink-0 flex items-center gap-2 text-xs sm:text-sm shadow-md backdrop-blur-md ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/40 font-black'
                    : 'bg-slate-950/70 text-slate-100 border-slate-600/70 hover:bg-slate-900/90 hover:border-slate-500'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: topic.color || '#3b82f6' }}
                />
                <span>{topic.title}</span>
                <span className={`text-xs font-mono font-bold ${isSelected ? 'text-blue-100' : 'text-slate-300'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
