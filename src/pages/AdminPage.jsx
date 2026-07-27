import { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard, Bug, Pill, Database, History, Plus, Pencil, Trash2,
  X, Search, AlertTriangle, TrendingUp, Leaf, Upload, CheckCircle2, RefreshCw,
  LogOut, ShieldCheck,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Badge, HealthBadge, SeverityBadge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import {
  listDiseases, createDisease, updateDisease, deleteDisease,
  listMedicines, createMedicine, updateMedicine, deleteMedicine,
  listDatasets, createDataset, updateDataset, deleteDataset,
  listPredictions, deletePrediction, clearAllPredictions,
} from '@/lib/adminService';
import { cropOptions } from '@/data/crops';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'diseases', label: 'Diseases', icon: Bug },
  { id: 'medicines', label: 'Medicines', icon: Pill },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'predictions', label: 'Predictions', icon: History },
];

const emptyDisease = {
  name: '', crop: 'Tomato', is_healthy: false, severity: 'Medium', confidence: 85,
  description: '', symptoms: [], causes: [], medicines: [], organic_treatment: [],
  prevention: [], fertilizer: '', recovery_time: '',
};
const emptyMedicine = { name: '', category: 'chemical', description: '', dosage: '', target_diseases: [] };
const emptyDataset = { name: '', crop: 'Unknown', description: '', sample_count: 0, file_format: 'images', image_url: '', status: 'pending' };

function toList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean);
  return [];
}

