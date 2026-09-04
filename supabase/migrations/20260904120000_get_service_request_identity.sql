-- Migration: 20260904120000_get_service_request_identity.sql
-- Description: Additive customer-safe booking identity RPC for KaamWala Customer Website
-- Security: SECURITY DEFINER with fixed search_path; returns only request_id and booking_code
-- Ownership verification: Requires matching service_requests.id AND customers.phone

CREATE OR REPLACE FUNCTION public.get_service_request_identity(
  p_request_id UUID,
  p_customer_phone TEXT
)
RETURNS TABLE (
  request_id UUID,
  booking_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_clean_phone TEXT;
BEGIN
  -- Normalize customer phone: strip non-digits and leading country code 91 or 0
  v_clean_phone := regexp_replace(COALESCE(p_customer_phone, ''), '[^0-9]', '', 'g');
  IF length(v_clean_phone) = 12 AND v_clean_phone LIKE '91%' THEN
    v_clean_phone := substr(v_clean_phone, 3);
  ELSIF length(v_clean_phone) = 11 AND v_clean_phone LIKE '0%' THEN
    v_clean_phone := substr(v_clean_phone, 2);
  END IF;

  -- Validate phone format (10-digit Indian mobile)
  IF v_clean_phone IS NULL OR length(v_clean_phone) <> 10 THEN
    RETURN;
  END IF;

  -- Return only request_id and booking_code if request UUID and customer phone strictly match
  RETURN QUERY
  SELECT 
    sr.id AS request_id,
    sr.booking_code
  FROM public.service_requests sr
  JOIN public.customers c ON sr.customer_id = c.id
  WHERE sr.id = p_request_id
    AND (
      c.phone = v_clean_phone
      OR regexp_replace(COALESCE(c.phone, ''), '[^0-9]', '', 'g') = v_clean_phone
    )
  LIMIT 1;
END;
$$;

-- Explicitly revoke public execution permissions and grant only to client roles
REVOKE ALL ON FUNCTION public.get_service_request_identity(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_service_request_identity(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_service_request_identity(UUID, TEXT) TO authenticated;
