export async function analyzeImage(file, crop) {
  window.dispatchEvent(
    new CustomEvent('analyze:progress', { detail: 'Uploading image to the AI model…' })
  );
  const body = new FormData();
  body.append('image', file);
  if (crop && crop !== 'Unknown') body.append('crop', crop);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const response = await fetch(`${apiBaseUrl}/api/predict`, { method: 'POST', body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || 'The prediction service could not analyze this image.');
  }
  window.dispatchEvent(new CustomEvent('analyze:progress', { detail: 'Prediction complete.' }));
  return {
    id: `${payload.diseaseId}_${Date.now()}`,
    ...payload,
    organicTreatment: [],
    fertilizer: '',
    recoveryTime: '',
  };
}
