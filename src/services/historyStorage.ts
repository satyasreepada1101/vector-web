import type { AnalysisResult, RiskLevel } from '../types/analysis.ts';
import { SAMPLE_HISTORICAL_ANALYSES } from '../data/demoAnalysis.ts';

const STORAGE_KEY = 'vector_analysis_history_v1';
const SEED_FLAG_KEY = 'vector_history_seeded_v1';

class HistoryStorageService {
  private inMemoryItems: AnalysisResult[] = [];

  constructor() {
    this.init();
  }

  private isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private init() {
    if (this.isStorageAvailable()) {
      const existing = window.localStorage.getItem(STORAGE_KEY);
      const hasSeeded = window.localStorage.getItem(SEED_FLAG_KEY);
      
      if (!existing && !hasSeeded) {
        // Seed with sample data on first run
        this.saveAll(SAMPLE_HISTORICAL_ANALYSES);
        window.localStorage.setItem(SEED_FLAG_KEY, 'true');
      }
    } else {
      this.inMemoryItems = [...SAMPLE_HISTORICAL_ANALYSES];
    }
  }

  getAll(): AnalysisResult[] {
    if (this.isStorageAvailable()) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item): item is AnalysisResult => {
          return Boolean(
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.prompt === 'string' &&
            typeof item.riskScore === 'number' &&
            Array.isArray(item.resources) &&
            Array.isArray(item.missing) &&
            Array.isArray(item.riskyFindings)
          );
        });
      } catch {
        return [];
      }
    }
    return [...this.inMemoryItems];
  }

  save(result: AnalysisResult): void {
    const items = this.getAll();
    // Prepend new item or update if id matches
    const filtered = items.filter(i => i.id !== result.id);
    const updated = [result, ...filtered];
    this.saveAll(updated);
  }

  delete(id: string): void {
    const items = this.getAll().filter(i => i.id !== id);
    this.saveAll(items);
  }

  clear(): void {
    this.saveAll([]);
  }

  resetToDemo(): void {
    this.saveAll(SAMPLE_HISTORICAL_ANALYSES);
  }

  private saveAll(items: AnalysisResult[]): void {
    if (this.isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to persist history to localStorage', e);
      }
    }
    this.inMemoryItems = [...items];
  }

  filterAndSort(options: {
    search?: string;
    riskFilter?: RiskLevel | 'ALL';
    sortBy?: 'date_desc' | 'risk_desc' | 'coverage_asc';
  }): AnalysisResult[] {
    let list = this.getAll();

    if (options.search && options.search.trim()) {
      const query = options.search.toLowerCase().trim();
      list = list.filter(item =>
        item.prompt.toLowerCase().includes(query) ||
        item.resources.some(r => r.label.toLowerCase().includes(query))
      );
    }

    if (options.riskFilter && options.riskFilter !== 'ALL') {
      list = list.filter(item => item.riskLevel === options.riskFilter);
    }

    if (options.sortBy) {
      list.sort((a, b) => {
        if (options.sortBy === 'risk_desc') {
          return b.riskScore - a.riskScore;
        }
        if (options.sortBy === 'coverage_asc') {
          return a.coverageScore - b.coverageScore;
        }
        // date_desc
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }
}

export const historyStorage = new HistoryStorageService();
