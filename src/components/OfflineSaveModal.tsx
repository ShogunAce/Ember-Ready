import React, { useState } from 'react';
import { AuditReport } from '../types/wildfire';
import { Bookmark, Download, Copy, Check, X, Shield, HardDrive, WifiOff } from 'lucide-react';

interface OfflineSaveModalProps {
  auditReport: AuditReport;
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSaveModal: React.FC<OfflineSaveModalProps> = ({
  auditReport,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(auditReport.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(auditReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ember-ready-audit-${auditReport.hazardProfile.location.zipCode}-${auditReport.id}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2B2824]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#615B52] hover:text-[#2B2824] p-1 rounded"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#6B7F5E] font-semibold mb-2">
          <HardDrive className="w-4 h-4" />
          <span>Local Persistence & Offline Cache</span>
        </div>

        <h3 className="font-serif-field text-xl font-bold text-[#2B2824] mb-2">
          Saved for Offline Access
        </h3>

        <p className="text-xs text-[#615B52] mb-4 leading-relaxed">
          This audit report has been permanently cached in your browser’s local storage and synced with the Ember Ready server. You can view it during power outages or cellular tower failures without active internet access.
        </p>

        {/* Audit ID Stamp */}
        <div className="p-3 bg-[#EAE1D1]/60 border border-[#C9BEAB] rounded mb-4">
          <div className="text-[10px] font-mono-data text-[#615B52] uppercase mb-1">
            Permanent Field Audit ID
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono-data font-bold text-sm text-[#2B2824]">
              {auditReport.id}
            </span>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs text-[#B5542C] hover:text-[#8F3E1D] font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#6B7F5E]" />
                  <span className="text-[#6B7F5E]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Details Summary */}
        <div className="space-y-2 text-xs text-[#2B2824] mb-5 border-t border-b border-[#D8CEBD] py-3">
          <div className="flex justify-between">
            <span className="text-[#615B52]">Property:</span>
            <span className="font-medium truncate max-w-[220px]">
              {auditReport.hazardProfile.location.address}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#615B52]">Resilience Score:</span>
            <span className="font-mono-data font-bold text-[#B5542C]">
              {auditReport.hardeningScore.overallScore} / 100 ({auditReport.hardeningScore.ratingTier})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#615B52]">Action Items Pending:</span>
            <span className="font-mono-data font-semibold">
              {auditReport.actionItems.filter((i) => !i.completed).length} items
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#615B52]">Date Audited:</span>
            <span className="font-mono-data">
              {new Date(auditReport.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDownloadJson}
            className="w-full py-2.5 px-4 bg-[#B5542C] hover:bg-[#8F3E1D] text-[#F2EBDD] font-medium text-xs rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Field Report Backup (.JSON)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-[#FAF6EF] hover:bg-[#EAE1D1] text-[#2B2824] font-medium text-xs rounded border border-[#D8CEBD] transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
