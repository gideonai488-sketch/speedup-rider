import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useConversation, useSendMessage } from '@/hooks/useMessages';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ChatViewProps {
  otherProfileId: string;
  otherName: string;
  otherPhone?: string;
  orderId?: string;
  onBack: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ otherProfileId, otherName, otherPhone, orderId, onBack }) => {
  const { profile } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages = [] } = useConversation(profile?.id || '', otherProfileId);
  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !profile) return;
    try {
      await sendMessage.mutateAsync({
        senderId: profile.id,
        receiverId: otherProfileId,
        content: message.trim(),
        orderId,
      });
      setMessage('');
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
          {otherName.charAt(0)}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">{otherName}</p>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>
        {otherPhone && (
          <a href={`tel:${otherPhone}`}>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Phone className="w-5 h-5 text-primary" />
            </Button>
          </a>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No messages yet. Say hello! 👋</p>
          </div>
        )}
        {messages.map((msg: any) => {
          const isMine = msg.sender_id === profile?.id;
          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5",
                isMine 
                  ? "bg-primary text-primary-foreground rounded-br-md" 
                  : "bg-secondary text-foreground rounded-bl-md"
              )}>
                <p className="text-sm">{msg.content}</p>
                <p className={cn(
                  "text-[10px] mt-1",
                  isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                )}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card border-t border-border p-3 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full"
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          size="icon"
          className="rounded-full shrink-0"
          onClick={handleSend}
          disabled={!message.trim() || sendMessage.isPending}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatView;
