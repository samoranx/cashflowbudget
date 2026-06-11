import { useState, useEffect } from 'react';
import { parseStandardBankCSV, extractPayMonths } from '../utils/parseCSV';
import type { Transaction } from '../types';

interface UseTransactionsReturn {
  transactions: Transaction[];
  payMonths: string[];
  loading: boolean;
  error: string | null;
  fileName: string;
  loadFromFile: (file: File) => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payMonths, setPayMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('Transactions.csv');

  useEffect(() => {
    fetch('/Transactions.csv')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => {
        const parsed = parseStandardBankCSV(text);
        setTransactions(parsed);
        setPayMonths(extractPayMonths(parsed));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load CSV');
        setLoading(false);
      });
  }, []);

  function loadFromFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const parsed = parseStandardBankCSV(text);
        setTransactions(parsed);
        setPayMonths(extractPayMonths(parsed));
        setError(null);
      }
    };
    reader.readAsText(file);
  }

  return { transactions, payMonths, loading, error, fileName, loadFromFile };
}
