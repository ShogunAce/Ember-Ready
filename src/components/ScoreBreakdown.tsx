import React, { useState } from 'react';
import { HardeningScore, ZoneCategory, ZoneScore } from '../types/wildfire';
import { Shield, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Scale, Info } from 'lucide-react';

interface ScoreBreakdownProps {
  score: HardeningScore;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ score }) => {
  // Track open state for each of the 5 zone cards independently
  const [expandedZones, setExpandedZones] = useState<Record<ZoneCategory, boolean>>({
    zone0: false,
    zone1: false,
    zone2: false,
    home_hardening: false,
    egress: false,
  });

  const toggleZone = (z: ZoneCategory) => {
    setExpandedZones((prev) => ({
      ...prev,
      [z]: !prev[z],
    }));
  };

  const zonesList = Object.values(score.zones);

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8CEBD] pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Audit Diagnostic · CAL FIRE Chapter 7A Standard</span>
          </div>
          <h2 className="font-serif-field text-xl sm:text-2xl font-bold text-[#2B2824]">
            Household Hardening Resilience Score
          </h2>
          <p className="text-xs text-[#615B52] mt-0.5">
            Transparent scoring based on California Public Resources Code § 4291 and AB 3074.
          </p>
        </div>

        {/* Big Overall Score Stamp */}
        <div className="flex items-center gap-3 bg-[#EAE1D1]/60 border border-[#C9BEAB] rounded-lg px-4 py-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#615B52] block">
              Overall Resilience
            </span>
            <span
              className="font-serif-field font-bold text-sm block"
              style={{ color: score.ratingColor }}
            >
              {score.ratingTier}
            </span>
          </div>

          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-mono-data text-2xl font-bold shadow-inner"
            style={{
              backgroundColor: `${score.ratingColor}15`,
              color: score.ratingColor,
              border: `2px solid ${score.ratingColor}`,
            }}
          >
            {score.overallScore}
          </div>
        </div>
      </div>

      {/* Explanatory summary text */}
      <div className="text-xs text-[#2B2824] leading-relaxed mb-6 bg-[#FFFFFF] p-3 rounded border border-[#D8CEBD]">
        <strong className="text-[#8F3E1D]">Auditor Assessment: </strong>
        {score.ratingDescription}
      </div>

      {/* Zone-by-Zone Cards Grid with INLINE Expandables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        {zonesList.map((z) => {
          const isExpanded = !!expandedZones[z.zone];
          const deductions = z.deductions || [];
          const hasDeductions = deductions.length > 0;

          return (
            <div
              key={z.zone}
              className={`bg-[#FFFFFF] border rounded-md transition-all flex flex-col justify-between ${
                isExpanded ? 'border-[#B5542C] shadow-xs' : 'border-[#D8CEBD] hover:border-[#C9BEAB]'
              }`}
            >
              {/* Card Summary Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-serif-field font-bold text-base text-[#2B2824]">
                    {z.name.split(':')[0]}
                  </h4>
                  <span
                    className="font-mono-data text-sm font-bold"
                    style={{ color: z.statusColor }}
                  >
                    {z.score}/100
                  </span>
                </div>

                <div className="text-[11px] text-[#615B52] mb-2 font-mono-data">
                  {z.distanceRange}
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#EAE1D1] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${z.score}%`,
                      backgroundColor: z.statusColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="font-medium" style={{ color: z.statusColor }}>
                    {z.status}
                  </span>
                  <span className="text-[#615B52]">
                    {hasDeductions
                      ? `${deductions.length} score deduction${deductions.length > 1 ? 's' : ''}`
                      : 'Full compliance'}
                  </span>
                </div>

                {/* Expand / Collapse Button */}
                <button
                  type="button"
                  onClick={() => toggleZone(z.zone)}
                  className={`w-full py-1.5 px-2 rounded border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isExpanded
                      ? 'bg-[#EAE1D1] text-[#2B2824] border-[#B5542C]/50'
                      : 'bg-[#FAF6EF] hover:bg-[#EAE1D1] text-[#615B52] hover:text-[#2B2824] border-[#D8CEBD]'
                  }`}
                >
                  <span>{isExpanded ? 'Hide Score Rationale' : 'Why this score?'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* INLINE EXPANDED REASONING PANEL */}
              {isExpanded && (
                <div className="border-t border-[#D8CEBD] bg-[#FAF6EF] p-4 text-xs animate-in fade-in">
                  <div className="mb-2">
                    <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold block">
                      Zone Scoring Rationale
                    </span>
                    <p className="text-[11px] text-[#615B52] mt-0.5">
                      {z.subtitle}
                    </p>
                  </div>

                  {/* List of specific factors that lowered this zone's score */}
                  {hasDeductions ? (
                    <div className="space-y-2 mt-3">
                      <div className="text-[11px] font-semibold text-[#8F3E1D] flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-[#C23B22]" />
                        <span>Factors that reduced this zone’s score:</span>
                      </div>

                      {deductions.map((d, dIdx) => (
                        <div
                          key={dIdx}
                          className="p-2.5 bg-[#FFFFFF] rounded border border-[#D8CEBD] text-[11px]"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-bold text-[#2B2824]">
                              • {d.factor}
                            </span>
                            <span className="font-mono-data text-[#C23B22] font-semibold shrink-0 text-[10px] bg-[#FBEBE8] px-1.5 py-0.5 rounded">
                              -{d.pointsLost} pts
                            </span>
                          </div>

                          <div className="text-[#615B52] mb-1">
                            Surveyed Answer: <span className="text-[#2B2824] font-medium">"{d.selectedLabel}"</span>
                          </div>

                          <div className="text-[#8F3E1D] font-mono-data text-[10px] mb-1 flex items-center gap-1">
                            <Scale className="w-3 h-3 text-[#B5542C]" />
                            <span>Standard: {d.codeCitation}</span>
                          </div>

                          {d.explanation && (
                            <p className="text-[10px] text-[#2B2824] italic bg-[#FAF6EF] p-1.5 rounded border border-[#EAE1D1]">
                              {d.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-[#EAEFE6] text-[#4F5E45] rounded border border-[#6B7F5E]/40 mt-2">
                      <div className="font-semibold flex items-center gap-1.5 text-xs text-[#6B7F5E]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>All CAL FIRE PRC § 4291 Standards Met</span>
                      </div>
                      <p className="text-[11px] mt-1 text-[#4F5E45]">
                        No deductions were applied to this zone. All surveyed home hardening criteria meet statutory recommendations.
                      </p>
                    </div>
                  )}

                  {/* All questions in this zone */}
                  {z.rationales && z.rationales.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#D8CEBD]/70 text-[10px] text-[#615B52]">
                      <span className="font-mono-data uppercase tracking-wider block mb-1">
                        Criteria Evaluated ({z.rationales.length}):
                      </span>
                      <ul className="space-y-1">
                        {z.rationales.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-center justify-between text-[#2B2824]">
                            <span className="flex items-center gap-1">
                              {r.compliant ? (
                                <CheckCircle2 className="w-3 h-3 text-[#6B7F5E]" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-[#B5542C]" />
                              )}
                              <span>{r.questionTitle}</span>
                            </span>
                            <span className="font-mono-data text-[10px] text-[#615B52]">
                              {r.pointsEarned}/100 pts
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
