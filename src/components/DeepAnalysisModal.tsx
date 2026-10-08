import React from 'react';
import { DeepAnalysisResult, NewsAlert } from '../types/watch';
import {
  X,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Send,
  Shield,
  Layers,
  Calendar,
} from 'lucide-react';

interface DeepAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: NewsAlert | null;
  analysis: DeepAnalysisResult | null;
  isLoading: boolean;
  onSendEmailWithAnalysis: (alert: NewsAlert, analysis: DeepAnalysisResult) => void;
  recipientEmail: string;
}

export const DeepAnalysisModal: React.FC<DeepAnalysisModalProps> = ({
  isOpen,
  onClose,
  alert,
  analysis,
  isLoading,
  onSendEmailWithAnalysis,
  recipientEmail,
}) => {
  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Analyse Stratégique Approfondie par IA</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sujet : <span className="text-blue-700 font-semibold">{alert.topicTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Signal Headline Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Signal Source Détecté
              </span>
              <span className="px-2 py-0.2 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Impact {alert.impactScore}/100
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{alert.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{alert.summary}</p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-10 text-center space-y-2.5">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Génération de l'évaluation stratégique avec Gemini...
              </p>
              <p className="text-xs text-slate-500">
                Croisement des implications citoyennes, juridiques et démocratiques.
              </p>
            </div>
          )}

          {/* Loaded Analysis Content */}
          {!isLoading && analysis && (
            <div className="space-y-4">
              
              {/* Urgency & Headline */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                    Angle Stratégique
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-indigo-950">{analysis.headline}</div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-300 text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Urgence : {analysis.urgencyLevel}</span>
                </div>
              </div>

              {/* Strategic Context */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Contexte & Rétrospective
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {analysis.strategicContext}
                </p>
              </div>

              {/* 3 Pillars Impact Analysis */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  Décomposition des Impacts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                      Finances & Gouvernance
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {analysis.impactAnalysis.business}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                      Outils & Accès
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {analysis.impactAnalysis.technological}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
                      Régulation & CADA
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {analysis.impactAnalysis.regulatoryOrMarket}
                    </p>
                  </div>
                </div>
              </div>

              {/* Risks vs Opportunities Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Risks */}
                <div className="bg-red-50/70 border border-red-200 rounded-xl p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-800 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    Menaces & Risques Démocratiques
                  </div>
                  <ul className="space-y-1 text-xs text-red-950">
                    {analysis.risksAndOpportunities.risks.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-600 font-bold shrink-0">&times;</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Opportunities */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Leviers Citoyens & Actions
                  </div>
                  <ul className="space-y-1 text-xs text-emerald-950">
                    {analysis.risksAndOpportunities.opportunities.map((o, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold shrink-0">&bull;</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  Feuille de Route Recommandée
                </div>
                <div className="space-y-1.5">
                  {analysis.actionableRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-mono font-bold text-[10px] shrink-0">
                        Étape {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Fermer
          </button>

          {!isLoading && analysis && (
            <button
              onClick={() => onSendEmailWithAnalysis(alert, analysis)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmettre par e-mail</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
