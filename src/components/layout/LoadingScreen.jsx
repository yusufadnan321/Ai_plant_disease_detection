import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

export default function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1800);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-brand-200/60 animate-pulse-ring dark:bg-brand-900/40" />
        <span
          className="absolute inset-0 rounded-full bg-brand-300/40 animate-pulse-ring dark:bg-brand-800/30"
          style={{ animationDelay: '0.5s' }}
        />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/40">
          <Leaf size={32} className="animate-leaf-sway" />
        </span>
      </div>
      <p className="mt-8 font-display text-lg font-bold text-gray-900 dark:text-white">
        AI Plant Disease Detection
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading your smart agriculture assistant…</p>
      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div className="h-full w-1/3 rounded-full bg-brand-500 animate-progress" />
      </div>
    </div>
  );
}
