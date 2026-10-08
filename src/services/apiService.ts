import { WatchTopic, NewsAlert, DeepAnalysisResult, ExecutiveReport, WatchSource } from '../types/watch';

export async function scanTopicWithServer(
  topic: WatchTopic
): Promise<{ success: boolean; alerts: NewsAlert[]; error?: string }> {
  try {
    const res = await fetch('/api/scan-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, alerts: data.alerts || [] };
  } catch (err: any) {
    console.error('Scan error:', err);
    return { success: false, alerts: [], error: err.message || 'Erreur lors du scan' };
  }
}

export async function scanSourceWithServer(
  source: WatchSource,
  topics: WatchTopic[]
): Promise<{ success: boolean; alerts: NewsAlert[]; count: number; error?: string }> {
  try {
    const res = await fetch('/api/scan-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, topics }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, alerts: data.alerts || [], count: data.count || 0 };
  } catch (err: any) {
    return { success: false, alerts: [], count: 0, error: err.message || 'Erreur lors du scan de la source' };
  }
}

export async function runDeepAnalysis(
  alert: NewsAlert
): Promise<{ success: boolean; analysis?: DeepAnalysisResult; error?: string }> {
  try {
    const res = await fetch('/api/deep-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, analysis: data.analysis };
  } catch (err: any) {
    return { success: false, error: err.message || "Erreur lors de l'analyse approfondie" };
  }
}

export async function generateExecutiveBriefing(
  alerts: NewsAlert[],
  topics: WatchTopic[]
): Promise<{ success: boolean; report?: ExecutiveReport; error?: string }> {
  try {
    const res = await fetch('/api/generate-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alerts, topics }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, report: data.report };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur lors de la génération du briefing' };
  }
}
