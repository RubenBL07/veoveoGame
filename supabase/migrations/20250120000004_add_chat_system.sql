-- Add chat system for real-time communication
-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'game')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in rooms they're part of" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_players 
      WHERE room_players.room_id = chat_messages.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in rooms they're part of" ON public.chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.room_players 
      WHERE room_players.room_id = chat_messages.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Function to send system messages
CREATE OR REPLACE FUNCTION public.send_system_message(room_uuid UUID, message_text TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.chat_messages (room_id, user_id, message, message_type)
  VALUES (room_uuid, '00000000-0000-0000-0000-000000000000', message_text, 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send game messages
CREATE OR REPLACE FUNCTION public.send_game_message(room_uuid UUID, message_text TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.chat_messages (room_id, user_id, message, message_type)
  VALUES (room_uuid, '00000000-0000-0000-0000-000000000000', message_text, 'game');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
