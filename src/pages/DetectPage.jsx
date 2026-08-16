import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Camera, ScanLine, ImageIcon, X, Leaf, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import ScanOverlay from '@/components/ScanOverlay';
import { useToast } from '@/context/ToastContext';
import { useRouter } from '@/context/RouterContext';
import { useHistory } from '@/context/HistoryContext';
import { cropOptions, ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from '@/data/crops';
import { analyzeImage } from '@/data/analyze';
import { supabase } from '@/lib/supabase';

export default function DetectPage() {
  const toast = useToast();
  const { navigate } = useRouter();
  const { addEntry } = useHistory();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState('Unknown');
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    if (!analyzing) return;
    const handler = (e) => setStepText(e.detail);
    window.addEventListener('analyze:progress', handler);

    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(95, p + Math.random() * 12);
      setProgress(p);
    }, 250);

    return () => {
      window.removeEventListener('analyze:progress', handler);
      clearInterval(interval);
    };
  }, [analyzing]);

  const validateFile = useCallback(
    (f) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        toast.error('Only JPG, JPEG, and PNG images are allowed.');
        return false;
      }
      if (f.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        toast.error(`Image must be under ${MAX_IMAGE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    },
    [toast]
  );

  const handleFile = useCallback(
    (f) => {
      if (!f) return;
      if (!validateFile(f)) return;
      setFile(f);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(f);
      toast.success('Image loaded successfully.');
    },
    [toast, validateFile]
  );

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.error('Please upload a leaf image first.');
      return;
    }
    setAnalyzing(true);
    setProgress(0);
    setStepText('Initializing…');
    try {
      const result = await analyzeImage(file, crop);
      setProgress(100);
      const entry = {
        ...result,
        image: preview,
        crop,
      };
      addEntry(entry);
      try {
        await supabase.from('predictions').insert({
          crop,
          disease_name: result.diseaseName,
          disease_id: result.diseaseId,
          is_healthy: result.isHealthy,
          confidence: result.confidence,
          image_url: preview,
        });
      } catch {
        /* prediction log is best-effort */
      }
      if (result.cropMismatch) {
        toast.error(`Crop mismatch: selected ${result.selectedCrop}, image appears to be ${result.detectedCrop}.`);
      } else {
        toast.success(
          result.isUncertain
          ? 'The result is uncertain — try another clear image.'
          : result.isHealthy
            ? 'Plant looks healthy!'
            : 'Disease detected — view your results.'
        );
      }
      setTimeout(() => navigate(`/result?id=${entry.id}`), 500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-grid min-h-screen py-12 lg:py-16">
      <div className="container-app">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-label">
            <ScanLine size={14} /> Disease Detection
          </span>
          <h1 className="mt-5 font-display text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Analyze your plant leaf
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Upload a clear photo of the affected leaf, select your crop, and let the AI detect the disease in seconds.
          </p>
        </Reveal>

        <Reveal delay={120} className="mx-auto mt-10 max-w-3xl">
          <div className="card overflow-hidden p-6 sm:p-8">
            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-all duration-300 ${
                  dragging
                    ? 'border-brand-500 bg-brand-50 scale-[1.01] dark:bg-brand-950/30'
                    : 'border-gray-300 bg-gray-50/50 hover:border-brand-400 hover:bg-brand-50/40 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:border-brand-700'
                }`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <ImageIcon size={30} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-gray-900 dark:text-white">
                  Drag &amp; drop your leaf image here
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Supports JPG, JPEG, PNG · up to {MAX_IMAGE_SIZE_MB}MB
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                    <Upload size={18} /> Choose Image
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()} className="btn-secondary">
                    <Camera size={18} /> Open Camera
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" onChange={onInputChange} className="hidden" />
                <input ref={cameraInputRef} type="file" accept="image/jpeg,image/jpg,image/png" capture="environment" onChange={onInputChange} className="hidden" />
              </div>
            ) : (
              <div>
                <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
                  <img src={preview} alt="Uploaded leaf" className="aspect-square w-full object-cover" />
                  <ScanOverlay active={analyzing} />
                  {!analyzing && (
                    <button
                      onClick={clearImage}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-lg transition-colors hover:text-red-600 dark:bg-gray-900/90"
                      aria-label="Remove image"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {analyzing && (
                  <div className="mx-auto mt-6 max-w-md">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium text-brand-700 dark:text-brand-300">
                        <Sparkles size={15} className="animate-spin-slow" /> {stepText}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {!analyzing && (
                  <div className="mx-auto mt-6 max-w-md">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Crop
                    </label>
                    <select value={crop} onChange={(e) => setCrop(e.target.value)} className="input-field">
                      {cropOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
                  {!analyzing && (
                    <button onClick={clearImage} className="btn-secondary sm:order-1">
                      <X size={18} /> Remove
                    </button>
                  )}
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="btn-primary sm:flex-1 sm:order-2"
                  >
                    {analyzing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        <ScanLine size={18} /> Analyze Disease
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
              {[
                { icon: ImageIcon, label: 'Clear photo' },
                { icon: Leaf, label: 'Single leaf' },
                { icon: Camera, label: 'Good lighting' },
              ].map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <t.icon size={17} />
                  </span>
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
