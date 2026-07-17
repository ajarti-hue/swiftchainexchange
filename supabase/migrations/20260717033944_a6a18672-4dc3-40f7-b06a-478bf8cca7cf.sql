
CREATE TABLE public.number_rentals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  service_name TEXT NOT NULL,
  country TEXT NOT NULL,
  country_name TEXT NOT NULL,
  price_ghs NUMERIC(12,2) NOT NULL,
  provider TEXT NOT NULL DEFAULT '5sim',
  provider_order_id TEXT,
  phone_number TEXT,
  provider_expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment','payment_confirmed','number_assigned','waiting_sms','sms_received','expired','cancelled','refund_requested')),
  sms_sender TEXT,
  sms_code TEXT,
  sms_text TEXT,
  sms_received_at TIMESTAMPTZ,
  momo_reference TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.number_rentals TO authenticated;
GRANT ALL ON public.number_rentals TO service_role;

ALTER TABLE public.number_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rentals"
  ON public.number_rentals FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own rentals"
  ON public.number_rentals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own pending rentals"
  ON public.number_rentals FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending_payment')
  WITH CHECK (auth.uid() = user_id AND status IN ('cancelled','pending_payment'));

CREATE POLICY "Admins manage all rentals"
  ON public.number_rentals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_number_rentals_updated_at
  BEFORE UPDATE ON public.number_rentals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_number_rentals_user ON public.number_rentals(user_id, created_at DESC);
CREATE INDEX idx_number_rentals_status ON public.number_rentals(status);

ALTER PUBLICATION supabase_realtime ADD TABLE public.number_rentals;
