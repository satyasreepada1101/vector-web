import type { SecurityFinding, AnalysisResult } from '../types/analysis.ts';

/**
 * Builds an improved infrastructure prompt by preserving the original prompt
 * and appending selected security requirements in a structured, clean format.
 */
export function buildImprovedPrompt(originalPrompt: string, selectedFindings: SecurityFinding[]): string {
  const trimmed = originalPrompt.trim();
  if (!trimmed) return '';

  const validClauses = selectedFindings
    .map(f => (f.clause || f.fix || '').trim())
    .filter(clause => clause.length > 0);

  // De-duplicate clauses while preserving order
  const uniqueClauses = Array.from(new Set(validClauses));

  if (uniqueClauses.length === 0) {
    return trimmed;
  }

  // Format with explicit Security requirements block
  const clausesFormatted = uniqueClauses
    .map(clause => `- ${clause}`)
    .join('\n');

  return `${trimmed}\n\nSecurity requirements:\n${clausesFormatted}`;
}

/**
 * Projects risk and security coverage when selected remediation clauses are applied.
 * Formula models how addressing missing requirements increases coverage and mitigates identified risks.
 */
export function projectMetrics(
  result: AnalysisResult,
  selectedFindingIds: Set<string>
): { projectedRisk: number; projectedCoverage: number } {
  const missingCount = result.missing.length;
  const riskyCount = result.riskyFindings.length;
  const totalFindings = missingCount + riskyCount;

  if (totalFindings === 0 || selectedFindingIds.size === 0) {
    return {
      projectedRisk: result.riskScore,
      projectedCoverage: result.coverageScore
    };
  }

  // Count how many missing controls were selected
  const selectedMissing = result.missing.filter(f => selectedFindingIds.has(f.id)).length;
  // Count how many risky findings had remediations accepted
  const selectedRisky = result.riskyFindings.filter(f => selectedFindingIds.has(f.id)).length;

  const totalSelected = selectedMissing + selectedRisky;

  // Each addressed missing item increases coverage towards 100%
  const remainingMissing = missingCount - selectedMissing;
  const totalApplicableControls = result.mentioned.length + missingCount;
  const projectedCoverage = totalApplicableControls > 0
    ? Math.min(100, Math.round(((result.mentioned.length + selectedMissing) / totalApplicableControls) * 100))
    : result.coverageScore;

  // Each addressed risky statement drops risk significantly; each addressed missing control reduces risk moderately
  const riskyReduction = (selectedRisky / Math.max(1, riskyCount)) * 40;
  const missingReduction = (selectedMissing / Math.max(1, missingCount)) * (result.riskScore - 15 - (riskyCount > 0 ? 30 : 0));
  
  const projectedRisk = Math.max(
    10,
    Math.round(result.riskScore - (riskyReduction + missingReduction * 0.7))
  );

  return {
    projectedRisk,
    projectedCoverage
  };
}
