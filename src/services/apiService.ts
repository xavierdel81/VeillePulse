import { WatchTopic, NewsAlert, DeepAnalysisResult, ExecutiveReport, WatchSource } from '../types/watch';
import {
  scanTopicClientSide,
  scanSourceClientSide,
  runClientDeepAnalysis,
  generateClientExecutiveBriefing,
} from './clientScanner';

let serverKnownUnavailable = false;

function isStaticHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.includes('github.io') || host.includes('surge.sh');
}

/**
 * Helper to get existing alerts from localStorage for deduplication
 */
function getStoredAlerts(): NewsAlert[] {
  try {
    const raw = localStorage.getItem('veillepulse_alerts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Scan topic with dual mode: Express server in dev/fullstack, resilient client-side scanner on GitHub Pages / static
 */
export async function scanTopicWithServer(
  topic: WatchTopic,
  existingAlerts?: NewsAlert[]
): Promise<{ success: boolean; alerts: NewsAlert[]; error?: string; isClientMode?: boolean }> {
  const currentAlerts = existingAlerts || getStoredAlerts();

  // If we already know the server is not available (e.g. on GitHub Pages static deployment)
  if (serverKnownUnavailable || isStaticHost()) {
    try {
      const clientAlerts = await scanTopicClientSide(topic, currentAlerts);
      return { success: true, alerts: clientAlerts, isClientMode: true };
    } catch (e: any) {
      console.warn('[VeillePulse] Client scanner warning:', e);
      return { success: true, alerts: [], error: e.message };
    }
  }

  // Attempt server scan
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/scan-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      // Server returned 404 or HTML (standard for static sites like GitHub Pages)
      console.info('[VeillePulse] Serveur API indisponible (déploiement statique détecté). Activation du scanner autonome en ligne.');
      serverKnownUnavailable = true;
      const clientAlerts = await scanTopicClientSide(topic, currentAlerts);
      return { success: true, alerts: clientAlerts, isClientMode: true };
    }

    const data = await res.json();
    return { success: true, alerts: data.alerts || [] };
  } catch (err: any) {
    // Network failure, timeout, or 404: seamlessly fallback to autonomous client-side scanner
    console.info('[VeillePulse] Erreur réseau vers /api/scan-topic, basculement vers le moteur de veille autonome en ligne :', err.message);
    serverKnownUnavailable = true;
    try {
      const clientAlerts = await scanTopicClientSide(topic, currentAlerts);
      return { success: true, alerts: clientAlerts, isClientMode: true };
    } catch (clientErr: any) {
      return { success: false, alerts: [], error: clientErr.message || 'Erreur lors du scan' };
    }
  }
}

/**
 * Scan source with dual mode
 */
export async function scanSourceWithServer(
  source: WatchSource,
  topics: WatchTopic[],
  existingAlerts?: NewsAlert[]
): Promise<{ success: boolean; alerts: NewsAlert[]; count: number; error?: string; isClientMode?: boolean }> {
  const currentAlerts = existingAlerts || getStoredAlerts();

  if (serverKnownUnavailable || isStaticHost()) {
    try {
      const result = await scanSourceClientSide(source, topics, currentAlerts);
      return { success: true, alerts: result.alerts, count: result.count, isClientMode: true };
    } catch (e: any) {
      return { success: false, alerts: [], count: 0, error: e.message };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/scan-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, topics }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      serverKnownUnavailable = true;
      const result = await scanSourceClientSide(source, topics, currentAlerts);
      return { success: true, alerts: result.alerts, count: result.count, isClientMode: true };
    }

    const data = await res.json();
    return { success: true, alerts: data.alerts || [], count: data.count || 0 };
  } catch (err: any) {
    serverKnownUnavailable = true;
    try {
      const result = await scanSourceClientSide(source, topics, currentAlerts);
      return { success: true, alerts: result.alerts, count: result.count, isClientMode: true };
    } catch (clientErr: any) {
      return { success: false, alerts: [], count: 0, error: clientErr.message || 'Erreur lors du scan de la source' };
    }
  }
}

/**
 * Deep Analysis with dual mode
 */
export async function runDeepAnalysis(
  alert: NewsAlert
): Promise<{ success: boolean; analysis?: DeepAnalysisResult; error?: string }> {
  if (serverKnownUnavailable || isStaticHost()) {
    try {
      const analysis = await runClientDeepAnalysis(alert);
      return { success: true, analysis };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/deep-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      serverKnownUnavailable = true;
      const analysis = await runClientDeepAnalysis(alert);
      return { success: true, analysis };
    }

    const data = await res.json();
    return { success: true, analysis: data.analysis };
  } catch (err: any) {
    serverKnownUnavailable = true;
    try {
      const analysis = await runClientDeepAnalysis(alert);
      return { success: true, analysis };
    } catch (clientErr: any) {
      return { success: false, error: clientErr.message || "Erreur lors de l'analyse approfondie" };
    }
  }
}

/**
 * Executive Briefing with dual mode
 */
export async function generateExecutiveBriefing(
  alerts: NewsAlert[],
  topics: WatchTopic[]
): Promise<{ success: boolean; report?: ExecutiveReport; error?: string }> {
  if (serverKnownUnavailable || isStaticHost()) {
    try {
      const report = await generateClientExecutiveBriefing(alerts, topics);
      return { success: true, report };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alerts, topics }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      serverKnownUnavailable = true;
      const report = await generateClientExecutiveBriefing(alerts, topics);
      return { success: true, report };
    }

    const data = await res.json();
    return { success: true, report: data.report };
  } catch (err: any) {
    serverKnownUnavailable = true;
    try {
      const report = await generateClientExecutiveBriefing(alerts, topics);
      return { success: true, report };
    } catch (clientErr: any) {
      return { success: false, error: clientErr.message || 'Erreur lors de la génération du briefing' };
    }
  }
}
