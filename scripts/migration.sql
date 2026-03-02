-- ============================================================
-- YAP 2026 – Database Migration Script
-- ============================================================

-- 1. Add relatives_name to location_info
ALTER TABLE location_info
  ADD COLUMN IF NOT EXISTS relatives_name VARCHAR(150);

-- 2. Add matric & intermediate fields to academic_background
ALTER TABLE academic_background
  ADD COLUMN IF NOT EXISTS matric_institution VARCHAR(200),
  ADD COLUMN IF NOT EXISTS matric_grade VARCHAR(10),
  ADD COLUMN IF NOT EXISTS matric_percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS intermediate_institution VARCHAR(200),
  ADD COLUMN IF NOT EXISTS intermediate_grade VARCHAR(10),
  ADD COLUMN IF NOT EXISTS intermediate_percentage DECIMAL(5,2);

-- 3. Add scenario_response to motivation_alignment
ALTER TABLE motivation_alignment
  ADD COLUMN IF NOT EXISTS scenario_response TEXT;

-- 4. Create voluntary_experiences table (replaces experience_engagement)
CREATE TABLE IF NOT EXISTS voluntary_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    institution VARCHAR(200) NOT NULL,
    from_year SMALLINT NOT NULL,
    to_year SMALLINT NOT NULL,
    responsibility VARCHAR(300) NOT NULL
);

-- 5. Migrate existing experience_engagement data (optional – skip if no data to preserve)
-- INSERT INTO voluntary_experiences (application_id, institution, from_year, to_year, responsibility)
-- SELECT application_id, 'N/A', 2020, 2024, COALESCE(description, 'N/A')
-- FROM experience_engagement;

-- 6. Drop the old experience_engagement table (only after confirming migration)
-- DROP TABLE IF EXISTS experience_engagement;
