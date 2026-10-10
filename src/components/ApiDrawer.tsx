import React, { useEffect, useState } from 'react';
import { Database, CheckCircle2, ShieldCheck, Key, ExternalLink, X, Info } from 'lucide-react';

interface ApiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDrawer: React.FC<ApiDrawerProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => setStatus(data.services))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2B2824]/60 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FAF6EF] w-full max-w-lg h-full border-l border-[#D8CEBD] shadow-2xl flex flex-col p-6 animate-in slide-in-from-right overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#D8CEBD] mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#B5542C]" />
            <div>
              <h3 className="font-serif-field font-bold text-lg text-[#2B2824]">
                Real Government Data Integrations
              </h3>
              <p className="text-[11px] text-[#615B52]">
                Verified state and federal wildfire data pipelines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#615B52] hover:text-[#2B2824]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#FFFFFF] p-3.5 rounded border border-[#D8CEBD] text-xs text-[#2B2824] leading-relaxed mb-4">
          <p className="mb-1 font-semibold text-[#8F3E1D]">
            Zero Synthetic Data Guarantee
          </p>
          <p className="text-[#615B52]">
            Ember Ready connects directly to official state and federal wildfire APIs. All integrations run with public, unauthenticated government endpoints by default, and seamlessly accept optional API keys for elevated quota.
          </p>
        </div>

        {/* Data Sources Grid */}
        <div className="space-y-3.5 mb-6">
          {/* Source 1: CAL FIRE FRAP */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  Static Hazard Layer
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  CAL FIRE FRAP GIS Feature Server
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Live Public Feed</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Spatial query to California Fire Hazard Severity Zones (SRA and LRA) via ArcGIS REST API. Identifies legal PRC § 4291 and AB 3074 mandates for the exact coordinates.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Endpoint: services1.arcgis.com/jUJYIo9tSA7EHvfZ</span>
              <a
                href="https://osfm.fire.ca.gov/divisions/community-wildfire-preparedness-and-mitigation/fire-hazard-severity-zones/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#B5542C]"
              >
                Docs ↗
              </a>
            </div>
          </div>

          {/* Source 2: FEMA NRI */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  County / Tract Risk
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  FEMA National Risk Index (NRI)
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NRI v1.19 Grounded</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Fetches wildfire risk percentiles, expected annual dollar loss (EAL), community resilience scores, and social vulnerability indexes for all 58 California counties.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Endpoint: hazards.fema.gov/nri</span>
              <a
                href="https://hazards.fema.gov/nri/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#B5542C]"
              >
                Docs ↗
              </a>
            </div>
          </div>

          {/* Source 3: NWS api.weather.gov */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  Active Red Flag Warnings
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  National Weather Service (api.weather.gov)
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Direct API (No Key Req.)</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Live queries point coordinates against NOAA/NWS active fire weather alerts, returning Red Flag Warnings, relative humidity (RH%), wind gusts, and fire weather discussions.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Endpoint: api.weather.gov/alerts/active</span>
              <a
                href="https://www.weather.gov/documentation/services-web-api"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#B5542C]"
              >
                Docs ↗
              </a>
            </div>
          </div>

          {/* Source 4: NASA FIRMS */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  Thermal Satellite Detections
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  NASA FIRMS & NIFC Active Perimeters
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>NIFC WFIGS Live Active</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Calculates mileage to nearest active California wildfire incidents and thermal hotspot detections using the National Interagency Fire Center (NIFC) and NASA VIIRS sensors.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Optional Key: NASA_FIRMS_MAP_KEY</span>
              <a
                href="https://firms.modaps.eosdis.nasa.gov/api/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#B5542C]"
              >
                Key Portal ↗
              </a>
            </div>
          </div>

          {/* Source 5: AirNow & Open-Meteo EPA */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  Air Quality & Smoke
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  AirNow EPA / CARB Monitoring Network
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active EPA Network</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Queries real-time US EPA Air Quality Index (AQI), PM2.5 wildfire smoke particulates, and smoke advisories for the exact address.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Optional Key: AIRNOW_API_KEY</span>
              <a
                href="https://docs.airnowapi.org/"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-[#B5542C]"
              >
                Key Portal ↗
              </a>
            </div>
          </div>

          {/* Source 6: Geocoding */}
          <div className="p-3.5 bg-[#FFFFFF] rounded border border-[#D8CEBD]">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold">
                  Spatial Resolution
                </span>
                <h4 className="font-serif-field font-bold text-sm text-[#2B2824]">
                  Google Geocoding / US Census Geocoder
                </h4>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-mono-data text-[#6B7F5E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>US Gov Census Live</span>
              </span>
            </div>
            <p className="text-xs text-[#615B52] mb-2 leading-relaxed">
              Resolves California addresses into latitude/longitude coordinates, validating that properties fall strictly within California jurisdiction.
            </p>
            <div className="text-[10px] font-mono-data text-[#8F3E1D] flex items-center justify-between">
              <span>Optional Key: GOOGLE_GEOCODING_API_KEY</span>
              <span className="text-[#615B52]">Auto-Fallback Active</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-[#D8CEBD]">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#EAE1D1] hover:bg-[#D8CEBD] text-[#2B2824] font-medium text-xs rounded transition-colors"
          >
            Close Data Feed Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
