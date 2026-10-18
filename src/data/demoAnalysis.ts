import type { AnalysisResult } from '../types/analysis.ts';

export const EXAMPLE_PROMPTS = {
  A: {
    title: 'Basic infrastructure',
    prompt: 'Create an S3 bucket for storing application documents.',
    description: 'Simple storage request missing encryption and access controls'
  },
  B: {
    title: 'Web application',
    prompt: 'Deploy an EC2 instance running a web application behind a load balancer, connect it to an RDS database, and store uploaded documents in S3.',
    description: 'Multi-tier web stack without network isolation or backup controls'
  },
  C: {
    title: 'Risky infrastructure',
    prompt: 'Create a public S3 bucket for customer documents and launch an EC2 instance with SSH open to 0.0.0.0/0.',
    description: 'High-exposure configuration with public bucket and open SSH ingress'
  }
};

export const DEMO_ANALYSIS_EXAMPLE_C: AnalysisResult = {
  id: 'vec-analysis-demo-c',
  prompt: 'Create a public S3 bucket for customer documents and launch an EC2 instance with SSH open to 0.0.0.0/0.',
  riskScore: 82,
  riskLevel: 'CRITICAL',
  coverageScore: 38,
  confidenceScore: 81,
  resources: [
    { id: 's3', label: 'Amazon S3', category: 'Storage' },
    { id: 'ec2', label: 'Amazon EC2', category: 'Compute' }
  ],
  mentioned: [
    {
      id: 'ment-1',
      label: 'Document Storage Provisioning',
      description: 'Designates object storage intent for application artifacts.',
      severity: 'low',
      source: 'rule',
      dimension: 'Storage'
    },
    {
      id: 'ment-2',
      label: 'Remote Administration Intent',
      description: 'Identifies remote host management requirement via SSH protocol.',
      severity: 'low',
      source: 'rule',
      dimension: 'Administration'
    }
  ],
  missing: [
    {
      id: 'miss-1',
      label: 'Encryption at Rest (KMS / SSE-S3)',
      description: 'The prompt does not explicitly require encryption for stored customer documents.',
      severity: 'high',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Unencrypted object stores risk plaintext exposure during unauthorized exfiltration or policy misconfiguration.',
      clause: 'Enable default SSE-S3 or customer-managed AWS KMS (SSE-KMS) encryption on the S3 bucket.'
    },
    {
      id: 'miss-2',
      label: 'Restricted Network Access & Security Groups',
      description: 'Network access restrictions are not clearly specified for the host instance.',
      severity: 'high',
      dimension: 'Network Security',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon EC2'],
      whyItMatters: 'Broad or unspecified network inbound rules leave ports exposed to automated vulnerability scanners.',
      clause: 'Attach a dedicated Security Group restricting inbound traffic to required application ports only.'
    },
    {
      id: 'miss-3',
      label: 'S3 Server Access & CloudTrail Logging',
      description: 'Logging and security audit monitoring requirements are missing.',
      severity: 'medium',
      dimension: 'Logging & Monitoring',
      tier: 'clarify',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Without access logging and object-level CloudTrail tracking, forensic investigation of data breaches is impossible.',
      clause: 'Enable S3 server access logging and route delivery to a dedicated, restricted log archive bucket.'
    },
    {
      id: 'miss-4',
      label: 'Least-Privilege IAM Instance Profile',
      description: 'The required permissions and scope of access for the EC2 instance are not specified.',
      severity: 'medium',
      dimension: 'Identity & Access Management',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon EC2'],
      whyItMatters: 'Instances running without bounded IAM profiles often default to overly permissive credentials or long-lived access keys.',
      clause: 'Assign an IAM instance profile with minimal permissions strictly limited to the necessary S3 bucket actions.'
    },
    {
      id: 'miss-5',
      label: 'Object Versioning and Deletion Protection',
      description: 'Data durability safeguards such as versioning and MFA delete are omitted.',
      severity: 'low',
      dimension: 'Data Protection',
      tier: 'harden',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Accidental deletions or ransomware overwriting can permanently destroy customer records without version history.',
      clause: 'Enable S3 Versioning and configure object lifecycle retention rules.'
    }
  ],
  riskyFindings: [
    {
      id: 'risk-1',
      label: 'Publicly Exposed S3 Bucket',
      description: 'The prompt explicitly requests a public S3 bucket for storing customer documents.',
      severity: 'critical',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      riskyStatement: 'public S3 bucket for customer documents',
      whyItMatters: 'Storing customer data in a public bucket directly violates AWS Foundational Security Best Practices and exposes sensitive PII to unauthenticated Internet traffic.',
      clause: 'Enforce S3 Block Public Access on bucket and account levels; use signed URLs or CloudFront OAC for authenticated access.',
      fix: 'Remove public bucket access and enable S3 Block Public Access.'
    },
    {
      id: 'risk-2',
      label: 'Unrestricted SSH Access (0.0.0.0/0)',
      description: 'Port 22 (SSH) is opened to the entire public Internet (0.0.0.0/0).',
      severity: 'critical',
      dimension: 'Network Security',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon EC2'],
      riskyStatement: 'SSH open to 0.0.0.0/0',
      whyItMatters: 'Unrestricted SSH port exposure invites continuous brute-force attacks, credential stuffing, and zero-day exploitation.',
      clause: 'Eliminate direct SSH from 0.0.0.0/0; require AWS Systems Manager Session Manager (SSM) or restrict ingress to a specific corporate VPN IP range.',
      fix: 'Replace 0.0.0.0/0 SSH ingress with AWS Systems Manager (SSM) Session Manager.'
    }
  ],
  feedback: [
    'The prompt contains an explicitly public S3 bucket and unrestricted SSH exposure. Several critical security requirements are not specified, including encryption at rest, restricted network access, and logging.'
  ],
  createdAt: '2026-10-17T21:40:00Z',
  isDemo: true
};

