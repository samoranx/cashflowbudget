import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cashflow-budget-goals';
const DEFAULT_BUDGET = 60000;

interface BudgetMap {
  [month: string]: number;
}

interface UseBudgetReturn {
  budgets: BudgetMap;
  getBudget: (month: string) => number;
  setMonthBudget: (month: string, value: number) => void;
  resetMonth: (month: string) => void;
  resetAll: () => void;
  DEFAULT_BUDGET: number;
}

function load(): BudgetMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BudgetMap) : {};
  } catch {
    return {};
  }
}

function save(data: BudgetMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export function useBudget(): UseBudgetReturn {
  const [budgets, setBudgets] = useState<BudgetMap>(() => load());

  const getBudget = useCallback(
    (month: string) => budgets[month] ?? DEFAULT_BUDGET,
    [budgets],
  );

  const setMonthBudget = useCallback((month: string, value: number) => {
    setBudgets(prev => {
      const next = { ...prev, [month]: value };
      save(next);
      return next;
    });
  }, []);

  const resetMonth = useCallback((month: string) => {
    setBudgets(prev => {
      const next = { ...prev };
      delete next[month];
      save(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setBudgets({});
    save({});
  }, []);

  return { budgets, getBudget, setMonthBudget, resetMonth, resetAll, DEFAULT_BUDGET };
}
