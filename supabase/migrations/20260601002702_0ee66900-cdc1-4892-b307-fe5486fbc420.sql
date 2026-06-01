-- Security hardening: handle_new_user is only invoked by a trigger as the
-- table owner (SECURITY DEFINER), so revoke direct EXECUTE from API roles.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- has_role MUST remain executable by authenticated, because every RLS policy
-- that calls it is evaluated as the caller's role. Revoke from anon only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;