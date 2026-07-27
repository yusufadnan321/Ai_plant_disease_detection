/*
# Admin Panel schema for AI Plant Disease Detection

This migration creates four tables that back the Admin Panel and
persist prediction history. The app has NO sign-in screen, so this is
a single-tenant design: all policies allow both `anon` and
`authenticated` roles to perform full CRUD, because the data is
intentionally shared/public across the single app instance.

## 1. New Tables

- `diseases` — admin-managed disease knowledge base. Each row mirrors
  the fields shown on the Result page (name, crop, severity, confidence,
  description, symptoms, causes, medicines, organic treatment, prevention,
  fertilizer, recovery time, healthy flag). JSONB arrays store the
  multi-item fields (symptoms, causes, etc.).

- `medicines` — admin-managed medicine catalog. Each row has a name,
  category (chemical / organic / biological), description, dosage, and
  an optional list of target diseases.

- `datasets` — records of uploaded training datasets. Stores metadata
  (name, crop, sample count, format, an image preview URL, status) so
  the admin can track which datasets have been uploaded and their
  training status. Actual binary files are not stored in the DB; the
  `image_url` field holds a reference/preview link.

- `predictions` — every analysis run by any visitor is recorded here so
  the admin can review prediction history. Stores crop, disease name,
  healthy flag, severity, confidence, an image data URL, and timestamp.

## 2. Security (RLS)

All four tables enable RLS with full CRUD policies scoped to
`TO anon, authenticated` (single-tenant, no sign-in, intentionally
shared data). This is the correct policy role because the frontend
uses the anon key for its entire lifetime.

## 3. Indexes

- `predictions` indexed on `created_at DESC` for history listing.
- `diseases` indexed on `crop` and a unique constraint on `name`.
- `datasets` indexed on `uploaded_at DESC`.

## 4. Important Notes

1. Idempotent: uses IF NOT EXISTS for tables/indexes and drops
   policies before recreating them so the migration is safe to re-run.
2. No user_id columns — no auth in this app.
3. JSONB defaults to empty arrays so inserts can omit multi-item fields.
*/

-- ===== diseases =====
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crop text NOT NULL DEFAULT 'Unknown',
  is_healthy boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'Medium',
  confidence int NOT NULL DEFAULT 85,
  description text NOT NULL DEFAULT '',
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  causes jsonb NOT NULL DEFAULT '[]'::jsonb,
  medicines jsonb NOT NULL DEFAULT '[]'::jsonb,
  organic_treatment jsonb NOT NULL DEFAULT '[]'::jsonb,
  prevention jsonb NOT NULL DEFAULT '[]'::jsonb,
  fertilizer text NOT NULL DEFAULT '',
  recovery_time text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_diseases" ON diseases;
CREATE POLICY "anon_select_diseases" ON diseases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_diseases" ON diseases;
CREATE POLICY "anon_insert_diseases" ON diseases FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_diseases" ON diseases;
CREATE POLICY "anon_update_diseases" ON diseases FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_diseases" ON diseases;
CREATE POLICY "anon_delete_diseases" ON diseases FOR DELETE
  TO anon, authenticated USING (true);

CREATE UNIQUE INDEX IF NOT EXISTS diseases_name_key ON diseases (name);
CREATE INDEX IF NOT EXISTS diseases_crop_idx ON diseases (crop);

-- ===== medicines =====
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'chemical',
  description text NOT NULL DEFAULT '',
  dosage text NOT NULL DEFAULT '',
  target_diseases jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_medicines" ON medicines;
CREATE POLICY "anon_select_medicines" ON medicines FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_medicines" ON medicines;
CREATE POLICY "anon_insert_medicines" ON medicines FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_medicines" ON medicines;
CREATE POLICY "anon_update_medicines" ON medicines FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_medicines" ON medicines;
CREATE POLICY "anon_delete_medicines" ON medicines FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS medicines_category_idx ON medicines (category);

-- ===== datasets =====
CREATE TABLE IF NOT EXISTS datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  crop text NOT NULL DEFAULT 'Unknown',
  description text NOT NULL DEFAULT '',
  sample_count int NOT NULL DEFAULT 0,
  file_format text NOT NULL DEFAULT 'images',
  image_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_datasets" ON datasets;
CREATE POLICY "anon_select_datasets" ON datasets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_datasets" ON datasets;
CREATE POLICY "anon_insert_datasets" ON datasets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_datasets" ON datasets;
CREATE POLICY "anon_update_datasets" ON datasets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_datasets" ON datasets;
CREATE POLICY "anon_delete_datasets" ON datasets FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS datasets_uploaded_at_idx ON datasets (uploaded_at DESC);

-- ===== predictions =====
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop text NOT NULL DEFAULT 'Unknown',
  disease_name text NOT NULL DEFAULT '',
  disease_id text NOT NULL DEFAULT '',
  is_healthy boolean NOT NULL DEFAULT false,
  severity text NOT NULL DEFAULT 'Low',
  confidence int NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS predictions_created_at_idx ON predictions (created_at DESC);
