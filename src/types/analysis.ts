export type RiskLevel = 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FindingSource = 'rule' | 'ai';

export interface AnalysisResource {
  id: string;
  label: string;
  category?: string;
}

export interface SecurityFinding {
  id: string;
  label: string;
  description: string;
  severity: FindingSeverity;
  dimension?: string;
  tier?: 'core' | 'clarify' | 'harden';
  clause?: string;
  fix?: string;
  appliesTo?: string[];
  source?: FindingSource;
  selected?: boolean;
  whyItMatters?: string;
  riskyStatement?: string;
}

export interface AnalysisResult {
  id: string;
  prompt: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  coverageScore: number; // 0 - 100 %
  confidenceScore: number; // 0 - 100 %
  resources: AnalysisResource[];
  mentioned: SecurityFinding[];
  missing: SecurityFinding[];
  riskyFindings: SecurityFinding[];
  feedback: string[];
  createdAt?: string;
  isDemo?: boolean;
  projectedRiskScore?: number;
  projectedCoverageScore?: number;
}

export interface AnalyzerAdapter {
  analyze(prompt: string): Promise<AnalysisResult>;
  deepScan?(prompt: string): Promise<AnalysisResult>;
}

export type ActiveTab = 'about' | 'overview' | 'new-analysis' | 'history' | 'guidelines' | 'settings';
