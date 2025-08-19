-- Fix database functions to have proper search path security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.user_is_in_room(target_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_players 
    WHERE room_id = target_room_id AND user_id = auth.uid()
  );
END;
$function$;