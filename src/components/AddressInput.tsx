import React, { useState } from 'react';
import { Search, MapPin, Compass, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { CALIFORNIA_SAMPLE_LOCATIONS, SampleLocation } from '../data/californiaData';

interface AddressInputProps {
  onSearch: (addressQuery: string) => void;
  isLoading: boolean;
  statusMessage?: string;
  errorMessage?: string;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  onSearch,
  isLoading,
  statusMessage,
  errorMessage,
}) => {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address.trim());
    }
  };

  const handleSelectSample = (sample: SampleLocation) => {
    setAddress(sample.location.address);
    onSearch(sample.location.address);
  };

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-7 shadow-xs">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Step 1 · Location Geocoding & Hazard Baseline</span>
          </div>
          <h2 className="font-serif-field text-xl sm:text-2xl font-bold text-[#2B2824]">
            Enter California Property Address
          </h2>
          <p className="text-sm text-[#615B52] mt-1 max-w-2xl">
            We pull real CAL FIRE Fire Hazard Severity Zone (FHSZ) data, FEMA National Risk Index scores,
            National Weather Service Red Flag warnings, and active satellite fire detections.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="survey-stamp inline-block text-[10px] font-mono-data text-[#8F3E1D] px-2 py-1 bg-[#EAE1D1]/60 rounded">
            STATE OF CALIFORNIA · WUI ZONE
          </span>
        </div>
      </div>

      {/* Address Form */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F3E1D]" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 5500 Clark Rd, Paradise, CA or 26 Corte Madera Ave, Mill Valley, CA"
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3 bg-[#FFFFFF] border border-[#D8CEBD] focus:border-[#B5542C] focus:ring-1 focus:ring-[#B5542C] rounded-md text-sm text-[#2B2824] placeholder-[#8C8476] outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !address.trim()}
            className="px-6 py-3 bg-[#B5542C] hover:bg-[#8F3E1D] disabled:opacity-50 disabled:cursor-not-allowed text-[#F2EBDD] font-medium text-sm rounded-md flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Location...</span>
              </>
            ) : (
              <>
                <span>Begin Audit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Loading state details */}
      {isLoading && (
        <div className="mb-4 p-3 bg-[#EAE1D1]/70 border border-[#C9BEAB] rounded flex items-center gap-2 text-xs font-mono-data text-[#2B2824]">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B5542C]" />
          <span>{statusMessage || 'Retrieving real-time government wildfire feeds...'}</span>
        </div>
      )}

      {/* Error state */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-[#FBEBE8] border border-[#C23B22]/30 rounded flex items-start gap-2.5 text-xs text-[#2B2824]">
          <AlertCircle className="w-4 h-4 text-[#C23B22] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#C23B22] block mb-0.5">Location Notice</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Sample California WUI Locations */}
      <div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#615B52] mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[#B5542C]" />
          <span>Or test with benchmark California Wildland-Urban Interface (WUI) communities:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {CALIFORNIA_SAMPLE_LOCATIONS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={isLoading}
              className="text-left p-2.5 rounded bg-[#FAF6EF] hover:bg-[#EAE1D1] border border-[#D8CEBD] hover:border-[#B5542C] transition-all group cursor-pointer"
            >
              <div className="font-medium text-xs text-[#2B2824] group-hover:text-[#B5542C] flex items-center justify-between">
                <span>{sample.label}</span>
                <span className="text-[10px] font-mono-data text-[#8F3E1D] opacity-80">
                  {sample.responsibilityArea}
                </span>
              </div>
              <p className="text-[10px] text-[#615B52] line-clamp-1 mt-0.5">
                {sample.sublabel}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
