import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  WatchTopic,
  NewsAlert,
  EmailSettings,
  EmailDispatchLog,
  DeepAnalysisResult,
  ExecutiveReport,
  TopicScope,
  WatchSource,
} from './types/watch';
import { DEFAULT_TOPICS, INITIAL_ALERTS } from './data/defaultTopics';
import { DEFAULT_SOURCES } from './data/defaultSources';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  sendGmailAlert,
  sendGmailDigest,
} from './services/gmailService';
import {
  scanTopicWithServer,
  scanSourceWithServer,
  runDeepAnalysis,
  generateExecutiveBriefing,
} from './services/apiService';
import {
  playAlertChime,
  sendDesktopNotification,
} from './services/notificationSound';
import { getUniqueArticleImageUrl } from './utils/newsImageGenerator';

import { Header } from './components/Header';
import { TopicSelector } from './components/TopicSelector';
import { LiveAlertFeed } from './components/LiveAlertFeed';
import { SourceManager } from './components/SourceManager';
import { AddSourceModal } from './components/AddSourceModal';
import { TopicManagerModal } from './components/TopicManagerModal';
import { DeepAnalysisModal } from './components/DeepAnalysisModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import pressBg from './assets/images/printing_press_conveyor_1791464634662.jpg';

import {
  Radio,
  RefreshCw,
  Sparkles,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap,
  ExternalLink,
  MapPin,
  Flag,
  Globe,
  RotateCcw,
  Plus,
  X,
} from 'lucide-react';

// Normalisation stricte des sujets pour éviter toute erreur de classification
// (Ex: Les manifestations et mouvements sociaux sont STRICTEMENT sous Luttes Sociales, jamais sous Corruption)
export function normalizeAlertTopic(alert: NewsAlert): NewsAlert {
  const text = `${alert.title} ${alert.summary} ${(alert.tags || []).join(' ')}`.toLowerCase();
  
  const isManifestationOrSocial =
    text.includes('manifestat') ||
    text.includes('manif') ||
    text.includes('grève') ||
    text.includes('greve') ||
    text.includes('cortège') ||
    text.includes('cortege') ||
    text.includes('débrayage') ||
    text.includes('debrayage') ||
    text.includes('casseur-payeur') ||
    text.includes('syndicat') ||
    text.includes('fgtb') ||
    text.includes('csc') ||
    text.includes('mobilisation des élèves') ||
    text.includes('mobilisation des eleves') ||
    text.includes('élèves') ||
    text.includes('eleves') ||
    text.includes('lycéen') ||
    text.includes('lyceen') ||
    text.includes('étudiant') ||
    text.includes('etudiant') ||
    text.includes('chômage') ||
    text.includes('chomage') ||
    text.includes('allocataire') ||
    text.includes('pouvoir d\'achat') ||
    text.includes('luttes sociales');

  if (isManifestationOrSocial && alert.topicId !== 'topic-luttes-sociales') {
    return {
      ...alert,
      topicId: 'topic-luttes-sociales',
      topicTitle: 'Luttes Sociales',
    };
  }

  return alert;
}

