import { useState, useCallback } from 'react';

const STORAGE_KEY = 'cashflow-budget-goals';
const DEFAULT_BUDGET = 60000;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function useBudget() {
  const [budgets, setBudgets] = useState(() => load());

  const getBudget = useCallback(
    (month) => budgets[month] ?? DEFAULT_BUDGET,
    [budgets]
  );

  const setMonthBudget = useCallback((month, value) => {
    setBudgets(prev => {
      const next = { ...prev, [month]: value };
      save(next);
      return next;
    });
  }, []);

  const resetMonth = useCallback((month) => {
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