export const DEMO_ANALYSIS_EXAMPLE_B: AnalysisResult = {
  id: 'vec-analysis-demo-b',
  prompt: 'Deploy an EC2 instance running a web application behind a load balancer, connect it to an RDS database, and store uploaded documents in S3.',
  riskScore: 58,
  riskLevel: 'MEDIUM',
  coverageScore: 46,
  confidenceScore: 88,
  resources: [
    { id: 'ec2', label: 'Amazon EC2', category: 'Compute' },
    { id: 'alb', label: 'Application Load Balancer', category: 'Networking' },
    { id: 'rds', label: 'Amazon RDS', category: 'Database' },
    { id: 's3', label: 'Amazon S3', category: 'Storage' }
  ],
  mentioned: [
    {
      id: 'ment-b1',
      label: 'Reverse Proxy & Load Balancing',
      description: 'Deploys an Application Load Balancer to terminate and distribute web tier traffic.',
      severity: 'low',
      source: 'rule',
      dimension: 'Architecture'
    },
    {
      id: 'ment-b2',
      label: 'Separation of Database and Compute',
      description: 'Decouples application runtime on EC2 from managed persistence on RDS.',
      severity: 'low',
      source: 'rule',
      dimension: 'Architecture'
    }
  ],
  missing: [
    {
      id: 'miss-b1',
      label: 'HTTPS / TLS Listener on Load Balancer',
      description: 'No SSL/TLS certificate or encrypted listener is mentioned for client ingress.',
      severity: 'high',
      dimension: 'Network Security',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Application Load Balancer'],
      whyItMatters: 'Unencrypted HTTP transmission allows eavesdropping and credential theft on network transit paths.',
      clause: 'Configure HTTPS (port 443) listener with AWS Certificate Manager (ACM) TLS 1.3 certificate.'
    },
    {
      id: 'miss-b2',
      label: 'RDS Storage Encryption (AWS KMS)',
      description: 'Database storage encryption is omitted from the specification.',
      severity: 'high',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon RDS'],
      whyItMatters: 'Unencrypted database volumes fail compliance frameworks (SOC2, HIPAA) and expose persistent disk backups.',
      clause: 'Enable storage encryption on the RDS instance using an AWS KMS customer-managed key.'
    },
    {
      id: 'miss-b3',
      label: 'VPC Multi-Tier Subnet Isolation',
      description: 'Subnet placement for database and compute instances is not defined.',
      severity: 'medium',
      dimension: 'Network Security',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon EC2', 'Amazon RDS'],
      whyItMatters: 'Databases and internal app servers should never reside in public subnets with direct Internet gateways.',
      clause: 'Deploy EC2 instances in private application subnets and RDS in isolated database subnets without Internet routing.'
    },
    {
      id: 'miss-b4',
      label: 'RDS Automated Backups & Multi-AZ',
      description: 'Disaster recovery and failover configurations are absent.',
      severity: 'medium',
      dimension: 'Resilience',
      tier: 'clarify',
      source: 'rule',
      appliesTo: ['Amazon RDS'],
      whyItMatters: 'Single-AZ database deployments without automated snapshots suffer downtime during hardware faults.',
      clause: 'Enable RDS Multi-AZ replication and configure automated daily backups with 14-day retention.'
    },
    {
      id: 'miss-b5',
      label: 'S3 Block Public Access & KMS Encryption',
      description: 'S3 bucket controls for uploaded documents are unspecified.',
      severity: 'medium',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Application upload buckets need strict access policies to avoid becoming unintended data leak vectors.',
      clause: 'Enable S3 Block Public Access and SSE-KMS default encryption on the document upload bucket.'
    }
  ],
  riskyFindings: [],
  feedback: [
    'The multi-tier architecture separates compute, database, and object storage, but lacks vital network tiering, TLS termination, and storage encryption specifications.'
  ],
  createdAt: '2026-10-17T20:15:00Z',
  isDemo: true
};

