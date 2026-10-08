import React from 'react';
import {
  X,
  Scale,
  ArrowRight,
  Building2,
  Calendar,
} from 'lucide-react';
import { NewsAlert } from '../types/watch';
import {
  getEffectivePoliticalLeaning,
  getPoliticalLeaningMeta,
  getSourceOwnership,
  getSourceCountry,
} from '../utils/politicalLeaning';
import { formatArticleDateWithYear } from '../utils/dateHelper';
import { MediaLogo } from './MediaLogo';

export interface StoryClusterData {
  id: string;
  title: string;
  topicTitle: string;
  alerts: NewsAlert[];
  leftPercent: number;
  centerPercent: number;
  rightPercent: number;
  blindspot: 'gauche' | 'droite' | 'centre' | 'equilibre';
  blindspotLabel: string;
  blindspotBadgeClass: string;
}

interface GroundNewsPerspectiveModalProps {
  cluster: StoryClusterData;
  isOpen?: boolean;
  onClose: () => void;
  onOpenAlertInReader?: (alert: NewsAlert) => void;
}

export const GroundNewsPerspectiveModal: React.FC<GroundNewsPerspectiveModalProps> = ({
  cluster,
  isOpen = true,
  onClose,
  onOpenAlertInReader,
}) => {
  if (!isOpen || !cluster) return null;

  // Separate alerts by political spectrum: Gauche = ROUGE, Centre = GRIS, Droite = BLEU
  const leftAlerts: NewsAlert[] = [];
  const centerAlerts: NewsAlert[] = [];
  const rightAlerts: NewsAlert[] = [];

  cluster.alerts.forEach((alert) => {
    const eff = getEffectivePoliticalLeaning(alert.source, alert.politicalLeaning, alert.sourceUrl);
    if (eff === 'gauche_radicale' || eff === 'gauche') {
      leftAlerts.push(alert);
    } else if (eff === 'droite' || eff === 'extreme_droite') {
      rightAlerts.push(alert);
    } else {
      centerAlerts.push(alert);
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perspective-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 text-white border border-slate-700 flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
                  Comparateur de Couverture Pluraliste
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                  {cluster.alerts.length} signaux analysés
                </span>
              </div>
              <h2 id="perspective-modal-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                {cluster.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            aria-label="Fermer la vue comparative"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Distribution Bar Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Segmented Bias Bar: Left (Red) - Center (Gray) - Right (Blue) */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Spectre politique du sujet :</span>
                <span className="font-mono text-xs">
                  <strong className="text-red-700">{cluster.leftPercent}% Gauche (Rouge)</strong> ·{' '}
                  <strong className="text-slate-600">{cluster.centerPercent}% Neutre (Gris)</strong> ·{' '}
                  <strong className="text-blue-700">{cluster.rightPercent}% Droite (Bleu)</strong>
                </span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200 shadow-inner">
                <div
                  style={{ width: `${cluster.leftPercent}%` }}
                  className="bg-red-600 transition-all duration-300"
                  title={`Gauche (Rouge) : ${cluster.leftPercent}%`}
                />
                <div
                  style={{ width: `${cluster.centerPercent}%` }}
                  className="bg-slate-400 transition-all duration-300"
                  title={`Centre & Neutre (Gris) : ${cluster.centerPercent}%`}
                />
                <div
                  style={{ width: `${cluster.rightPercent}%` }}
                  className="bg-blue-600 transition-all duration-300"
                  title={`Droite (Bleu) : ${cluster.rightPercent}%`}
                />
              </div>
            </div>

            {/* Blindspot badge */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${cluster.blindspotBadgeClass}`}>
              {cluster.blindspotLabel}
            </div>

          </div>
        </div>

        {/* 3 Perspectives Columns */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* COLUMN 1: GAUCHE & GAUCHE RADICALE (ROUGE) */}
            <div className="bg-white rounded-2xl border-2 border-red-200 shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-red-50/90 border-b border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-200" />
                  <span className="text-xs sm:text-sm font-black text-red-950 uppercase tracking-wider">
                    Perspectives de Gauche
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-red-700 border border-red-200">
                  {leftAlerts.length} {leftAlerts.length > 1 ? 'sources' : 'source'}
                </span>
              </div>

              <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
                {leftAlerts.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 italic">
                    Aucun article de gauche détecté sur ce sujet.
                    <div className="mt-1 font-semibold text-blue-600">Angle mort pour la gauche</div>
                  </div>
                ) : (
                  leftAlerts.map((alert) => {
                    const eff = getEffectivePoliticalLeaning(alert.source, alert.politicalLeaning, alert.sourceUrl);
                    const meta = getPoliticalLeaningMeta(eff);
                    const ownership = getSourceOwnership(alert.source);
                    const country = getSourceCountry(alert.source);

                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                            <MediaLogo sourceName={alert.source} size="sm" />
                            <span>{alert.source}</span>
                            <span className="text-sm">{country.flag}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-black ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatArticleDateWithYear(alert.publishedAt, alert.publishedDateExact)}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug hover:text-red-700 transition">
                          <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {alert.title}
                          </a>
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {alert.summary}
                        </p>

                        {alert.directQuote && (
                          <div className="p-2 bg-blue-50/70 border-l-2 border-blue-500 text-xs text-blue-950 italic rounded-r">
                            {alert.directQuote}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate max-w-[170px]" title={ownership}>
                            {ownership}
                          </span>
                          {onOpenAlertInReader && (
                            <button
                              onClick={() => onOpenAlertInReader(alert)}
                              className="text-blue-700 hover:text-blue-900 font-bold shrink-0 inline-flex items-center gap-0.5"
                            >
                              <span>Détails</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN 2: CENTRE & NEUTRE (GRIS / SLATE) */}
            <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-500" />
                  <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                    Sources Neutres &amp; Fact-check
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-300">
                  {centerAlerts.length} {centerAlerts.length > 1 ? 'sources' : 'source'}
                </span>
              </div>

              <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
                {centerAlerts.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 italic">
                    Aucun article de source neutre détecté sur ce sujet.
                  </div>
                ) : (
                  centerAlerts.map((alert) => {
                    const eff = getEffectivePoliticalLeaning(alert.source, alert.politicalLeaning, alert.sourceUrl);
                    const meta = getPoliticalLeaningMeta(eff);
                    const ownership = getSourceOwnership(alert.source);
                    const country = getSourceCountry(alert.source);

                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                            <MediaLogo sourceName={alert.source} size="sm" />
                            <span>{alert.source}</span>
                            <span className="text-sm">{country.flag}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-black ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatArticleDateWithYear(alert.publishedAt, alert.publishedDateExact)}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug hover:text-slate-800 transition">
                          <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {alert.title}
                          </a>
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {alert.summary}
                        </p>

                        {alert.directQuote && (
                          <div className="p-2 bg-slate-50 border-l-2 border-slate-400 text-xs text-slate-800 italic rounded-r">
                            {alert.directQuote}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate max-w-[170px]" title={ownership}>
                            {ownership}
                          </span>
                          {onOpenAlertInReader && (
                            <button
                              onClick={() => onOpenAlertInReader(alert)}
                              className="text-slate-800 hover:text-black font-bold shrink-0 inline-flex items-center gap-0.5"
                            >
                              <span>Détails</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN 3: DROITE & DROITE ÉCONOMIQUE (BLEU) */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-xs flex flex-col overflow-hidden">
              <div className="px-4 py-3 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                  <span className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider">
                    Perspectives de Droite
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200">
                  {rightAlerts.length} {rightAlerts.length > 1 ? 'sources' : 'source'}
                </span>
              </div>

              <div className="p-3.5 space-y-3 flex-1 overflow-y-auto max-h-[60vh]">
                {rightAlerts.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400 italic">
                    Aucun article de droite détecté sur ce sujet.
                    <div className="mt-1 font-semibold text-blue-600">Angle mort pour la droite</div>
                  </div>
                ) : (
                  rightAlerts.map((alert) => {
                    const eff = getEffectivePoliticalLeaning(alert.source, alert.politicalLeaning, alert.sourceUrl);
                    const meta = getPoliticalLeaningMeta(eff);
                    const ownership = getSourceOwnership(alert.source);
                    const country = getSourceCountry(alert.source);

                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                            <MediaLogo sourceName={alert.source} size="sm" />
                            <span>{alert.source}</span>
                            <span className="text-sm">{country.flag}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-black ${meta.badgeClass}`}>
                            {meta.shortLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatArticleDateWithYear(alert.publishedAt, alert.publishedDateExact)}</span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug hover:text-blue-700 transition">
                          <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer">
                            {alert.title}
                          </a>
                        </h4>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {alert.summary}
                        </p>

                        {alert.directQuote && (
                          <div className="p-2 bg-blue-50/70 border-l-2 border-blue-500 text-xs text-blue-950 italic rounded-r">
                            {alert.directQuote}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span className="truncate max-w-[170px]" title={ownership}>
                            {ownership}
                          </span>
                          {onOpenAlertInReader && (
                            <button
                              onClick={() => onOpenAlertInReader(alert)}
                              className="text-blue-700 hover:text-blue-900 font-bold shrink-0 inline-flex items-center gap-0.5"
                            >
                              <span>Détails</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>
              Couleurs : <strong className="text-red-700">Rouge = Gauche</strong> · <strong className="text-slate-700">Gris = Neutre</strong> · <strong className="text-blue-700">Bleu = Droite</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Fermer le comparateur
          </button>
        </div>

      </div>
    </div>
  );
};
