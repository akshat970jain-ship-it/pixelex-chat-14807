import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  status?: string;
  phone?: string;
};

type NewChatDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (conversationId: string) => void;
};

export const NewChatDialog = ({ open, onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchProfiles();
    }
  }, [open]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("user_id", user.id)
        .order("full_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (otherUserId: string) => {
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if conversation already exists
      const { data: existingConversations } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", user.id);

      if (existingConversations) {
        for (const conv of existingConversations) {
          const { data: otherParticipants } = await supabase
            .from("conversation_participants")
            .select("user_id")
            .eq("conversation_id", conv.conversation_id)
            .neq("user_id", user.id);

          if (otherParticipants && otherParticipants.length === 1 && otherParticipants[0].user_id === otherUserId) {
            // Conversation exists
            onChatCreated(conv.conversation_id);
            onOpenChange(false);
            return;
          }
        }
      }

      // Create new conversation
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({})
        .select()
        .single();

      if (convError) throw convError;

      // Add participants
      const { error: participantsError } = await supabase
        .from("conversation_participants")
        .insert([
          { conversation_id: conversation.id, user_id: user.id },
          { conversation_id: conversation.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      toast({
        title: "Success",
        description: "New conversation created",
      });

      onChatCreated(conversation.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile.phone && profile.phone.includes(searchQuery))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No users found
              </p>
            ) : (
              filteredProfiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => createConversation(profile.user_id)}
                  disabled={creating}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                        />
                        <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
                      </Avatar>
                      {profile.status === "online" && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.phone || `@${profile.username}`}
                      </p>
                    </div>
                  </div>
                </Button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
