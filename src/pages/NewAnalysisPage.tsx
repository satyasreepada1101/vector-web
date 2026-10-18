import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, SecurityFinding } from '../types/analysis.ts';
import { defaultAnalyzer } from '../services/analyzer.ts';
import { historyStorage } from '../services/historyStorage.ts';
import { buildImprovedPrompt, projectMetrics } from '../services/promptBuilder.ts';
import { PromptEditor } from '../components/analysis/PromptEditor.tsx';
import { SecurityOverviewCard } from '../components/analysis/SecurityOverviewCard.tsx';
import { DetectedResources } from '../components/analysis/DetectedResources.tsx';
import { SecurityRequirementsList } from '../components/analysis/SecurityRequirementsList.tsx';
import { ImprovedPromptPanel } from '../components/analysis/ImprovedPromptPanel.tsx';
import { useToast } from '../components/ui/Toast.tsx';
import { ArrowLeftRight, CheckCircle2, History } from 'lucide-react';

interface NewAnalysisPageProps {
  initialResult?: AnalysisResult | null;
  onClearInitialResult?: () => void;
  onViewHistory?: () => void;
}

export const NewAnalysisPage: React.FC<NewAnalysisPageProps> = ({
  initialResult,
  onClearInitialResult,
  onViewHistory
}) => {
  const { toast } = useToast();
  const [promptText, setPromptText] = useState('');
  const [selectedExampleKey, setSelectedExampleKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Analysis result state
  const [originalResult, setOriginalResult] = useState<AnalysisResult | null>(null);
  const [revisedResult, setRevisedResult] = useState<AnalysisResult | null>(null);
  const [activeViewVersion, setActiveViewVersion] = useState<'original' | 'revised'>('original');

  // Selected findings for improved prompt
  const [selectedFindingIds, setSelectedFindingIds] = useState<Set<string>>(new Set());

  // Ref to scroll to results smoothly
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load initial result if opened from history or example
  useEffect(() => {
    if (initialResult) {
      setOriginalResult(initialResult);
      setPromptText(initialResult.prompt);
      setRevisedResult(null);
      setActiveViewVersion('original');
      setSelectedFindingIds(new Set());
    }
  }, [initialResult]);

  // The active result being inspected
  const currentResult = activeViewVersion === 'revised' && revisedResult ? revisedResult : originalResult;

  // Selected findings objects
  const allEligibleFindings: SecurityFinding[] = currentResult
    ? [...currentResult.missing, ...currentResult.riskyFindings]
    : [];

  const selectedFindingObjects = allEligibleFindings.filter(f => selectedFindingIds.has(f.id));

  // Compute live improved prompt
  const improvedPromptText = originalResult
    ? buildImprovedPrompt(originalResult.prompt, selectedFindingObjects)
    : '';

  // Compute projected metrics if on original view
  const projected = originalResult
    ? projectMetrics(originalResult, selectedFindingIds)
    : null;

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await defaultAnalyzer.analyze(text);
      setOriginalResult(res);
      setRevisedResult(null);
      setActiveViewVersion('original');
      setSelectedFindingIds(new Set());
      // Save to history
      historyStorage.save(res);
      toast('Prompt analysis complete', 'success');

      // Accessibility scroll
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      toast(err.message || 'Failed to analyze prompt.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReanalyze = async (revisedPrompt: string) => {
    setIsReanalyzing(true);
    try {
      const res = await defaultAnalyzer.analyze(revisedPrompt);
      setRevisedResult(res);
      setActiveViewVersion('revised');
      // Save revised to history
      historyStorage.save(res);
      toast('Improved prompt re-analyzed successfully', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to re-analyze prompt.', 'error');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleToggleFinding = (id: string) => {
    setSelectedFindingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!currentResult) return;
    const allIds = [...currentResult.missing, ...currentResult.riskyFindings].map(f => f.id);
    setSelectedFindingIds(new Set(allIds));
    toast(`Added ${allIds.length} security clauses to improved prompt`, 'info');
  };

  const handleClearAll = () => {
    setSelectedFindingIds(new Set());
  };

  const handleResetToOriginal = () => {
    setSelectedFindingIds(new Set());
    toast('Reset prompt to original text', 'info');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-[#283638] tracking-tight">
              New Security Analysis
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#E4EBDD] text-[#30494B] border border-[#CFE2C8]">
              AWS Prompt Analyzer
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#737A72]">
            Review your infrastructure request for missing security constraints and risky configurations.
          </p>
        </div>

        {onViewHistory && (
          <button
            type="button"
            onClick={onViewHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E2D8] bg-white hover:bg-[#F6F4EC] text-xs font-semibold text-[#283638] transition-colors self-start sm:self-auto"
          >
            <History className="w-3.5 h-3.5 text-[#49686C]" />
            <span>View Analysis History</span>
          </button>
        )}
      </div>

      {/* Prompt Editor */}
      <PromptEditor
        promptText={promptText}
        setPromptText={setPromptText}
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        selectedExampleKey={selectedExampleKey}
        setSelectedExampleKey={setSelectedExampleKey}
      />

      {/* Results Section */}
      {currentResult && (
        <div ref={resultsRef} className="space-y-6 pt-2 scroll-mt-6">
          {/* Version Switcher if Re-analysis was performed */}
          {revisedResult && (
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5E2D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#49686C]" />
                <span className="text-xs font-bold text-[#283638]">
                  Comparing Versions:
                </span>
                <span className="text-xs text-[#737A72]">
                  Switch between original prompt and revised prompt results
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#F6F4EC] p-1 rounded-lg border border-[#E5E2D8]">
                <button
                  type="button"
                  onClick={() => setActiveViewVersion('original')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeViewVersion === 'original'
                      ? 'bg-white text-[#283638] shadow-xs'
                      : 'text-[#737A72] hover:text-[#283638]'
                  }`}
                >
                  Original Prompt ({originalResult?.riskScore}/100)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewVersion('revised')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeViewVersion === 'revised'
                      ? 'bg-[#49686C] text-white shadow-xs'
                      : 'text-[#737A72] hover:text-[#283638]'
                  }`}
                >
                  Revised Prompt ({revisedResult.riskScore}/100)
                </button>
              </div>
            </div>
          )}

          {/* Security Overview Metric Card */}
          <SecurityOverviewCard
            result={currentResult}
            projectedMetrics={activeViewVersion === 'original' ? projected : null}
          />

          {/* Identified AWS Resources */}
          <DetectedResources resources={currentResult.resources} />

          {/* Side-by-side or Stacked Layout: Findings (Left) & Improved Prompt (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Requirements and Findings */}
            <div className="lg:col-span-7 space-y-6">
              <SecurityRequirementsList
                missing={currentResult.missing}
                mentioned={currentResult.mentioned}
                riskyFindings={currentResult.riskyFindings}
                selectedFindingIds={selectedFindingIds}
                onToggleFinding={handleToggleFinding}
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
              />
            </div>

            {/* Right Column: Improved Prompt Generator */}
            <div className="lg:col-span-5">
              <ImprovedPromptPanel
                originalPrompt={originalResult ? originalResult.prompt : promptText}
                improvedPrompt={improvedPromptText || promptText}
                selectedCount={selectedFindingIds.size}
                onResetPrompt={handleResetToOriginal}
                onReanalyze={handleReanalyze}
                isReanalyzing={isReanalyzing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
