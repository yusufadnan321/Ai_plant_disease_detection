import { useEffect, useState } from 'react';
import { Leaf, Moon, Sun, Github, Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from '@/context/RouterContext';

const links = [
  { label: 'Home', to: '/' },
  { label: 'Detect Disease', to: '/detect' },
  { label: 'Supported Crops', to: '/crops' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { path, navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const isActive = (to) => (to === '/' ? path === '/' : path.startsWith(to));

  const go = (to) => {
    setMobileOpen(false);
    navigate(to);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/90'
          : 'border-b border-transparent bg-white/0 dark:bg-gray-950/0'
      }`}
    >
      <nav className="container-app flex h-16 items-center justify-between gap-4 lg:h-20">
        <button onClick={() => go('/')} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
            <Leaf size={20} className="animate-leaf-sway" />
          </span>
          <span className="hidden text-left sm:block">
            <span className="block font-display text-sm font-bold leading-tight text-gray-900 dark:text-white">
              AI Plant Disease
            </span>
            <span className="block text-[11px] font-medium leading-tight text-brand-600 dark:text-brand-400">
              Detection System
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <button
              key={l.to}
              onClick={() => go(l.to)}
              className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(l.to)
                  ? 'text-brand-700 dark:text-brand-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 lg:hidden dark:border-gray-700 dark:text-gray-300"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-gray-100 bg-white lg:hidden dark:border-gray-800 dark:bg-gray-950">
          <div className="container-app flex flex-col gap-1 py-4">
            {links.map((l) => (
              <button
                key={l.to}
                onClick={() => go(l.to)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive(l.to)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                {l.label}
              </button>
            ))}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
