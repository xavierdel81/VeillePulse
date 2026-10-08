import React, { useState, useEffect } from 'react';
import { WatchTopic, PriorityLevel, TopicScope } from '../types/watch';
import { X, Plus, Trash2, Tag, ShieldAlert, Sparkles, Check, Info, Globe, MapPin, Flag, AlertTriangle } from 'lucide-react';

interface TopicManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicToEdit?: WatchTopic | null;
  onSaveTopic: (topic: WatchTopic) => void;
  onDeleteTopic?: (topicId: string) => void;
}

const PRESET_TEMPLATES = [
  {
    title: 'Transparence & Marchés Publics - Charleroi & Intercommunales',
    description: 'Veille inspirée de Transparencia Charleroi : accès aux documents administratifs (CADA), marchés publics de la Ville de Charleroi, mandats dans les intercommunales (Igretec, Tibi).',
    scope: 'local' as TopicScope,
    keywords: ['Transparencia Charleroi', 'Ville de Charleroi', 'Marchés publics Charleroi', 'CADA Wallonie', 'Igretec', 'Tibi'],
    priority: 'haute' as PriorityLevel,
    minImpactThreshold: 65,
    color: '#ef4444',
  },
  {
    title: 'Démocratie Participative & Mobilisations Citoyennes - Charleroi',
    description: 'Collectifs citoyens carolos, interpellations citoyennes au conseil communal de Charleroi, comités de quartier et budgets participatifs.',
    scope: 'local' as TopicScope,
    keywords: ['Collectif citoyen Charleroi', 'Interpellation citoyenne Charleroi', 'Comité de quartier Charleroi', 'Budget participatif Charleroi', 'Riverains Charleroi'],
    priority: 'haute' as PriorityLevel,
    minImpactThreshold: 60,
    color: '#06b6d4',
  },
  {
    title: 'Corruption Politique & Privée, Éthique & Lobbies - Belgique',
    description: 'Cour des comptes de Belgique, transparence en Wallonie, conflits d\'intérêts, marchés publics et gouvernance des intercommunales.',
    scope: 'national' as TopicScope,
    keywords: ['Cour des comptes Belgique', 'Transparence Wallonie', 'Conflits d\'intérêts Belgique', 'Lobbying Parlement fédéral', 'Intercommunales wallonnes'],
    priority: 'haute' as PriorityLevel,
    minImpactThreshold: 70,
    color: '#f59e0b',
  },
  {
    title: 'Rhétorique, Sophismes Fallacieux & Autodéfense Intellectuelle',
    description: 'Détection des sophismes en politique (strawman, ad hominem, faux dilemme, appel à l\'autorité, langue de bois) et autodéfense citoyenne.',
    scope: 'national' as TopicScope,
    keywords: ['Sophismes fallacieux', 'Argument ad hominem', 'Homme de paille strawman', 'Faux dilemme', 'Langue de bois politique', 'Autodéfense intellectuelle'],
    priority: 'haute' as PriorityLevel,
    minImpactThreshold: 65,
    color: '#ec4899',
  },
  {
    title: 'Anti-Corruption & Évasion Fiscale - International & UE',
    description: 'Rapports Transparency International, directives européennes anti-corruption et lanceurs d\'alerte, paradis fiscaux.',
    scope: 'international' as TopicScope,
    keywords: ['Transparency International', 'Directive européenne lanceurs d\'alerte', 'Paradis fiscaux', 'Corruption privée multinationales', 'GRECO'],
    priority: 'haute' as TopicScope,
    minImpactThreshold: 75,
    color: '#8b5cf6',
  },
];

const COLOR_OPTIONS = [
  '#ef4444', // Red (Charleroi Transparence)
  '#06b6d4', // Cyan (Démocratie participative)
  '#f59e0b', // Amber (Belgique Éthique)
  '#ec4899', // Pink (Rhétorique & Sophismes)
  '#8b5cf6', // Violet (International)
  '#10b981', // Emerald
  '#3b82f6', // Blue
];

