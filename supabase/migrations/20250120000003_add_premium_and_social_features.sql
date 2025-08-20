-- Add premium and social features to match PRD requirements

-- Add premium subscription fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS karma INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS private_rooms_today INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_room_reset DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login DATE DEFAULT CURRENT_DATE;

-- Add missing room configuration fields
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_name VARCHAR(25);
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(10) DEFAULT 'private' CHECK (room_type IN ('private', 'public'));
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS time_per_round INTEGER DEFAULT 60;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'es';

-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_name VARCHAR(100) NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Create daily challenges table
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type VARCHAR(50) NOT NULL,
  challenge_name VARCHAR(100) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL, -- 'xp', 'games_won', 'accuracy', etc.
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  region VARCHAR(10),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, region)
);

-- Enable RLS on new tables
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friends
CREATE POLICY "Users can view their own friends" ON public.friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can manage their own friend requests" ON public.friends FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage achievements" ON public.achievements FOR ALL USING (true);

-- RLS Policies for daily challenges
CREATE POLICY "Users can view their own challenges" ON public.daily_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage challenges" ON public.daily_challenges FOR ALL USING (true);

-- RLS Policies for leaderboards
CREATE POLICY "Users can view leaderboards" ON public.leaderboards FOR SELECT USING (true);
CREATE POLICY "System can manage leaderboards" ON public.leaderboards FOR ALL USING (true);

-- Function to reset daily room count
CREATE OR REPLACE FUNCTION public.reset_daily_rooms()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_room_reset != CURRENT_DATE THEN
    NEW.private_rooms_today = 0;
    NEW.last_room_reset = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset daily rooms
CREATE TRIGGER reset_daily_rooms_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_daily_rooms();

-- Function to check premium status and room limits
CREATE OR REPLACE FUNCTION public.can_create_private_room(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT is_premium, private_rooms_today INTO user_profile
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  IF user_profile.is_premium THEN
    RETURN TRUE;
  ELSE
    RETURN user_profile.private_rooms_today < 3;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_xp(user_uuid UUID, xp_amount INTEGER, reason VARCHAR(100))
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  current_level INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current XP and level
  SELECT xp, level INTO current_xp, current_level
  FROM public.profiles
  WHERE user_id = user_uuid;
  
  -- Calculate new XP and level
  new_xp := current_xp + xp_amount;
  new_level := 1 + (new_xp / 1000); -- Level = 1 + (XP / 1000)
  
  -- Update profile
  UPDATE public.profiles
  SET xp = new_xp, level = new_level
  WHERE user_id = user_uuid;
  
  -- Log achievement if level up
  IF new_level > current_level THEN
    INSERT INTO public.achievements (user_id, achievement_type, achievement_name, description)
    VALUES (user_uuid, 'level_up', 'Nivel ' || new_level, 'Alcanzaste el nivel ' || new_level);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create daily challenges
CREATE OR REPLACE FUNCTION public.create_daily_challenges(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete existing incomplete challenges
  DELETE FROM public.daily_challenges 
  WHERE user_id = user_uuid AND completed = FALSE;
  
  -- Create new challenges based on user type
  INSERT INTO public.daily_challenges (user_id, challenge_type, challenge_name, description, target_value, xp_reward)
  VALUES 
    (user_uuid, 'play_games', 'Jugar 3 partidas', 'Completa 3 partidas hoy', 3, 500),
    (user_uuid, 'correct_guesses', 'Adivinar 5 objetos', 'Adivina correctamente 5 objetos', 5, 500);
    
  -- Add extra challenge for premium users
  INSERT INTO public.daily_challenges (user_id, challenge_type, challenge_name, description, target_value, xp_reward)
  SELECT user_uuid, 'win_games', 'Ganar 2 partidas', 'Gana 2 partidas hoy', 2, 750
  FROM public.profiles
  WHERE user_id = user_uuid AND is_premium = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
