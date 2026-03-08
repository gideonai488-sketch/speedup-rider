import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useConversation = (profileId: string, otherProfileId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profileId || !otherProfileId) return;
    // Use sorted IDs for consistent channel name regardless of who initiates
    const sortedIds = [profileId, otherProfileId].sort().join('-');
    const channel = supabase
      .channel(`chat-${sortedIds}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload: any) => {
        const msg = payload.new;
        if (
          (msg.sender_id === profileId && msg.receiver_id === otherProfileId) ||
          (msg.sender_id === otherProfileId && msg.receiver_id === profileId)
        ) {
          queryClient.invalidateQueries({ queryKey: ['conversation', profileId, otherProfileId] });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profileId, otherProfileId, queryClient]);

  return useQuery({
    queryKey: ['conversation', profileId, otherProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profileId},receiver_id.eq.${otherProfileId}),and(sender_id.eq.${otherProfileId},receiver_id.eq.${profileId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId && !!otherProfileId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ senderId, receiverId, content, orderId }: {
      senderId: string;
      receiverId: string;
      content: string;
      orderId?: string;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          order_id: orderId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });
};

// Get all conversations for a user
export const useConversations = (profileId: string) => {
  return useQuery({
    queryKey: ['conversations', profileId],
    queryFn: async () => {
      // Get latest message from each conversation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, phone),
          receiver:profiles!messages_receiver_id_fkey(id, full_name, avatar_url, phone)
        `)
        .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const convMap = new Map<string, any>();
      data?.forEach(msg => {
        const partnerId = msg.sender_id === profileId ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) {
          const partner = msg.sender_id === profileId ? msg.receiver : msg.sender;
          convMap.set(partnerId, {
            partnerId,
            partnerName: partner?.full_name || 'Unknown',
            partnerAvatar: partner?.avatar_url,
            partnerPhone: partner?.phone,
            lastMessage: msg.content,
            lastMessageAt: msg.created_at,
            unread: msg.receiver_id === profileId && !msg.is_read ? 1 : 0,
          });
        } else if (msg.receiver_id === profileId && !msg.is_read) {
          convMap.get(partnerId).unread++;
        }
      });

      return Array.from(convMap.values());
    },
    enabled: !!profileId,
  });
};
