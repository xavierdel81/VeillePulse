import React from 'react';
import { EmailDispatchLog } from '../types/watch';
import {
  X,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Trash2,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: EmailDispatchLog[];
  onClearLogs: () => void;
  onSendTestEmail: () => void;
  recipientEmail: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onSendTestEmail,
  recipientEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-800">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Journal des Alertes & E-mails</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Info bar */}
          <div className="px-5 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Destinataire : <strong className="text-slate-900">{recipientEmail}</strong>
            </span>
            {logs.length > 0 && (
              <button
                onClick={onClearLogs}
                className="text-xs text-slate-500 hover:text-red-600 transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Effacer
              </button>
            )}
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Aucun e-mail expédié pour le moment</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                  Dès qu'une alerte dépasse votre seuil configuré ou lors d'un envoi manuel, le suivi apparaîtra ici.
                </p>
                <button
                  onClick={onSendTestEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer un e-mail test</span>
                </button>
              </div>
            ) : (
              logs.map((log) => {
                const isSuccess = log.status === 'envoyé';
                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        <span
                          className={`font-semibold capitalize ${
                            isSuccess ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {log.method === 'gmail_api' ? 'Gmail API' : 'Direct'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {log.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Vers : {log.recipient}</span>
                      {log.gmailMessageId && (
                        <span className="font-mono text-[10px] text-slate-400">
                          ID: {log.gmailMessageId.slice(0, 10)}...
                        </span>
                      )}
                    </div>

                    {log.error && (
                      <div className="text-[11px] text-red-700 bg-red-50 p-2 rounded-lg border border-red-200">
                        {log.error}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {logs.length} notification{logs.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition"
            >
              Fermer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
