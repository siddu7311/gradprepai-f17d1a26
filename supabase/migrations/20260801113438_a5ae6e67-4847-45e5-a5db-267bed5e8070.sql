CREATE TABLE public.upi_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  amount NUMERIC NOT NULL DEFAULT 199,
  currency TEXT NOT NULL DEFAULT 'INR',
  plan TEXT NOT NULL DEFAULT 'pro',
  upi_reference TEXT NOT NULL,
  payer_phone TEXT,
  status TEXT NOT NULL DEFAULT 'approved',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upi_payments_user ON public.upi_payments(user_id, expires_at DESC);

GRANT SELECT ON public.upi_payments TO authenticated;
GRANT ALL ON public.upi_payments TO service_role;

ALTER TABLE public.upi_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.upi_payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
ON public.upi_payments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));