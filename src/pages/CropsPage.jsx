import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import LinkButton from '@/components/ui/LinkButton';
import { supportedCrops } from '@/data/crops';
import { diseaseDatabase } from '@/data/diseases';

export default function CropsPage() {
  return (
    <div className="bg-grid py-12 lg:py-16">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">Supported Crops</span>
          <h1 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Crops our AI can analyze
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Eight major crop types with dedicated disease models. Select any crop to start a diagnosis tailored to that plant.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {supportedCrops.map((crop, i) => {
            const count = diseaseDatabase.filter((d) => d.crop === crop.name).length;
            return (
              <Reveal key={crop.id} delay={i * 70}>
                <div className="card card-hover group overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={crop.image}
                      alt={crop.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-3 left-4 font-display text-xl font-bold text-white">{crop.name}</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{crop.tagline}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {count} disease model{count !== 1 ? 's' : ''}
                      </span>
                      <LinkButton to="/detect" variant="ghost" className="-mr-2 px-2 text-brand-700 dark:text-brand-300">
                        Detect <ArrowRight size={15} />
                      </LinkButton>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
