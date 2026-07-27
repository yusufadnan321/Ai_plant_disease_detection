import { Compass, Home, ScanLine } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';
import LinkButton from '@/components/ui/LinkButton';

export default function NotFoundPage() {
  const { navigate } = useRouter();
  return (
    <div className="bg-grid flex min-h-[80vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-brand-200/50 animate-pulse-ring dark:bg-brand-900/40" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg">
            <Compass size={32} className="animate-spin-slow" />
          </span>
        </div>
        <p className="mt-8 font-display text-6xl font-extrabold text-gradient">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton to="/">
            <Home size={18} /> Back Home
          </LinkButton>
          <LinkButton to="/detect" variant="secondary">
            <ScanLine size={18} /> Detect Disease
          </LinkButton>
        </div>
        <button onClick={() => navigate('/')} className="mt-6 text-xs text-gray-400 underline-offset-2 hover:underline dark:text-gray-500">
          or return to the homepage
        </button>
      </div>
    </div>
  );
}
