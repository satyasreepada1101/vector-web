import type { AnalysisResult, AnalyzerAdapter, AnalysisResource, SecurityFinding, RiskLevel } from '../types/analysis.ts';
import { DEMO_ANALYSIS_EXAMPLE_A, DEMO_ANALYSIS_EXAMPLE_B, DEMO_ANALYSIS_EXAMPLE_C } from '../data/demoAnalysis.ts';

export class VectorMockAnalyzer implements AnalyzerAdapter {
  async analyze(prompt: string): Promise<AnalysisResult> {
    // Simulate brief offline rule-based processing
    await new Promise(resolve => setTimeout(resolve, 380));

    const normalized = prompt.trim();
    if (!normalized) {
      throw new Error('Prompt cannot be empty.');
    }

    const lower = normalized.toLowerCase();

    // Check if this is a Re-analysis of an improved prompt (contains "Security requirements:")
    if (lower.includes('security requirements:') || lower.includes('- enable ') || lower.includes('- attach ') || lower.includes('- enforce ')) {
      return this.analyzeImprovedPrompt(normalized);
    }

    // Match known demo examples
    if (lower.includes('customer documents') && lower.includes('ssh open to 0.0.0.0/0')) {
      return {
        ...DEMO_ANALYSIS_EXAMPLE_C,
        id: `vec-res-${Date.now()}`,
        prompt: normalized,
        createdAt: new Date().toISOString()
      };
    }

    if (lower.includes('running a web application behind a load balancer') && lower.includes('rds database')) {
      return {
        ...DEMO_ANALYSIS_EXAMPLE_B,
        id: `vec-res-${Date.now()}`,
        prompt: normalized,
        createdAt: new Date().toISOString()
      };
    }

    if (lower === 'create an s3 bucket for storing application documents.' || (lower.includes('storing application documents') && !lower.includes('encrypt') && !lower.includes('public'))) {
      return {
        ...DEMO_ANALYSIS_EXAMPLE_A,
        id: `vec-res-${Date.now()}`,
        prompt: normalized,
        createdAt: new Date().toISOString()
      };
    }

    // Rule-based parsing for custom prompt
    return this.analyzeCustomPrompt(normalized);
  }

  async deepScan(_prompt: string): Promise<AnalysisResult> {
    // As per prompt specification:
    // "The optional deep scan should have a separate state. If the integration is not configured,
    // explain that deep scan is unavailable in the current demo. Do not pretend an AI service has actually run."
    throw new Error('Deep Scan requires a configured Vector semantic integration or backend model endpoint. In this client demo, rule-based offline diagnosis is the active engine.');
  }

