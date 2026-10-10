import React from 'react';
import { AuditReport } from '../types/wildfire';

interface PrintViewProps {
  auditReport: AuditReport;
}

export const PrintView: React.FC<PrintViewProps> = ({ auditReport }) => {
  const { hazardProfile, hardeningScore, actionItems } = auditReport;
  const { location, fhsz, femaNri } = hazardProfile;

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto">
      {/* Field Survey Document Header */}
      <div className="print-header border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-widest font-mono text-gray-700 font-bold mb-1">
              STATE OF CALIFORNIA · WUI FIELD RESILIENCE AUDIT
            </div>
            <h1 className="text-2xl font-serif font-bold text-black tracking-tight">
              EMBER READY RESIDENCE AUDIT
            </h1>
            <p className="text-xs text-gray-800 mt-0.5">
              California Public Resources Code § 4291 & Assembly Bill 3074 Verification
            </p>
          </div>

          <div className="text-right border border-black p-2 rounded text-[11px] font-mono">
            <div>AUDIT ID: <strong>{auditReport.id}</strong></div>
            <div>DATE: {new Date(auditReport.createdAt).toLocaleDateString()}</div>
            <div>JURISDICTION: {fhsz.responsibilityArea} ({location.county})</div>
          </div>
        </div>

        {/* Property Coordinates Strip */}
        <div className="mt-4 pt-2 border-t border-gray-400 grid grid-cols-4 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-gray-600 block text-[9px]">PROPERTY</span>
            <strong>{location.address}</strong>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px]">COORDINATES</span>
            <span>{location.lat.toFixed(4)}° N, {Math.abs(location.lon).toFixed(4)}° W</span>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px]">CAL FIRE FHSZ TIER</span>
            <strong className="text-black">{fhsz.tier.toUpperCase()}</strong>
          </div>
          <div>
            <span className="text-gray-600 block text-[9px]">FEMA NRI RISK RANK</span>
            <strong>{femaNri.wildfireRiskPercentile.toFixed(1)}th Percentile</strong>
          </div>
        </div>
      </div>

      {/* Resilience Score Matrix */}
      <div className="print-avoid-break mb-6 border border-black p-4 rounded">
        <div className="flex justify-between items-center mb-3 border-b border-gray-300 pb-2">
          <div>
            <h2 className="text-base font-serif font-bold">Hardening Resilience Scorecard</h2>
            <p className="text-[10px] text-gray-700">Calculated under CAL FIRE defensible space weighting.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-bold">{hardeningScore.overallScore}/100</span>
            <span className="text-xs font-semibold block uppercase">({hardeningScore.ratingTier})</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {Object.values(hardeningScore.zones).map((z) => (
            <div key={z.zone} className="border border-gray-300 p-2 rounded">
              <div className="text-[10px] font-mono text-gray-600">{z.distanceRange}</div>
              <div className="font-bold text-sm font-mono mt-0.5">{z.score}/100</div>
              <div className="text-[9px] uppercase font-semibold mt-0.5 text-gray-800">{z.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan Checklist (Physical Checkboxes for Fridge) */}
      <div className="print-avoid-break mb-6">
        <h2 className="text-base font-serif font-bold mb-1 border-b border-black pb-1">
          Prioritized Field Hardening Checklist
        </h2>
        <p className="text-[11px] text-gray-700 mb-3">
          Check off items as completed to meet CAL FIRE PRC § 4291 and AB 3074 standards:
        </p>

        <div className="space-y-2">
          {actionItems.map((item, index) => (
            <div key={item.id} className="border border-gray-400 p-2.5 rounded text-xs flex items-start gap-2.5">
              <div className="w-4 h-4 border-2 border-black rounded-xs mt-0.5 shrink-0 flex items-center justify-center font-bold text-[10px]">
                {item.completed ? '✓' : ''}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <strong className="text-sm">
                    {index + 1}. {item.title}
                  </strong>
                  <span className="font-mono text-[10px] text-gray-700">
                    {item.priority} · {item.effortCost}
                  </span>
                </div>
                <p className="text-[11px] text-gray-900 mt-0.5 leading-snug">
                  {item.instructions}
                </p>
                <div className="text-[9px] font-mono text-gray-600 mt-1">
                  Mandate: {item.calFireCode} · Cost: {item.estimatedCostRange}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Go-Bag & Evacuation Protocol Protocol for Fridge / Go-Bag */}
      <div className="print-avoid-break border-2 border-black p-4 rounded mb-6">
        <h3 className="font-serif font-bold text-sm uppercase tracking-wider mb-2 border-b border-black pb-1">
          Household Emergency Wildfire Evacuation Protocol
        </h3>
        <div className="grid grid-cols-2 gap-4 text-[11px]">
          <div>
            <h4 className="font-bold uppercase text-[10px] mb-1">Evacuation Go-Bag Checklist (The 6 P's):</h4>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-900">
              <li><strong>People & Pets:</strong> Carrier, leashes, 7 days pet food/water.</li>
              <li><strong>Prescriptions:</strong> Medications, eyeglasses, first aid kit.</li>
              <li><strong>Papers:</strong> Deeds, passports, insurance policies, USB drive.</li>
              <li><strong>Pictures & Memorabilia:</strong> Irreplaceable keepsakes.</li>
              <li><strong>Personal Computers:</strong> Hard drives, laptops, chargers.</li>
              <li><strong>Plastic & Cash:</strong> Emergency cash, credit cards.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase text-[10px] mb-1">Emergency Communications & Radio:</h4>
            <div className="space-y-1 text-gray-900">
              <div><strong>Emergency Dispatch:</strong> Dial 911</div>
              <div><strong>County Emergency Info:</strong> 211 / Genasys Protect</div>
              <div><strong>NOAA Weather Radio:</strong> 162.400 – 162.550 MHz</div>
              <div><strong>Emergency Radio:</strong> KCBS 740 AM / KNX 1070 AM</div>
              <div><strong>Wildfire Tracker:</strong> Watch Duty (watchduty.org)</div>
              <div><strong>CAL FIRE Info Line:</strong> 1-800-468-4408</div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] font-mono text-gray-600 border-t border-gray-400 pt-2">
        EMBER READY · CERTIFIED FIELD AUDIT SUMMARY · KEEP MOUNTED ON REFRIGERATOR OR IN EVACUATION GO-BAG
      </div>
    </div>
  );
};
