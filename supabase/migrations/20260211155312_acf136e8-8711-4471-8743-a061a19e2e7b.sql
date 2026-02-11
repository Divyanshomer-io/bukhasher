
-- Users table (simple auth, no password)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_lower TEXT NOT NULL GENERATED ALWAYS AS (lower(trim(name))) STORED,
  avatar TEXT NOT NULL DEFAULT '🐯',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_users_name_lower ON public.users (name_lower);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Everyone can read users (small group app)
CREATE POLICY "Anyone can view users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update users" ON public.users FOR UPDATE USING (true);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  food_item TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, user_id)
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete orders" ON public.orders FOR DELETE USING (true);

-- Day payments table
CREATE TABLE public.day_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  paid_by UUID NOT NULL REFERENCES public.users(id),
  total_amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.day_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view day_payments" ON public.day_payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert day_payments" ON public.day_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete day_payments" ON public.day_payments FOR DELETE USING (true);

-- Split details table
CREATE TABLE public.split_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_payment_id UUID NOT NULL REFERENCES public.day_payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  amount NUMERIC(10,2) NOT NULL
);

ALTER TABLE public.split_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view split_details" ON public.split_details FOR SELECT USING (true);
CREATE POLICY "Anyone can insert split_details" ON public.split_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete split_details" ON public.split_details FOR DELETE USING (true);

-- Balances table (net amounts between user pairs)
CREATE TABLE public.balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL REFERENCES public.users(id),
  user_b UUID NOT NULL REFERENCES public.users(id),
  net_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE(user_a, user_b),
  CHECK (user_a < user_b)
);

ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view balances" ON public.balances FOR SELECT USING (true);
CREATE POLICY "Anyone can insert balances" ON public.balances FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update balances" ON public.balances FOR UPDATE USING (true);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.day_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.split_details;
ALTER PUBLICATION supabase_realtime ADD TABLE public.balances;
