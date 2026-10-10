import React, { useEffect, useState } from 'react';
import { listAllSavedAudits, fetchAuditById } from '../services/apiClient';
import { AuditReport } from '../types/wildfire';
import { X, Bookmark, ExternalLink, Calendar, MapPin, ChevronRight, HardDrive } from 'lucide-react';

interface SavedAuditsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudit: (report: AuditReport) => void;
}

export const SavedAuditsDrawer: React.FC<SavedAuditsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectAudit,
}) => {
  const [audits, setAudits] = useState<
    { id: string; address: string; city: string; score: number; date: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAudits();
    }
  }, [isOpen]);

  const loadAudits = async () => {
    setIsLoading(true);
    const list = await listAllSavedAudits();
    setAudits(list);
    setIsLoading(false);
  };

  const handleSelect = async (id: string) => {
    const report = await fetchAuditById(id);
    if (report) {
      onSelectAudit(report);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2B2824]/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FAF6EF] w-full max-w-md h-full border-l border-[#D8CEBD] shadow-2xl flex flex-col p-6 animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8CEBD] mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#B5542C]" />
            <h3 className="font-serif-field font-bold text-lg text-[#2B2824]">
              Saved Household Audits
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#615B52] hover:text-[#2B2824]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#615B52] mb-4">
          Previously audited properties saved in your offline browser storage and server archive.
        </p>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-[#615B52]">
              Loading saved reports...
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#D8CEBD] rounded p-6">
              <HardDrive className="w-8 h-8 text-[#9E9382] mx-auto mb-2" />
              <div className="text-xs font-semibold text-[#2B2824]">
                No Saved Audits Yet
              </div>
              <p className="text-[11px] text-[#615B52] mt-1">
                Complete an audit for a California property to save it for offline retrieval.
              </p>
            </div>
          ) : (
            audits.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => handleSelect(a.id)}
                className="w-full text-left p-3.5 bg-[#FFFFFF] hover:bg-[#EAE1D1]/60 border border-[#D8CEBD] hover:border-[#B5542C] rounded transition-all group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B2824] group-hover:text-[#B5542C] mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8F3E1D] shrink-0" />
                    <span className="truncate max-w-[220px]">{a.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#615B52] font-mono-data">
                    <span>ID: {a.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-[10px] font-mono-data uppercase block text-[#615B52]">
                      Score
                    </span>
                    <span className="font-mono-data font-bold text-sm text-[#B5542C]">
                      {a.score}/100
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#9E9382] group-hover:text-[#B5542C]" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#D8CEBD] text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#EAE1D1] hover:bg-[#D8CEBD] text-[#2B2824] font-medium text-xs rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
