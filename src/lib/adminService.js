import { supabase } from '@/lib/supabase';

export async function listDiseases() {
  const { data, error } = await supabase
    .from('diseases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createDisease(payload) {
  const { data, error } = await supabase.from('diseases').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateDisease(id, payload) {
  const { data, error } = await supabase
    .from('diseases')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDisease(id) {
  const { error } = await supabase.from('diseases').delete().eq('id', id);
  if (error) throw error;
}

export async function listMedicines() {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createMedicine(payload) {
  const { data, error } = await supabase.from('medicines').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateMedicine(id, payload) {
  const { data, error } = await supabase
    .from('medicines')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMedicine(id) {
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) throw error;
}

export async function listDatasets() {
  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createDataset(payload) {
  const { data, error } = await supabase.from('datasets').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateDataset(id, payload) {
  const { data, error } = await supabase
    .from('datasets')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDataset(id) {
  const { error } = await supabase.from('datasets').delete().eq('id', id);
  if (error) throw error;
}

export async function listPredictions() {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deletePrediction(id) {
  const { error } = await supabase.from('predictions').delete().eq('id', id);
  if (error) throw error;
}

export async function clearAllPredictions() {
  const { error } = await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}