  private analyzeImprovedPrompt(prompt: string): AnalysisResult {
    const lower = prompt.toLowerCase();
    const resources = this.detectResources(lower);

    // Identify which clauses were applied
    const mentioned: SecurityFinding[] = [
      {
        id: 'rev-m1',
        label: 'Applied Security Constraints Section',
        description: 'Explicit security requirements have been appended to the baseline specification.',
        severity: 'low',
        source: 'rule',
        dimension: 'Compliance'
      }
    ];

    if (lower.includes('encryption') || lower.includes('sse-') || lower.includes('kms')) {
      mentioned.push({
        id: 'rev-m2',
        label: 'Data Encryption Specified',
        description: 'Default server-side encryption with AWS KMS or SSE is declared.',
        severity: 'low',
        source: 'rule',
        dimension: 'Data Protection'
      });
    }

    if (lower.includes('block public access') || lower.includes('private subnet')) {
      mentioned.push({
        id: 'rev-m3',
        label: 'Inbound Boundary Protection',
        description: 'Perimeter restriction and public access blocking applied.',
        severity: 'low',
        source: 'rule',
        dimension: 'Network Security'
      });
    }

    if (lower.includes('logging') || lower.includes('cloudtrail')) {
      mentioned.push({
        id: 'rev-m4',
        label: 'Audit Logging & Monitoring Declared',
        description: 'Audit trails and access logs are designated.',
        severity: 'low',
        source: 'rule',
        dimension: 'Logging & Monitoring'
      });
    }

    // Check if any critical risks remain
    const riskyFindings: SecurityFinding[] = [];
    if (lower.includes('0.0.0.0/0') && !lower.includes('eliminate direct ssh') && !lower.includes('systems manager')) {
      riskyFindings.push({
        id: 'rev-r1',
        label: 'Unrestricted Ingress (0.0.0.0/0)',
        description: 'Unrestricted CIDR ingress remains in the prompt text.',
        severity: 'critical',
        source: 'rule',
        riskyStatement: '0.0.0.0/0',
        whyItMatters: 'Unrestricted ingress allows open port access.',
        clause: 'Restrict ingress to explicit internal CIDRs.'
      });
    }

    const missing: SecurityFinding[] = [];
    if (!lower.includes('iam') && !lower.includes('least-privilege') && !lower.includes('profile')) {
      missing.push({
        id: 'rev-miss-1',
        label: 'Fine-Grained IAM Policy Scoping',
        description: 'Ensure runtime execution policies use resource-specific ARNs.',
        severity: 'low',
        dimension: 'Identity & Access Management',
        tier: 'harden',
        source: 'rule',
        clause: 'Scope IAM execution policies to specific resource ARNs rather than wildcard (*).'
      });
    }

    const riskScore = riskyFindings.length > 0 ? 35 : (missing.length > 0 ? 14 : 8);
    const riskLevel: RiskLevel = riskScore <= 15 ? 'MINIMAL' : (riskScore <= 35 ? 'LOW' : 'MEDIUM');
    const coverageScore = Math.min(96, Math.max(75, 100 - (missing.length * 10)));

    return {
      id: `vec-rev-${Date.now()}`,
      prompt,
      riskScore,
      riskLevel,
      coverageScore,
      confidenceScore: 89,
      resources: resources.length > 0 ? resources : [{ id: 'aws', label: 'AWS Infrastructure', category: 'General' }],
      mentioned,
      missing,
      riskyFindings,
      feedback: [
        'Revised prompt incorporates accepted security clauses. Identified risk is dramatically reduced and security coverage meets baseline recommendations.'
      ],
      createdAt: new Date().toISOString(),
      isDemo: true
    };
  }

