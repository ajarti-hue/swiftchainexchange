
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  total_trades INTEGER NOT NULL DEFAULT 0,
  rewards_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('Gift Card', 'Crypto')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('Gift Card', 'Crypto')),
  action TEXT NOT NULL CHECK (action IN ('buy', 'sell')),
  item TEXT NOT NULL,
  amount NUMERIC(12,2),
  reward_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed reviews
INSERT INTO public.reviews (user_id, name, rating, comment, trade_type, created_at) VALUES
  (NULL, 'Kwame A.', 5, 'Traded my Amazon gift card in under 10 minutes. Best rates I''ve found anywhere. Will definitely come back!', 'Gift Card', '2026-02-28'),
  (NULL, 'Ama B.', 5, 'Sold USDT quickly and got paid instantly. Very professional and trustworthy service.', 'Crypto', '2026-02-25'),
  (NULL, 'Yaw M.', 4, 'Great experience buying Bitcoin. The WhatsApp support made everything easy to follow.', 'Crypto', '2026-02-20'),
  (NULL, 'Efua K.', 5, 'I''ve done 5 trades so far and earned bonus rewards. SwiftChain X is my go-to for gift cards!', 'Gift Card', '2026-03-01');
