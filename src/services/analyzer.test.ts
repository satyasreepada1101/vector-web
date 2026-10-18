import test from 'node:test';
import assert from 'node:assert/strict';
import { VectorMockAnalyzer } from './analyzer.ts';

test('analyzer processes Example C prompt and returns critical risk with S3 and EC2 resources', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Create a public S3 bucket for customer documents and launch an EC2 instance with SSH open to 0.0.0.0/0.';
  const result = await analyzer.analyze(prompt);

  assert.equal(result.riskScore, 82);
  assert.equal(result.riskLevel, 'CRITICAL');
  assert.equal(result.coverageScore, 38);
  assert.equal(result.confidenceScore, 81);
  assert.equal(result.resources.length, 2);
  assert.equal(result.riskyFindings.length, 2);
  assert.equal(result.missing.length, 5);
  assert.ok(result.resources.some(r => r.id === 's3'));
  assert.ok(result.resources.some(r => r.id === 'ec2'));
});

test('analyzer recognizes improved prompt and returns reduced risk score', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = `Create an S3 bucket for documents.

Security requirements:
- Enable default SSE-S3 or customer-managed AWS KMS (SSE-KMS) encryption on the S3 bucket.
- Enforce S3 Block Public Access on bucket and account levels.
- Enable S3 server access logging.`;

  const result = await analyzer.analyze(prompt);
  assert.ok(result.riskScore < 30, `Expected risk score ${result.riskScore} < 30`);
  assert.ok(result.riskLevel === 'MINIMAL' || result.riskLevel === 'LOW');
  assert.ok(result.coverageScore >= 80, `Expected coverage score ${result.coverageScore} >= 80`);
});

test('analyzer throws on empty prompt', async () => {
  const analyzer = new VectorMockAnalyzer();
  await assert.rejects(async () => {
    await analyzer.analyze('   ');
  }, /cannot be empty/i);
});

test('deepScan throws clear unavailable message without pretending AI ran', async () => {
  const analyzer = new VectorMockAnalyzer();
  await assert.rejects(async () => {
    await analyzer.deepScan('test prompt');
  }, /Deep Scan requires/i);
});
