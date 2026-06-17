-- =============================================================================
-- Migration: 20260411_fix_debtors_timestamps.sql
-- Description: Fix NULL created_at / updated_at on the debtors table
--
-- Root Cause:
--   The `created_at` and `updated_at` columns on public.debtors have no
--   DEFAULT value and no trigger, so every row inserted via the CSV import
--   engine lands with NULL in both columns. All 136 existing rows are affected.
--
-- Fix:
--   1. Set DEFAULT now() on both columns (covers all future inserts).
--   2. Create a BEFORE UPDATE trigger to auto-stamp updated_at on every update.
--   3. Backfill all 136 existing NULL rows with the current timestamp.
--
-- POPIA / Audit Note:
--   Accurate record-creation timestamps are required for data-subject access
--   requests and regulatory audit trails under POPIA Chapter 3.
--
-- Author: Thalia (SmartKollect AI)
-- Date:   2026-04-11
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Set DEFAULT now() on created_at and updated_at
-- ----------------------------------------------------------------------------
ALTER TABLE public.debtors
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- ----------------------------------------------------------------------------
-- 2. Create trigger function to auto-update updated_at on every row change
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Attach the trigger to the debtors table (drop first to keep idempotent)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_debtors_set_updated_at ON public.debtors;

CREATE TRIGGER trg_debtors_set_updated_at
  BEFORE UPDATE ON public.debtors
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Backfill existing NULL rows
--    Uses now() for created_at (best available approximation for legacy rows)
-- ----------------------------------------------------------------------------
UPDATE public.debtors
SET
  created_at = now(),
  updated_at = now()
WHERE
  created_at IS NULL
  OR updated_at IS NULL;

-- ----------------------------------------------------------------------------
-- 5. Verification query (informational — returns count of still-null rows)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM public.debtors
  WHERE created_at IS NULL OR updated_at IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING 'debtors: % rows still have NULL timestamps after migration', null_count;
  ELSE
    RAISE NOTICE 'debtors: All timestamp columns successfully populated.';
  END IF;
END;
$$;
