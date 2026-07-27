/*
# Lock down admin tables to authenticated users only

The app now has an admin sign-in screen. The three admin-management
tables (diseases, medicines, datasets) must be writable only by an
authenticated admin. The predictions table stays publicly writable for
INSERT (any visitor's analysis is logged) but SELECT/UPDATE/DELETE on
predictions become authenticated-only so only the admin can browse and
manage prediction history.

## 1. Policy changes

- diseases: SELECT/INSERT/UPDATE/DELETE → TO authenticated with ownership
  predicate auth.uid() IS NOT NULL (single admin account, no user_id
  column needed since there's one shared admin).
- medicines: same pattern.
- datasets: same pattern.
- predictions: INSERT stays TO anon, authenticated (visitors log results).
  SELECT/UPDATE/DELETE → TO authenticated only.

## 2. Important notes

1. Drops all existing policies first, then recreates — idempotent.
2. No schema/column changes — no data loss risk.
3. Using `auth.uid() IS NOT NULL` as the predicate because there is a
   single admin account (no per-row ownership). Any authenticated user
   can manage the shared knowledge base.
*/

-- ===== diseases: authenticated-only CRUD =====
DROP POLICY IF EXISTS "anon_select_diseases" ON diseases;
DROP POLICY IF EXISTS "anon_insert_diseases" ON diseases;
DROP POLICY IF EXISTS "anon_update_diseases" ON diseases;
DROP POLICY IF EXISTS "anon_delete_diseases" ON diseases;

DROP POLICY IF EXISTS "auth_select_diseases" ON diseases;
CREATE POLICY "auth_select_diseases" ON diseases FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_insert_diseases" ON diseases;
CREATE POLICY "auth_insert_diseases" ON diseases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_update_diseases" ON diseases;
CREATE POLICY "auth_update_diseases" ON diseases FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_delete_diseases" ON diseases;
CREATE POLICY "auth_delete_diseases" ON diseases FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ===== medicines: authenticated-only CRUD =====
DROP POLICY IF EXISTS "anon_select_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_insert_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_update_medicines" ON medicines;
DROP POLICY IF EXISTS "anon_delete_medicines" ON medicines;

DROP POLICY IF EXISTS "auth_select_medicines" ON medicines;
CREATE POLICY "auth_select_medicines" ON medicines FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_insert_medicines" ON medicines;
CREATE POLICY "auth_insert_medicines" ON medicines FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_update_medicines" ON medicines;
CREATE POLICY "auth_update_medicines" ON medicines FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_delete_medicines" ON medicines;
CREATE POLICY "auth_delete_medicines" ON medicines FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ===== datasets: authenticated-only CRUD =====
DROP POLICY IF EXISTS "anon_select_datasets" ON datasets;
DROP POLICY IF EXISTS "anon_insert_datasets" ON datasets;
DROP POLICY IF EXISTS "anon_update_datasets" ON datasets;
DROP POLICY IF EXISTS "anon_delete_datasets" ON datasets;

DROP POLICY IF EXISTS "auth_select_datasets" ON datasets;
CREATE POLICY "auth_select_datasets" ON datasets FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_insert_datasets" ON datasets;
CREATE POLICY "auth_insert_datasets" ON datasets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_update_datasets" ON datasets;
CREATE POLICY "auth_update_datasets" ON datasets FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_delete_datasets" ON datasets;
CREATE POLICY "auth_delete_datasets" ON datasets FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ===== predictions: public INSERT, authenticated-only SELECT/UPDATE/DELETE =====
DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;

DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_select_predictions" ON predictions;
CREATE POLICY "auth_select_predictions" ON predictions FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_update_predictions" ON predictions;
CREATE POLICY "auth_update_predictions" ON predictions FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "auth_delete_predictions" ON predictions;
CREATE POLICY "auth_delete_predictions" ON predictions FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);
