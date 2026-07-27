import { History, ImageIcon, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { useHistory } from '@/context/HistoryContext';
import { useRouter } from '@/context/RouterContext';
import { useToast } from '@/context/ToastContext';
import { HealthBadge } from '@/components/ui/Badge';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecentHistory() {
  const { history, removeEntry } = useHistory();
  const { navigate } = useRouter();
  const toast = useToast();

  if (history.length === 0) {
    return (
      <section className="py-16 lg:py-24">
        <div className="container-app">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-label">Recent History</span>
            <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Your past diagnoses
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="mx-auto mt-12 max-w-md card flex flex-col items-center justify-center p-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-950 dark:text-brand-400">
                <ImageIcon size={30} />
              </span>
              <h3 className="mt-5 font-display text-lg font-bold text-gray-900 dark:text-white">No diagnoses yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Once you analyze a leaf, your past results will appear here for quick reference.
              </p>
              <button onClick={() => navigate('/detect')} className="btn-primary mt-6">
                Run your first analysis
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="container-app">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="section-label">Recent History</span>
            <h2 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
              Your past diagnoses
            </h2>
          </div>
          <button
            onClick={() => navigate('/detect')}
            className="btn-ghost text-brand-700 dark:text-brand-300"
          >
            New analysis <ChevronRight size={16} />
          </button>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {history.slice(0, 6).map((item, i) => (
            <Reveal key={item.id} delay={i * 60}>
              <div className="card card-hover group overflow-hidden">
                <div className="relative h-44 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.diseaseName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEntry(item.id);
                      toast.info('Entry removed from history.');
                    }}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-600 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                    aria-label="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="absolute left-3 top-3">
                    <HealthBadge isHealthy={item.isHealthy} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-display text-sm font-bold text-gray-900 dark:text-white">{item.diseaseName}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{item.crop}</span>
                    <span>{item.confidence}% confidence</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <Calendar size={12} /> {formatDate(item.date)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
