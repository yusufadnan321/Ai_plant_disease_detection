import { Leaf, ScanLine, Sparkles, Camera, ShieldCheck, Activity } from 'lucide-react';
import LinkButton from '@/components/ui/LinkButton';
import { Reveal } from '@/components/ui/Reveal';
import { heroImage } from '@/data/crops';

const features = [
  { icon: ScanLine, label: 'Disease Detection' },
  { icon: Activity, label: 'Confidence Score' },
  { icon: ShieldCheck, label: 'Treatment' },
  { icon: Leaf, label: 'Medicine' },
  { icon: Sparkles, label: 'Prevention Tips' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/20" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-earth-200/40 blur-3xl dark:bg-earth-900/20" />

      <div className="container-app relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Reveal>
            <span className="section-label">
              <Sparkles size={14} /> AI-Powered Agriculture
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
              Detect Plant Diseases{' '}
              <span className="text-gradient">Instantly</span> Using Artificial Intelligence
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
              Upload a photo of your plant leaf and receive an instant diagnosis — including the disease, a
              confidence score, recommended medicine, treatment steps, and prevention tips to protect your harvest.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <ul className="mt-7 grid max-w-lg grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                    <f.icon size={15} />
                  </span>
                  {f.label}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={320}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <LinkButton to="/detect">
                <ScanLine size={18} /> Detect Disease
              </LinkButton>
              <LinkButton to="/about" variant="secondary">
                Learn More
              </LinkButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-300/30 to-earth-300/30 blur-2xl dark:from-brand-800/20 dark:to-earth-800/20" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 shadow-2xl shadow-brand-600/20">
              <img
                src={heroImage}
                alt="Healthy plants and agriculture technology"
                className="aspect-square w-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-lg backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
                AI Analysis Active
              </div>

              <div className="absolute inset-x-6 top-1/2 h-0.5 animate-scan bg-gradient-to-r from-transparent via-brand-300 to-transparent shadow-[0_0_20px_4px_rgba(34,197,94,0.6)]" />

              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                      <Camera size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Tomato Leaf</p>
                      <p className="text-[10px] text-gray-500">Analysis complete</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
                    96% Healthy
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -right-3 top-1/4 hidden animate-float rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:block dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <Leaf size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">8 Crops</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Supported</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-3 bottom-1/4 hidden animate-float rounded-2xl border border-gray-100 bg-white p-3 shadow-xl sm:block dark:border-gray-800 dark:bg-gray-900" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-earth-100 text-earth-600 dark:bg-earth-900/40 dark:text-earth-400">
                  <Activity size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">10+ Diseases</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Detectable</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
