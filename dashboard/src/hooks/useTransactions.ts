import { useState, useEffect, useCallback, useRef } from 'react';
import { parseSpreadsheet, extractPayMonths } from '../utils/parseXLSX';
import type { Transaction, BankAccount } from '../types';

const SPREADSHEET_URL = '/Transactions.xlsx';
const POLL_INTERVAL_MS = 30_000; // re-check every 30 seconds

export interface UseTransactionsReturn {
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  payMonths: string[];
  loading: boolean;
  error: string | null;
  lastSynced: Date | null;
  loadFromFile: (file: File) => void;
  refreshNow: () => void;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [payMonths, setPayMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Track last ETag/Last-Modified to avoid re-parsing unchanged files
  const lastETagRef = useRef<string | null>(null);

  const applyParsed = useCallback((buffer: Uint8Array) => {
    const { transactions: txs, bankAccounts: accts, payMonths: months } = parseSpreadsheet(buffer);
    setTransactions(txs);
    setBankAccounts(accts);
    setPayMonths(months);
    setLastSynced(new Date());
    setError(null);
    setLoading(false);
  }, []);

  const fetchFromServer = useCallback(async (force = false) => {
    try {
      // HEAD first to cheaply check if the file changed
      if (!force) {
        const head = await fetch(SPREADSHEET_URL, { method: 'HEAD', cache: 'no-store' });
        const tag = head.headers.get('ETag') ?? head.headers.get('Last-Modified');
        if (tag && tag === lastETagRef.current) return; // no change
      }

      const res = await fetch(SPREADSHEET_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

      const tag = res.headers.get('ETag') ?? res.headers.get('Last-Modified');
      lastETagRef.current = tag;

      const buffer = await res.arrayBuffer();
      applyParsed(new Uint8Array(buffer));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load spreadsheet';
      setError(msg);
      setLoading(false);
    }
  }, [applyParsed]);

  // Initial load + polling
  useEffect(() => {
    fetchFromServer(true);
    const timer = setInterval(() => fetchFromServer(), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchFromServer]);

  // Manual file upload (accepts .xlsx)
  const loadFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const buf = e.target?.result;
      if (buf instanceof ArrayBuffer) applyParsed(new Uint8Array(buf));
    };
    reader.readAsArrayBuffer(file);
  }, [applyParsed]);

  const refreshNow = useCallback(() => fetchFromServer(true), [fetchFromServer]);

  return { transactions, bankAccounts, payMonths, loading, error, lastSynced, loadFromFile, refreshNow };
}

// Re-export so App can compute per-account pay months without a separate import
export { extractPayMonths };
