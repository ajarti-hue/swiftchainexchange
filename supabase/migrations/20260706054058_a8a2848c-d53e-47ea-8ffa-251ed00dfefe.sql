
DROP POLICY IF EXISTS "Mark messages read" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update read status on own trade messages" ON public.chat_messages;

CREATE OR REPLACE FUNCTION public.mark_messages_read(p_trade_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_admin boolean;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  v_is_admin := public.has_role(v_uid, 'admin');

  IF v_is_admin THEN
    UPDATE public.chat_messages
       SET read_by_admin = true
     WHERE trade_id = p_trade_id
       AND sender_id <> v_uid
       AND read_by_admin = false;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.trades t WHERE t.id = p_trade_id AND t.user_id = v_uid) THEN
      RAISE EXCEPTION 'forbidden';
    END IF;
    UPDATE public.chat_messages
       SET read_by_user = true
     WHERE trade_id = p_trade_id
       AND sender_id <> v_uid
       AND read_by_user = false;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_messages_read(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(uuid) TO authenticated;
