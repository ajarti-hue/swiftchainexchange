
-- 1. Lock down SECURITY DEFINER function execution
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 2. Prevent privilege escalation via profile updates
-- A trigger resets protected columns to their previous values for non-admin updates.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.rewards_balance := OLD.rewards_balance;
    NEW.total_trades := OLD.total_trades;
    NEW.email_verified := OLD.email_verified;
    NEW.user_id := OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 3. Realtime: remove tables from realtime publication so subscribers can't leak other users' rows
ALTER PUBLICATION supabase_realtime DROP TABLE public.trades;
ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages;
