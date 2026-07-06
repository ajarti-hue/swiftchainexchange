
-- Tighten RLS: scope policies to authenticated role, and enforce that non-admins
-- cannot modify sensitive profile columns (rewards_balance, total_trades,
-- email_verified, user_id) via the existing prevent_profile_privilege_escalation
-- trigger function.

-- 1) profiles: wire the privilege-escalation guard trigger and scope UPDATE to authenticated
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2) trades: scope INSERT and SELECT to authenticated only
DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
CREATE POLICY "Users can insert their own trades"
  ON public.trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
CREATE POLICY "Users can view their own trades"
  ON public.trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) chat_messages: scope INSERT/SELECT/UPDATE to authenticated only
DROP POLICY IF EXISTS "Users send messages on own trades" ON public.chat_messages;
CREATE POLICY "Users send messages on own trades"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (sender_id = auth.uid())
    AND (
      (
        sender_role = 'user'
        AND EXISTS (
          SELECT 1 FROM public.trades t
          WHERE t.id = chat_messages.trade_id AND t.user_id = auth.uid()
        )
      )
      OR (sender_role = 'admin' AND public.has_role(auth.uid(), 'admin'::app_role))
    )
  );

DROP POLICY IF EXISTS "Users view own trade messages" ON public.chat_messages;
CREATE POLICY "Users view own trade messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trades t
      WHERE t.id = chat_messages.trade_id AND t.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Mark messages read" ON public.chat_messages;
CREATE POLICY "Mark messages read"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trades t
      WHERE t.id = chat_messages.trade_id AND t.user_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );
