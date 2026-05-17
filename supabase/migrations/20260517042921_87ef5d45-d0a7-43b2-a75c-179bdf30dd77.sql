-- Ensure 'bot' is a valid sender_role (no explicit check constraint existed, but add one safely)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.chat_messages'::regclass
      AND conname = 'chat_messages_sender_role_check'
  ) THEN
    ALTER TABLE public.chat_messages DROP CONSTRAINT chat_messages_sender_role_check;
  END IF;
END $$;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_sender_role_check
  CHECK (sender_role IN ('user', 'admin', 'bot'));