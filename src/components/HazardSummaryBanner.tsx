import React from 'react';
import { HazardProfile } from '../types/wildfire';
import { ShieldAlert, Mountain, MapPin, Scale, Info, CheckCircle2 } from 'lucide-react';

interface HazardSummaryBannerProps {
  hazardProfile: HazardProfile;
}

export const HazardSummaryBanner: React.FC<HazardSummaryBannerProps> = ({ hazardProfile }) => {
  const { location, fhsz, femaNri } = hazardProfile;

  const isVeryHigh = fhsz.tier === 'Very High';
  const isHigh = fhsz.tier === 'High';
  const isNoDesignation = fhsz.tier === 'No FHSZ Designation';

  const headingText = isNoDesignation
    ? 'No Fire Hazard Severity Zone (LRA)'
    : `${fhsz.tier} Fire Hazard Severity Zone`;

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-6 shadow-xs relative overflow-hidden">
      {/* Top Survey Coordinates Strip */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#D8CEBD] pb-3 mb-4 text-xs font-mono-data text-[#615B52]">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-[#B5542C]" />
          <span className="font-semibold text-[#2B2824]">{location.address}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>
            LAT {location.lat.toFixed(4)}° N · LON {Math.abs(location.lon).toFixed(4)}° W
          </span>
          <span aria-hidden="true" className="text-[#C9BEAB]">|</span>
          <span className="flex items-center gap-1">
            <Mountain className="w-3 h-3 text-[#6B7F5E]" />
            <span>ELEV ~{location.elevationFt ?? 450} FT</span>
          </span>
        </div>
      </div>

      {/* Main Grid: CAL FIRE FHSZ + FEMA NRI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        {/* Box 1: CAL FIRE FHSZ */}
        <div className="bg-[#EAE1D1]/50 border border-[#D8CEBD] rounded-md p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
                CAL FIRE Hazard Classification
              </span>
              <h3 className="font-serif-field text-xl font-bold text-[#2B2824] flex items-center gap-2 mt-0.5">
                <span
                  className={
                    isVeryHigh
                      ? 'text-[#C23B22]'
                      : isHigh
                      ? 'text-[#B5542C]'
                      : 'text-[#6B7F5E]'
                  }
                >
                  {headingText}
                </span>
              </h3>
            </div>
            <span className="font-mono-data text-xs px-2 py-0.5 bg-[#FAF6EF] border border-[#C9BEAB] rounded text-[#2B2824]">
              {fhsz.responsibilityArea}
            </span>
          </div>

          <p className="text-xs text-[#2B2824] leading-relaxed mb-3">
            {fhsz.description}
          </p>

          <div className="text-[11px] text-[#615B52] border-t border-[#D8CEBD] pt-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#B5542C]" />
              <span>Mandate: {fhsz.calFireCode}</span>
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${
                fhsz.isMandatoryZone0 ? 'text-[#6B7F5E]' : 'text-[#615B52]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>
                {fhsz.isMandatoryZone0 ? 'AB 3074 Zone 0 Enacted' : 'Gov Code § 51178 (Unzoned LRA)'}
              </span>
            </span>
          </div>
        </div>

        {/* Box 2: FEMA NRI Risk Index */}
        <div className="bg-[#EAE1D1]/50 border border-[#D8CEBD] rounded-md p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
                FEMA National Risk Index (NRI)
              </span>
              <h3 className="font-serif-field text-xl font-bold text-[#2B2824] mt-0.5">
                <span className="font-mono-data text-[#B5542C]">
                  {femaNri.wildfireRiskPercentile.toFixed(1)}th
                </span>{' '}
                Percentile Wildfire Risk
              </h3>
            </div>
            <span className="font-mono-data text-xs px-2 py-0.5 bg-[#FAF6EF] border border-[#C9BEAB] rounded text-[#2B2824]">
              {femaNri.countyName}
            </span>
          </div>

          <p className="text-xs text-[#2B2824] leading-relaxed mb-3">
            Ranked higher in wildfire exposure than{' '}
            <strong className="text-[#B5542C] font-semibold">{femaNri.wildfireRiskPercentile.toFixed(1)}%</strong> of
            communities nationwide. Expected Annual Loss (EAL):{' '}
            <span className="font-mono-data font-semibold">
              ${(femaNri.wildfireExpectedAnnualLossDollars / 1000000).toFixed(1)}M / year
            </span>.
          </p>

          <div className="text-[11px] text-[#615B52] border-t border-[#D8CEBD] pt-2 flex items-center justify-between">
            <span>
              Community Resilience: <strong className="text-[#2B2824]">{femaNri.communityResilienceRating}</strong> ({femaNri.communityResilienceScore}/100)
            </span>
            <span>
              Social Vulnerability: <strong className="text-[#2B2824]">{femaNri.socialVulnerabilityRating}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Plain Language Synthesis Callout */}
      <div className="bg-[#FAF6EF] border-l-3 border-[#B5542C] p-3 text-xs text-[#2B2824] leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#B5542C] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#8F3E1D] mr-1">Auditor Field Assessment:</span>
          {isNoDesignation ? (
            <>
              Per California Government Code section 51178, the State Fire Marshal has not designated this LRA parcel within a formal Fire Hazard Severity Zone. However, defensible space best practices and structural ember hardening (such as 1/8-inch metal vent mesh and gutter ember guards) are strongly recommended across California, as wind-borne embers from regional fires can travel over a mile into unzoned neighborhoods.
            </>
          ) : (
            <>
              Under California law (PRC § 4291 and AB 3074), homes in this hazard tier require strict compliance with 100 feet of defensible space and a mandatory 5-foot non-combustible ember-resistant perimeter (Zone 0). Over 90% of home losses in California WUI fires are caused by wind-blown embers igniting vulnerable vents, roofs, or foundation mulch.
            </>
          )}
        </div>
      </div>
    </div>
  );
};
