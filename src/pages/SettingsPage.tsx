import React, { useState } from 'react';
import { 
  Palette, 
  Cpu, 
  Info, 
  Database, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  RotateCcw,
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { historyStorage } from '../services/historyStorage.ts';
import { useToast } from '../components/ui/Toast.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

interface SettingsPageProps {
  onRefreshData?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshData }) => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [deepScanEndpoint, setDeepScanEndpoint] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    toast('Settings saved locally', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleResetData = () => {
    historyStorage.resetToDemo();
    if (onRefreshData) onRefreshData();
    toast('Local sample data reloaded', 'info');
  };

  const handleClearData = () => {
    if (window.confirm('Clear all local analysis history?')) {
      historyStorage.clear();
      if (onRefreshData) onRefreshData();
      toast('Local history cleared', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#283638] tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#737A72] mt-1">
          Configure Vector analysis parameters, diagnostic engines, and local data persistence.
        </p>
      </div>

      {/* Appearance Section */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5E2D8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E2D8]">
          <Palette className="w-4 h-4 text-[#49686C]" />
          <h2 className="text-base font-bold text-[#283638]">Appearance & Theme</h2>
        </div>

        <p className="text-xs text-[#737A72]">
          Choose your interface theme. Both themes preserve Vector's primary teal, mustard-yellow risk accents, and high-contrast technical readability.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Light Mode Option */}
          <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            theme === 'light'
              ? 'border-[#49686C] bg-[#F0F5F5] ring-1 ring-[#49686C]'
              : 'border-[#E5E2D8] bg-[#FAFAF8] hover:bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
                className="text-[#49686C] focus:ring-[#49686C]"
              />
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E5E2D8] text-[#D1B653]">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#283638] block">Vector Classic (Light)</span>
                <span className="text-[11px] text-[#737A72]">Warm ivory #F6F4EC canvas & teal typography</span>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-[#49686C]" />}
          </label>

          {/* Dark Mode Option */}
          <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            theme === 'dark'
              ? 'border-[#49686C] bg-[#F0F5F5] ring-1 ring-[#49686C]'
              : 'border-[#E5E2D8] bg-[#FAFAF8] hover:bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
                className="text-[#49686C] focus:ring-[#49686C]"
              />
              <div className="p-2 rounded-lg bg-[#283638] text-white">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#283638] block">Vector Obsidian (Dark)</span>
                <span className="text-[11px] text-[#737A72]">Deep slate teal-black canvas & high contrast</span>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-[#49686C]" />}
          </label>
        </div>
      </div>

      {/* Analysis Engine Settings */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5E2D8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E2D8]">
          <Cpu className="w-4 h-4 text-[#49686C]" />
          <h2 className="text-base font-bold text-[#283638]">Analysis Engine Configuration</h2>
        </div>

        <div className="p-4 rounded-lg bg-[#F4F9F1] border border-[#CFE2C8] space-y-1.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#3E6B33]" />
            <span className="text-xs font-bold text-[#2D5A27]">
              Active Engine: Offline Rule-Based Analyzer
            </span>
          </div>
          <p className="text-xs text-[#283638] leading-relaxed pl-6">
            The core Vector analyzer operates locally and deterministically. It checks input infrastructure prompts against AWS security rules without transmitting prompts to external third-party services.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold text-[#283638] block mb-1">
              Optional Deep Scan Backend Endpoint
            </label>
            <input
              type="text"
              placeholder="e.g. http://localhost:8080/v1/deep-scan (optional)"
              value={deepScanEndpoint}
              onChange={(e) => setDeepScanEndpoint(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E5E2D8] bg-[#FAFAF8] text-xs font-mono text-[#283638] focus:bg-white focus:outline-none focus:border-[#49686C]"
            />
            <span className="text-[11px] text-[#737A72] block mt-1">
              Optional endpoint for multi-pass semantic AI scanning. When unconfigured, the application relies exclusively on offline rule-based evaluation.
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-[#49686C] text-white text-xs font-bold rounded-lg hover:bg-[#30494B] transition-colors"
            >
              {isSaved ? 'Saved' : 'Save Engine Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Local Data Management */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5E2D8] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E2D8]">
          <Database className="w-4 h-4 text-[#49686C]" />
          <h2 className="text-base font-bold text-[#283638]">Local Data & Storage</h2>
        </div>

        <p className="text-xs text-[#737A72]">
          All analysis history and prompts are stored locally within your browser's private web storage. No data is stored in remote databases.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E2D8] bg-white hover:bg-[#F6F4EC] text-xs font-semibold text-[#283638] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#49686C]" />
            <span>Reload Sample Demo History</span>
          </button>
          <button
            type="button"
            onClick={handleClearData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#F0C4BF] bg-white hover:bg-[#FDF2F0] text-xs font-semibold text-[#B94D42] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Local Storage</span>
          </button>
        </div>
      </div>

      {/* Application Information */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E5E2D8] shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E2D8]">
          <Info className="w-4 h-4 text-[#49686C]" />
          <h2 className="text-base font-bold text-[#283638]">About Vector</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[#737A72] block">Application</span>
            <span className="font-bold text-[#283638]">Vector — AWS Infrastructure Prompt Security</span>
          </div>
          <div>
            <span className="text-[#737A72] block">Version</span>
            <span className="font-mono font-bold text-[#283638]">v0.9.4</span>
          </div>
          <div>
            <span className="text-[#737A72] block">Engine Type</span>
            <span className="font-bold text-[#283638]">Deterministic NLP Rule Evaluation</span>
          </div>
          <div>
            <span className="text-[#737A72] block">Execution Context</span>
            <span className="font-bold text-[#283638]">Private Local Evaluation (Zero Egress)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
