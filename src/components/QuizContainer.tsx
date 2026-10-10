import React, { useState } from 'react';
import { QuizAnswers, QuizQuestion, ZoneCategory } from '../types/wildfire';
import { QUIZ_QUESTIONS, ZONE_METADATA } from '../data/quizStandards';
import { CheckCircle2, AlertCircle, Info, ChevronRight, ChevronLeft, Shield, Check } from 'lucide-react';

interface QuizContainerProps {
  answers: QuizAnswers;
  onAnswerChange: (questionId: string, optionId: string) => void;
  onFinishQuiz: () => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  answers,
  onAnswerChange,
  onFinishQuiz,
}) => {
  const [activeZone, setActiveZone] = useState<ZoneCategory>('zone0');

  const zoneKeys: ZoneCategory[] = [
    'zone0',
    'zone1',
    'zone2',
    'home_hardening',
    'egress',
  ];

  const currentQuestions = QUIZ_QUESTIONS.filter((q) => q.zone === activeZone);
  const totalQuestionsCount = QUIZ_QUESTIONS.length;
  const answeredQuestionsCount = Object.keys(answers).length;
  const isAllAnswered = answeredQuestionsCount >= totalQuestionsCount;

  const currentZoneMeta = ZONE_METADATA[activeZone];
  const currentZoneIndex = zoneKeys.indexOf(activeZone);

  const handleNextZone = () => {
    if (currentZoneIndex < zoneKeys.length - 1) {
      setActiveZone(zoneKeys[currentZoneIndex + 1]);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else {
      onFinishQuiz();
    }
  };

  const handlePrevZone = () => {
    if (currentZoneIndex > 0) {
      setActiveZone(zoneKeys[currentZoneIndex - 1]);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-5 sm:p-7 shadow-xs">
      {/* Quiz Header & Progress */}
      <div className="border-b border-[#D8CEBD] pb-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Step 2 · CAL FIRE Defensible Space & Home Hardening Audit</span>
            </div>
            <h2 className="font-serif-field text-xl sm:text-2xl font-bold text-[#2B2824]">
              Home Resilience Assessment
            </h2>
          </div>

          <div className="text-right">
            <span className="font-mono-data text-xs text-[#615B52]">
              Audit Progress:{' '}
              <strong className="text-[#2B2824]">
                {answeredQuestionsCount} / {totalQuestionsCount}
              </strong>{' '}
              ({Math.round((answeredQuestionsCount / totalQuestionsCount) * 100)}%)
            </span>
            <div className="w-36 h-2 bg-[#EAE1D1] rounded-full overflow-hidden mt-1.5 ml-auto border border-[#D8CEBD]">
              <div
                className="h-full bg-[#B5542C] transition-all duration-300"
                style={{
                  width: `${(answeredQuestionsCount / totalQuestionsCount) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Zone Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2">
          {zoneKeys.map((zKey, idx) => {
            const meta = ZONE_METADATA[zKey];
            const questionsInZ = QUIZ_QUESTIONS.filter((q) => q.zone === zKey);
            const answeredInZ = questionsInZ.filter((q) => answers[q.id]);
            const isCompleted = answeredInZ.length === questionsInZ.length;
            const isActive = activeZone === zKey;

            return (
              <button
                key={zKey}
                onClick={() => setActiveZone(zKey)}
                className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#B5542C] text-[#F2EBDD] shadow-xs'
                    : 'bg-[#EAE1D1]/60 hover:bg-[#EAE1D1] text-[#2B2824] border border-[#D8CEBD]'
                }`}
              >
                <span>
                  {idx + 1}. {zKey === 'home_hardening' ? 'Hardening' : zKey.replace('zone', 'Zone ')}
                </span>
                {isCompleted && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-[#F2EBDD]' : 'text-[#6B7F5E]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Zone Intro Card */}
      <div className="bg-[#EAE1D1]/50 border border-[#D8CEBD] rounded-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <h3 className="font-serif-field text-lg font-bold text-[#2B2824]">
            {currentZoneMeta.name}
          </h3>
          <span className="font-mono-data text-xs text-[#8F3E1D] font-semibold">
            {currentZoneMeta.distanceRange} · {currentZoneMeta.calFireCode}
          </span>
        </div>
        <p className="text-xs text-[#615B52] mb-2">{currentZoneMeta.subtitle}</p>
        <p className="text-xs text-[#2B2824] bg-[#FAF6EF] p-2.5 rounded border border-[#D8CEBD]">
          <strong className="text-[#8F3E1D]">Fire Engineering Context:</strong>{' '}
          {currentZoneMeta.primaryThreat}
        </p>
      </div>

      {/* Questions list for active zone */}
      <div className="space-y-6 mb-8">
        {currentQuestions.map((q, qIndex) => {
          const selectedOptionId = answers[q.id];

          return (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-md border border-[#D8CEBD] bg-[#FAF6EF] hover:border-[#C9BEAB] transition-colors"
            >
              {/* Question Header */}
              <div className="mb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#615B52]">
                    Question {qIndex + 1} of {currentQuestions.length} · {q.calFireCodeRef}
                  </span>
                  {selectedOptionId && (
                    <span className="text-xs font-mono-data text-[#6B7F5E] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Recorded</span>
                    </span>
                  )}
                </div>

                <h4 className="font-serif-field font-bold text-base sm:text-lg text-[#2B2824]">
                  {q.title}
                </h4>
                <p className="text-xs text-[#2B2824] mt-0.5">{q.prompt}</p>
              </div>

              {/* Options */}
              <div className="space-y-2 mb-3">
                {q.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onAnswerChange(q.id, opt.id)}
                      className={`w-full text-left p-3 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? opt.calFireStandardMet
                            ? 'bg-[#EAEFE6] border-[#6B7F5E] ring-1 ring-[#6B7F5E]'
                            : 'bg-[#F9EFE9] border-[#B5542C] ring-1 ring-[#B5542C]'
                          : 'bg-[#FFFFFF] border-[#D8CEBD] hover:bg-[#FAF6EF]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? opt.calFireStandardMet
                                ? 'border-[#6B7F5E] bg-[#6B7F5E]'
                                : 'border-[#B5542C] bg-[#B5542C]'
                              : 'border-[#9E9382]'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF]" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-[#2B2824]">
                              {opt.label}
                            </span>
                            {opt.calFireStandardMet ? (
                              <span className="text-[10px] font-mono-data text-[#6B7F5E] bg-[#EAEFE6] px-1.5 py-0.2 rounded">
                                CAL FIRE Compliant
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono-data text-[#B5542C] bg-[#F9EFE9] px-1.5 py-0.2 rounded">
                                Deficient
                              </span>
                            )}
                          </div>

                          {opt.description && (
                            <p className="text-[11px] text-[#615B52] mt-0.5">
                              {opt.description}
                            </p>
                          )}

                          {isSelected && opt.riskPenaltyNotice && (
                            <div className="mt-1.5 pt-1.5 border-t border-[#D8CEBD]/60 flex items-start gap-1.5 text-[11px] text-[#8F3E1D]">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#B5542C]" />
                              <span>{opt.riskPenaltyNotice}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Field Guidance Accordion Tip */}
              <div className="text-[11px] text-[#615B52] bg-[#EAE1D1]/40 rounded p-2 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-[#B5542C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#2B2824]">Field Guidance: </span>
                  {q.fieldGuidance}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#D8CEBD]">
        <button
          type="button"
          onClick={handlePrevZone}
          disabled={currentZoneIndex === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#2B2824] bg-[#FAF6EF] hover:bg-[#EAE1D1] disabled:opacity-30 disabled:cursor-not-allowed border border-[#D8CEBD] rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Zone</span>
        </button>

        <div className="flex items-center gap-2">
          {currentZoneIndex < zoneKeys.length - 1 ? (
            <button
              type="button"
              onClick={handleNextZone}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#F2EBDD] bg-[#B5542C] hover:bg-[#8F3E1D] rounded transition-colors shadow-xs"
            >
              <span>Continue to Next Zone</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinishQuiz}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-[#F2EBDD] bg-[#6B7F5E] hover:bg-[#4F5E45] rounded transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Resilience Audit & View Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
