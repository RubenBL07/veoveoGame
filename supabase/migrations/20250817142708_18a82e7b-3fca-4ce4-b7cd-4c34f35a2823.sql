-- Fix infinite recursion in room_players RLS policy
-- Create security definer function to check if user is in room
CREATE OR REPLACE FUNCTION public.user_is_in_room(target_room_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM room_players 
    WHERE room_id = target_room_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view players in their rooms" ON room_players;

-- Create new policy using the security definer function
CREATE POLICY "Users can view players in their rooms" 
ON room_players 
FOR SELECT 
USING (public.user_is_in_room(room_id));