import { Upload, BrainCircuit, ScanSearch, Pill, ShieldCheck, ArrowDown } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

const steps = [
  { icon: Upload, title: 'Upload Image', desc: 'Capture or upload a clear photo of the affected plant leaf.', color: 'from-brand-500 to-brand-700' },
  { icon: BrainCircuit, title: 'AI Analysis', desc: 'A convolutional neural network processes the image through multiple layers.', color: 'from-sky-500 to-sky-700' },
  { icon: ScanSearch, title: 'Disease Detection', desc: 'The model identifies disease signatures and classifies the condition.', color: 'from-amber-500 to-amber-600' },
  { icon: Pill, title: 'Medicine Recommendation', desc: 'Targeted fungicide and organic treatment options are generated.', color: 'from-earth-400 to-earth-600' },
  { icon: ShieldCheck, title: 'Prevention Advice', desc: 'Actionable steps to stop the disease from returning or spreading.', color: 'from-emerald-500 to-emerald-700' },
];

export default function About() {
  return (
    <section id="about" className="py-16 lg:py-24">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">How It Works</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            The AI diagnosis pipeline
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            From leaf photo to treatment plan in seconds. Here is the journey your image takes through our AI system.
          </p>
        </Reveal>

        <div className="mx-auto mt-16 max-w-3xl">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 90}>
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                  <s.icon size={28} />
                </div>
                <div className="mt-4 sm:ml-6 sm:mt-0">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <span className="font-display text-xs font-bold text-brand-600 dark:text-brand-400">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.desc}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="my-4 flex justify-center sm:ml-8">
                  <ArrowDown size={20} className="text-brand-400 animate-bounce-subtle" />
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
