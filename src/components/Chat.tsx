import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'system' | 'game';
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_premium: boolean;
  };
}

interface ChatProps {
  roomId: string;
  isGameActive: boolean;
  onSendMessage?: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ roomId, isGameActive, onSendMessage }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_user_id_fkey(username, display_name, avatar_url, is_premium)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
      
      // Call parent callback if provided
      if (onSendMessage) {
        onSendMessage(newMessage.trim());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = (message: ChatMessage) => {
    if (message.message_type === 'system') {
      return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
    }
    if (message.message_type === 'game') {
      return 'bg-green-500/10 border-green-500/20 text-green-600';
    }
    if (message.user_id === user?.id) {
      return 'bg-primary/10 border-primary/20 ml-auto';
    }
    return 'bg-muted/30 border-muted/50';
  };

  const compactView = (
    <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg">
      <MessageCircle className="h-4 w-4" />
      <span className="text-sm font-medium">Chat ({messages.length})</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(true)}
        className="ml-auto h-6 w-6 p-0"
      >
        <MessageCircle className="h-3 w-3" />
      </Button>
    </div>
  );

  const expandedView = (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5" />
          Chat
          <Badge variant="secondary" className="ml-auto">
            {messages.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay mensajes aún</p>
              <p className="text-xs text-muted-foreground">¡Sé el primero en escribir!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 max-w-[80%] ${message.user_id === user?.id ? 'ml-auto' : ''}`}
              >
                {message.user_id !== user?.id && message.message_type === 'text' && (
                  <Avatar
                    username={message.profiles.username}
                    avatarUrl={message.profiles.avatar_url || undefined}
                    size="sm"
                  />
                )}
                <div className={`flex-1 p-3 rounded-lg border ${getMessageStyle(message)}`}>
                  {message.message_type === 'text' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {message.profiles.display_name || message.profiles.username}
                      </span>
                      {message.profiles.is_premium && (
                        <Crown className="h-3 w-3 text-yellow-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    {message.message_type === 'system' && '🔔 '}
                    {message.message_type === 'game' && '🎮 '}
                    {message.message}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex gap-2">
            <Input
              placeholder={isGameActive ? "Escribe un mensaje..." : "¡Saluda a tus compañeros!"}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="sm"
              className="game-button"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full">
      {isExpanded ? expandedView : compactView}
    </div>
  );
};

export default Chat;
