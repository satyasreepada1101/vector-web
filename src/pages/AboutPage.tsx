import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Layers, 
  Zap, 
  Terminal, 
  Server, 
  Database, 
  Key, 
  ChevronRight,
  ShieldAlert,
  Check,
  RefreshCw
} from 'lucide-react';

interface AboutPageProps {
  onStartAnalysis: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onStartAnalysis }) => {
  // Interactive visualization animation state
  const [animStep, setAnimStep] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollToWorkflow = () => {
    const el = document.getElementById('workflow-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 lg:space-y-24 max-w-6xl mx-auto pb-12 antialiased">
      {/* 1. HERO SECTION */}
      <section className="relative pt-2 sm:pt-6 lg:pt-8" aria-label="Hero">
        {/* Subtle decorative geometric background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#49686C]/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-10 w-72 h-72 bg-[#D1B653]/10 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4EBDD] text-[#30494B] border border-[#CFE2C8] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#49686C] animate-pulse" />
              <span>Vector · Pre-Generation Security Diagnosis</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#283638] tracking-tight leading-[1.15]">
              Better infrastructure starts <br className="hidden sm:inline" />
              <span className="text-[#49686C] underline decoration-[#D1B653] decoration-wavy decoration-2 underline-offset-6">
                before the first line
              </span> of code.
            </h1>

            <p className="text-base sm:text-lg text-[#737A72] max-w-xl leading-relaxed">
              Identify security gaps, risky exposures, and missing controls in natural-language AWS infrastructure prompts before they become part of generated Terraform, CDK, or CloudFormation templates.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onStartAnalysis}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#49686C] hover:bg-[#30494B] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] group"
              >
                <span>Analyze a Prompt</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToWorkflow}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-[#F6F4EC] text-[#283638] border border-[#E5E2D8] hover:border-[#CDC9BC] text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span>How It Works</span>
                <ChevronRight className="w-4 h-4 text-[#737A72]" />
              </button>
            </div>

            {/* Quick feature checklist */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-[#737A72]">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#49686C]" />
                <span>Deterministic NLP analysis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#49686C]" />
                <span>AWS Well-Architected baselines</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#49686C]" />
                <span>Zero prompt egress (private)</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visualization: Interactive Live Prompt Examination Card */}
          <div 
            className="lg:col-span-5 relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E2D8] shadow-lg p-5 sm:p-6 space-y-4 relative overflow-hidden">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D8]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B94D42]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#D1B653]/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#688E5E]/70" />
                  <span className="text-[11px] font-mono text-[#737A72] ml-2">vector-live-scan.aws</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F6F4EC] text-[#49686C] font-semibold">
                    Step {animStep + 1}/4
                  </span>
                </div>
              </div>

              {/* Sample Prompt Stream */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#737A72]">Input Infrastructure Brief</span>
                <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E2D8] text-xs font-mono text-[#283638] leading-relaxed relative">
                  <span>Create an </span>
                  <span className="bg-[#E4EBDD] text-[#30494B] px-1 py-0.5 rounded font-bold">S3 bucket</span>
                  <span> for customer files and launch an </span>
                  <span className="bg-[#E4EBDD] text-[#30494B] px-1 py-0.5 rounded font-bold">EC2 instance</span>
                  <span> with </span>
                  <span className="bg-[#FDF2F0] text-[#B94D42] px-1 py-0.5 rounded font-bold">SSH open to 0.0.0.0/0</span>.
                </div>
              </div>

              {/* Step 1: Resource Detection */}
              <div className={`transition-all duration-300 ${animStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#283638] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#49686C]" /> Recognized Resources
                  </span>
                  <span className="text-[11px] text-[#49686C] font-mono">2 detected</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded bg-[#F0F5F5] border border-[#CFDFE1] text-[11px] font-mono font-medium text-[#49686C] flex items-center gap-1">
                    <Database className="w-3 h-3" /> Amazon S3 (Storage)
                  </span>
                  <span className="px-2 py-1 rounded bg-[#F0F5F5] border border-[#CFDFE1] text-[11px] font-mono font-medium text-[#49686C] flex items-center gap-1">
                    <Server className="w-3 h-3" /> Amazon EC2 (Compute)
                  </span>
                </div>
              </div>

              {/* Step 2: Security Findings Triggered */}
              <div className={`transition-all duration-300 ${animStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#283638] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D1B653]" /> Evaluation Findings
                  </span>
                  <span className="text-[11px] text-[#B94D42] font-semibold font-mono">CRITICAL RISK</span>
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-[#FDF2F0] border border-[#F0C4BF] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#B94D42] shrink-0" />
                      <span className="font-semibold text-[#B94D42]">Unrestricted SSH (0.0.0.0/0)</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#B94D42]">Critical</span>
                  </div>
                  <div className="p-2 rounded bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#C96839] shrink-0" />
                      <span className="font-semibold text-[#C96839]">Missing SSE-KMS Encryption</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase text-[#C96839]">High</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Hardened Prompt Output */}
              <div className={`transition-all duration-300 ${animStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-1'}`}>
                <div className="p-2.5 rounded-lg bg-[#F4F9F1] border border-[#CFE2C8] space-y-1 text-xs text-[#2D5A27]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3E6B33]" />
                    <span>Hardened Remediation Clause Generated</span>
                  </div>
                  <p className="text-[11px] font-mono leading-relaxed pl-5">
                    + Enforce S3 Block Public Access and SSM Session Manager instead of direct SSH ingress.
                  </p>
                </div>
              </div>

              {/* Interactive step indicator pill */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E5E2D8] text-[11px] text-[#737A72]">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setAnimStep(step)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        animStep === step ? 'w-6 bg-[#49686C]' : 'w-2 bg-[#E5E2D8] hover:bg-[#CDC9BC]'
                      }`}
                      aria-label={`Show step ${step + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAnimStep((s) => (s + 1) % 4)}
                  className="inline-flex items-center gap-1 text-[#49686C] hover:text-[#30494B] font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Next simulation step</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM SECTION */}
      <section className="bg-white rounded-2xl border border-[#E5E2D8] p-6 sm:p-10 shadow-xs space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-[#D1B653] uppercase tracking-wider">
            The Fundamental Gap
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#283638] tracking-tight">
            Good prompts don’t always mean secure infrastructure.
          </h2>
          <p className="text-sm text-[#737A72] leading-relaxed">
            When developers and AI code assistants translate natural-language prompts into Terraform, CloudFormation, or CDK, they prioritize functional completeness over defensive hardening.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-[#FAFAF8] border border-[#E5E2D8] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F0] text-[#B94D42] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#283638]">Omitted Defensive Controls</h3>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Requests like “host a web app on EC2 with an S3 bucket” rarely mention KMS encryption, S3 Block Public Access, or VPC flow logs. Generated code inherits the omission.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAFAF8] border border-[#E5E2D8] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEFCE8] text-[#D1B653] flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#283638]">Overly Broad IAM & Ingress</h3>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Default prompts often produce wildcard permissions (<code className="text-[#30494B]">Resource: "*"</code>) or wide-open Security Groups (<code className="text-[#30494B]">0.0.0.0/0</code>) just to ensure immediate connectivity.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#FAFAF8] border border-[#E5E2D8] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#F0F5F5] text-[#49686C] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#283638]">Fix Before Code Generation</h3>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Remediating misconfigurations in Terraform state files or deployed clouds costs orders of magnitude more than inserting precision clauses into the initial prompt.
            </p>
          </div>
        </div>
      </section>

      {/* 3. HOW VECTOR WORKS (4 CONNECTED STEPS) */}
      <section id="workflow-section" className="space-y-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#49686C] uppercase tracking-wider">
            Diagnostic Workflow
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#283638] tracking-tight">
            How Vector Works
          </h2>
          <p className="text-sm text-[#737A72]">
            Four systematic stages that transform ambiguous infrastructure requests into security-hardened briefs.
          </p>
        </div>

        {/* 4 Steps Grid: Horizontal on Desktop, Vertical on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs flex flex-col justify-between relative group hover:border-[#49686C] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#F0F5F5] text-[#49686C] font-mono font-bold text-xs flex items-center justify-center">
                  01
                </span>
                <span className="text-[11px] font-mono font-medium text-[#737A72]">Input</span>
              </div>
              <h3 className="text-base font-bold text-[#283638]">Describe</h3>
              <p className="text-xs text-[#737A72] leading-relaxed">
                Provide your raw natural-language AWS infrastructure prompt or paste your intended architectural scope.
              </p>
            </div>
            <div className="pt-4 text-[11px] font-mono text-[#49686C]">
              → Natural language input
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs flex flex-col justify-between relative group hover:border-[#49686C] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#F0F5F5] text-[#49686C] font-mono font-bold text-xs flex items-center justify-center">
                  02
                </span>
                <span className="text-[11px] font-mono font-medium text-[#737A72]">Scan</span>
              </div>
              <h3 className="text-base font-bold text-[#283638]">Analyze</h3>
              <p className="text-xs text-[#737A72] leading-relaxed">
                Vector parses AWS resource entities (S3, EC2, RDS, IAM) and evaluates your prompt against baseline security rules.
              </p>
            </div>
            <div className="pt-4 text-[11px] font-mono text-[#49686C]">
              → Deterministic NLP
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs flex flex-col justify-between relative group hover:border-[#49686C] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#F0F5F5] text-[#49686C] font-mono font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <span className="text-[11px] font-mono font-medium text-[#737A72]">Diagnose</span>
              </div>
              <h3 className="text-base font-bold text-[#283638]">Identify</h3>
              <p className="text-xs text-[#737A72] leading-relaxed">
                Review discovered risks, missing controls, severity scores, and Well-Architected remediation clauses.
              </p>
            </div>
            <div className="pt-4 text-[11px] font-mono text-[#49686C]">
              → Prioritized findings
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs flex flex-col justify-between relative group hover:border-[#49686C] transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-lg bg-[#F4F9F1] text-[#3E6B33] font-mono font-bold text-xs flex items-center justify-center">
                  04
                </span>
                <span className="text-[11px] font-mono font-medium text-[#3E6B33]">Harden</span>
              </div>
              <h3 className="text-base font-bold text-[#283638]">Improve</h3>
              <p className="text-xs text-[#737A72] leading-relaxed">
                Select desired recommendations and copy the automatically synthesized, security-hardened prompt.
              </p>
            </div>
            <div className="pt-4 text-[11px] font-mono text-[#3E6B33]">
              → Hardened output
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT MAKES VECTOR USEFUL */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-bold text-[#49686C] uppercase tracking-wider">
            Engine Advantages
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#283638] tracking-tight">
            What makes Vector useful?
          </h2>
          <p className="text-sm text-[#737A72]">
            Designed exclusively for engineers and platform teams adopting AI-assisted infrastructure provisioning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#49686C]" />
              <h3 className="text-sm font-bold text-[#283638]">Understandable Findings</h3>
            </div>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Every finding explains exactly why the risk matters, what cloud vulnerability it exposes, and which AWS services are impacted in simple, direct engineering terms.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#3E6B33]" />
              <h3 className="text-sm font-bold text-[#283638]">Practical Recommendations</h3>
            </div>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Concrete clauses aligned with the AWS Well-Architected Framework and CIS Benchmarks that you can append with a single click.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D1B653]" />
              <h3 className="text-sm font-bold text-[#283638]">Transparent Analysis</h3>
            </div>
            <p className="text-xs text-[#737A72] leading-relaxed">
              No black-box hallucinations. Vector uses deterministic pattern matching and rule catalogs so findings are completely repeatable and auditable.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E5E2D8] shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#49686C]" />
              <h3 className="text-sm font-bold text-[#283638]">Improved Security-Oriented Prompts</h3>
            </div>
            <p className="text-xs text-[#737A72] leading-relaxed">
              Generate refined prompts ready to paste directly into GitHub Copilot, Amazon Q, Claude, or ChatGPT to generate compliant Infrastructure as Code.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ANALYSIS APPROACH (HONEST DISCLOSURE) */}
      <section className="bg-white rounded-2xl border border-[#E5E2D8] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#E5E2D8]">
          <Cpu className="w-4 h-4 text-[#49686C]" />
          <h2 className="text-base font-bold text-[#283638]">Analysis Approach & Technical Honesty</h2>
        </div>

        <div className="space-y-3 text-xs text-[#737A72] leading-relaxed">
          <p>
            Vector operates on a <strong>deterministic, rule-based NLP engine</strong>. It parses recognized AWS services, network topologies, storage declarations, and access modifiers from the prompt text, then cross-references them against our codified security rules catalog.
          </p>
          <p>
            The offline engine evaluates all checks in your browser session with <strong>zero external network calls</strong>. Your proprietary infrastructure requirements never leave your local environment.
          </p>
          <p className="text-[#30494B] font-medium bg-[#F6F4EC] p-3 rounded-lg border border-[#E5E2D8]">
            Note: An optional deep-scan backend endpoint can be configured in Settings for multi-pass semantic AI scanning. When unconfigured, the application relies exclusively on its deterministic offline rule engine without fabricating AI outputs.
          </p>
        </div>
      </section>

      {/* 6. RESPONSIBLE USE MESSAGING */}
      <section className="bg-[#FAFAF8] rounded-2xl border border-[#E5E2D8] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-[#283638]">
          <ShieldCheck className="w-5 h-5 text-[#49686C]" />
          <h2 className="text-base font-bold">A useful checkpoint, not a security guarantee.</h2>
        </div>

        <p className="text-xs text-[#737A72] leading-relaxed">
          Prompt diagnosis is an advisory pre-generation safeguard. Vector identifies potential omissions and risky configuration patterns based on supported AWS rules and the explicit information provided in your prompt text.
        </p>

        <p className="text-xs text-[#737A72] leading-relaxed">
          A low risk score does not guarantee that generated infrastructure is impenetrable, nor does prompt analysis replace static analysis of generated Terraform (tfsec, checkov), runtime configuration audits (AWS Config), or cloud security posture management (CSPM). Always review generated code and test environments before deploying to production.
        </p>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="bg-[#30494B] rounded-2xl p-8 sm:p-12 text-center text-white space-y-5 relative overflow-hidden shadow-lg">
        <div className="max-w-xl mx-auto space-y-3 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Make security part of the prompt.
          </h2>
          <p className="text-sm text-gray-200 leading-relaxed">
            Start with the infrastructure you want to build. Review potential security gaps before generating code.
          </p>
          <div className="pt-3">
            <button
              type="button"
              onClick={onStartAnalysis}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D1B653] hover:bg-[#bda241] text-[#283638] text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Analyze a Prompt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
      </section>
    </div>
  );
};
