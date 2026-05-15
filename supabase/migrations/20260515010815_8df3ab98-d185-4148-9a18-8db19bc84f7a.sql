-- Extend trades for the order chat flow
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS customer_email text,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_notified boolean NOT NULL DEFAULT false;

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('user','admin')),
  body text,
  attachment_url text,
  attachment_name text,
  read_by_user boolean NOT NULL DEFAULT false,
  read_by_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_trade_id ON public.chat_messages(trade_id, created_at);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own trade messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.trades t WHERE t.id = trade_id AND t.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users send messages on own trades"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (sender_role = 'user' AND EXISTS (SELECT 1 FROM public.trades t WHERE t.id = trade_id AND t.user_id = auth.uid()))
      OR (sender_role = 'admin' AND public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Mark messages read"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.trades t WHERE t.id = trade_id AND t.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Allow users to delete their own trades only if needed (skip)

-- Realtime
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.trades REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trades;

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read chat attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Authenticated upload chat attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid() IS NOT NULL);
