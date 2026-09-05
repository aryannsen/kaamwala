-- Migration: 20260905100000_fix_create_service_request_price_semantics.sql
-- Description: Fix production pricing semantics in create_service_request RPC
-- Phase 3 Step 8.2: Ensure service_options.starting_price is NOT automatically copied into service_requests.estimated_price.
-- Pricing contract:
--   - pricing_type = service_options.pricing_type
--   - estimated_price = NULL (authoritative request-specific estimate to be established later by admin review)
--   - confirmed_price = NULL
--   - status = 'REQUESTED'
-- Security: SECURITY DEFINER with fixed search_path = public, pg_temp

CREATE OR REPLACE FUNCTION public.create_service_request(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_address_line TEXT,
  p_area TEXT,
  p_city TEXT,
  p_state TEXT,
  p_pincode TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_service_option_id UUID,
  p_problem_description TEXT DEFAULT NULL,
  p_problem_photos JSONB DEFAULT '[]'::jsonb,
  p_customer_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_phone TEXT;
  v_clean_name TEXT;
  v_customer_id UUID;
  v_address_id UUID;
  v_service_option RECORD;
  v_booking_code TEXT;
  v_request_id UUID;
BEGIN
  -- 1. Normalize and validate customer phone (strip non-digits and leading country code 91 or 0)
  v_clean_phone := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF length(v_clean_phone) = 12 AND v_clean_phone LIKE '91%' THEN
    v_clean_phone := substr(v_clean_phone, 3);
  ELSIF length(v_clean_phone) = 11 AND v_clean_phone LIKE '0%' THEN
    v_clean_phone := substr(v_clean_phone, 2);
  END IF;

  IF v_clean_phone IS NULL OR length(v_clean_phone) <> 10 THEN
    RAISE EXCEPTION 'Please provide a valid 10-digit mobile number';
  END IF;

  -- 2. Validate customer name
  v_clean_name := trim(COALESCE(p_customer_name, ''));
  IF length(v_clean_name) < 2 THEN
    RAISE EXCEPTION 'Customer name is required and must be at least 2 characters';
  END IF;

  -- 3. Upsert customer record
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE phone = v_clean_phone
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (name, phone)
    VALUES (v_clean_name, v_clean_phone)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET name = v_clean_name
    WHERE id = v_customer_id;
  END IF;

  -- 4. Create customer address
  INSERT INTO public.customer_addresses (
    customer_id,
    address_line,
    area,
    city,
    state,
    pincode,
    latitude,
    longitude
  ) VALUES (
    v_customer_id,
    trim(COALESCE(p_address_line, '')),
    trim(COALESCE(p_area, '')),
    trim(COALESCE(p_city, 'Kadi')),
    trim(COALESCE(p_state, 'Gujarat')),
    trim(COALESCE(p_pincode, '382715')),
    p_latitude,
    p_longitude
  )
  RETURNING id INTO v_address_id;

  -- 5. Validate service option exists and is active
  SELECT * INTO v_service_option
  FROM public.service_options
  WHERE id = p_service_option_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service option not found or inactive';
  END IF;

  -- 6. Generate booking code
  v_booking_code := public.generate_booking_code();

  -- 7. Insert service request with strict pricing semantics:
  --    - pricing_type set from catalog option
  --    - estimated_price explicitly NULL (never copied from starting_price)
  --    - confirmed_price explicitly NULL
  --    - status initialized to 'REQUESTED'
  INSERT INTO public.service_requests (
    booking_code,
    customer_id,
    address_id,
    service_option_id,
    problem_description,
    problem_photos,
    pricing_type,
    estimated_price,
    confirmed_price,
    status,
    customer_notes
  ) VALUES (
    v_booking_code,
    v_customer_id,
    v_address_id,
    p_service_option_id,
    nullif(trim(COALESCE(p_problem_description, '')), ''),
    COALESCE(p_problem_photos, '[]'::jsonb),
    v_service_option.pricing_type,
    NULL,
    NULL,
    'REQUESTED',
    nullif(trim(COALESCE(p_customer_notes, '')), '')
  )
  RETURNING id INTO v_request_id;

  -- 8. Record initial status in request_status_history
  INSERT INTO public.request_status_history (
    request_id,
    status,
    changed_by
  ) VALUES (
    v_request_id,
    'REQUESTED',
    v_customer_id
  );

  RETURN v_request_id;
END;
$$;

-- Explicitly revoke public execution permissions and grant only to client roles
REVOKE ALL ON FUNCTION public.create_service_request(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, UUID, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_service_request(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, UUID, TEXT, JSONB, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.create_service_request(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, NUMERIC, NUMERIC, UUID, TEXT, JSONB, TEXT) TO authenticated;