export const DEMO_ANALYSIS_EXAMPLE_A: AnalysisResult = {
  id: 'vec-analysis-demo-a',
  prompt: 'Create an S3 bucket for storing application documents.',
  riskScore: 45,
  riskLevel: 'MEDIUM',
  coverageScore: 25,
  confidenceScore: 85,
  resources: [
    { id: 's3', label: 'Amazon S3', category: 'Storage' }
  ],
  mentioned: [
    {
      id: 'ment-a1',
      label: 'Object Storage Declaration',
      description: 'Specifies S3 bucket target for application artifacts.',
      severity: 'low',
      source: 'rule',
      dimension: 'Storage'
    }
  ],
  missing: [
    {
      id: 'miss-a1',
      label: 'S3 Block Public Access',
      description: 'Bucket public access controls are not explicitly declared.',
      severity: 'high',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Without explicitly blocking public access, bucket policies can inadvertently expose sensitive documents.',
      clause: 'Enable all four S3 Block Public Access settings on the bucket.'
    },
    {
      id: 'miss-a2',
      label: 'Default Encryption at Rest',
      description: 'Server-side encryption is not requested in the prompt.',
      severity: 'high',
      dimension: 'Data Protection',
      tier: 'core',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Stored files should be encrypted at rest to safeguard against unauthorized access to physical media.',
      clause: 'Configure SSE-KMS or SSE-S3 default encryption on the S3 bucket.'
    },
    {
      id: 'miss-a3',
      label: 'Access Logging & Audit Trail',
      description: 'Access logging is not configured.',
      severity: 'medium',
      dimension: 'Logging & Monitoring',
      tier: 'clarify',
      source: 'rule',
      appliesTo: ['Amazon S3'],
      whyItMatters: 'Audit trails are essential for detecting anomalous data transfers and compliance audits.',
      clause: 'Enable S3 server access logging directed to a centralized log bucket.'
    }
  ],
  riskyFindings: [],
  feedback: [
    'The basic S3 prompt omits essential bucket baseline security controls, including public access prevention and encryption at rest.'
  ],
  createdAt: '2026-10-17T18:00:00Z',
  isDemo: true
};

export const SAMPLE_HISTORICAL_ANALYSES: AnalysisResult[] = [
  DEMO_ANALYSIS_EXAMPLE_C,
  DEMO_ANALYSIS_EXAMPLE_B,
  DEMO_ANALYSIS_EXAMPLE_A,
  {
    id: 'vec-analysis-demo-d',
    prompt: 'Provision an AWS Lambda function with API Gateway to process payment webhooks and store transaction data in DynamoDB.',
    riskScore: 35,
    riskLevel: 'LOW',
    coverageScore: 68,
    confidenceScore: 92,
    resources: [
      { id: 'lambda', label: 'AWS Lambda', category: 'Serverless' },
      { id: 'apigw', label: 'Amazon API Gateway', category: 'Networking' },
      { id: 'dynamodb', label: 'Amazon DynamoDB', category: 'Database' }
    ],
    mentioned: [
      { id: 'm-d1', label: 'Serverless architecture', description: 'Serverless compute layer', severity: 'low' },
      { id: 'm-d2', label: 'API Gateway integration', description: 'Managed HTTP entrypoint', severity: 'low' }
    ],
    missing: [
      {
        id: 'miss-d1',
        label: 'API Gateway Authorization & Throttling',
        description: 'Webhook endpoint does not specify request throttling or signature validation.',
        severity: 'medium',
        clause: 'Implement API Gateway rate limiting and HMAC webhook signature verification.'
      },
      {
        id: 'miss-d2',
        label: 'DynamoDB KMS Customer Managed Keys',
        description: 'Table encryption relies on AWS default rather than customer-managed KMS key.',
        severity: 'low',
        clause: 'Configure AWS KMS CMK encryption for DynamoDB table at rest.'
      }
    ],
    riskyFindings: [],
    feedback: [
      'Serverless payment processing workflow is well scoped, but requires signature verification and request throttling safeguards.'
    ],
    createdAt: '2026-10-16T14:30:00Z',
    isDemo: true
  }
];
