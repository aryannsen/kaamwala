-- Migration: 20260905110000_secure_create_service_review_customer_ownership.sql
-- Description: Implement secure production create_service_review RPC with customer ownership enforcement and real professional rating recalculation
-- Phase 3 Step 8.3:
-- 1. Validates rating is between 1 and 5
-- 2. Normalizes and validates 10-digit customer phone
-- 3. Verifies request exists and belongs to the specified customer (phone verification)
-- 4. Verifies request status is strictly 'COMPLETED'
-- 5. Verifies request has an assigned professional
-- 6. Enforces single review per request (rejects duplicate reviews via check + UNIQUE constraint)
-- 7. Inserts review into public.reviews table
-- 8. Recalculates professional.rating as the REAL mathematical average of all reviews
-- 9. Preserves professional.completed_jobs (does NOT increment on review submission)
-- Security: SECURITY DEFINER with fixed search_path = public, pg_temp

-- Ensure UNIQUE constraint on reviews.request_id exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_request_id_key'
  ) THEN
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_request_id_key UNIQUE (request_id);
  END IF;
EXCEPTION
  WHEN duplicate_table OR duplicate_object THEN
    NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_service_review(
  p_request_id UUID,
  p_customer_phone TEXT,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_phone TEXT;
  v_customer_id UUID;
  v_request RECORD;
  v_professional_id UUID;
  v_existing_review_id UUID;
  v_review_id UUID;
  v_new_rating NUMERIC;
  v_clean_comment TEXT;
BEGIN
  -- 1. Validate rating is an integer between 1 and 5
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- 2. Normalize and validate customer phone (strip non-digits and leading country code 91 or 0)
  v_clean_phone := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF length(v_clean_phone) = 12 AND v_clean_phone LIKE '91%' THEN
    v_clean_phone := substr(v_clean_phone, 3);
  ELSIF length(v_clean_phone) = 11 AND v_clean_phone LIKE '0%' THEN
    v_clean_phone := substr(v_clean_phone, 2);
  END IF;

  IF v_clean_phone IS NULL OR length(v_clean_phone) <> 10 THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit mobile number';
  END IF;

  -- 3. Verify request exists and verify customer ownership via phone
  SELECT 
    sr.id,
    sr.status,
    sr.customer_id,
    c.id AS matched_customer_id
  INTO v_request
  FROM public.service_requests sr
  JOIN public.customers c ON sr.customer_id = c.id
  WHERE sr.id = p_request_id
    AND (
      c.phone = v_clean_phone
      OR regexp_replace(COALESCE(c.phone, ''), '[^0-9]', '', 'g') = v_clean_phone
    );

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Request not found or customer phone does not match booking';
  END IF;

  v_customer_id := v_request.customer_id;

  -- 4. Verify request status is strictly COMPLETED
  IF v_request.status <> 'COMPLETED' THEN
    RAISE EXCEPTION 'Only completed service requests can be reviewed';
  END IF;

  -- 5. Verify request has an assigned professional
  SELECT professional_id
  INTO v_professional_id
  FROM public.request_assignments
  WHERE request_id = p_request_id
    AND professional_id IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_professional_id IS NULL THEN
    RAISE EXCEPTION 'Completed assigned request not found';
  END IF;

  -- 6. Enforce single review per request (reject duplicate)
  SELECT id INTO v_existing_review_id
  FROM public.reviews
  WHERE request_id = p_request_id;

  IF v_existing_review_id IS NOT NULL THEN
    RAISE EXCEPTION 'This service request has already been reviewed';
  END IF;

  -- Clean comment text
  v_clean_comment := nullif(trim(COALESCE(p_comment, '')), '');

  -- 7. Insert the real review record
  INSERT INTO public.reviews (
    request_id,
    customer_id,
    professional_id,
    rating,
    comment,
    created_at,
    updated_at
  )
  VALUES (
    p_request_id,
    v_customer_id,
    v_professional_id,
    p_rating,
    v_clean_comment,
    now(),
    now()
  )
  RETURNING id INTO v_review_id;

  -- 8. Recalculate real aggregate rating for the professional from all their reviews
  SELECT ROUND(AVG(r.rating)::numeric, 2)
  INTO v_new_rating
  FROM public.reviews r
  WHERE r.professional_id = v_professional_id;

  IF v_new_rating IS NOT NULL THEN
    UPDATE public.professionals
    SET rating = v_new_rating
    WHERE id = v_professional_id;
  END IF;

  -- 9. NOTE on completed_jobs: Not modified here. Completed jobs represents completed work, not reviews.

  -- Return success payload
  RETURN jsonb_build_object(
    'success', true,
    'review_id', v_review_id,
    'request_id', p_request_id,
    'professional_id', v_professional_id,
    'rating', p_rating,
    'comment', v_clean_comment,
    'professional_new_rating', v_new_rating
  );
END;
$$;

-- Revoke public execution permissions and grant explicitly to client roles
REVOKE ALL ON FUNCTION public.create_service_review(UUID, TEXT, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_service_review(UUID, TEXT, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_service_review(UUID, TEXT, INTEGER, TEXT) TO authenticated;
