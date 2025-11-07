import { Phone, Video, MoreVertical, Paperclip, Mic, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Message } from "./Message";
import { useChatContext } from "@/contexts/ChatContext";
import { useMessages } from "@/hooks/useMessages";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { mockMessages, mockConversations } from "@/data/mockData";
import { MobileChatHeader } from "./MobileChatHeader";
import { VoiceRecorder } from "./VoiceRecorder";
import { cn } from "@/lib/utils";

type ChatAreaProps = {
  isMobile?: boolean;
  onBack?: () => void;
  onMenuClick?: () => void;
};

export const ChatArea = ({ isMobile = false, onBack, onMenuClick }: ChatAreaProps) => {
  const { selectedConversationId, isGuest } = useChatContext();
  const { data: messages, isLoading } = useMessages(selectedConversationId);
  const [messageInput, setMessageInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [guestMessages, setGuestMessages] = useState<Record<string, any[]>>({});
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isGuest) {
      setCurrentUserId("guest");
      return;
    }
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUser();
  }, [isGuest]);

  useEffect(() => {
    if (isGuest && selectedConversationId) {
      const conversation = mockConversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        setOtherParticipant(conversation.participant);
      }
      return;
    }

    const fetchOtherParticipant = async () => {
      if (!selectedConversationId || !currentUserId) return;

      const { data, error } = await (supabase as any)
        .from("conversation_participants")
        .select(`
          profiles!inner (
            id,
            full_name,
            username,
            avatar_url,
            status
          )
        `)
        .eq("conversation_id", selectedConversationId)
        .neq("user_id", currentUserId)
        .single();

      if (!error && data) {
        setOtherParticipant((data as any).profiles);
      }
    };

    fetchOtherParticipant();
  }, [selectedConversationId, currentUserId, isGuest]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || messageInput;
    if (!messageContent.trim() || !selectedConversationId || !currentUserId) return;

    if (isGuest) {
      const newMessage = {
        id: `guest-msg-${Date.now()}`,
        conversation_id: selectedConversationId,
        sender_id: "guest",
        content: messageContent,
        created_at: new Date().toISOString(),
        sender: {
          id: "guest",
          full_name: "Guest User",
          username: "guest",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
        },
      };

      setGuestMessages(prev => ({
        ...prev,
        [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
      }));

      setMessageInput("");
      return;
    }

    const { error } = await (supabase as any)
      .from("messages")
      .insert({
        conversation_id: selectedConversationId,
        sender_id: currentUserId,
        content: messageContent,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setMessageInput("");
  };

  const handleVoiceMessageSend = (transcript: string) => {
    handleSendMessage(transcript);
    setIsRecordingVoice(false);
  };

  if (!selectedConversationId) {
    return (
      <main className="flex-1 flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Select a conversation to start chatting</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      {/* Mobile Chat Header */}
      {isMobile && onBack && onMenuClick && (
        <MobileChatHeader
          onBack={onBack}
          onMenuClick={onMenuClick}
          otherParticipant={otherParticipant}
        />
      )}

      {/* Desktop Chat Header */}
      <header className={cn(
        "h-16 border-b border-border flex items-center justify-between px-6",
        isMobile && "hidden"
      )}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherParticipant?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.username}`} />
            <AvatarFallback>{otherParticipant?.full_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {otherParticipant?.full_name || otherParticipant?.username || 'Unknown User'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {otherParticipant?.status || 'offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isGuest ? (
          selectedConversationId ? (
            (() => {
              const allMessages = [
                ...(mockMessages[selectedConversationId] || []),
                ...(guestMessages[selectedConversationId] || []),
              ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              
              return allMessages.length > 0 ? (
                allMessages.map((message: any) => (
                  <Message
                    key={message.id}
                    sender={message.sender.full_name || message.sender.username}
                    content={message.content}
                    timestamp={format(new Date(message.created_at), 'PPp')}
                    isSent={message.sender_id === currentUserId}
                    avatar={message.sender.avatar_url}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
              );
            })()
          ) : (
            <p className="text-center text-muted-foreground">Select a conversation to start chatting</p>
          )
        ) : isLoading ? (
          <p className="text-center text-muted-foreground">Loading messages...</p>
        ) : messages && messages.length > 0 ? (
          messages.map((message: any) => (
            <Message
              key={message.id}
              sender={message.sender.full_name || message.sender.username}
              content={message.content}
              timestamp={format(new Date(message.created_at), 'PPp')}
              isSent={message.sender_id === currentUserId}
              avatar={message.sender.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.username}`}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        {isRecordingVoice ? (
          <VoiceRecorder
            onVoiceMessageSend={handleVoiceMessageSend}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Type a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-muted border-0 text-foreground placeholder:text-muted-foreground"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsRecordingVoice(true)}
              className="text-muted-foreground hover:bg-muted"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              size="icon" 
              onClick={() => handleSendMessage()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};
