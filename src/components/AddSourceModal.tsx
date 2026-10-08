import React, { useState, useEffect } from 'react';
import { X, Globe, Rss, Tag, FileText, CheckCircle2, MapPin, Flag, Play, Compass, Image as ImageIcon } from 'lucide-react';
import { WatchSource, TopicScope, SourceCategory, PoliticalLeaning, SourceChannel } from '../types/watch';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (source: WatchSource) => void;
  sourceToEdit?: WatchSource | null;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sourceToEdit,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [rssUrl, setRssUrl] = useState('');
  const [channel, setChannel] = useState<SourceChannel>('presse');
  const [politicalLeaning, setPoliticalLeaning] = useState<PoliticalLeaning>('independant_non_aligne');
  const [scope, setScope] = useState<TopicScope>('national');
  const [category, setCategory] = useState<SourceCategory>('presse_independante');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [portalHub, setPortalHub] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceToEdit) {
      setName(sourceToEdit.name);
      setUrl(sourceToEdit.url);
      setRssUrl(sourceToEdit.rssUrl || '');
      setChannel(sourceToEdit.channel || (sourceToEdit.category === 'chaine_youtube' ? 'youtube' : 'presse'));
      setPoliticalLeaning(sourceToEdit.politicalLeaning || 'independant_non_aligne');
      setScope(sourceToEdit.scope);
      setCategory(sourceToEdit.category);
      setDescription(sourceToEdit.description);
      setImageUrl(sourceToEdit.imageUrl || '');
      setTagsInput((sourceToEdit.tags || []).join(', '));
      setPortalHub(sourceToEdit.portalHub || '');
      setIsActive(sourceToEdit.isActive);
    } else {
      setName('');
      setUrl('');
      setRssUrl('');
      setChannel('presse');
      setPoliticalLeaning('independant_non_aligne');
      setScope('national');
      setCategory('presse_independante');
      setDescription('');
      setImageUrl('');
      setTagsInput('');
      setPortalHub('Presse Indépendante');
      setIsActive(true);
    }
    setError(null);
  }, [sourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Veuillez renseigner le nom de la source.');
      return;
    }
    if (!url.trim()) {
      setError("Veuillez renseigner l'URL de la source ou du portail.");
      return;
    }

    // Auto prepend https:// if missing
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    let cleanRss = rssUrl.trim();
    if (cleanRss && !/^https?:\/\//i.test(cleanRss)) {
      cleanRss = `https://${cleanRss}`;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const savedSource: WatchSource = {
      id: sourceToEdit?.id || `source-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      url: cleanUrl,
      rssUrl: cleanRss || undefined,
      channel,
      politicalLeaning,
      scope,
      category,
      description: description.trim() || `Source de veille d'information indépendante pour ${scope === 'local' ? 'Charleroi' : 'la Belgique'}.`,
      imageUrl: imageUrl.trim() || undefined,
      isActive,
      isCustom: sourceToEdit ? sourceToEdit.isCustom : true,
      tags: tags.length > 0 ? tags : [name.trim(), category],
      portalHub: portalHub.trim() || undefined,
    };

    onSave(savedSource);
    onClose();
  };

  const handleSuggestRss = () => {
    if (!url) return;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (parsed.hostname.includes('youtube.com')) {
        setChannel('youtube');
        setCategory('chaine_youtube');
      } else if (parsed.hostname.includes('basta.media')) {
        setRssUrl('https://portail.basta.media/spip.php?page=backend');
      } else if (parsed.hostname.includes('spip') || parsed.pathname.includes('spip')) {
        setRssUrl(`${parsed.origin}/spip.php?page=backend`);
      } else {
        setRssUrl(`${parsed.origin}/feed/`);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 animate-scale-in my-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {sourceToEdit ? 'Modifier la source de veille' : 'Ajouter une source de veille'}
              </h3>
              <p className="text-xs text-slate-500">
                Surveillance de chaînes YouTube, revues, blogs d'enquêtes ou pages citoyennes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Source Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nom de la source ou du média *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Blast, Mediapart, Still Pissing, Clément Viktorovitch..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Channel (Presse vs YouTube vs Réseaux Sociaux) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canal de diffusion *
              </label>
              <select
                value={channel}
                onChange={(e) => {
                  const ch = e.target.value as SourceChannel;
                  setChannel(ch);
                  if (ch === 'youtube') setCategory('chaine_youtube');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="presse">📰 Article de Presse / Revue</option>
                <option value="youtube">▶️ Chaîne YouTube / Vidéo</option>
                <option value="reseaux_sociaux">📱 Réseaux Sociaux / Page citoyenne</option>
                <option value="rapport_officiel">⚖️ Vigie officielle & CADA</option>
              </select>
            </div>

            {/* Political Leaning (Supposed) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Orientation politique supposée *</span>
              </label>
              <select
                value={politicalLeaning}
                onChange={(e) => setPoliticalLeaning(e.target.value as PoliticalLeaning)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="gauche_radicale">🟣 Gauche radicale (critique structurelle)</option>
                <option value="gauche">🔴 Plutôt de gauche (social & citoyen)</option>
                <option value="centre">🟡 Du centre (modéré / pluraliste)</option>
                <option value="droite">🔵 De droite (libérale ou conservatrice)</option>
                <option value="extreme_droite">⚫ Extrême droite (nationaliste)</option>
                <option value="independant_non_aligne">🟢 Indépendant / Non aligné / Vigie</option>
              </select>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Principale (Site web, YouTube, Facebook) *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={handleSuggestRss}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>URL Flux RSS / Atom (Optionnel)</span>
                {url && (
                  <button
                    type="button"
                    onClick={handleSuggestRss}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    Détecter RSS
                  </button>
                )}
              </label>
              <input
                type="text"
                value={rssUrl}
                onChange={(e) => setRssUrl(e.target.value)}
                placeholder="https://.../feed/ ou /rss"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Image URL preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>URL de l'aperçu en image / bannière (Optionnel)</span>
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... ou logo du média"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Scope & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Échelle géographique
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as TopicScope)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="local">📍 Charleroi / Local</option>
                <option value="national">🇧🇪 Belgique / Fédéral / Wallonie</option>
                <option value="international">🌍 International / Europe / Monde</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie thématique
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SourceCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="investigation">🔍 Investigation & Enquêtes</option>
                <option value="chaine_youtube">▶️ Chaîne YouTube / Vidéos</option>
                <option value="transparence">⚖️ Transparence Publique & CADA</option>
                <option value="presse_independante">📰 Presse Indépendante</option>
                <option value="citoyen_local">🗣️ Média Citoyen & Réseau</option>
                <option value="analyse_critique">🧠 Auto-Défense Intellectuelle</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description de la ligne éditoriale ou du collectif
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez les thèmes suivis : enquêtes corruption, recours CADA, rhétorique politique, riverains carolos..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mots-clés / Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="corruption, CADA, charleroi, sophismes, multinationales"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveSource"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isActiveSource" className="text-xs font-medium text-slate-700 cursor-pointer">
              Activer cette source immédiatement dans les scans périodiques et le flux direct
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition"
            >
              {sourceToEdit ? 'Enregistrer les modifications' : 'Ajouter la source'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
