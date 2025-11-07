import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConversations = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await (supabase as any)
        .from("conversation_participants")
        .select(`
          conversation_id,
          conversations!inner (
            id,
            updated_at,
            conversation_participants!inner (
              profiles!inner (
                id,
                full_name,
                username,
                avatar_url,
                status
              )
            )
          )
        `)
        .eq("user_id", userId);

      if (error) throw error;

      // Transform data to get conversation with other participant info
      const conversations = data.map((item: any) => {
        const conversation = item.conversations;
        const otherParticipant = conversation.conversation_participants
          .find((p: any) => p.profiles.id !== userId)?.profiles;

        return {
          id: conversation.id,
          updated_at: conversation.updated_at,
          participant: otherParticipant,
        };
      });

      return conversations;
    },
    enabled: !!userId,
  });
};
