import React, { useState } from 'react';
import { ExecutiveReport } from '../types/watch';
import { formatArticleDateWithYear } from '../utils/dateHelper';
import {
  X,
  FileText,
  Send,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ExecutiveReport | null;
  isLoading: boolean;
  onGenerateReport: () => void;
  onSendReportByEmail: (report: ExecutiveReport) => void;
  recipientEmail: string;
  isSendingEmail: boolean;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  onGenerateReport,
  onSendReportByEmail,
  recipientEmail,
  isSendingEmail,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!report) return;
    const text = `# ${report.period} - VeillePulse Intelligence
Généré le : ${new Date(report.generatedAt).toLocaleString('fr-FR')}

## Synthèse Exécutive
${report.summary}

## Tendances Détectées
${report.topTrends.map((t) => `- ${t}`).join('\n')}

## Enseignements Stratégiques
${report.strategicInsights.map((i) => `- ${i}`).join('\n')}

## Alertes Prioritaires Traitées
${(report.criticalAlerts || []).map((a) => `- [${a.topicTitle}] (${a.impactScore}/100) ${a.title}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Briefing Exécutif & Synthèse Transverse</h2>
              <p className="text-xs text-slate-500">Rapport consolidé sur l'ensemble de vos sujets surveillés</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {isLoading && (
            <div className="py-14 text-center space-y-3">
              <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-900">
                Synthèse des signaux par l'intelligence artificielle...
              </p>
              <p className="text-xs text-slate-500">
                Extraction des tendances citoyennes, corrélations et impacts stratégiques.
              </p>
            </div>
          )}

          {!isLoading && !report && (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs sm:text-sm text-slate-600">
                Aucun briefing généré pour cette session.
              </p>
              <button
                onClick={onGenerateReport}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Générer le briefing maintenant</span>
              </button>
            </div>
          )}

          {!isLoading && report && (
            <div className="space-y-4">
              
              {/* Meta strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div>
                  Période : <strong className="text-slate-900">{report.period}</strong> &bull; Généré le :{' '}
                  <span className="text-slate-700">{new Date(report.generatedAt).toLocaleString('fr-FR')}</span>
                </div>
                <button
                  onClick={handleCopyMarkdown}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié en Markdown' : 'Copier texte'}</span>
                </button>
              </div>

              {/* Executive Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Synthèse Globale
                </h3>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs">
                  <p>{report.summary}</p>
                </div>
              </div>

              {/* Top Trends */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  Tendances Transverses Observées
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {report.topTrends.map((trend, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] mb-1.5 border border-blue-200">
                        {i + 1}
                      </span>
                      <span>{trend}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Insights */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Recommandations Stratégiques Prioritaires
                </h3>
                <div className="space-y-2">
                  {report.strategicInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
                    >
                      <span className="font-bold text-amber-600 shrink-0">&bull;</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Alerts Recap */}
              {report.criticalAlerts && report.criticalAlerts.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Alertes Critiques Ayant Alimenté ce Briefing
                  </h3>
                  <div className="space-y-1.5">
                    {report.criticalAlerts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs gap-2"
                      >
                        <div className="truncate max-w-[420px]">
                          <span className="text-blue-700 font-semibold mr-2">[{a.topicTitle}]</span>
                          <span className="text-slate-900">{a.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-slate-500 font-medium">
                            {formatArticleDateWithYear(a.publishedAt, a.publishedDateExact)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[10px] border border-red-200">
                            {a.impactScore}/100
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Fermer
          </button>

          {!isLoading && report && (
            <button
              onClick={() => onSendReportByEmail(report)}
              disabled={isSendingEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-spin' : ''}`} />
              <span>{isSendingEmail ? 'Envoi...' : `Envoyer ce briefing à ${recipientEmail}`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
