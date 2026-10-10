import React, { useState } from 'react';
import { HazardProfile } from '../types/wildfire';
import { Flame, Wind, AlertTriangle, ShieldCheck, CloudFog, ChevronDown, ChevronUp, Radio } from 'lucide-react';

interface LiveConditionsStripProps {
  hazardProfile: HazardProfile;
}

export const LiveConditionsStrip: React.FC<LiveConditionsStripProps> = ({ hazardProfile }) => {
  const { weather, firms, airQuality } = hazardProfile;
  const [showDetectionsModal, setShowDetectionsModal] = useState(false);

  const hasRedFlag = weather.redFlagActive;
  const rhValue = weather.relativeHumidityPct ?? 25;
  const isCriticallyDry = rhValue < 20;

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 border-b border-[#D8CEBD] pb-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-[#B5542C] animate-pulse" />
          <span className="font-serif-field font-semibold text-sm sm:text-base text-[#2B2824]">
            Live Environmental Danger Feeds
          </span>
          <span className="text-[11px] font-mono-data text-[#615B52]">
            (NOAA · NASA FIRMS · EPA)
          </span>
        </div>

        <span className="text-[10px] font-mono-data text-[#615B52] uppercase">
          Live Point Observation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: NWS Red Flag Warning & Weather */}
        <div
          className={`p-3.5 rounded border ${
            hasRedFlag
              ? 'bg-[#FBEBE8] border-[#C23B22]'
              : 'bg-[#EAE1D1]/40 border-[#D8CEBD]'
          }`}
        >
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
              NWS Fire Weather
            </span>
            {hasRedFlag ? (
              <span className="flex items-center gap-1 font-mono-data text-[10px] uppercase font-bold text-[#C23B22] bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#C23B22]/30">
                <AlertTriangle className="w-3 h-3" />
                <span>RED FLAG ACTIVE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 font-mono-data text-[10px] text-[#6B7F5E]">
                <ShieldCheck className="w-3 h-3" />
                <span>NO RED FLAG</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`font-serif-field font-bold text-lg ${
                hasRedFlag ? 'text-[#C23B22]' : 'text-[#2B2824]'
              }`}
            >
              {hasRedFlag ? 'Red Flag Warning In Effect' : 'Standard Fire Weather'}
            </span>
          </div>

          {/* Meteorological Values */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#D8CEBD] text-[11px]">
            <div>
              <span className="text-[#615B52] block text-[10px]">TEMP</span>
              <span className="font-mono-data font-semibold text-[#2B2824]">
                {weather.temperatureF ?? 78}°F
              </span>
            </div>
            <div>
              <span className="text-[#615B52] block text-[10px]">HUMIDITY</span>
              <span
                className={`font-mono-data font-semibold ${
                  isCriticallyDry ? 'text-[#C23B22]' : 'text-[#2B2824]'
                }`}
              >
                {rhValue}% RH
              </span>
            </div>
            <div>
              <span className="text-[#615B52] block text-[10px]">GUSTS</span>
              <span className="font-mono-data font-semibold text-[#2B2824]">
                {weather.windGustMph ?? 15} mph
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: NASA FIRMS Active Thermal Detections */}
        <div className="p-3.5 rounded border bg-[#EAE1D1]/40 border-[#D8CEBD]">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
              Active Fire Detections
            </span>
            <span className="text-[10px] font-mono-data text-[#8F3E1D]">
              NASA VIIRS / NIFC
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-serif-field font-bold text-lg text-[#2B2824] flex items-center gap-1.5">
              <Flame
                className={`w-4 h-4 ${
                  firms.nearestFireMiles !== null && firms.nearestFireMiles < 15
                    ? 'text-[#C23B22]'
                    : 'text-[#B5542C]'
                }`}
              />
              {firms.nearestFireMiles !== null
                ? `${firms.nearestFireMiles} mi`
                : 'No nearby hotspots'}
            </span>
            <span className="text-xs text-[#615B52]">to closest active fire</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#D8CEBD] text-[11px] text-[#615B52]">
            <span>
              Within 25 mi:{' '}
              <strong className="text-[#2B2824] font-mono-data font-semibold">
                {firms.activeDetectionsCount25Miles}
              </strong>
            </span>
            <span>
              Within 50 mi:{' '}
              <strong className="text-[#2B2824] font-mono-data font-semibold">
                {firms.activeDetectionsCount50Miles}
              </strong>
            </span>
            {firms.detections.length > 0 && (
              <button
                onClick={() => setShowDetectionsModal(!showDetectionsModal)}
                className="text-[#B5542C] hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                {showDetectionsModal ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>

        {/* Card 3: AirNow / EPA Smoke & AQI */}
        <div className="p-3.5 rounded border bg-[#EAE1D1]/40 border-[#D8CEBD]">
          <div className="flex items-start justify-between mb-1.5">
            <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
              Air Quality & Smoke
            </span>
            <span className="text-[10px] font-mono-data text-[#615B52]">
              EPA AIRNOW
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="font-serif-field font-bold text-lg flex items-center gap-1.5"
              style={{ color: airQuality.categoryColor }}
            >
              <CloudFog className="w-4 h-4 text-[#615B52]" />
              AQI {airQuality.aqi}
            </span>
            <span className="text-xs font-medium text-[#2B2824]">
              · {airQuality.category}
            </span>
          </div>

          <div className="pt-2 border-t border-[#D8CEBD] text-[11px] text-[#615B52] truncate">
            {airQuality.pm25 ? `PM2.5: ${airQuality.pm25} µg/m³ · ` : ''}
            <span>{airQuality.smokeAdvisory}</span>
          </div>
        </div>
      </div>

      {/* Expanded Active Fire List */}
      {showDetectionsModal && firms.detections.length > 0 && (
        <div className="mt-3 p-3 bg-[#FFFFFF] border border-[#D8CEBD] rounded text-xs">
          <div className="font-semibold text-[#2B2824] mb-2 flex items-center justify-between">
            <span>Nearest Active Wildfire Incidents & Satellite Thermal Signatures:</span>
            <span className="text-[10px] font-mono-data text-[#615B52]">
              Source: {firms.source}
            </span>
          </div>
          <div className="space-y-1.5">
            {firms.detections.map((det) => (
              <div
                key={det.id}
                className="flex items-center justify-between p-1.5 bg-[#FAF6EF] rounded border border-[#EAE1D1] text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#B5542C]" />
                  <span className="font-medium text-[#2B2824]">{det.name || 'Wildfire Thermal Anomaly'}</span>
                  {det.acres && (
                    <span className="text-[#615B52] font-mono-data">({det.acres} acres)</span>
                  )}
                  {det.containmentPct !== undefined && (
                    <span className="text-[#6B7F5E] font-mono-data">[{det.containmentPct}% contained]</span>
                  )}
                </div>
                <div className="font-mono-data text-[#8F3E1D] font-semibold">
                  {det.distanceMiles} miles away
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
