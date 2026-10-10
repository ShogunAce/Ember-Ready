import React from 'react';
import { Compass, ShieldCheck, Database, Printer, Bookmark, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onOpenSaved: () => void;
  onOpenDataSources: () => void;
  onResetAudit: () => void;
  hasActiveAudit: boolean;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSaved,
  onOpenDataSources,
  onResetAudit,
  hasActiveAudit,
  onPrint,
}) => {
  return (
    <header className="border-b border-[#D8CEBD] bg-[#FAF6EF]/90 backdrop-blur sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#B5542C] flex items-center justify-center text-[#F2EBDD] shadow-sm">
            <Compass className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-field font-bold text-xl sm:text-2xl tracking-tight text-[#2B2824]">
                Ember Ready
              </span>
              <span className="hidden sm:inline-block font-mono-data text-[10px] uppercase tracking-wider text-[#615B52] bg-[#EAE1D1] px-1.5 py-0.5 rounded">
                CA PRC § 4291 ALIGNED
              </span>
            </div>
            <p className="text-xs text-[#615B52] hidden sm:block">
              California Household Wildfire Resilience & Hardening Audit
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveAudit && (
            <button
              onClick={onPrint}
              title="Print field report for go-bag or fridge"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2B2824] bg-[#EAE1D1] hover:bg-[#D8CEBD] rounded border border-[#C9BEAB] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#B5542C]" />
              <span className="hidden sm:inline">Print Field Report</span>
            </button>
          )}

          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2B2824] bg-[#FAF6EF] hover:bg-[#EAE1D1] rounded border border-[#D8CEBD] transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#6B7F5E]" />
            <span>Saved Audits</span>
          </button>

          <button
            onClick={onOpenDataSources}
            title="Inspect live government data sources"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#615B52] hover:text-[#2B2824] hover:bg-[#EAE1D1] rounded border border-transparent hover:border-[#D8CEBD] transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-[#B5542C]" />
            <span className="hidden md:inline">Data Feeds</span>
          </button>

          {hasActiveAudit && (
            <button
              onClick={onResetAudit}
              title="Audit a different California address"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#615B52] hover:text-[#B5542C] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Audit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
