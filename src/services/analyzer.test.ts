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

test('analyzer detects wildcard IAM permissions as critical risk', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Provision an IAM role with AdministratorAccess and wildcard *:* actions for our service.';
  const result = await analyzer.analyze(prompt);

  assert.equal(result.riskLevel, 'CRITICAL');
  assert.ok(result.riskyFindings.some(f => f.id === 'c-risk-iam-wildcard' || f.label.includes('Wildcard IAM')));
  assert.ok(result.resources.some(r => r.id === 'iam'));
});

test('analyzer detects hardcoded static credentials as critical risk', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Deploy an EC2 instance with access key AKIAIOSFODNN7EXAMPLE and secret key stored in config.';
  const result = await analyzer.analyze(prompt);

  assert.equal(result.riskLevel, 'CRITICAL');
  assert.ok(result.riskyFindings.some(f => f.id === 'c-risk-credentials' || f.label.includes('Hardcoded Credentials')));
  assert.ok(result.resources.some(r => r.id === 'ec2'));
});

test('analyzer recognizes multi-resource prompt and detects multiple services', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Set up a high-performance stack with a cluster of virtual machines behind an Application Load Balancer, a Postgres database cluster, and an object store bucket.';
  const result = await analyzer.analyze(prompt);

  assert.ok(result.resources.some(r => r.id === 'ec2'), 'Should detect EC2 from virtual machine');
  assert.ok(result.resources.some(r => r.id === 'alb'), 'Should detect ALB from load balancer');
  assert.ok(result.resources.some(r => r.id === 'rds'), 'Should detect RDS from Postgres');
  assert.ok(result.resources.some(r => r.id === 's3'), 'Should detect S3 from object store');
  assert.ok(result.resources.length >= 4);
});

test('analyzer recognizes explicit security controls and awards higher coverage', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Deploy an EC2 instance in a private subnet VPC with KMS encryption at rest, CloudTrail logging enabled, and least-privilege IAM roles.';
  const result = await analyzer.analyze(prompt);

  assert.ok(result.riskScore < 50, `Expected low or medium risk score, got ${result.riskScore}`);
  assert.ok(result.coverageScore >= 60, `Expected high coverage, got ${result.coverageScore}`);
  assert.ok(result.mentioned.some(m => m.id === 'c-ment-vpc' || m.label.includes('Network Scoping')));
  assert.ok(result.mentioned.some(m => m.id === 'c-ment-enc' || m.label.includes('Encryption')));
  assert.ok(result.mentioned.some(m => m.id === 'c-ment-log' || m.label.includes('Logging')));
  assert.ok(result.mentioned.some(m => m.id === 'c-ment-iam' || m.label.includes('Least-Privilege')));
});

test('analyzer handles mixed risky configurations with some explicit controls', async () => {
  const analyzer = new VectorMockAnalyzer();
  const prompt = 'Provision an S3 bucket with KMS encryption enabled, but set the bucket policy to public access.';
  const result = await analyzer.analyze(prompt);

  // Even though encryption was requested, public access is a critical risk
  assert.ok(result.riskyFindings.some(f => f.id === 'c-risk-public'));
  assert.ok(result.mentioned.some(m => m.id === 'c-ment-enc'));
  assert.ok(result.riskScore >= 60, 'Critical risk should maintain high overall score');
});

test('analyzer handles unusually long prompt without crashing or corrupting output', async () => {
  const analyzer = new VectorMockAnalyzer();
  const padding = ' We need fast processing and reliable uptime.'.repeat(60);
  const prompt = `Deploy an EC2 compute server and RDS database.${padding}`;
  const result = await analyzer.analyze(prompt);

  assert.ok(result.id);
  assert.equal(result.prompt, prompt.trim());
  assert.ok(result.resources.length >= 2);
  assert.ok(typeof result.riskScore === 'number');
});

