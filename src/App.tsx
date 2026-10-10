import React, { useState } from 'react';
import { Header } from './components/Header';
import { AddressInput } from './components/AddressInput';
import { HazardSummaryBanner } from './components/HazardSummaryBanner';
import { LiveConditionsStrip } from './components/LiveConditionsStrip';
import { QuizContainer } from './components/QuizContainer';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { ActionChecklist } from './components/ActionChecklist';
import { ResourceLinks } from './components/ResourceLinks';
import { OfflineSaveModal } from './components/OfflineSaveModal';
import { SavedAuditsDrawer } from './components/SavedAuditsDrawer';
import { ApiDrawer } from './components/ApiDrawer';
import { PrintView } from './components/PrintView';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import {
  HazardProfile,
  QuizAnswers,
  HardeningScore,
  ActionItem,
  AuditReport,
} from './types/wildfire';
import { QUIZ_QUESTIONS } from './data/quizStandards';
import { calculateHardeningAudit } from './services/scoringEngine';
import { geocodeAddress, fetchHazardProfile, saveAudit } from './services/apiClient';
import { Bookmark, ChevronRight, Edit3, Compass, Printer } from 'lucide-react';

export default function App() {
  const [hazardProfile, setHazardProfile] = useState<HazardProfile | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [hardeningScore, setHardeningScore] = useState<HardeningScore | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [currentStep, setCurrentStep] = useState<'address' | 'quiz' | 'dashboard'>('address');

  // UI Loaders & Errors
  const [isLoadingHazard, setIsLoadingHazard] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modals & Drawers
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isApiDrawerOpen, setIsApiDrawerOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeAuditReport, setActiveAuditReport] = useState<AuditReport | null>(null);

  // Initialize baseline quiz answers (default to typical California home condition)
  const initializeDefaultAnswers = () => {
    const defaults: QuizAnswers = {};
    for (const q of QUIZ_QUESTIONS) {
      // Pick middle option as baseline default
      if (q.options.length >= 2) {
        defaults[q.id] = q.options[1].id;
      } else {
        defaults[q.id] = q.options[0].id;
      }
    }
    return defaults;
  };

  // Handle address geocoding & hazard profile retrieval
  const handleSearchAddress = async (query: string) => {
    setIsLoadingHazard(true);
    setErrorMessage('');
    setLoadingMessage('Resolving California parcel coordinates & jurisdiction...');

    try {
      const geoResult = await geocodeAddress(query);
      if (!geoResult.ok || !geoResult.location) {
        setErrorMessage(geoResult.error || 'Could not locate address in California.');
        setIsLoadingHazard(false);
        return;
      }

      setLoadingMessage(
        `Connected to ${geoResult.location.county}. Querying CAL FIRE FRAP GIS, NWS Red Flag, and NASA FIRMS...`
      );

      const hazardResult = await fetchHazardProfile(geoResult.location);
      if (!hazardResult.ok || !hazardResult.profile) {
        setErrorMessage(hazardResult.error || 'Failed to assemble real-time wildfire hazard profile.');
        setIsLoadingHazard(false);
        return;
      }

      setHazardProfile(hazardResult.profile);

      // If answers empty, initialize defaults
      const initialAnswers = Object.keys(answers).length > 0 ? answers : initializeDefaultAnswers();
      setAnswers(initialAnswers);

      const { hardeningScore: newScore, actionItems: newActions } = calculateHardeningAudit(initialAnswers);
      setHardeningScore(newScore);
      setActionItems(newActions);

      setCurrentStep('quiz');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage('Network error communicating with wildfire servers.');
    } finally {
      setIsLoadingHazard(false);
    }
  };

  // Handle quiz answer selection
  const handleAnswerChange = (questionId: string, optionId: string) => {
    const updatedAnswers = { ...answers, [questionId]: optionId };
    setAnswers(updatedAnswers);

    // Dynamic real-time score recalculation
    const { hardeningScore: newScore, actionItems: newActions } = calculateHardeningAudit(updatedAnswers);
    setHardeningScore(newScore);

    // Preserve completed states of existing action items if still in list
    const preservedActions = newActions.map((item) => {
      const existing = actionItems.find((a) => a.id === item.id);
      return existing ? { ...item, completed: existing.completed } : item;
    });
    setActionItems(preservedActions);
  };

  // Toggle action item completed status
  const handleToggleActionComplete = (actionId: string) => {
    const updatedActions = actionItems.map((item) =>
      item.id === actionId ? { ...item, completed: !item.completed } : item
    );
    setActionItems(updatedActions);

    // Give a bonus bump to hardening score as user checks off actions
    if (hardeningScore) {
      const completedCount = updatedActions.filter((i) => i.completed).length;
      const totalCount = updatedActions.length;
      const progressBonus = totalCount > 0 ? Math.round((completedCount / totalCount) * 15) : 0;

      const baseScore = calculateHardeningAudit(answers).hardeningScore.overallScore;
      const newOverall = Math.min(100, baseScore + progressBonus);

      setHardeningScore({
        ...hardeningScore,
        overallScore: newOverall,
      });
    }
  };

  // Transition from Quiz to Dashboard
  const handleFinishQuiz = () => {
    setCurrentStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSaveAuditReport();
  };

  // Save audit report to persistent storage & open confirmation
  const handleSaveAuditReport = async () => {
    if (!hazardProfile || !hardeningScore) return;

    const reportId = `EMBER-CA-${hazardProfile.location.zipCode || '94563'}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const report: AuditReport = {
      id: reportId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hazardProfile,
      quizAnswers: answers,
      hardeningScore,
      actionItems,
    };

    setActiveAuditReport(report);
    await saveAudit(report);
    return report;
  };

  // Open save modal explicitly
  const handleOpenSaveModal = async () => {
    if (!activeAuditReport && hazardProfile && hardeningScore) {
      await handleSaveAuditReport();
    }
    setIsOfflineModalOpen(true);
  };

  // Open print preview modal
  const handleOpenPrintPreview = async () => {
    if (!activeAuditReport && hazardProfile && hardeningScore) {
      await handleSaveAuditReport();
    }
    setIsPrintModalOpen(true);
  };

  const handleExecutePrint = () => {
    window.print();
  };

  // Load a previously saved report from drawer
  const handleLoadSavedReport = (report: AuditReport) => {
    setHazardProfile(report.hazardProfile);
    setAnswers(report.quizAnswers);
    setHardeningScore(report.hardeningScore);
    setActionItems(report.actionItems);
    setActiveAuditReport(report);
    setCurrentStep('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to new audit
  const handleResetAudit = () => {
    setHazardProfile(null);
    setAnswers({});
    setHardeningScore(null);
    setActionItems([]);
    setCurrentStep('address');
    setActiveAuditReport(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentReportToPrint: AuditReport | null =
    activeAuditReport ||
    (hazardProfile && hardeningScore
      ? {
          id: `EMBER-CA-${hazardProfile.location.zipCode || '94563'}-PRINT`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hazardProfile,
          quizAnswers: answers,
          hardeningScore,
          actionItems,
        }
      : null);

  return (
    <>
      {/* =========================================================================
          SCREEN ROOT CONTAINER: Hidden completely during window.print()
         ========================================================================= */}
      <div id="screen-view" className="min-h-screen bg-topo-pattern text-[#2B2824] flex flex-col antialiased selection:bg-[#B5542C]/20 print:hidden">
        {/* App Header */}
        <Header
          onOpenSaved={() => setIsSavedDrawerOpen(true)}
          onOpenDataSources={() => setIsApiDrawerOpen(true)}
          onResetAudit={handleResetAudit}
          hasActiveAudit={!!hazardProfile}
          onPrint={handleOpenPrintPreview}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Hero Field Guide Banner (when no active location) */}
          {!hazardProfile && (
            <div className="bg-[#FAF6EF] border border-[#D8CEBD] rounded-lg p-6 sm:p-10 shadow-xs relative overflow-hidden">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-mono-data uppercase tracking-wider text-[#B5542C] font-semibold mb-2">
                  <Compass className="w-4 h-4" />
                  <span>California Field Resilience Standard · Grounded In Real Gov Data</span>
                </div>
                <h1 className="font-serif-field text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2B2824] leading-tight">
                  Personalized Wildfire Readiness & Hardening Audit
                </h1>
                <p className="text-sm sm:text-base text-[#615B52] mt-3 leading-relaxed">
                  Generic checklists aren’t enough for California's complex wildfire terrain. Ember Ready integrates real{' '}
                  <strong className="text-[#2B2824]">CAL FIRE Fire Hazard Severity Zone (FHSZ)</strong> maps,{' '}
                  <strong className="text-[#2B2824]">FEMA National Risk Index percentiles</strong>, live{' '}
                  <strong className="text-[#2B2824]">National Weather Service Red Flag warnings</strong>, and{' '}
                  <strong className="text-[#2B2824]">NASA FIRMS active satellite detections</strong> with CAL FIRE’s{' '}
                  <strong className="text-[#8F3E1D]">Public Resources Code § 4291 & AB 3074</strong> defensible space criteria.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono-data text-[#615B52]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6B7F5E]" />
                    <span>CAL FIRE AB 3074 (0–5ft Zone)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6B7F5E]" />
                    <span>FEMA NRI Wildfire Risk Index</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6B7F5E]" />
                    <span>NWS api.weather.gov Red Flag</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6B7F5E]" />
                    <span>NASA FIRMS Active Thermal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Address Input */}
          <AddressInput
            onSearch={handleSearchAddress}
            isLoading={isLoadingHazard}
            statusMessage={loadingMessage}
            errorMessage={errorMessage}
          />

          {/* When Hazard Data is Loaded */}
          {hazardProfile && (
            <div className="space-y-6 animate-in fade-in">
              {/* Step 2 Indicator Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#EAE1D1]/60 border border-[#D8CEBD] px-4 py-2.5 rounded-md text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data uppercase text-[#8F3E1D] font-bold">
                    Active Property Audit:
                  </span>
                  <span className="font-semibold text-[#2B2824]">
                    {hazardProfile.location.address}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentStep === 'quiz' ? (
                    <button
                      onClick={handleFinishQuiz}
                      className="flex items-center gap-1 px-3 py-1 bg-[#6B7F5E] hover:bg-[#4F5E45] text-[#F2EBDD] font-medium rounded transition-colors text-xs cursor-pointer"
                    >
                      <span>View Dashboard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep('quiz')}
                      className="flex items-center gap-1 px-3 py-1 bg-[#FAF6EF] hover:bg-[#EAE1D1] text-[#2B2824] font-medium rounded border border-[#D8CEBD] transition-colors text-xs cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#B5542C]" />
                      <span>Adjust Quiz Answers</span>
                    </button>
                  )}

                  <button
                    onClick={handleOpenPrintPreview}
                    className="flex items-center gap-1 px-3 py-1 bg-[#FAF6EF] hover:bg-[#EAE1D1] text-[#2B2824] font-medium rounded border border-[#C9BEAB] transition-colors text-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#B5542C]" />
                    <span>Print Report</span>
                  </button>

                  <button
                    onClick={handleOpenSaveModal}
                    className="flex items-center gap-1 px-3 py-1 bg-[#B5542C] hover:bg-[#8F3E1D] text-[#F2EBDD] font-medium rounded transition-colors text-xs shadow-xs cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save for Offline</span>
                  </button>
                </div>
              </div>

              {/* Location Risk Banner: CAL FIRE FHSZ + FEMA NRI */}
              <HazardSummaryBanner hazardProfile={hazardProfile} />

              {/* Live Environmental Danger Strip (NASA FIRMS, NWS Red Flag, AirNow) */}
              <LiveConditionsStrip hazardProfile={hazardProfile} />

              {/* Step: Quiz Mode */}
              {currentStep === 'quiz' && (
                <QuizContainer
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  onFinishQuiz={handleFinishQuiz}
                />
              )}

              {/* Step: Dashboard Mode */}
              {currentStep === 'dashboard' && hardeningScore && (
                <>
                  {/* Hardening Score Diagnostic Breakdown with INLINE Explainers */}
                  <ScoreBreakdown score={hardeningScore} />

                  {/* Prioritized Action Checklist with Interactive Remediations */}
                  <ActionChecklist
                    actionItems={actionItems}
                    onToggleComplete={handleToggleActionComplete}
                  />

                  {/* Official California Wildfire Resources & Evacuation Portals */}
                  <ResourceLinks hazardProfile={hazardProfile} />
                </>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#D8CEBD] bg-[#FAF6EF] py-6 px-4 sm:px-6 text-xs text-[#615B52] mt-12 no-print">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif-field font-bold text-sm text-[#2B2824]">
                Ember Ready
              </span>
              <span>· California Wildfire Household Resilience Engine</span>
            </div>

            <div className="text-center sm:text-right font-mono-data text-[11px]">
              <span>PRC § 4291 · AB 3074 · FEMA NRI · NWS NOAA · NASA FIRMS · AIRNOW</span>
            </div>
          </div>
        </footer>

        {/* Offline Save Modal */}
        {activeAuditReport && (
          <OfflineSaveModal
            auditReport={activeAuditReport}
            isOpen={isOfflineModalOpen}
            onClose={() => setIsOfflineModalOpen(false)}
          />
        )}

        {/* Saved Audits Drawer */}
        <SavedAuditsDrawer
          isOpen={isSavedDrawerOpen}
          onClose={() => setIsSavedDrawerOpen(false)}
          onSelectAudit={handleLoadSavedReport}
        />

        {/* Real Data Feeds Drawer */}
        <ApiDrawer
          isOpen={isApiDrawerOpen}
          onClose={() => setIsApiDrawerOpen(false)}
        />

        {/* In-App Physical Field Report Preview Modal */}
        {currentReportToPrint && (
          <PrintPreviewModal
            auditReport={currentReportToPrint}
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            onTriggerPrint={handleExecutePrint}
          />
        )}
      </div>

      {/* =========================================================================
          PRINT ROOT CONTAINER: Displayed ONLY when printing via @media print
         ========================================================================= */}
      <div id="print-view">
        {currentReportToPrint && <PrintView auditReport={currentReportToPrint} />}
      </div>
    </>
  );
}
