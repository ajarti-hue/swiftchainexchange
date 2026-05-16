
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  instructions TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active payment methods"
ON public.payment_methods FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage payment methods"
ON public.payment_methods FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_methods (label, type, details, instructions, sort_order) VALUES
('MTN Mobile Money', 'Mobile Money', '+233 55 509 8098', 'Send to this number and include the order ID as reference.', 1),
('Vodafone Cash', 'Mobile Money', '+233 55 509 8098', 'Send to this number and share the transaction ID in chat.', 2),
('AirtelTigo Money', 'Mobile Money', '+233 55 509 8098', 'Send to this number and confirm here in chat.', 3),
('Bank Transfer (GHS)', 'Bank', 'Account: 1234567890 — SwiftChain X Ltd', 'Use your order ID as the transfer reference.', 4);
