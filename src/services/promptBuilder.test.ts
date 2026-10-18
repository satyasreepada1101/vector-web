import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImprovedPrompt, projectMetrics } from './promptBuilder.ts';
import type { SecurityFinding, AnalysisResult } from '../types/analysis.ts';

test('buildImprovedPrompt preserves original prompt when no clauses are selected', () => {
  const original = 'Deploy an EC2 instance and RDS database.';
  const result = buildImprovedPrompt(original, []);
  assert.equal(result, original);
});

test('buildImprovedPrompt appends deduplicated clauses under Security requirements', () => {
  const original = 'Create an S3 bucket for storing documents.';
  const findings: SecurityFinding[] = [
    {
      id: 'f1',
      label: 'Encryption at Rest',
      description: 'Missing encryption',
      severity: 'high',
      clause: 'Enable SSE-S3 or SSE-KMS encryption at rest for the S3 bucket.'
    },
    {
      id: 'f2',
      label: 'Block Public Access',
      description: 'Missing public access block',
      severity: 'critical',
      clause: 'Enable S3 Block Public Access to prevent unintended exposure.'
    },
    {
      id: 'f3',
      label: 'Duplicate clause test',
      description: 'Duplicate',
      severity: 'medium',
      clause: 'Enable SSE-S3 or SSE-KMS encryption at rest for the S3 bucket.'
    }
  ];

  const improved = buildImprovedPrompt(original, findings);
  assert.ok(improved.startsWith(original));
  assert.ok(improved.includes('Security requirements:'));
  assert.ok(improved.includes('- Enable SSE-S3 or SSE-KMS encryption at rest for the S3 bucket.'));
  assert.ok(improved.includes('- Enable S3 Block Public Access to prevent unintended exposure.'));
  
  // Verify deduplication: clause should appear exactly once
  const occurrences = (improved.match(/SSE-S3 or SSE-KMS/g) || []).length;
  assert.equal(occurrences, 1);
});

test('projectMetrics computes higher coverage and reduced risk score as findings are addressed', () => {
  const mockResult: AnalysisResult = {
    id: 'res-1',
    prompt: 'Public S3 bucket and EC2',
    riskScore: 82,
    riskLevel: 'CRITICAL',
    coverageScore: 38,
    confidenceScore: 81,
    resources: [{ id: 's3', label: 'Amazon S3' }],
    mentioned: [
      { id: 'm1', label: 'Basic storage', description: 'desc', severity: 'low' }
    ],
    missing: [
      { id: 'f1', label: 'Encryption', description: 'desc', severity: 'high', clause: 'Encrypt S3' },
      { id: 'f2', label: 'Access logging', description: 'desc', severity: 'medium', clause: 'Log S3' }
    ],
    riskyFindings: [
      { id: 'r1', label: 'Public S3', description: 'desc', severity: 'critical', fix: 'Block public access' }
    ],
    feedback: []
  };

  // Initially with no selected findings
  const initial = projectMetrics(mockResult, new Set());
  assert.equal(initial.projectedRisk, 82);
  assert.equal(initial.projectedCoverage, 38);

  // When all findings are selected
  const allSelected = projectMetrics(mockResult, new Set(['f1', 'f2', 'r1']));
  assert.ok(allSelected.projectedRisk < 82, `Risk ${allSelected.projectedRisk} should be less than 82`);
  assert.ok(allSelected.projectedCoverage > 38, `Coverage ${allSelected.projectedCoverage} should be greater than 38`);
  assert.equal(allSelected.projectedCoverage, 100);
});