function ListEditor({ label, value, onChange, placeholder }) {
  const text = Array.isArray(value) ? value.join('\n') : '';
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        rows={3}
        defaultValue={text}
        onBlur={(e) => onChange(toList(e.target.value))}
        placeholder={placeholder}
        className="input-field resize-none"
      />
      <p className="mt-1 text-xs text-gray-400">One item per line</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    brand: 'from-brand-500 to-brand-700',
    earth: 'from-earth-400 to-earth-600',
    amber: 'from-amber-400 to-amber-600',
    blue: 'from-sky-400 to-sky-600',
  };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${colors[color]} text-white`}>
          <Icon size={22} />
        </span>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const toast = useToast();
  const { navigate } = useRouter();
  const { signOut } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [diseases, setDiseases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [search, setSearch] = useState('');

  const [diseaseModal, setDiseaseModal] = useState({ open: false, editing: null, data: emptyDisease });
  const [medicineModal, setMedicineModal] = useState({ open: false, editing: null, data: emptyMedicine });
  const [datasetModal, setDatasetModal] = useState({ open: false, editing: null, data: emptyDataset });
  const [confirm, setConfirm] = useState({ open: false, message: '', action: null });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, m, ds, p] = await Promise.all([listDiseases(), listMedicines(), listDatasets(), listPredictions()]);
      setDiseases(d || []);
      setMedicines(m || []);
      setDatasets(ds || []);
      setPredictions(p || []);
    } catch (err) {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const askConfirm = (message, action) => setConfirm({ open: true, message, action });
  const runConfirm = async () => {
    if (confirm.action) await confirm.action();
    setConfirm({ open: false, message: '', action: null });
  };

  const filtered = (items, fields) => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((it) => fields.some((f) => String(it[f] ?? '').toLowerCase().includes(q)));
  };

  const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 py-10 dark:bg-gray-900/30">
      <div className="container-app">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="section-label">
              <LayoutDashboard size={14} /> Admin Panel
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold text-gray-900 dark:text-white">Manage your knowledge base</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add diseases, medicines, datasets, and review prediction history.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="btn-secondary">
              <RefreshCw size={16} /> Refresh
            </button>
            <button onClick={() => { signOut(); toast.info('Signed out.'); navigate('/'); }} className="btn-secondary !text-red-600 hover:!border-red-300">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setSearch(''); }}
                  className={`flex flex-shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <t.icon size={18} /> {t.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <RefreshCw size={28} className="animate-spin text-brand-500" />
              </div>
            ) : (
              <>
                {tab === 'dashboard' && (
                  <Dashboard diseases={diseases} medicines={medicines} datasets={datasets} predictions={predictions} setTab={setTab} />
                )}

                {tab === 'diseases' && (
                  <DiseasesTab
                    items={filtered(diseases, ['name', 'crop', 'severity'])}
                    search={search} setSearch={setSearch}
                    onAdd={() => setDiseaseModal({ open: true, editing: null, data: { ...emptyDisease } })}
                    onEdit={(d) => setDiseaseModal({ open: true, editing: d.id, data: { ...d } })}
                    onDelete={(d) => askConfirm(`Delete disease "${d.name}"?`, async () => {
                      await deleteDisease(d.id); setDiseases((p) => p.filter((x) => x.id !== d.id)); toast.success('Disease deleted.');
                    })}
                  />
                )}

                {tab === 'medicines' && (
                  <MedicinesTab
                    items={filtered(medicines, ['name', 'category', 'description'])}
                    search={search} setSearch={setSearch}
                    onAdd={() => setMedicineModal({ open: true, editing: null, data: { ...emptyMedicine } })}
                    onEdit={(m) => setMedicineModal({ open: true, editing: m.id, data: { ...m } })}
                    onDelete={(m) => askConfirm(`Delete medicine "${m.name}"?`, async () => {
                      await deleteMedicine(m.id); setMedicines((p) => p.filter((x) => x.id !== m.id)); toast.success('Medicine deleted.');
                    })}
                  />
                )}

                {tab === 'datasets' && (
                  <DatasetsTab
                    items={filtered(datasets, ['name', 'crop', 'status'])}
                    search={search} setSearch={setSearch}
                    onAdd={() => setDatasetModal({ open: true, editing: null, data: { ...emptyDataset } })}
                    onEdit={(ds) => setDatasetModal({ open: true, editing: ds.id, data: { ...ds } })}
                    onDelete={(ds) => askConfirm(`Delete dataset "${ds.name}"?`, async () => {
                      await deleteDataset(ds.id); setDatasets((p) => p.filter((x) => x.id !== ds.id)); toast.success('Dataset deleted.');
                    })}
                  />
                )}

                {tab === 'predictions' && (
                  <PredictionsTab
                    items={filtered(predictions, ['crop', 'disease_name', 'severity'])}
                    search={search} setSearch={setSearch}
                    onDelete={(p) => askConfirm(`Delete this prediction record?`, async () => {
                      await deletePrediction(p.id); setPredictions((prev) => prev.filter((x) => x.id !== p.id)); toast.success('Record deleted.');
                    })}
                    onClear={() => askConfirm('Delete ALL prediction records? This cannot be undone.', async () => {
                      await clearAllPredictions(); setPredictions([]); toast.success('All predictions cleared.');
                    })}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DiseaseModal
        state={diseaseModal}
        onClose={() => setDiseaseModal((s) => ({ ...s, open: false }))}
        onChange={(patch) => setDiseaseModal((s) => ({ ...s, data: { ...s.data, ...patch } }))}
        onSave={async () => {
          try {
            if (diseaseModal.editing) {
              await updateDisease(diseaseModal.editing, diseaseModal.data);
              toast.success('Disease updated.');
            } else {
              const created = await createDisease(diseaseModal.data);
              toast.success('Disease added.');
              setDiseases((p) => [created, ...p]);
            }
            if (diseaseModal.editing) setDiseases((p) => p.map((x) => x.id === diseaseModal.editing ? { ...x, ...diseaseModal.data } : x));
            setDiseaseModal((s) => ({ ...s, open: false }));
            await loadAll();
          } catch { toast.error('Could not save disease.'); }
        }}
      />

      <MedicineModal
        state={medicineModal}
        onClose={() => setMedicineModal((s) => ({ ...s, open: false }))}
        onChange={(patch) => setMedicineModal((s) => ({ ...s, data: { ...s.data, ...patch } }))}
        onSave={async () => {
          try {
            if (medicineModal.editing) {
              await updateMedicine(medicineModal.editing, medicineModal.data);
              toast.success('Medicine updated.');
            } else {
              const created = await createMedicine(medicineModal.data);
              toast.success('Medicine added.');
              setMedicines((p) => [created, ...p]);
            }
            setMedicineModal((s) => ({ ...s, open: false }));
            await loadAll();
          } catch { toast.error('Could not save medicine.'); }
        }}
      />

      <DatasetModal
        state={datasetModal}
        onClose={() => setDatasetModal((s) => ({ ...s, open: false }))}
        onChange={(patch) => setDatasetModal((s) => ({ ...s, data: { ...s.data, ...patch } }))}
        onSave={async () => {
          try {
            const payload = { ...datasetModal.data, sample_count: Number(datasetModal.data.sample_count) || 0 };
            if (datasetModal.editing) {
              await updateDataset(datasetModal.editing, payload);
              toast.success('Dataset updated.');
            } else {
              const created = await createDataset(payload);
              toast.success('Dataset uploaded.');
              setDatasets((p) => [created, ...p]);
            }
            setDatasetModal((s) => ({ ...s, open: false }));
            await loadAll();
          } catch { toast.error('Could not save dataset.'); }
        }}
      />

      <Modal
        open={confirm.open}
        onClose={() => setConfirm({ open: false, message: '', action: null })}
        title="Confirm action"
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirm({ open: false, message: '', action: null })} className="btn-secondary">Cancel</button>
            <button onClick={runConfirm} className="btn-primary !bg-red-600 hover:!bg-red-700">Delete</button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertTriangle size={20} />
          </span>
          <p className="pt-1.5 text-sm text-gray-600 dark:text-gray-300">{confirm.message}</p>
        </div>
      </Modal>
    </div>
  );
}

