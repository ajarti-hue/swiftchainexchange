
ALTER TABLE public.trades DROP CONSTRAINT IF EXISTS trades_status_check;
ALTER TABLE public.trades ADD CONSTRAINT trades_status_check CHECK (status = ANY (ARRAY['pending'::text, 'awaiting_confirmation'::text, 'completed'::text, 'cancelled'::text]));
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS ai_paused boolean NOT NULL DEFAULT false;
