import { ScanLine, Pill, ShieldCheck, Activity, Camera, FileDown } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const features = [
  {
    icon: ScanLine,
    title: 'AI Disease Detection',
    desc: 'Advanced neural networks analyze leaf imagery to identify diseases across multiple crop types in seconds.',
    color: 'from-brand-500 to-brand-700',
  },
  {
    icon: Pill,
    title: 'Medicine Recommendation',
    desc: 'Get specific fungicide and medicine suggestions tailored to the detected disease and crop.',
    color: 'from-earth-400 to-earth-600',
  },
  {
    icon: ShieldCheck,
    title: 'Disease Prevention',
    desc: 'Proactive prevention tips to protect your crops and stop disease from spreading in your fields.',
    color: 'from-brand-500 to-emerald-600',
  },
  {
    icon: Activity,
    title: 'Confidence Score',
    desc: 'Every diagnosis includes a transparent confidence score so you know how certain the AI is.',
    color: 'from-amber-400 to-amber-600',
  },
  {
    icon: Camera,
    title: 'Camera Upload',
    desc: 'Snap a photo directly from your phone camera or drag and drop an image — no setup required.',
    color: 'from-sky-400 to-sky-600',
  },
  {
    icon: FileDown,
    title: 'Download Report',
    desc: 'Export a complete PDF report of your diagnosis, treatment plan, and prevention advice.',
    color: 'from-rose-400 to-rose-600',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">Features</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Everything you need to protect your crops
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            A complete AI toolkit for plant health — from instant detection to actionable treatment and prevention guidance.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 70}>
              <div className="card card-hover group h-full p-7">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}>
                  <f.icon size={24} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