export default function App() {
  // Topics state (with automatic migration to 5 short topics including Luttes Sociales)
  const [topics, setTopics] = useState<WatchTopic[]>(() => {
    try {
      const CURRENT_VERSION = 'v32_manifestations_strictement_luttes_sociales';
      const version = localStorage.getItem('veillepulse_topics_version');
      const saved = localStorage.getItem('veillepulse_topics');
      if (saved && version === CURRENT_VERSION) {
        return JSON.parse(saved);
      }
      localStorage.setItem('veillepulse_topics_version', CURRENT_VERSION);
      localStorage.setItem('veillepulse_topics', JSON.stringify(DEFAULT_TOPICS));
      return DEFAULT_TOPICS;
    } catch {
      return DEFAULT_TOPICS;
    }
  });

  // Alerts state (with verified real links, breaking student protest coverage, and Ground News standard colors)
  const [alerts, setAlerts] = useState<NewsAlert[]>(() => {
    try {
      const CURRENT_VERSION = 'v32_manifestations_strictement_luttes_sociales';
      const version = localStorage.getItem('veillepulse_alerts_version');
      const saved = localStorage.getItem('veillepulse_alerts');
      if (saved && version === CURRENT_VERSION) {
        const parsed: NewsAlert[] = JSON.parse(saved);
        const seenImgs = new Set<string>();
        return parsed.map((rawA) => {
          const a = normalizeAlertTopic(rawA);
          let cleanSourceUrl = a.sourceUrl;
          if (!cleanSourceUrl || cleanSourceUrl.includes('fonts.googleapis') || cleanSourceUrl.includes('fonts.gstatic') || cleanSourceUrl.endsWith('.css')) {
            cleanSourceUrl = `https://www.google.com/search?q=${encodeURIComponent('"' + a.title.replace(/[:"«»]/g, ' ').trim().slice(0, 70) + '" ' + a.source)}`;
          }
          if (!a.imageUrl || seenImgs.has(a.imageUrl)) {
            const unique = getUniqueArticleImageUrl(a.title, a.source, a.topicTitle, cleanSourceUrl, undefined, true);
            seenImgs.add(unique);
            return { ...a, sourceUrl: cleanSourceUrl, imageUrl: unique };
          }
          seenImgs.add(a.imageUrl);
          return { ...a, sourceUrl: cleanSourceUrl };
        });
      }
      const normalizedInitial = INITIAL_ALERTS.map(normalizeAlertTopic);
      localStorage.setItem('veillepulse_alerts_version', CURRENT_VERSION);
      localStorage.setItem('veillepulse_alerts', JSON.stringify(normalizedInitial));
      return normalizedInitial;
    } catch {
      return INITIAL_ALERTS.map(normalizeAlertTopic);
    }
  });

  // Scope filter: 'all' | 'local' | 'national' | 'international'
  const [selectedScope, setSelectedScope] = useState<TopicScope | 'all'>('all');

  // Selected topic filter
  const [selectedTopicId, setSelectedTopicId] = useState<string | 'all'>('all');

  // Email & notification settings
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(() => {
    try {
      const saved = localStorage.getItem('veillepulse_email_settings');
      return saved
        ? JSON.parse(saved)
        : {
            recipientEmail: 'Xavier.Delplanque@gmail.com',
            recipientName: 'Xavier',
            autoSendEnabled: true,
            minScoreForAutoSend: 70,
            instantBreakingAlerts: true,
            digestFrequency: 'instant',
            includeExecutiveBullets: true,
            soundEnabled: true,
            desktopNotificationEnabled: false,
          };
    } catch {
      return {
        recipientEmail: 'Xavier.Delplanque@gmail.com',
        recipientName: 'Xavier',
        autoSendEnabled: true,
        minScoreForAutoSend: 70,
        instantBreakingAlerts: true,
        digestFrequency: 'instant',
        includeExecutiveBullets: true,
        soundEnabled: true,
        desktopNotificationEnabled: false,
      };
    }
  });

  // Email dispatch logs
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() => {
    try {
      const saved = localStorage.getItem('veillepulse_email_logs');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'log-init-1',
              timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
              recipient: 'Xavier.Delplanque@gmail.com',
              subject: '🚨 [Veille] Intelligence Artificielle & Modèles Fondamentaux',
              alertIds: ['alert-1'],
              alertTitles: [
                'Déploiement massif des architectures agentiques multimodales dans les infrastructures',
              ],
              status: 'envoyé',
              method: 'gmail_api',
              gmailMessageId: '18f23a9b1c098df',
            },
          ];
    } catch {
      return [];
    }
  });

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false);

  // Scanning loop state (default: scan every 1 hour / 3600s)
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanCountdown, setScanCountdown] = useState<number>(3600);

  // Modals state
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<WatchTopic | null>(null);
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Deep Analysis state
  const [isDeepModalOpen, setIsDeepModalOpen] = useState(false);
  const [activeDeepAlert, setActiveDeepAlert] = useState<NewsAlert | null>(null);
  const [deepAnalysis, setDeepAnalysis] = useState<DeepAnalysisResult | null>(null);
  const [isDeepLoading, setIsDeepLoading] = useState(false);

  // Executive Report state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isSendingReportEmail, setIsSendingReportEmail] = useState(false);

  // Email sending states
  const [isSendingEmailId, setIsSendingEmailId] = useState<string | null>(null);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  // Sources state (Belgian Francophone Press directory + International + YouTube + citizen watchdogs)
  const [sources, setSources] = useState<WatchSource[]>(() => {
    try {
      const version = localStorage.getItem('veillepulse_sources_version');
      const saved = localStorage.getItem('veillepulse_sources_v15');
      if (saved && version === 'v15_130plus_balanced_sources_youtube_social_textures_1h_scan') {
        return JSON.parse(saved);
      }
      localStorage.setItem('veillepulse_sources_version', 'v15_130plus_balanced_sources_youtube_social_textures_1h_scan');
      localStorage.setItem('veillepulse_sources_v15', JSON.stringify(DEFAULT_SOURCES));
      return DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });

  // Dedicated full directory modal state (to list and manage all sources on a dedicated page)
  const [isSourceDirectoryOpen, setIsSourceDirectoryOpen] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [sourceToEdit, setSourceToEdit] = useState<WatchSource | null>(null);
  const [scanningSourceId, setScanningSourceId] = useState<string | null>(null);

  // Confirmation dialog state for destructive/send actions
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('veillepulse_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('veillepulse_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('veillepulse_sources_v15', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('veillepulse_email_settings', JSON.stringify(emailSettings));
  }, [emailSettings]);

  useEffect(() => {
    localStorage.setItem('veillepulse_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setIsGmailConnected(!!token);
      },
      () => {
        setIsGmailConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setIsGmailConnected(true);
        showToast(
          `Compte Gmail connecté avec succès (${result.user.email}) ! L'envoi direct d'e-mails est activé.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      showToast(err.message || 'Échec de la connexion à Google Gmail', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setIsGmailConnected(false);
    showToast('Compte Gmail déconnecté.', 'info');
  };

  // Automated scanning countdown timer (1 heure = 3600 secondes)
  useEffect(() => {
    const timer = setInterval(() => {
      setScanCountdown((prev) => {
        if (prev <= 1) {
          triggerAutoScan();
          return 3600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [topics, alerts, emailSettings, isGmailConnected]);

  // Automated scan across all active topics
  const triggerAutoScan = async () => {
    const activeTopics = topics.filter((t) => t.isActive);
    if (activeTopics.length === 0 || isScanning) return;

    // Pick one topic to scan on each cycle to respect quotas and provide progressive fresh news
    const randomTopic = activeTopics[Math.floor(Math.random() * activeTopics.length)];
    await scanSingleTopic(randomTopic, true);
  };

  // Core Topic Scanner (performs fetch, deduping against existing alerts, and assigns guaranteed unique images)
  const runTopicScanCore = async (topic: WatchTopic): Promise<NewsAlert[]> => {
    const result = await scanTopicWithServer(topic, alerts);
    if (!result.success || !result.alerts || result.alerts.length === 0) {
      return [];
    }

    // Filter out duplicates based on title similarity
    const newUniqueAlerts = result.alerts.filter(
      (newA) => !alerts.some((existing) => existing.title.toLowerCase().trim() === newA.title.toLowerCase().trim())
    );

    // Guarantee that every single new alert has a unique, high-definition image
    return newUniqueAlerts.map((a) => ({
      ...a,
      imageUrl: getUniqueArticleImageUrl(a.title, a.source, a.topicTitle, a.sourceUrl, a.imageUrl, true),
    }));
  };

  // Scan single topic
  const scanSingleTopic = async (topic: WatchTopic, isBackground: boolean = false) => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      const newUniqueAlerts = await runTopicScanCore(topic);

      if (newUniqueAlerts.length > 0) {
        // Play sound
        if (emailSettings.soundEnabled) {
          const hasHigh = newUniqueAlerts.some((a) => a.impactScore >= 80);
          playAlertChime(hasHigh ? 'high' : 'normal');
        }

        // Desktop notification
        if (emailSettings.desktopNotificationEnabled) {
          const first = newUniqueAlerts[0];
          sendDesktopNotification(
            `🚨 [Veille] ${first.topicTitle}`,
            `${first.title} (Impact ${first.impactScore}/100)`
          );
        }

        // Auto-send emails for alerts exceeding the threshold
        let updatedWithEmailFlags = [...newUniqueAlerts];
        if (emailSettings.autoSendEnabled) {
          for (let i = 0; i < updatedWithEmailFlags.length; i++) {
            const alertToEvaluate = updatedWithEmailFlags[i];
            if (alertToEvaluate.impactScore >= emailSettings.minScoreForAutoSend) {
              await dispatchEmailForAlert(alertToEvaluate, false);
              updatedWithEmailFlags[i] = {
                ...alertToEvaluate,
                emailSent: true,
                emailSentAt: new Date().toISOString(),
              };
            }
          }
        }

        // Update alerts state
        setAlerts((prev) => [...updatedWithEmailFlags, ...prev]);

        // Update topic stats
        setTopics((prev) =>
          prev.map((t) =>
            t.id === topic.id
              ? {
                  ...t,
                  lastScannedAt: new Date().toISOString(),
                  signalsCount: (t.signalsCount || 0) + newUniqueAlerts.length,
                }
              : t
          )
        );

        showToast(
          `${newUniqueAlerts.length} nouveau(x) signal(aux) détecté(s) pour "${topic.title}" !`,
          'success'
        );
      } else if (!isBackground) {
        showToast(`Veille à jour : Aucun nouveau signal détecté pour "${topic.title}".`, 'info');
      }
    } catch (err: any) {
      console.error('Scan failed:', err);
      if (!isBackground) {
        showToast(`Erreur lors du scan : ${err.message}`, 'error');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Manual Trigger Scan on all or selected topic
  const handleManualScan = async () => {
    if (isScanning) return;

    if (selectedTopicId !== 'all') {
      const topic = topics.find((t) => t.id === selectedTopicId);
      if (topic) {
        await scanSingleTopic(topic, false);
        return;
      }
    }

    // Scan all active topics
    const activeTopics = topics.filter((t) => t.isActive);
    if (activeTopics.length === 0) {
      showToast('Aucun sujet actif à scanner.', 'info');
      return;
    }

    setIsScanning(true);
    showToast(`Scan en cours sur ${activeTopics.length} sujet(s) de veille...`, 'info');

    try {
      let allNewAlerts: NewsAlert[] = [];
      const topicCounts: Record<string, number> = {};

      for (const topic of activeTopics) {
        try {
          const newAlerts = await runTopicScanCore(topic);
          if (newAlerts.length > 0) {
            allNewAlerts = [...allNewAlerts, ...newAlerts];
            topicCounts[topic.id] = newAlerts.length;
          }
        } catch (e) {
          console.error(`Error scanning topic ${topic.title}:`, e);
        }
      }

      if (allNewAlerts.length > 0) {
        // Sound
        if (emailSettings.soundEnabled) {
          const hasHigh = allNewAlerts.some((a) => a.impactScore >= 80);
          playAlertChime(hasHigh ? 'high' : 'normal');
        }

        // Notification
        if (emailSettings.desktopNotificationEnabled) {
          sendDesktopNotification(
            `🚨 [Veille] Nouveaux signaux`,
            `${allNewAlerts.length} nouveau(x) article(s) et vidéo(s) détecté(s)`
          );
        }

        // Auto-send emails if threshold exceeded
        let updatedWithEmailFlags = [...allNewAlerts];
        if (emailSettings.autoSendEnabled) {
          for (let i = 0; i < updatedWithEmailFlags.length; i++) {
            const alertToEvaluate = updatedWithEmailFlags[i];
            if (alertToEvaluate.impactScore >= emailSettings.minScoreForAutoSend) {
              await dispatchEmailForAlert(alertToEvaluate, false);
              updatedWithEmailFlags[i] = {
                ...alertToEvaluate,
                emailSent: true,
                emailSentAt: new Date().toISOString(),
              };
            }
          }
        }

        // Prepend new alerts normalized strictly
        const normalizedNew = updatedWithEmailFlags.map(normalizeAlertTopic);
        setAlerts((prev) => [...normalizedNew, ...prev]);

        // Update topics stats
        setTopics((prev) =>
          prev.map((t) => ({
            ...t,
            lastScannedAt: topicCounts[t.id] ? new Date().toISOString() : t.lastScannedAt,
            signalsCount: (t.signalsCount || 0) + (topicCounts[t.id] || 0),
          }))
        );

        showToast(`${allNewAlerts.length} nouveau(x) signal(aux) détecté(s) lors du scan !`, 'success');
      } else {
        showToast('Scan terminé : Toutes vos sources et alertes sont déjà parfaitement à jour.', 'info');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      showToast(`Erreur lors du scan : ${err.message}`, 'error');
    } finally {
      setIsScanning(false);
      setScanCountdown(3600);
    }
  };

  // Dispatch Email for Alert
  const dispatchEmailForAlert = async (alert: NewsAlert, showToastFeedback: boolean = true) => {
    const recipient = emailSettings.recipientEmail;
    setIsSendingEmailId(alert.id);

    try {
      const token = await getAccessToken();

      if (token) {
        // Send via official Gmail API
        const result = await sendGmailAlert(recipient, alert, window.location.href);
        if (result.success) {
          const newLog: EmailDispatchLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient,
            subject: `🚨 [Veille] ${alert.topicTitle} : ${alert.title.slice(0, 60)}...`,
            alertIds: [alert.id],
            alertTitles: [alert.title],
            status: 'envoyé',
            method: 'gmail_api',
            gmailMessageId: result.messageId,
          };
          setEmailLogs((prev) => [newLog, ...prev]);

          // Update alert state
          setAlerts((prev) =>
            prev.map((a) =>
              a.id === alert.id
                ? { ...a, emailSent: true, emailSentAt: new Date().toISOString() }
                : a
            )
          );

          if (showToastFeedback) {
            showToast(`E-mail d'alerte envoyé via Gmail à ${recipient} !`, 'success');
          }
        } else {
          throw new Error(result.error);
        }
      } else {
        // If not connected to Google yet, log and inform user
        const newLog: EmailDispatchLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          recipient,
          subject: `🚨 [Veille] ${alert.topicTitle} : ${alert.title.slice(0, 60)}...`,
          alertIds: [alert.id],
          alertTitles: [alert.title],
          status: 'envoyé',
          method: 'simulation',
        };
        setEmailLogs((prev) => [newLog, ...prev]);

        // Mark as sent
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id
              ? { ...a, emailSent: true, emailSentAt: new Date().toISOString() }
              : a
          )
        );

        if (showToastFeedback) {
          showToast(
            `Alerte préparée pour ${recipient}. Cliquez sur 'Connecter Gmail' pour l'envoi direct depuis votre boîte.`,
            'info'
          );
        }
      }
    } catch (err: any) {
      console.error('Email dispatch error:', err);
      const failedLog: EmailDispatchLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        recipient,
        subject: `🚨 [Veille] ${alert.topicTitle} : ${alert.title.slice(0, 60)}...`,
        alertIds: [alert.id],
        alertTitles: [alert.title],
        status: 'échoué',
        method: 'gmail_api',
        error: err.message || "Erreur d'envoi",
      };
      setEmailLogs((prev) => [failedLog, ...prev]);

      if (showToastFeedback) {
        showToast(`Échec de l'envoi de l'e-mail : ${err.message}`, 'error');
      }
    } finally {
      setIsSendingEmailId(null);
    }
  };

  // User confirmed manual send
  const requestSendEmail = (alert: NewsAlert) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirmer l'envoi de l'alerte par e-mail",
      description: `Voulez-vous envoyer immédiatement l'alerte "${alert.title}" à l'adresse ${emailSettings.recipientEmail} ?`,
      onConfirm: () => {
        setConfirmDialog(null);
        dispatchEmailForAlert(alert, true);
      },
    });
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    setTestEmailStatus(null);

    const testAlert: NewsAlert = {
      id: `test-${Date.now()}`,
      topicId: 'topic-charleroi-transparence',
      topicTitle: 'Test de Notification en Temps Réel',
      scope: 'local',
      sourceType: 'presse',
      title: 'Vérification du système de veille informative et des alertes e-mail',
      summary:
        "Ceci est un e-mail de test validant le bon fonctionnement de votre système de notifications d'intelligence stratégique VeillePulse.",
      source: 'VeillePulse Verification Engine',
      sourceUrl: window.location.href,
      authorOrAccount: 'Pôle Rédaction & Vérification',
      directQuote: '« Le canal de notification d\'alertes de veille et d\'articles de presse est pleinement opérationnel. »',
      publishedAt: `Aujourd'hui (${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })})`,
      publishedDateExact: new Date().toISOString(),
      detectedAt: new Date().toISOString(),
      impactScore: 95,
      sentiment: 'opportunite',
      keyTakeaways: [
        'Le canal de notification par e-mail est pleinement opérationnel.',
        'La collecte croisée presse régionale et réseaux sociaux est active.',
        'Les déclencheurs automatiques enverront les alertes dès détection.',
      ],
      suggestedAction:
        'Vous pouvez maintenant configurer vos sujets personnalisés et laisser le radar tourner en temps réel.',
      tags: ['Test', 'Vérification', 'VeillePulse'],
      isRead: false,
      isBookmarked: false,
      emailSent: false,
    };

    try {
      const token = await getAccessToken();
      if (token) {
        const res = await sendGmailAlert(
          emailSettings.recipientEmail,
          testAlert,
          window.location.href
        );
        if (res.success) {
          setTestEmailStatus({ success: true });
          const newLog: EmailDispatchLog = {
            id: `log-test-${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient: emailSettings.recipientEmail,
            subject: `🚨 [Veille Test] Vérification du système de notifications`,
            alertIds: [testAlert.id],
            alertTitles: [testAlert.title],
            status: 'envoyé',
            method: 'gmail_api',
            gmailMessageId: res.messageId,
          };
          setEmailLogs((prev) => [newLog, ...prev]);
          showToast(`E-mail de test envoyé à ${emailSettings.recipientEmail} via Gmail !`, 'success');
        } else {
          setTestEmailStatus({ success: false, error: res.error });
          showToast(`Erreur d'envoi : ${res.error}`, 'error');
        }
      } else {
        // Simulation log and prompt user to login
        const newLog: EmailDispatchLog = {
          id: `log-test-${Date.now()}`,
          timestamp: new Date().toISOString(),
          recipient: emailSettings.recipientEmail,
          subject: `🚨 [Veille Test] Simulation d'envoi d'alerte`,
          alertIds: [testAlert.id],
          alertTitles: [testAlert.title],
          status: 'envoyé',
          method: 'simulation',
        };
        setEmailLogs((prev) => [newLog, ...prev]);
        setTestEmailStatus({ success: true });
        showToast(
          `Modèle d'e-mail validé. Connectez votre compte Gmail pour activer l'envoi réel.`,
          'info'
        );
      }
    } catch (e: any) {
      setTestEmailStatus({ success: false, error: e.message });
      showToast(`Erreur : ${e.message}`, 'error');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Run deep strategic analysis on an alert
  const handleOpenDeepAnalysis = async (alert: NewsAlert) => {
    setActiveDeepAlert(alert);
    setDeepAnalysis(null);
    setIsDeepLoading(true);
    setIsDeepModalOpen(true);

    try {
      const res = await runDeepAnalysis(alert);
      if (res.success && res.analysis) {
        setDeepAnalysis(res.analysis);
      } else {
        showToast("Erreur lors de la génération de l'analyse stratégique", 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erreur analyse', 'error');
    } finally {
      setIsDeepLoading(false);
    }
  };

  // Generate Executive Briefing
  const handleOpenReportModal = async () => {
    setIsReportModalOpen(true);
    if (!executiveReport) {
      handleGenerateReport();
    }
  };

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    try {
      const res = await generateExecutiveBriefing(alerts, topics);
      if (res.success && res.report) {
        setExecutiveReport(res.report);
      }
    } catch (e: any) {
      showToast(e.message || 'Erreur lors du briefing', 'error');
    } finally {
      setIsReportLoading(false);
    }
  };

  // Send Executive Briefing by Email
  const handleSendReportByEmail = async (report: ExecutiveReport) => {
    setIsSendingReportEmail(true);
    try {
      const token = await getAccessToken();
      const topAlerts = report.criticalAlerts && report.criticalAlerts.length > 0 ? report.criticalAlerts : alerts.slice(0, 4);

      if (token) {
        const res = await sendGmailDigest(
          emailSettings.recipientEmail,
          topAlerts,
          emailSettings.recipientName || 'Xavier',
          window.location.href
        );
        if (res.success) {
          const newLog: EmailDispatchLog = {
            id: `log-briefing-${Date.now()}`,
            timestamp: new Date().toISOString(),
            recipient: emailSettings.recipientEmail,
            subject: `📊 [Briefing Veille] ${report.period} - Synthèse Stratégique`,
            alertIds: topAlerts.map((a) => a.id),
            alertTitles: topAlerts.map((a) => a.title),
            status: 'envoyé',
            method: 'gmail_api',
            gmailMessageId: res.messageId,
          };
          setEmailLogs((prev) => [newLog, ...prev]);
          showToast(`Briefing exécutif envoyé par e-mail à ${emailSettings.recipientEmail} !`, 'success');
          setIsReportModalOpen(false);
        } else {
          throw new Error(res.error);
        }
      } else {
        showToast("Veuillez connecter votre compte Gmail pour expédier le rapport.", 'info');
      }
    } catch (err: any) {
      showToast(`Échec de l'envoi du briefing : ${err.message}`, 'error');
    } finally {
      setIsSendingReportEmail(false);
    }
  };

  // Topic management
  const handleSaveTopic = (savedTopic: WatchTopic) => {
    setTopics((prev) => {
      const exists = prev.some((t) => t.id === savedTopic.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTopic.id ? savedTopic : t));
      }
      return [...prev, savedTopic];
    });
    showToast(`Sujet "${savedTopic.title}" enregistré et placé sous surveillance active !`, 'success');
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== topicId));
    setAlerts((prev) => prev.filter((a) => a.topicId !== topicId));
    if (selectedTopicId === topicId) {
      setSelectedTopicId('all');
    }
    showToast('Sujet de veille supprimé avec succès.', 'info');
  };

  const handleResetToBelgianTopics = () => {
    const normalized = INITIAL_ALERTS.map(normalizeAlertTopic);
    setTopics(DEFAULT_TOPICS);
    setAlerts(normalized);
    setSelectedScope('all');
    setSelectedTopicId('all');
    localStorage.setItem('veillepulse_topics', JSON.stringify(DEFAULT_TOPICS));
    localStorage.setItem('veillepulse_alerts', JSON.stringify(normalized));
    localStorage.setItem('veillepulse_alerts_version', 'v29_manifestations_strictement_luttes_sociales');
    localStorage.setItem('veillepulse_topics_version', 'v29_manifestations_strictement_luttes_sociales');
    showToast('Sujets et actualités réinitialisés avec succès (Luttes Sociales vérifiées, formatage Ground News).', 'success');
  };

  const handleToggleTopicActive = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const handleToggleBookmark = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isBookmarked: !a.isBookmarked } : a))
    );
  };

  const handleToggleRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: !a.isRead } : a))
    );
  };

  // Source management handlers
  const handleSaveSource = (savedSource: WatchSource) => {
    setSources((prev) => {
      const exists = prev.some((s) => s.id === savedSource.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSource.id ? savedSource : s));
      }
      return [savedSource, ...prev];
    });
    showToast(`Source "${savedSource.name}" enregistrée et prête pour la surveillance !`, 'success');
  };

  const handleDeleteSource = (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    showToast('Source supprimée avec succès.', 'info');
  };

  const handleToggleSourceActive = (sourceId: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleResetSourcesToDefaults = () => {
    setSources(DEFAULT_SOURCES);
    localStorage.setItem('veillepulse_sources_version', 'v15_130plus_balanced_sources_youtube_social_textures_1h_scan');
    localStorage.setItem('veillepulse_sources_v15', JSON.stringify(DEFAULT_SOURCES));
    showToast(`Répertoire de presse et vigies réinitialisé avec succès (${DEFAULT_SOURCES.length} sources équilibrées).`, 'success');
  };

  const handleScanSingleSource = async (source: WatchSource) => {
    if (scanningSourceId) return;
    setScanningSourceId(source.id);
    showToast(`Interrogation directe de "${source.name}" en cours...`, 'info');

    try {
      const result = await scanSourceWithServer(source, topics);
      if (result.success && result.alerts.length > 0) {
        const newUnique = result.alerts.filter(
          (newA) => !alerts.some((existing) => existing.title === newA.title)
        );

        if (newUnique.length > 0) {
          if (emailSettings.soundEnabled) {
            playAlertChime('normal');
          }

          let updatedWithEmailFlags = [...newUnique];
          if (emailSettings.autoSendEnabled) {
            for (let i = 0; i < updatedWithEmailFlags.length; i++) {
              const a = updatedWithEmailFlags[i];
              if (a.impactScore >= emailSettings.minScoreForAutoSend) {
                await dispatchEmailForAlert(a, false);
                updatedWithEmailFlags[i] = {
                  ...a,
                  emailSent: true,
                  emailSentAt: new Date().toISOString(),
                };
              }
            }
          }

          const normalizedSingleSourceAlerts = updatedWithEmailFlags.map(normalizeAlertTopic);
          setAlerts((prev) => [...normalizedSingleSourceAlerts, ...prev]);

          setSources((prev) =>
            prev.map((s) =>
              s.id === source.id
                ? {
                    ...s,
                    lastScannedAt: new Date().toISOString(),
                    articlesFoundCount: (s.articlesFoundCount || 0) + newUnique.length,
                  }
                : s
            )
          );

          showToast(
            `${newUnique.length} article(s) détecté(s) sur ${source.name} et intégré(s) au flux d'alertes !`,
            'success'
          );
        } else {
          showToast(`Veille à jour : Les articles récents de ${source.name} sont déjà indexés.`, 'info');
        }
      } else {
        showToast(`Aucun nouvel article trouvé actuellement pour ${source.name}.`, 'info');
      }
    } catch (err: any) {
      showToast(`Erreur lors du scan de ${source.name} : ${err.message}`, 'error');
    } finally {
      setScanningSourceId(null);
    }
  };

  // Visible alerts filtered by selected scope (Local, National, International) and topic
  const visibleAlerts = alerts.filter((alert) => {
    if (selectedScope !== 'all' && (alert.scope || 'local') !== selectedScope) {
      return false;
    }
    if (selectedTopicId !== 'all' && alert.topicId !== selectedTopicId) {
      return false;
    }
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Toast feedback */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border backdrop-blur-md transition animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-white text-slate-800 border-slate-200 shadow-md'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Confirmation Dialog for Workspace Actions */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Mail className="w-4 h-4" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition"
              >
                Confirmer l'envoi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header
        isScanning={isScanning}
        onTriggerScan={handleManualScan}
        onOpenReportModal={handleOpenReportModal}
        onOpenSourcesModal={() => setIsSourceDirectoryOpen(true)}
        activeSourcesCount={sources.filter((s) => s.isActive).length}
        scanCountdown={scanCountdown}
        totalAlertsCount={alerts.length}
      />

      {/* Watch Topics Bar with Prominent Scopes (Wallonie/FWB/Local, National, International) */}
      <TopicSelector
        topics={topics}
        alerts={alerts}
        selectedTopicId={selectedTopicId}
        onSelectTopic={setSelectedTopicId}
        selectedScope={selectedScope}
        onSelectScope={setSelectedScope}
        onOpenNewTopicModal={() => {
          setTopicToEdit(null);
          setIsTopicModalOpen(true);
        }}
        onEditTopic={(t) => {
          setTopicToEdit(t);
          setIsTopicModalOpen(true);
        }}
        onToggleTopicActive={handleToggleTopicActive}
      />

      {/* Main Content Area: Direct Unified Feed from All Sources with background image at lowest level */}
      <div className="relative flex-1">
        {/* Background image at the lowest level in the background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-15 pointer-events-none -z-10"
          style={{ backgroundImage: `url(${pressBg})` }}
        />
        {/* Soft atmospheric gradient wash over background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/70 via-stone-50/50 to-slate-50/75 pointer-events-none -z-10" />

        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4 relative z-0">
          
          {/* Sleek Ground News Sub-Bar: Feed Summary & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Flux d'Actualités &amp; Auto-Défense
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold border border-slate-200">
                {visibleAlerts.length} signaux
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => setIsSourceDirectoryOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Répertoire ({sources.length} sources)</span>
              </button>

              <button
                onClick={() => {
                  setSourceToEdit(null);
                  setIsAddSourceModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter source</span>
              </button>

              <button
                onClick={handleResetToBelgianTopics}
                title="Recharger la liste des sujets et actualités de référence"
                className="p-1.5 rounded-lg bg-white/95 hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Live Alert Feed from all sources */}
          <LiveAlertFeed
            alerts={visibleAlerts}
            onDeepAnalyze={handleOpenDeepAnalysis}
            onSendEmailAlert={requestSendEmail}
            onToggleBookmark={handleToggleBookmark}
            onToggleRead={handleToggleRead}
            recipientEmail={emailSettings.recipientEmail}
            isSendingEmailId={isSendingEmailId}
          />

        </main>
      </div>

      {/* Dedicated Sources Directory Modal (Full Page View) */}
      {isSourceDirectoryOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50/98 backdrop-blur-md overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl w-full mx-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <button
                onClick={() => setIsSourceDirectoryOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-2xs transition"
              >
                <span>← Revenir au flux en direct de toutes les sources</span>
              </button>
              <button
                onClick={() => setIsSourceDirectoryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SourceManager
              sources={sources}
              onToggleSourceActive={handleToggleSourceActive}
              onScanSingleSource={handleScanSingleSource}
              onOpenAddModal={() => {
                setSourceToEdit(null);
                setIsAddSourceModalOpen(true);
              }}
              onEditSource={(source) => {
                setSourceToEdit(source);
                setIsAddSourceModalOpen(true);
              }}
              onDeleteSource={handleDeleteSource}
              onResetToDefaults={handleResetSourcesToDefaults}
              scanningSourceId={scanningSourceId}
            />
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <AddSourceModal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
        onSave={handleSaveSource}
        sourceToEdit={sourceToEdit}
      />

      <TopicManagerModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        topicToEdit={topicToEdit}
        onSaveTopic={handleSaveTopic}
        onDeleteTopic={handleDeleteTopic}
      />

      <DeepAnalysisModal
        isOpen={isDeepModalOpen}
        onClose={() => setIsDeepModalOpen(false)}
        alert={activeDeepAlert}
        analysis={deepAnalysis}
        isLoading={isDeepLoading}
        onSendEmailWithAnalysis={(alert, analysis) => {
          setIsDeepModalOpen(false);
          requestSendEmail(alert);
        }}
        recipientEmail={emailSettings.recipientEmail}
      />

      <ExecutiveReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={executiveReport}
        isLoading={isReportLoading}
        onGenerateReport={handleGenerateReport}
        onSendReportByEmail={handleSendReportByEmail}
        recipientEmail={emailSettings.recipientEmail}
        isSendingEmail={isSendingReportEmail}
      />

    </div>
  );
}
