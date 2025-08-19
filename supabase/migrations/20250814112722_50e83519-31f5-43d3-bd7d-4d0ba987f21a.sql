-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_players INTEGER NOT NULL DEFAULT 5,
  current_players INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  ai_mode TEXT NOT NULL DEFAULT 'random' CHECK (ai_mode IN ('random', 'host_choice')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_players table
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL,
  current_turn_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'photo_taking', 'guessing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_rounds table
CREATE TABLE public.game_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  photographer_id UUID NOT NULL REFERENCES auth.users(id),
  photo_url TEXT,
  selected_object TEXT,
  selected_object_spanish TEXT,
  selected_object_english TEXT,
  first_letter TEXT,
  detected_objects JSONB,
  winner_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'photo_taken', 'object_selected', 'guessing', 'finished')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_scores table
CREATE TABLE public.player_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  UNIQUE(game_id, user_id)
);

-- Create player_guesses table
CREATE TABLE public.player_guesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL REFERENCES public.game_rounds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guess TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_guesses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rooms
CREATE POLICY "Users can view rooms they are in" ON public.rooms FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.room_players WHERE room_id = id
  ) OR auth.uid() = host_id
);
CREATE POLICY "Users can create rooms" ON public.rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update their rooms" ON public.rooms FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Host can delete their rooms" ON public.rooms FOR DELETE USING (auth.uid() = host_id);

-- RLS Policies for room_players
CREATE POLICY "Users can view players in their rooms" ON public.room_players FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.room_players WHERE room_id = room_players.room_id
  )
);
CREATE POLICY "Users can join rooms" ON public.room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave rooms" ON public.room_players FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for games
CREATE POLICY "Players can view their games" ON public.games FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM public.room_players WHERE room_id = games.room_id
  )
);
CREATE POLICY "Host can manage games" ON public.games FOR ALL USING (
  auth.uid() IN (
    SELECT host_id FROM public.rooms WHERE id = games.room_id
  )
);

-- RLS Policies for game_rounds
CREATE POLICY "Players can view rounds in their games" ON public.game_rounds FOR SELECT USING (
  auth.uid() IN (
    SELECT rp.user_id FROM public.room_players rp 
    JOIN public.games g ON g.room_id = rp.room_id 
    WHERE g.id = game_rounds.game_id
  )
);
CREATE POLICY "Photographers can update their rounds" ON public.game_rounds FOR UPDATE USING (auth.uid() = photographer_id);
CREATE POLICY "Host can manage rounds" ON public.game_rounds FOR ALL USING (
  auth.uid() IN (
    SELECT r.host_id FROM public.rooms r 
    JOIN public.games g ON g.room_id = r.id 
    WHERE g.id = game_rounds.game_id
  )
);

-- RLS Policies for player_scores
CREATE POLICY "Players can view scores in their games" ON public.player_scores FOR SELECT USING (
  auth.uid() IN (
    SELECT rp.user_id FROM public.room_players rp 
    JOIN public.games g ON g.room_id = rp.room_id 
    WHERE g.id = player_scores.game_id
  )
);
CREATE POLICY "System can manage scores" ON public.player_scores FOR ALL USING (true);

-- RLS Policies for player_guesses
CREATE POLICY "Players can view guesses in their rounds" ON public.player_guesses FOR SELECT USING (
  auth.uid() IN (
    SELECT rp.user_id FROM public.room_players rp 
    JOIN public.games g ON g.room_id = rp.room_id 
    JOIN public.game_rounds gr ON gr.game_id = g.id 
    WHERE gr.id = player_guesses.round_id
  )
);
CREATE POLICY "Players can submit their own guesses" ON public.player_guesses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('game-photos', 'game-photos', true);

-- Storage policies
CREATE POLICY "Players can upload photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'game-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Players can view game photos" ON storage.objects FOR SELECT USING (bucket_id = 'game-photos');

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  random_username TEXT;
  username_exists BOOLEAN;
BEGIN
  -- Generate random username
  LOOP
    random_username := 'Player' || floor(random() * 999999 + 1)::text;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE username = random_username) INTO username_exists;
    EXIT WHEN NOT username_exists;
  END LOOP;

  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    NEW.id, 
    random_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', random_username)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();