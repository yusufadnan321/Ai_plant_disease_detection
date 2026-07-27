export default function ScanOverlay({ active = true }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <div className="absolute inset-x-0 h-1 animate-scan bg-gradient-to-r from-transparent via-brand-400 to-transparent shadow-[0_0_18px_4px_rgba(34,197,94,0.5)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-400/5 via-transparent to-brand-400/5" />
      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
        AI Scanning
      </div>
      <div className="absolute right-4 top-4 h-4 w-4 border-t-2 border-r-2 border-brand-400" />
      <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-brand-400" />
      <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-brand-400" />
    </div>
  );
}