function SearchBar({ search, setSearch, onAdd, addLabel }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="input-field pl-10"
        />
      </div>
      {onAdd && (
        <button onClick={onAdd} className="btn-primary sm:w-auto">
          <Plus size={18} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function EmptyRow({ icon: Icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
        <Icon size={26} />
      </span>
      <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function Dashboard({ diseases, medicines, datasets, predictions, setTab }) {
  const healthyCount = predictions.filter((p) => p.is_healthy).length;
  const diseasedCount = predictions.length - healthyCount;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bug} label="Diseases" value={diseases.length} color="brand" />
        <StatCard icon={Pill} label="Medicines" value={medicines.length} color="earth" />
        <StatCard icon={Database} label="Datasets" value={datasets.length} color="amber" />
        <StatCard icon={History} label="Predictions" value={predictions.length} color="blue" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-brand-500" />
            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">Prediction overview</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><CheckCircle2 size={15} className="text-brand-500" /> Healthy predictions</span>
              <span className="font-bold text-gray-900 dark:text-white">{healthyCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><AlertTriangle size={15} className="text-amber-500" /> Diseased predictions</span>
              <span className="font-bold text-gray-900 dark:text-white">{diseasedCount}</span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-2">
            <Leaf size={18} className="text-brand-500" />
            <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">Crops covered</h3>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(new Set(diseases.map((d) => d.crop))).map((c) => (
              <Badge key={c} color="green">{c}</Badge>
            ))}
            {diseases.length === 0 && <span className="text-sm text-gray-400">No diseases added yet</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TABS.slice(1).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="card card-hover flex items-center gap-3 p-4 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <t.icon size={20} />
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Manage {t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiseasesTab({ items, search, setSearch, onAdd, onEdit, onDelete }) {
  return (
    <div>
      <SearchBar search={search} setSearch={setSearch} onAdd={onAdd} addLabel="Add Disease" />
      {items.length === 0 ? <EmptyRow icon={Bug} label="No diseases yet. Add your first disease." /> : (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">{d.name}</h3>
                  <HealthBadge isHealthy={d.is_healthy} />
                  <SeverityBadge severity={d.severity} />
                  <Badge color="earth">{d.crop}</Badge>
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{d.description}</p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button onClick={() => onEdit(d)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><Pencil size={15} /></button>
                <button onClick={() => onDelete(d)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-300"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MedicinesTab({ items, search, setSearch, onAdd, onEdit, onDelete }) {
  const catColor = { chemical: 'earth', organic: 'green', biological: 'blue' };
  return (
    <div>
      <SearchBar search={search} setSearch={setSearch} onAdd={onAdd} addLabel="Add Medicine" />
      {items.length === 0 ? <EmptyRow icon={Pill} label="No medicines yet. Add your first medicine." /> : (
        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">{m.name}</h3>
                  <Badge color={catColor[m.category] || 'gray'}>{m.category}</Badge>
                </div>
                <p className="mt-1.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-400">{m.description}</p>
                {m.dosage && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Dosage: {m.dosage}</p>}
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button onClick={() => onEdit(m)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"><Pencil size={15} /></button>
                <button onClick={() => onDelete(m)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 dark:border-gray-700 dark:text-gray-300"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DatasetsTab({ items, search, setSearch, onAdd, onEdit, onDelete }) {
  const statusColor = { pending: 'amber', training: 'blue', ready: 'green', failed: 'red' };
  return (
    <div>
      <SearchBar search={search} setSearch={setSearch} onAdd={onAdd} addLabel="Upload Dataset" />
      {items.length === 0 ? <EmptyRow icon={Database} label="No datasets yet. Upload your first dataset." /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((ds) => (
            <div key={ds.id} className="card card-hover overflow-hidden">
              {ds.image_url && (
                <div className="h-32 overflow-hidden">
                  <img src={ds.image_url} alt={ds.name} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white">{ds.name}</h3>
                  <Badge color={statusColor[ds.status] || 'gray'}>{ds.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{ds.crop} · {ds.sample_count} samples · {ds.file_format}</p>
                {ds.description && <p className="mt-1.5 line-clamp-2 text-xs text-gray-400 dark:text-gray-500">{ds.description}</p>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => onEdit(ds)} className="btn-ghost px-2 py-1.5 text-xs"><Pencil size={14} /> Edit</button>
                  <button onClick={() => onDelete(ds)} className="btn-ghost px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PredictionsTab({ items, search, setSearch, onDelete, onClear }) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search predictions…" className="input-field pl-10" />
        </div>
        {items.length > 0 && (
          <button onClick={onClear} className="btn-secondary !text-red-600 hover:!border-red-300 sm:w-auto"><Trash2 size={16} /> Clear all</button>
        )}
      </div>
      {items.length === 0 ? <EmptyRow icon={History} label="No prediction history yet." /> : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="card flex items-center gap-4 p-3">
              {p.image_url ? (
                <img src={p.image_url} alt={p.disease_name} className="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"><Leaf size={20} className="text-gray-400" /></div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-display text-sm font-bold text-gray-900 dark:text-white">{p.disease_name}</h3>
                  <HealthBadge isHealthy={p.is_healthy} />
                  <SeverityBadge severity={p.severity} />
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{p.crop} · {p.confidence}% confidence</p>
              </div>
              <div className="hidden text-right text-xs text-gray-400 sm:block dark:text-gray-500">{new Date(p.created_at).toLocaleDateString()}</div>
              <button onClick={() => onDelete(p)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiseaseModal({ state, onClose, onChange, onSave }) {
  const { open, editing, data } = state;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Disease' : 'Add Disease'}
      size="lg"
      footer={<>
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={onSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Disease'}</button>
      </>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Disease Name</label><input value={data.name} onChange={(e) => onChange({ name: e.target.value })} className="input-field" placeholder="e.g. Tomato Early Blight" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Crop</label>
          <select value={data.crop} onChange={(e) => onChange({ crop: e.target.value })} className="input-field">{cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Severity</label>
          <select value={data.severity} onChange={(e) => onChange({ severity: e.target.value })} className="input-field"><option>Low</option><option>Medium</option><option>High</option></select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Confidence (%)</label><input type="number" min={0} max={100} value={data.confidence} onChange={(e) => onChange({ confidence: Number(e.target.value) })} className="input-field" /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label><textarea rows={2} value={data.description} onChange={(e) => onChange({ description: e.target.value })} className="input-field resize-none" /></div>
        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          <ListEditor label="Symptoms" value={data.symptoms} onChange={(v) => onChange({ symptoms: v })} placeholder="Concentric dark rings on leaves" />
          <ListEditor label="Causes" value={data.causes} onChange={(v) => onChange({ causes: v })} placeholder="Fungal spores from Alternaria" />
          <ListEditor label="Medicines" value={data.medicines} onChange={(v) => onChange({ medicines: v })} placeholder="Chlorothalonil fungicide" />
          <ListEditor label="Organic Treatment" value={data.organic_treatment} onChange={(v) => onChange({ organic_treatment: v })} placeholder="Neem oil spray" />
          <ListEditor label="Prevention Tips" value={data.prevention} onChange={(v) => onChange({ prevention: v })} placeholder="Mulch around base" />
          <div className="grid gap-4">
            <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Suggested Fertilizer</label><input value={data.fertilizer} onChange={(e) => onChange({ fertilizer: e.target.value })} className="input-field" /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Recovery Time</label><input value={data.recovery_time} onChange={(e) => onChange({ recovery_time: e.target.value })} className="input-field" /></div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"><input type="checkbox" checked={data.is_healthy} onChange={(e) => onChange({ is_healthy: e.target.checked })} className="h-4 w-4 rounded text-brand-600" /> Mark as healthy condition</label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function MedicineModal({ state, onClose, onChange, onSave }) {
  const { open, editing, data } = state;
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="md"
      footer={<><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={onSave} className="btn-primary">{editing ? 'Save Changes' : 'Add Medicine'}</button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</label><input value={data.name} onChange={(e) => onChange({ name: e.target.value })} className="input-field" placeholder="e.g. Chlorothalonil" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
          <select value={data.category} onChange={(e) => onChange({ category: e.target.value })} className="input-field"><option value="chemical">Chemical</option><option value="organic">Organic</option><option value="biological">Biological</option></select>
        </div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label><textarea rows={2} value={data.description} onChange={(e) => onChange({ description: e.target.value })} className="input-field resize-none" /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label><input value={data.dosage} onChange={(e) => onChange({ dosage: e.target.value })} className="input-field" placeholder="e.g. 5ml per liter, every 7 days" /></div>
        <div className="sm:col-span-2"><ListEditor label="Target Diseases" value={data.target_diseases} onChange={(v) => onChange({ target_diseases: v })} placeholder="Tomato Early Blight" /></div>
      </div>
    </Modal>
  );
}

function DatasetModal({ state, onClose, onChange, onSave }) {
  const { open, editing, data } = state;
  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Dataset' : 'Upload Dataset'} size="md"
      footer={<><button onClick={onClose} className="btn-secondary">Cancel</button><button onClick={onSave} className="btn-primary">{editing ? 'Save Changes' : 'Upload Dataset'}</button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Dataset Name</label><input value={data.name} onChange={(e) => onChange({ name: e.target.value })} className="input-field" placeholder="e.g. Tomato Leaf Dataset v2" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Crop</label>
          <select value={data.crop} onChange={(e) => onChange({ crop: e.target.value })} className="input-field">{cropOptions.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Sample Count</label><input type="number" min={0} value={data.sample_count} onChange={(e) => onChange({ sample_count: e.target.value })} className="input-field" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Format</label>
          <select value={data.file_format} onChange={(e) => onChange({ file_format: e.target.value })} className="input-field"><option>images</option><option>csv</option><option>json</option><option>tfrecord</option></select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select value={data.status} onChange={(e) => onChange({ status: e.target.value })} className="input-field"><option value="pending">Pending</option><option value="training">Training</option><option value="ready">Ready</option><option value="failed">Failed</option></select>
        </div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Preview Image URL</label><input value={data.image_url} onChange={(e) => onChange({ image_url: e.target.value })} className="input-field" placeholder="https://…" /></div>
        <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label><textarea rows={2} value={data.description} onChange={(e) => onChange({ description: e.target.value })} className="input-field resize-none" /></div>
        <div className="sm:col-span-2 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"><Upload size={15} /> Enter dataset details above. Binary file storage is recorded as metadata for tracking.</div>
      </div>
    </Modal>
  );
}