  private analyzeCustomPrompt(prompt: string): AnalysisResult {
    const lower = prompt.toLowerCase();
    const resources = this.detectResources(lower);

    const missing: SecurityFinding[] = [];
    const riskyFindings: SecurityFinding[] = [];
    const mentioned: SecurityFinding[] = [];

    // Check for risky patterns
    if (lower.includes('public') && (lower.includes('s3') || lower.includes('bucket') || lower.includes('database') || lower.includes('db') || lower.includes('storage'))) {
      riskyFindings.push({
        id: 'c-risk-public',
        label: 'Public Resource Declaration',
        description: 'Storage or persistence resource is explicitly configured as public.',
        severity: 'critical',
        dimension: 'Data Protection',
        source: 'rule',
        riskyStatement: 'Public data resource configuration',
        whyItMatters: 'Public cloud data resources lead to unauthenticated data exfiltration.',
        clause: 'Enforce private network scoping and block public access.',
        fix: 'Block all public access and route through authenticated gateway.'
      });
    }

    if (lower.includes('0.0.0.0/0') || lower.includes('anywhere') || lower.includes('open to all') || (lower.includes('ssh') && (lower.includes('public') || lower.includes('unrestricted') || lower.includes('open to internet')))) {
      riskyFindings.push({
        id: 'c-risk-cidr',
        label: 'Unrestricted Network Ingress (0.0.0.0/0)',
        description: 'Network listener open to all IP addresses without restriction.',
        severity: 'critical',
        dimension: 'Network Security',
        source: 'rule',
        riskyStatement: '0.0.0.0/0 open ingress',
        whyItMatters: 'Permits untrusted Internet entities to probe open server ports.',
        clause: 'Restrict ingress Security Group rules to specific trusted CIDRs.',
        fix: 'Eliminate 0.0.0.0/0 ingress; bind to private VPC CIDR.'
      });
    }

    if (lower.includes('*:*') || lower.includes('wildcard') || lower.includes('administratoraccess') || lower.includes('admin access') || lower.includes('full access') || lower.includes('action: "*"') || lower.includes('resource: "*"')) {
      riskyFindings.push({
        id: 'c-risk-iam-wildcard',
        label: 'Wildcard IAM Permissions (*)',
        description: 'Role or policy grants unrestricted wildcard action or resource access.',
        severity: 'critical',
        dimension: 'Identity & Access Management',
        source: 'rule',
        riskyStatement: 'Wildcard Administrator / Full Access permissions',
        whyItMatters: 'Wildcard permissions violate least-privilege, allowing total account takeover if credentials leak.',
        clause: 'Restrict IAM permissions to explicit resource ARNs and specific API actions.',
        fix: 'Scope IAM policies strictly to required service actions and target ARNs.'
      });
    }

    if (lower.includes('access key') || lower.includes('secret key') || lower.includes('password=') || lower.includes('token=') || lower.includes('hardcoded') || lower.includes('credentials in code')) {
      riskyFindings.push({
        id: 'c-risk-credentials',
        label: 'Hardcoded Credentials / Secrets',
        description: 'Static access keys, passwords, or tokens declared in launch brief.',
        severity: 'critical',
        dimension: 'Secrets Management',
        source: 'rule',
        riskyStatement: 'Static credentials embedded in prompt configuration',
        whyItMatters: 'Hardcoded credentials risk exposure in code repos and deployment logs.',
        clause: 'Retrieve temporary credentials via IAM instance profiles or AWS Secrets Manager.',
        fix: 'Store secrets in AWS Secrets Manager and use IAM roles for instance credentials.'
      });
    }

    // Check missing controls
    const mentionsEncryption = lower.includes('encrypt') || lower.includes('kms') || lower.includes('sse');
    if (!mentionsEncryption) {
      missing.push({
        id: 'c-miss-enc',
        label: 'Encryption at Rest (KMS)',
        description: 'Data encryption at rest is not explicitly requested.',
        severity: 'high',
        dimension: 'Data Protection',
        tier: 'core',
        source: 'rule',
        whyItMatters: 'Protects stored records from unauthorized access if underlying storage media is compromised.',
        clause: 'Enable default encryption at rest using AWS KMS or service-managed keys.'
      });
    }

    const mentionsLogging = lower.includes('log') || lower.includes('trail') || lower.includes('monitor') || lower.includes('cloudwatch');
    if (!mentionsLogging) {
      missing.push({
        id: 'c-miss-log',
        label: 'Centralized Logging & CloudWatch',
        description: 'Logging and activity monitoring are not mentioned.',
        severity: 'medium',
        dimension: 'Logging & Monitoring',
        tier: 'clarify',
        source: 'rule',
        whyItMatters: 'Essential for incident detection and forensics.',
        clause: 'Enable AWS CloudTrail and forward service logs to CloudWatch Logs.'
      });
    }

    const mentionsLeastPrivilege = lower.includes('least-privilege') || lower.includes('least privilege') || lower.includes('scoped role') || lower.includes('granular policy');
    if (!lower.includes('iam') && !mentionsLeastPrivilege && !lower.includes('role')) {
      missing.push({
        id: 'c-miss-iam',
        label: 'Least-Privilege IAM Boundaries',
        description: 'Role access permissions and boundary constraints are unspecified.',
        severity: 'medium',
        dimension: 'Identity & Access Management',
        tier: 'core',
        source: 'rule',
        whyItMatters: 'Prevents lateral movement in the event of component compromise.',
        clause: 'Define minimal IAM execution roles with granular resource ARNs.'
      });
    }

    const mentionsPrivateSubnet = lower.includes('private subnet') || lower.includes('private vpc') || lower.includes('internal subnet') || lower.includes('isolated subnet');
    if (resources.some(r => r.id === 'ec2' || r.id === 'rds') && !mentionsPrivateSubnet && !lower.includes('vpc')) {
      missing.push({
        id: 'c-miss-vpc',
        label: 'VPC Private Subnet Isolation',
        description: 'Workload placement lacks dedicated private subnet isolation.',
        severity: 'high',
        dimension: 'Network Security',
        tier: 'core',
        source: 'rule',
        whyItMatters: 'Prevents direct external routing to internal databases and compute tiers.',
        clause: 'Deploy workloads within private VPC subnets with NAT Gateway egress.'
      });
    }

    // Mentioned controls
    if (lower.includes('private') || lower.includes('vpc') || mentionsPrivateSubnet) {
      mentioned.push({
        id: 'c-ment-vpc',
        label: 'Network Scoping Specified',
        description: 'Prompt specifies VPC or private network boundary.',
        severity: 'low',
        source: 'rule',
        dimension: 'Network Security'
      });
    }

    if (mentionsEncryption) {
      mentioned.push({
        id: 'c-ment-enc',
        label: 'Encryption Intent Declared',
        description: 'Explicit encryption requirement included in prompt.',
        severity: 'low',
        source: 'rule',
        dimension: 'Data Protection'
      });
    }

    if (mentionsLogging) {
      mentioned.push({
        id: 'c-ment-log',
        label: 'Logging & Auditing Declared',
        description: 'Audit trails or monitoring requirements declared.',
        severity: 'low',
        source: 'rule',
        dimension: 'Logging & Monitoring'
      });
    }

    if (mentionsLeastPrivilege) {
      mentioned.push({
        id: 'c-ment-iam',
        label: 'Least-Privilege Scoping Declared',
        description: 'Explicit least-privilege IAM configuration requested.',
        severity: 'low',
        source: 'rule',
        dimension: 'Identity & Access Management'
      });
    }

    // Compute risk score based on rules
    let baseScore = 20;
    if (riskyFindings.length > 0) baseScore += 45 + (riskyFindings.length - 1) * 20;
    if (missing.some(m => m.severity === 'high')) baseScore += 20;
    if (missing.some(m => m.severity === 'medium')) baseScore += 10;
    if (mentioned.length > 0) baseScore -= mentioned.length * 6;

    // A prompt with critical risky findings must never score below 60
    let riskScore = Math.min(95, Math.max(15, baseScore));
    if (riskyFindings.some(f => f.severity === 'critical')) {
      riskScore = Math.max(65, riskScore);
    }
    let riskLevel: RiskLevel = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 60) riskLevel = 'HIGH';
    else if (riskScore >= 40) riskLevel = 'MEDIUM';
    else if (riskScore >= 20) riskLevel = 'LOW';
    else riskLevel = 'MINIMAL';

