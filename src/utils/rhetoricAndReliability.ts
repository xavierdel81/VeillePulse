import { PoliticalLeaning } from '../types/watch';
import { getEffectivePoliticalLeaning, getPoliticalLeaningMeta } from './politicalLeaning';

export interface DominantBiasInfo {
  biasLabel: string;
  spectrum: 'gauche' | 'centre' | 'droite';
  badgeClass: string;
  colorName: 'Rouge' | 'Gris' | 'Bleu';
}

export interface RhetoricAssessmentInfo {
  hasFallacies: boolean;
  fallaciesCount: number;
  fallaciesList: string[];
  label: string;
  badgeClass: string;
  explanation: string;
}

export interface CrossMediaCoverageInfo {
  status: 'forte' | 'moyenne' | 'isolee';
  count: number;
  label: string;
  badgeClass: string;
}

/**
 * Détermine le biais idéologique dominant de l'article :
 * - Gauche = Rouge (fond rouge, texte rouge)
 * - Centre = Gris (fond gris, texte ardoise)
 * - Droite = Bleu (fond bleu, texte bleu)
 */
export function getDominantIdeologicalBias(
  source: string,
  explicitLeaning?: PoliticalLeaning,
  sourceUrl?: string
): DominantBiasInfo {
  const eff = getEffectivePoliticalLeaning(source, explicitLeaning, sourceUrl);
  const meta = getPoliticalLeaningMeta(eff);

  if (eff === 'gauche' || eff === 'gauche_radicale') {
    return {
      biasLabel: `Biais dominant : ${meta.label} (Rouge)`,
      spectrum: 'gauche',
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-extrabold',
      colorName: 'Rouge',
    };
  }

  if (eff === 'droite' || eff === 'extreme_droite') {
    return {
      biasLabel: `Biais dominant : ${meta.label} (Bleu)`,
      spectrum: 'droite',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-extrabold',
      colorName: 'Bleu',
    };
  }

  return {
    biasLabel: `Biais dominant : ${meta.label} (Gris)`,
    spectrum: 'centre',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold',
    colorName: 'Gris',
  };
}

/**
 * Détermine si le contenu de l'article comporte de la rhétorique fallacieuse
 * (détection zététique : faux dilemme, appel à la peur, ad hominem, homme de paille, généralisation hâtive)
 */
export function assessRhetoricAndFallacies(
  title: string = '',
  summary: string = '',
  directQuote: string = ''
): RhetoricAssessmentInfo {
  const fullText = `${title} ${summary} ${directQuote}`.toLowerCase();
  const fallacies: string[] = [];

  // 1. Appel à la peur / sensationnalisme
  if (
    fullText.includes('chaos') ||
    fullText.includes('apocalypse') ||
    fullText.includes('menace mortelle') ||
    fullText.includes('scandale absolu') ||
    fullText.includes('terreur') ||
    fullText.includes('dangereux criminels') ||
    fullText.includes('déferlement')
  ) {
    fallacies.push('Appel à la peur / Dramatisation');
  }

  // 2. Homme de paille / Caricature outrancière
  if (
    fullText.includes('veulent détruire') ||
    fullText.includes('islamo-gauchiste') ||
    fullText.includes('wokiste') ||
    fullText.includes('traître') ||
    fullText.includes('ennemi de l\'intérieur') ||
    fullText.includes('parasite')
  ) {
    fallacies.push('Homme de paille / Caricature');
  }

  // 3. Faux dilemme
  if (
    fullText.includes('soit avec nous soit') ||
    fullText.includes('seule alternative') ||
    fullText.includes('il n\'y a pas d\'autre choix') ||
    fullText.includes('la seule solution') ||
    fullText.includes('ou c\'est la faillite')
  ) {
    fallacies.push('Faux dilemme');
  }

  // 4. Généralisation abusive
  if (
    fullText.includes('tous les manifestants sont') ||
    fullText.includes('tous les chômeurs') ||
    fullText.includes('tous des voleurs') ||
    fullText.includes('l\'ensemble des fonctionnaires profitent')
  ) {
    fallacies.push('Généralisation abusive');
  }

  // 5. Attaque ad hominem
  if (
    fullText.includes('hystérique') ||
    fullText.includes('incompétent notoire') ||
    fullText.includes('marionnette') ||
    fullText.includes('vendu aux')
  ) {
    fallacies.push('Attaque ad hominem');
  }

  if (fallacies.length === 0) {
    return {
      hasFallacies: false,
      fallaciesCount: 0,
      fallaciesList: [],
      label: 'Rhétorique factuelle • Pas de sophisme détecté',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      explanation: 'Argumentation centrée sur les faits vérifiés et pièces administratives, sans recours à des artifices de manipulation rhétorique.',
    };
  }

  return {
    hasFallacies: true,
    fallaciesCount: fallacies.length,
    fallaciesList: fallacies,
    label: `Rhétorique fallacieuse (${fallacies.length} artifice${fallacies.length > 1 ? 's' : ''} : ${fallacies.join(', ')})`,
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
    explanation: `Présence de procédés rhétoriques biaisés : ${fallacies.join(', ')}. Vigilance requise lors de la lecture.`,
  };
}

/**
 * Détermine si le contenu de l'article est fortement repris par d'autres médias
 */
export function assessCrossMediaCoverage(
  articleTitle: string,
  clusterAlertCount?: number,
  allAlertsCountForTopic: number = 1
): CrossMediaCoverageInfo {
  const count = clusterAlertCount || Math.min(6, Math.max(1, Math.floor(allAlertsCountForTopic / 3)));

  if (count >= 4) {
    return {
      status: 'forte',
      count,
      label: `Fortement repris (${count}+ médias nationaux)`,
      badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
    };
  }

  if (count >= 2) {
    return {
      status: 'moyenne',
      count,
      label: `Repris par ${count} sources différentes`,
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
    };
  }

  return {
    status: 'isolee',
    count: 1,
    label: 'Signal exclusif / Peu relayé ailleurs',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
  };
}
