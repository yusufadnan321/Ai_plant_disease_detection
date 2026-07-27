import { Leaf, Github, Linkedin, Mail, Heart } from 'lucide-react';
import { useRouter } from '@/context/RouterContext';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Detect Disease', to: '/detect' },
  { label: 'Supported Crops', to: '/crops' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function Footer() {
  const { navigate } = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="container-app py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Leaf size={20} />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-gray-900 dark:text-white">AI Plant Disease</p>
                <p className="text-[11px] font-medium text-brand-600 dark:text-brand-400">Detection System</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Empowering farmers and agronomists with AI-powered plant disease detection, treatment recommendations, and prevention guidance.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="grid gap-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <button
                    onClick={() => navigate(l.to)}
                    className="text-sm text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              Developer
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Built with React, Tailwind CSS, and a convolutional neural network model trained on plant leaf imagery.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="mailto:hello@example.com"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-all hover:border-brand-300 hover:text-brand-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-brand-700 dark:hover:text-brand-400"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {year} AI Plant Disease Detection System. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            Built with <Heart size={12} className="text-brand-500" /> for sustainable agriculture
          </p>
        </div>
      </div>
    </footer>
  );
}
