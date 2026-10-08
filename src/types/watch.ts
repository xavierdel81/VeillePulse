export type PriorityLevel = 'haute' | 'moyenne' | 'basse';
export type SentimentType = 'alerte' | 'opportunite' | 'positif' | 'neutre';
export type TopicScope = 'international' | 'national' | 'local' | 'all';
export type SourceChannel = 'presse' | 'reseaux_sociaux' | 'youtube' | 'rapport_officiel';
export type PoliticalLeaning =
  | 'gauche_radicale'
  | 'gauche'
  | 'centre'
  | 'droite'
  | 'extreme_droite'
  | 'independant_non_aligne';

export type SourceCategory =
  | 'presse_independante'
  | 'investigation'
  | 'citoyen_local'
  | 'transparence'
  | 'analyse_critique'
  | 'chaine_youtube';

export interface WatchSource {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  channel?: SourceChannel;
  politicalLeaning: PoliticalLeaning;
  scope: TopicScope;
  category: SourceCategory;
  description: string;
  isActive: boolean;
  isCustom?: boolean; // Ajouté manuellement par l'utilisateur
  lastScannedAt?: string;
  articlesFoundCount?: number;
  tags?: string[];
  portalHub?: string; // ex: "Portail Basta! Médias Indépendants"
  imageUrl?: string;
}

export interface WatchTopic {
  id: string;
  title: string;
  description: string;
  scope: TopicScope;
  keywords: string[];
  excludedKeywords?: string[];
  targetDomains?: string[];
  priority: PriorityLevel;
  isActive: boolean;
  minImpactThreshold: number; // 0 to 100 for triggering email alerts
  lastScannedAt?: string;
  signalsCount?: number;
  color?: string;
}

export interface NewsAlert {
  id: string;
  topicId: string;
  topicTitle: string;
  scope: TopicScope;
  sourceType: SourceChannel;
  politicalLeaning?: PoliticalLeaning;
  sourceTendencyEvaluation?: string; // Évaluation explicite de la tendance de la source (ex: "Gauche citoyenne & émancipation sociale")
  imageUrl?: string;
  videoUrl?: string;
  archiveUrl?: string; // Lien direct Wayback Machine (Internet Archive) pour lire l'article même s'il a été retiré
  factuality?: 'elevee' | 'mixte' | 'citoyenne' | 'verifiee'; // Évaluation de fiabilité inspirée de Ground News
  // Nouveaux critères de fiabilité et d'analyse demandés par l'utilisateur :
  dominantBiasLabel?: string; // Biais idéologique dominant (ex: "Gauche progressiste", "Droite libérale", "Centre factuel")
  crossMediaCoverage?: {
    status: 'forte' | 'moyenne' | 'isolee';
    count: number;
    label: string; // ex: "Fortement repris par 6+ médias", "Corroboration moyenne (3 médias)", "Signal exclusif / Isolé"
    badgeClass?: string;
  };
  rhetoricAssessment?: {
    hasFallacies: boolean;
    fallaciesCount: number;
    fallaciesList?: string[]; // ex: ["Faux dilemme", "Appel à la peur", "Attaque ad hominem"]
    label: string; // ex: "Rhétorique factuelle sans sophismes", "Sophismes détectés (2)"
    explanation?: string;
    badgeClass?: string;
  };
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  authorOrAccount?: string;
  directQuote?: string; // Citation exacte extraite de l'article ou de la publication
  publishedAt: string; // Ex: "Il y a 3 heures", "15 mai 2024", etc.
  publishedDateExact?: string; // Date ISO pour tri chronologique strict
  detectedAt: string;
  impactScore: number; // 1 to 100
  sentiment: SentimentType;
  keyTakeaways: string[];
  suggestedAction?: string;
  tags: string[];
  storyClusterId?: string; // Regroupement par grand dossier Ground News (ex: "story-chomage", "story-semlex")
  storyClusterTitle?: string;
  mediaOwnership?: string; // Type d'actionnariat inspiré de Ground News (ex: "Indépendant sans publicité", "Groupe de presse privé", "Service public")
  biasDistribution?: {
    leftPercent: number;
    centerPercent: number;
    rightPercent: number;
    blindspot?: 'gauche' | 'droite' | 'centre' | 'aucun';
  };
  isRead: boolean;
  isBookmarked: boolean;
  emailSent: boolean;
  emailSentAt?: string;
}

export interface EmailSettings {
  recipientEmail: string;
  recipientName?: string;
  autoSendEnabled: boolean;
  minScoreForAutoSend: number; // e.g. 70
  instantBreakingAlerts: boolean; // instant send on >= 85 score
  digestFrequency: 'instant' | 'daily' | 'disabled';
  includeExecutiveBullets: boolean;
  soundEnabled: boolean;
  desktopNotificationEnabled: boolean;
}

export interface EmailDispatchLog {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  alertIds: string[];
  alertTitles: string[];
  status: 'envoyé' | 'échoué' | 'en cours';
  method: 'gmail_api' | 'simulation';
  gmailMessageId?: string;
  error?: string;
}

export interface DeepAnalysisResult {
  alertId: string;
  headline: string;
  strategicContext: string;
  impactAnalysis: {
    business: string;
    technological: string;
    regulatoryOrMarket: string;
  };
  risksAndOpportunities: {
    risks: string[];
    opportunities: string[];
  };
  actionableRecommendations: string[];
  urgencyLevel: 'Critique' | 'Élevée' | 'Modérée' | 'Faible';
}

export interface ExecutiveReport {
  id: string;
  generatedAt: string;
  period: string;
  summary: string;
  topTrends: string[];
  criticalAlerts: NewsAlert[];
  strategicInsights: string[];
}
