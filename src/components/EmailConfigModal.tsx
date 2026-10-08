import React, { useState } from 'react';
import { EmailSettings } from '../types/watch';
import {
  X,
  Mail,
  Send,
  Bell,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Laptop,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmailSettings;
  onSaveSettings: (settings: EmailSettings) => void;
  user: User | null;
  isGmailConnected: boolean;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  onSendTestEmail: () => void;
  isSendingTest: boolean;
  testEmailStatus: { success?: boolean; error?: string } | null;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  user,
  isGmailConnected,
  onGoogleSignIn,
  onLogout,
  onSendTestEmail,
  isSendingTest,
  testEmailStatus,
}) => {
  const [recipientEmail, setRecipientEmail] = useState(settings.recipientEmail);
  const [recipientName, setRecipientName] = useState(settings.recipientName || 'Xavier');
  const [autoSendEnabled, setAutoSendEnabled] = useState(settings.autoSendEnabled);
  const [minScoreForAutoSend, setMinScoreForAutoSend] = useState(settings.minScoreForAutoSend);
  const [instantBreakingAlerts, setInstantBreakingAlerts] = useState(settings.instantBreakingAlerts);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [desktopNotificationEnabled, setDesktopNotificationEnabled] = useState(
    settings.desktopNotificationEnabled
  );

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      recipientEmail: recipientEmail.trim(),
      recipientName: recipientName.trim(),
      autoSendEnabled,
      minScoreForAutoSend,
      instantBreakingAlerts,
      soundEnabled,
      desktopNotificationEnabled,
    });
    onClose();
  };

  const handleRequestDesktopPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setDesktopNotificationEnabled(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Paramètres des Alertes & Notifications Mail</h2>
              <p className="text-xs text-slate-500">Configuration de l'envoi en temps réel via Gmail API</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Google / Gmail Account Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Compte d'expédition Gmail
                </span>
                {isGmailConnected && user ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">{user.email}</div>
                      <div className="text-xs text-slate-500">
                        Autorisation d'envoi Gmail active via Google Workspace OAuth
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-amber-800">
                        Compte Gmail non connecté
                      </div>
                      <div className="text-xs text-slate-500">
                        Connectez-vous avec votre compte Google pour envoyer des e-mails directement depuis votre boîte Gmail.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                {isGmailConnected && user ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs text-slate-500 hover:text-red-600 transition underline"
                  >
                    Déconnecter
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="gsi-material-button inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-2xs transition"
                  >
                    <svg viewBox="0 0 48 48" className="w-3.5 h-3.5">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    <span>Connecter Gmail</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recipient Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Adresse e-mail destinataire *
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="votre.email@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Nom du destinataire
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="ex: Xavier"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Test Email Action Button */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-blue-900">Vérifier la réception d'e-mail</div>
              <div className="text-[11px] text-slate-500">
                Envoie un e-mail d'alerte modèle à <strong>{recipientEmail}</strong>.
              </div>
            </div>
            <button
              type="button"
              onClick={onSendTestEmail}
              disabled={isSendingTest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition disabled:opacity-50 shrink-0"
            >
              <Send className={`w-3.5 h-3.5 ${isSendingTest ? 'animate-spin' : ''}`} />
              <span>{isSendingTest ? 'Envoi...' : 'Envoyer test'}</span>
            </button>
          </div>

          {/* Test feedback */}
          {testEmailStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                testEmailStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testEmailStatus.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>E-mail de test expédié avec succès vers {recipientEmail} !</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{testEmailStatus.error || "Échec de l'envoi"}</span>
                </>
              )}
            </div>
          )}

          {/* Auto Send & Criteria */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">Notifications mail automatiques</div>
                <div className="text-[11px] text-slate-500">
                  Déclencher un e-mail dès qu'un signal dépasse le seuil
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSendEnabled}
                onChange={(e) => setAutoSendEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Threshold Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Seuil minimal de déclenchement automatique
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  Score &ge; {minScoreForAutoSend}/100
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={minScoreForAutoSend}
                onChange={(e) => setMinScoreForAutoSend(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Instant Breaking Alerts */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Alertes Majeures Prioritaires (&ge; 85/100)
                </div>
                <div className="text-[11px] text-slate-500">
                  Envoi instantané immédiat sans temporisation pour les alertes critiques
                </div>
              </div>
              <input
                type="checkbox"
                checked={instantBreakingAlerts}
                onChange={(e) => setInstantBreakingAlerts(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

            {/* Sound & Desktop Notifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-700">Alerte sonore</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-slate-700">Alerte bureau</span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestDesktopPermission}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 text-blue-700 border border-slate-300 rounded font-semibold hover:bg-slate-200"
                >
                  {Notification.permission === 'granted' ? 'Activé' : 'Autoriser'}
                </button>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              Enregistrer les préférences
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
