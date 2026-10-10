import React from 'react';
import { HazardProfile, ResourceLink } from '../types/wildfire';
import { CALIFORNIA_COUNTY_DATABASE, DEFAULT_CALIFORNIA_COUNTY_DATA } from '../data/californiaData';
import { ExternalLink, MapPin, Shield, LifeBuoy, FileText, CheckCircle2 } from 'lucide-react';

interface ResourceLinksProps {
  hazardProfile: HazardProfile;
}

export const ResourceLinks: React.FC<ResourceLinksProps> = ({ hazardProfile }) => {
  const { location } = hazardProfile;
  const countyData = CALIFORNIA_COUNTY_DATABASE[location.county] || DEFAULT_CALIFORNIA_COUNTY_DATA;

  const officialLinks: ResourceLink[] = [
    {
      title: 'CAL FIRE Ready for Wildfire Official Portal',
      category: 'CAL FIRE Inspection',
      url: 'https://www.readyforwildfire.org/',
      description: 'Official California defensible space guidelines, wildfire action plans, and hardening checklists.',
      isOfficialGov: true,
    },
    {
      title: 'Book CAL FIRE Free Defensible Space Inspection',
      category: 'CAL FIRE Inspection',
      url: 'https://www.fire.ca.gov/dspace',
      description: 'Request a free on-site property evaluation from your local CAL FIRE or county fire inspector.',
      isOfficialGov: true,
    },
    {
      title: `${countyData.fireDeptName}`,
      category: 'Local Fire Safe Council',
      url: countyData.fireDeptUrl,
      description: `Official fire jurisdiction serving ${location.county}. Access local burn permits and weed abatement notices.`,
      isOfficialGov: true,
    },
    {
      title: `Evacuation Zone Lookup (${countyData.evacuationSystem})`,
      category: 'Evacuation & Dispatch',
      url: countyData.evacuationUrl,
      description: `Know your zone beforehand. Real-time emergency evacuation alerts and road closure tracking for ${location.county}.`,
      isOfficialGov: true,
    },
    {
      title: 'California Dept of Insurance "Safer from Wildfires"',
      category: 'Insurance & Rebates',
      url: 'https://www.insurance.ca.gov/01-consumers/140-catastrophes/SaferFromWildfires.cfm',
      description: 'Mandatory insurance premium discounts for California homeowners who complete verified home hardening.',
      isOfficialGov: true,
    },
    {
      title: 'California FAIR Plan Association',
      category: 'Insurance & Rebates',
      url: 'https://www.cfpnet.com/',
      description: 'California insurer of last resort for high-wildfire risk properties, including wildfire mitigation credits.',
      isOfficialGov: true,
    },
    {
      title: 'Watch Duty Live Wildfire Tracker',
      category: 'Evacuation & Dispatch',
      url: 'https://www.watchduty.org/',
      description: 'Citizen and responder powered real-time California wildland fire tracking with radio dispatch audio.',
      isOfficialGov: false,
    },
    {
      title: 'Local Fire Safe Council Directory',
      category: 'Local Fire Safe Council',
      url: countyData.fireSafeCouncilUrl,
      description: `Community chipping programs, neighborhood evacuation drills, and free reflective sign ordering for ${location.county}.`,
      isOfficialGov: false,
    },
  ];

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-6 shadow-xs">
      <div className="border-b border-[#D8CEBD] pb-3 mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-1">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>County & State Resilience Network</span>
          </div>
          <h2 className="font-serif-field text-xl sm:text-2xl font-bold text-[#2B2824]">
            Official Wildfire Resources & Contacts
          </h2>
          <p className="text-xs text-[#615B52] mt-0.5">
            Verified California emergency response portals, inspection booking, and insurance discount programs.
          </p>
        </div>

        <span className="survey-stamp hidden sm:inline-block text-[10px] font-mono-data text-[#615B52] px-2 py-1 bg-[#EAE1D1] rounded">
          {location.county.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {officialLinks.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded border border-[#D8CEBD] bg-[#FFFFFF] hover:bg-[#FAF6EF] hover:border-[#B5542C] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#8F3E1D]">
                  {link.category}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-[#615B52] group-hover:text-[#B5542C] transition-colors shrink-0" />
              </div>

              <h4 className="font-serif-field font-bold text-sm text-[#2B2824] group-hover:text-[#B5542C] transition-colors mb-1">
                {link.title}
              </h4>

              <p className="text-xs text-[#615B52] leading-relaxed">
                {link.description}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#EAE1D1] flex items-center justify-between text-[10px] text-[#615B52] font-mono-data">
              <span>{link.isOfficialGov ? 'Official Government Portal' : 'Community Wildfire Service'}</span>
              <span className="text-[#B5542C] group-hover:underline">Visit Portal →</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
