import React, { useState } from 'react';
import { ActionItem, ActionPriority } from '../types/wildfire';
import { ListChecks, CheckCircle2, Clock, DollarSign, ShieldAlert, Sparkles, Filter, Wrench } from 'lucide-react';

interface ActionChecklistProps {
  actionItems: ActionItem[];
  onToggleComplete: (actionId: string) => void;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
  actionItems,
  onToggleComplete,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const completedCount = actionItems.filter((i) => i.completed).length;
  const totalCount = actionItems.length;

  const filteredItems = actionItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'immediate') return item.priority === 'Immediate / High Impact';
    if (filter === 'seasonal') return item.priority === 'Seasonal Maintenance';
    if (filter === 'capital') return item.priority === 'Capital Hardening Investment';
    if (filter === 'emergency') return item.priority === 'Emergency Protocol';
    if (filter === 'insurance') return item.insuranceRebateEligible;
    return true;
  });

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8CEBD] pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-1">
            <ListChecks className="w-3.5 h-3.5" />
            <span>Prescriptive Hardening Roadmap</span>
          </div>
          <h2 className="font-serif-field text-xl sm:text-2xl font-bold text-[#2B2824]">
            Prioritized Risk Reduction Checklist
          </h2>
          <p className="text-xs text-[#615B52] mt-0.5">
            Ranked by wildfire risk reduction impact vs financial and physical effort.
          </p>
        </div>

        {/* Completion Counter */}
        <div className="text-right sm:text-right">
          <span className="font-mono-data text-xs text-[#615B52]">
            Remediated:{' '}
            <strong className="text-[#6B7F5E]">
              {completedCount} of {totalCount}
            </strong>{' '}
            actions ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100}%)
          </span>
          <div className="w-32 h-2 bg-[#EAE1D1] rounded-full overflow-hidden mt-1 sm:ml-auto border border-[#D8CEBD]">
            <div
              className="h-full bg-[#6B7F5E] transition-all duration-300"
              style={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Filter Tabs (Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-[#B5542C] text-[#F2EBDD]'
              : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
          }`}
        >
          All Items ({totalCount})
        </button>

        <button
          onClick={() => setFilter('immediate')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'immediate'
              ? 'bg-[#B5542C] text-[#F2EBDD]'
              : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
          }`}
        >
          Immediate High Impact ($0–$150)
        </button>

        <button
          onClick={() => setFilter('insurance')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'insurance'
              ? 'bg-[#6B7F5E] text-[#F2EBDD]'
              : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
          }`}
        >
          Safer from Wildfires (Insurance Rebates)
        </button>

        <button
          onClick={() => setFilter('seasonal')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'seasonal'
              ? 'bg-[#B5542C] text-[#F2EBDD]'
              : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
          }`}
        >
          Seasonal Yard Maintenance
        </button>

        <button
          onClick={() => setFilter('capital')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'capital'
              ? 'bg-[#B5542C] text-[#F2EBDD]'
              : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
          }`}
        >
          Capital Hardening (Contractor)
        </button>
      </div>

      {/* Action items list */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 bg-[#FFFFFF] rounded border border-[#D8CEBD] text-xs text-[#615B52]">
          <CheckCircle2 className="w-8 h-8 text-[#6B7F5E] mx-auto mb-2" />
          <p className="font-semibold text-[#2B2824]">
            No outstanding vulnerabilities under this filter!
          </p>
          <p className="mt-0.5">Your home meets CAL FIRE standards for these criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-md border transition-all ${
                item.completed
                  ? 'bg-[#EAEFE6]/60 border-[#6B7F5E]/40 opacity-75'
                  : 'bg-[#FFFFFF] border-[#D8CEBD] hover:border-[#C9BEAB]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Interactive Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleComplete(item.id)}
                  aria-label={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                  className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors cursor-pointer border ${
                    item.completed
                      ? 'bg-[#6B7F5E] border-[#6B7F5E] text-[#FFFFFF]'
                      : 'border-[#9E9382] hover:border-[#B5542C] bg-[#FAF6EF]'
                  }`}
                >
                  {item.completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="flex-1">
                  {/* Top metadata unboxed */}
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] mb-1">
                    <div className="flex items-center gap-2 text-[#615B52]">
                      <span className="font-semibold text-[#8F3E1D]">{item.priority}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.zoneLabel.split(':')[0]}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-data">{item.calFireCode}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-data">
                      <span className="text-[#2B2824] font-semibold">{item.effortCost}</span>
                      {item.insuranceRebateEligible && (
                        <span className="text-[#6B7F5E] font-medium">
                          ✓ Insurance Discount Eligible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4
                    className={`font-serif-field font-bold text-base ${
                      item.completed ? 'line-through text-[#615B52]' : 'text-[#2B2824]'
                    }`}
                  >
                    {item.title}
                  </h4>

                  {/* Instructions */}
                  <p className="text-xs text-[#2B2824] mt-1 leading-relaxed">
                    {item.instructions}
                  </p>

                  {/* Materials & Cost footer */}
                  <div className="mt-2.5 pt-2 border-t border-[#EAE1D1] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#615B52]">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#B5542C]" />
                      <span>Est. Cost: <strong className="text-[#2B2824]">{item.estimatedCostRange}</strong></span>
                    </div>

                    {item.materialsNeeded && item.materialsNeeded.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-[#6B7F5E]" />
                        <span>Recommended: {item.materialsNeeded.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