    const totalControls = Math.max(1, mentioned.length + missing.length);
    const coverageScore = Math.round((mentioned.length / totalControls) * 100);

    return {
      id: `vec-res-${Date.now()}`,
      prompt,
      riskScore,
      riskLevel,
      coverageScore,
      confidenceScore: 84,
      resources: resources.length > 0 ? resources : [{ id: 'aws', label: 'AWS Infrastructure', category: 'General' }],
      mentioned,
      missing,
      riskyFindings,
      feedback: [
        riskyFindings.length > 0
          ? 'Critical exposure risks detected in configuration. Immediate remediation required before code generation.'
          : 'Infrastructure prompt analyzed. Several standard security baselines are missing from the specification.'
      ],
      createdAt: new Date().toISOString(),
      isDemo: true
    };
  }

  private detectResources(text: string): AnalysisResource[] {
    const list: AnalysisResource[] = [];
    if (text.includes('s3') || text.includes('bucket') || text.includes('object store') || text.includes('blob storage')) {
      list.push({ id: 's3', label: 'Amazon S3', category: 'Storage' });
    }
    if (text.includes('ec2') || text.includes('instance') || text.includes('server') || text.includes('virtual machine') || text.includes('vm')) {
      list.push({ id: 'ec2', label: 'Amazon EC2', category: 'Compute' });
    }
    if (text.includes('rds') || text.includes('database') || text.includes('postgres') || text.includes('mysql') || text.includes('aurora')) {
      list.push({ id: 'rds', label: 'Amazon RDS', category: 'Database' });
    }
    if (text.includes('load balancer') || text.includes('alb') || text.includes('nlb') || text.includes('elb')) {
      list.push({ id: 'alb', label: 'Application Load Balancer', category: 'Networking' });
    }
    if (text.includes('lambda') || text.includes('serverless') || text.includes('cloud function')) {
      list.push({ id: 'lambda', label: 'AWS Lambda', category: 'Serverless' });
    }
    if (text.includes('dynamodb') || text.includes('dynamo') || text.includes('nosql')) {
      list.push({ id: 'dynamodb', label: 'Amazon DynamoDB', category: 'Database' });
    }
    if (text.includes('vpc') || text.includes('subnet') || text.includes('cidr') || text.includes('security group')) {
      list.push({ id: 'vpc', label: 'Amazon VPC', category: 'Networking' });
    }
    if (text.includes('iam') || text.includes('role') || text.includes('policy') || text.includes('permission')) {
      list.push({ id: 'iam', label: 'AWS IAM', category: 'Security & Identity' });
    }
    return list;
  }
}

// Singleton adapter instance
export const defaultAnalyzer = new VectorMockAnalyzer();