export const TopicManagerModal: React.FC<TopicManagerModalProps> = ({
  isOpen,
  onClose,
  topicToEdit,
  onSaveTopic,
  onDeleteTopic,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<TopicScope>('local');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [excludedKeywords, setExcludedKeywords] = useState<string[]>([]);
  const [excludedInput, setExcludedInput] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('haute');
  const [minImpactThreshold, setMinImpactThreshold] = useState<number>(65);
  const [color, setColor] = useState('#ef4444');
  
  // Custom in-modal delete confirmation state (avoids window.confirm which is blocked in iframes!)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    setIsConfirmingDelete(false);
    if (topicToEdit) {
      setTitle(topicToEdit.title);
      setDescription(topicToEdit.description);
      setScope(topicToEdit.scope || 'local');
      setKeywords(topicToEdit.keywords || []);
      setExcludedKeywords(topicToEdit.excludedKeywords || []);
      setPriority(topicToEdit.priority || 'haute');
      setMinImpactThreshold(topicToEdit.minImpactThreshold || 65);
      setColor(topicToEdit.color || '#ef4444');
    } else {
      // Default initial state
      setTitle('');
      setDescription('');
      setScope('local');
      setKeywords(['Transparence', 'Charleroi', 'Conseil communal']);
      setExcludedKeywords([]);
      setPriority('haute');
      setMinImpactThreshold(65);
      setColor('#ef4444');
    }
  }, [topicToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddExcluded = () => {
    const trimmed = excludedInput.trim();
    if (trimmed && !excludedKeywords.includes(trimmed)) {
      setExcludedKeywords([...excludedKeywords, trimmed]);
      setExcludedInput('');
    }
  };

  const handleRemoveExcluded = (index: number) => {
    setExcludedKeywords(excludedKeywords.filter((_, i) => i !== index));
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setScope(preset.scope);
    setKeywords([...preset.keywords]);
    setPriority(preset.priority as PriorityLevel);
    setMinImpactThreshold(preset.minImpactThreshold);
    setColor(preset.color);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const topic: WatchTopic = {
      id: topicToEdit ? topicToEdit.id : `topic-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      scope,
      keywords: keywords.length > 0 ? keywords : [title.trim()],
      excludedKeywords,
      priority,
      isActive: topicToEdit ? topicToEdit.isActive : true,
      minImpactThreshold,
      color,
      signalsCount: topicToEdit ? topicToEdit.signalsCount : 0,
      lastScannedAt: topicToEdit?.lastScannedAt,
    };

    onSaveTopic(topic);
    onClose();
  };

  const handleExecuteDelete = () => {
    if (topicToEdit && onDeleteTopic) {
      onDeleteTopic(topicToEdit.id);
      setIsConfirmingDelete(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-800 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {topicToEdit ? 'Configurer le sujet de veille' : 'Nouveau sujet de veille'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Quick Preset Selector for new topics */}
          {!topicToEdit && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Piliers recommandés (Corruption, CADA, Démocratie, Auto-Défense) :</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEMPLATES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition text-left"
                  >
                    {p.title.split('-')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scope / Category (Local, National, International) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Échelle Géographique / Catégorie *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('local')}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scope === 'local'
                    ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-2xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span>📍 Charleroi</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('national')}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scope === 'national'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flag className="w-3.5 h-3.5 text-amber-600" />
                <span>🇧🇪 Belgique</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('international')}
                className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  scope === 'international'
                    ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-2xs font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>🌍 International</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Titre du sujet de veille *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Still Pissing & Intercommunales, Recours CADA Charleroi, Auto-défense intellectuelle..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Périmètre & Objectifs de veille
            </label>
            <textarea
              rows={2}
              placeholder="ex: Surveillance des révélations et débats sur internet et les réseaux sociaux..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none transition"
            />
          </div>

          {/* Keywords Target */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Mots-clés cibles & termes surveillés
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Tapez un mot-clé (ex: Still Pissing, CADA, Délibération) et validez"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
              >
                Ajouter
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                >
                  <Tag className="w-3 h-3 text-blue-500" />
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(i)}
                    className="hover:text-red-600 pl-1 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Excluded Keywords */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
              <span>Termes exclus (filtrage de bruit)</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(facultatif)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="ex: résultat sportif, promo, météo..."
                value={excludedInput}
                onChange={(e) => setExcludedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExcluded();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleAddExcluded}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
              >
                Exclure
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {excludedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-red-50 text-red-700 border border-red-200 font-medium"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExcluded(i)}
                    className="hover:text-red-900 pl-1 font-bold"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Priority & Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Niveau de Priorité
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['haute', 'moyenne', 'basse'] as PriorityLevel[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1.5 text-xs font-semibold capitalize rounded-lg border transition ${
                      priority === p
                        ? p === 'haute'
                          ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                          : p === 'moyenne'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-800 border-slate-300 font-bold'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Seuil d'alerte email
                </label>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                  {minImpactThreshold}/100
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={minImpactThreshold}
                onChange={(e) => setMinImpactThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Seules les actualités ayant un impact &ge; {minImpactThreshold} déclencheront un e-mail direct.
              </p>
            </div>
          </div>

          {/* Color Selection */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Couleur d'identification
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition flex items-center justify-center ${
                    color === c ? 'ring-2 ring-slate-800 ring-offset-2 ring-offset-white scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* In-Modal Delete Confirmation Box (100% Reliable in iFrame!) */}
          {isConfirmingDelete && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2 animate-slide-up">
              <div className="flex items-center gap-1.5 font-bold text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Êtes-vous sûr de vouloir supprimer définitivement ce sujet ?</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Le sujet <strong>"{title}"</strong> sera supprimé de votre tableau de bord et ne fera plus l'objet de scans.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs transition"
                >
                  Oui, supprimer
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            {topicToEdit && onDeleteTopic && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {topicToEdit ? 'Enregistrer' : 'Créer et lancer la veille'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
