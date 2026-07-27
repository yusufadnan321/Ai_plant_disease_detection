import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const HistoryContext = createContext(null);
const STORAGE_KEY = 'pdd-history';

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((items) => {
    setHistory(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, []);

  const addEntry = useCallback(
    (entry) => {
      const item = {
        ...entry,
        id: entry.id || Date.now().toString(),
        date: entry.date || new Date().toISOString(),
      };
      setHistory((prev) => {
        const next = [item, ...prev].slice(0, 24);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    []
  );

  const removeEntry = useCallback((id) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    persist([]);
  }, [persist]);

  return (
    <HistoryContext.Provider value={{ history, addEntry, removeEntry, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider');
  return ctx;
}
