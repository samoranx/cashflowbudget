import { useState, useEffect, useCallback } from 'react';
import { parseStandardBankCSV, extractPayMonths } from '../utils/parseCSV';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [payMonths, setPayMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('Transactions.csv');

  const applyData = useCallback((csvText, name) => {
    const parsed = parseStandardBankCSV(csvText);
    setTransactions(parsed);
    setPayMonths(extractPayMonths(parsed));
    setFileName(name);
    setError(null);
  }, []);

  // Load the default CSV from public/ on mount
  useEffect(() => {
    setLoading(true);
    fetch('/Transactions.csv')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then(text => applyData(text, 'Transactions.csv'))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [applyData]);

  // File-picker handler — user selects any CSV from disk
  const loadFromFile = useCallback((file) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        applyData(e.target.result, file.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file'); setLoading(false); };
    reader.readAsText(file);
  }, [applyData]);

  return { transactions, payMonths, loading, error, fileName, loadFromFile };
}
