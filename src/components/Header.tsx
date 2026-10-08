import React from 'react';
import {
  Radio,
  RefreshCw,
  FileText,
  Globe,
} from 'lucide-react';
import headerBg from '../assets/images/header_global_network_1791464618050.jpg';

interface HeaderProps {
  isScanning: boolean;
  onTriggerScan: () => void;
  onOpenReportModal: () => void;
  onOpenSourcesModal?: () => void;
  activeSourcesCount?: number;
  scanCountdown: number;
  totalAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isScanning,
  onTriggerScan,
  onOpenReportModal,
  onOpenSourcesModal,
  activeSourcesCount = 0,
  scanCountdown,
  totalAlertsCount,
}) => {
  const formatScanTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m} min ${s > 0 ? `${s}s` : ''}`;
    return `${s}s`;
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-700/80 text-white shadow-lg relative overflow-hidden bg-slate-950">
      {/* Background Image: Global Orbital Network with crystal clear visibility */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: `url(${headerBg})`,
        }}
      />
      {/* Ultra-soft, subtle gradient overlay so the globe and network lines shine through brilliantly */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-transparent to-slate-950/25 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 relative backdrop-blur-xs">
              <Radio className="w-5 h-5 text-white drop-shadow" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  VeillePulse
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-200 border border-blue-400/50 backdrop-blur-md shadow-xs">
                  Radar Pluraliste
                </span>
              </div>
              <p className="text-xs text-slate-200 flex items-center gap-1.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></span>
                <span>Scan auto (1h)</span>
                <span>&bull;</span>
                <span>Prochain scan : <strong className="font-mono text-emerald-300">{formatScanTimer(scanCountdown)}</strong></span>
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2">
            {onOpenSourcesModal && (
              <button
                onClick={onOpenSourcesModal}
                title="Consulter et gérer toutes les sources de veille"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-950/70 hover:bg-slate-900/90 text-slate-100 border border-slate-600/70 transition backdrop-blur-md shadow-md"
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Sources ({activeSourcesCount})</span>
              </button>
            )}

            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              title="Lancer un scan immédiat sur tous les sujets actifs"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border border-blue-400/40 transition disabled:opacity-50 backdrop-blur-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-white' : ''}`} />
              <span>{isScanning ? 'Scan en cours...' : 'Scanner'}</span>
            </button>

            <button
              onClick={onOpenReportModal}
              title="Générer une synthèse exécutive de tous vos sujets"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-950/70 hover:bg-slate-900/90 text-slate-100 border border-slate-600/70 transition backdrop-blur-md shadow-md"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Briefing</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
