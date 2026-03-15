
CREATE TABLE public.crypto_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crypto_name text NOT NULL,
  crypto_symbol text NOT NULL,
  buy_rate numeric NOT NULL DEFAULT 0,
  sell_rate numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid DEFAULT NULL
);

ALTER TABLE public.crypto_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crypto rates" ON public.crypto_rates FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage crypto rates" ON public.crypto_rates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.crypto_rates (crypto_name, crypto_symbol, buy_rate, sell_rate) VALUES
  ('Bitcoin', 'BTC', 15.50, 15.00),
  ('Ethereum', 'ETH', 15.50, 15.00),
  ('USDT (Tether)', 'USDT', 15.50, 15.00),
  ('Bitcoin Cash', 'BCH', 15.50, 15.00),
  ('Litecoin', 'LTC', 15.50, 15.00),
  ('Ripple', 'XRP', 15.50, 15.00),
  ('Stellar', 'XLM', 15.50, 15.00),
  ('Dash', 'DASH', 15.50, 15.00);
