import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import LinkButton from '@/components/ui/LinkButton';
import { supportedCrops } from '@/data/crops';
import { useRouter } from '@/context/RouterContext';

export default function SupportedCrops() {
  const { navigate } = useRouter();

  return (
    <section id="crops" className="bg-gray-50 py-16 lg:py-24 dark:bg-gray-900/40">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">Supported Crops</span>
          <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
            Crops we can analyze
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Our AI model is trained on leaf imagery from eight major crop types — covering the diseases that matter most to farmers worldwide.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {supportedCrops.map((crop, i) => (
            <Reveal key={crop.id} delay={i * 60}>
              <button
                onClick={() => navigate('/detect')}
                className="card card-hover group block w-full overflow-hidden text-left"
              >
                <div className="relative h-40 overflow-hidden sm:h-44">
                  <img
                    src={crop.image}
                    alt={crop.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur-sm">
                      {crop.name}
                    </span>
                  </div>
                  <span className="absolute right-3 top-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-brand-600 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <ArrowRight size={15} />
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{crop.tagline}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <LinkButton to="/detect">
            Start Detection <ArrowRight size={18} />
          </LinkButton>
        </Reveal>
      </div>
    </section>
  );
}
