'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  getOrCreateGeneralConversation,
  getMessagesRecent,
  getMessagesNewerThan,
  getMessagesOlderThan,
  getReactionsForMessages,
  sendMessage as sendMessageApi,
  togglePin as togglePinApi,
  toggleReaction as toggleReactionApi,
  toggleImportant as toggleImportantApi,
  votePoll as votePollApi,
  voteQuick as voteQuickApi,
  deleteMessage as deleteMessageApi,
  markConversationRead,
  getUnreadCount as getUnreadCountApi,
} from '@/lib/supabase/messages';
import { useOrgOptional } from '@/components/providers/OrgProvider';
import type { Conversation, Message, SendMessageInput, MessageAuthor } from '@/types/messages';

export function useMessages() {
  const orgContext = useOrgOptional();
  const orgId = orgContext?.activeOrg?.id ?? null;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const authorCacheRef = useRef<Map<string, MessageAuthor>>(new Map());
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const refreshPinned = useCallback((msgs: Message[]) => {
    setPinnedMessages(msgs.filter((m) => m.isPinned).reverse());
  }, []);

  // Initial load
  useEffect(() => {
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const conv = await getOrCreateGeneralConversation(orgId);
        if (cancelled) return;
        setConversation(conv);

        const msgs = await getMessagesRecent(conv.id, 3);
        if (cancelled) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user?.id) setCurrentUserId(user.id);
        const reactionsMap = await getReactionsForMessages(msgs.map((m) => m.id), user?.id ?? null);
        if (cancelled) return;

        const msgsWithReactions = msgs.map((m) => ({
          ...m,
          reactions: reactionsMap.get(m.id) ?? [],
        }));

        msgsWithReactions.forEach((m) => {
          if (m.author && m.authorId) {
            authorCacheRef.current.set(m.authorId, m.author);
          }
        });

        setMessages(msgsWithReactions);
        refreshPinned(msgsWithReactions);

        await markConversationRead(conv.id);
        if (!cancelled) setUnreadCount(0);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur inconnue');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [orgId, refreshPinned]);

  // Realtime subscription
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as Record<string, unknown>;
            const authorId = newRow.author_id as string | null;
            let author: MessageAuthor | undefined;

            if (authorId) {
              const cached = authorCacheRef.current.get(authorId);
              if (cached) {
                author = cached;
              } else {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id, first_name, last_name, avatar')
                  .eq('id', authorId)
                  .single();
                if (profile) {
                  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Utilisateur';
                  author = { id: profile.id, name, avatar: profile.avatar ?? undefined };
                  authorCacheRef.current.set(authorId, author);
                }
              }
            }

            const msg: Message = {
              id: newRow.id as string,
              conversationId: newRow.conversation_id as string,
              orgId: newRow.org_id as string,
              authorId,
              author,
              type: newRow.type as Message['type'],
              content: newRow.content as string,
              createdAt: new Date(newRow.created_at as string),
              isPinned: newRow.is_pinned as boolean,
              relatedEntityType: newRow.related_entity_type as Message['relatedEntityType'],
              relatedEntityId: newRow.related_entity_id as string | null,
              metadata: (newRow.metadata as Record<string, unknown>) ?? {},
              reactions: [],
            };

            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev;
              const next = [...prev, msg];
              refreshPinned(next);
              return next;
            });
          }

          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Record<string, unknown>;
            setMessages((prev) => {
              const next = prev.map((m) =>
                m.id === updated.id
                  ? {
                      ...m,
                      isPinned: updated.is_pinned as boolean,
                      content: updated.content as string,
                      metadata: (updated.metadata as Record<string, unknown>) ?? m.metadata,
                    }
                  : m
              );
              refreshPinned(next);
              return next;
            });
          }

          if (payload.eventType === 'DELETE') {
            const old = payload.old as Record<string, unknown>;
            setMessages((prev) => {
              const next = prev.filter((m) => m.id !== old.id);
              refreshPinned(next);
              return next;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, refreshPinned]);

  // Polling fallback quand l'onglet est visible (au cas où realtime rate un événement)
  useEffect(() => {
    if (!conversation || typeof document === 'undefined') return;

    const poll = async () => {
      if (document.visibilityState !== 'visible') return;
      const msgs = messagesRef.current;
      if (msgs.length === 0) return;
      const last = msgs[msgs.length - 1];
      const after = new Date(last.createdAt.getTime() + 1);
      const newer = await getMessagesNewerThan(conversation.id, after);
      if (newer.length === 0) return;
      const { data: { user } } = await supabase.auth.getUser();
      const reactionsMap = await getReactionsForMessages(newer.map((m) => m.id), user?.id ?? null);
      const withReactions = newer.map((m) => ({
        ...m,
        reactions: reactionsMap.get(m.id) ?? [],
      }));
      withReactions.forEach((m) => {
        if (m.author && m.authorId) authorCacheRef.current.set(m.authorId, m.author);
      });
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const toAdd = withReactions.filter((m) => !existingIds.has(m.id));
        if (toAdd.length === 0) return prev;
        const next = [...prev, ...toAdd].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        refreshPinned(next);
        return next;
      });
    };

    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [conversation, refreshPinned]);

  // Realtime reactions
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`reactions:${conversation.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_reactions' },
        async () => {
          const msgs = messagesRef.current;
          if (msgs.length === 0) return;
          const { data: { user } } = await supabase.auth.getUser();
          const reactionsMap = await getReactionsForMessages(msgs.map((m) => m.id), user?.id ?? null);
          setMessages((prev) =>
            prev.map((m) => ({ ...m, reactions: reactionsMap.get(m.id) ?? [] }))
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversation]);

  const sendMessage = useCallback(
    async (input: SendMessageInput): Promise<Message | undefined> => {
      if (!conversation) return undefined;
      const msg = await sendMessageApi(conversation.id, input);
      if (msg) {
        // Ajout immédiat pour l'expéditeur (fallback si realtime tarde)
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const next = [...prev, { ...msg, reactions: msg.reactions ?? [] }];
          refreshPinned(next);
          return next;
        });
        if (orgId) {
          fetch('/api/push/notify-new-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orgId,
              authorId: msg.authorId,
              authorName: msg.author?.name,
              content: msg.content,
            }),
          }).catch(() => {});
        }
      }
      return msg;
    },
    [conversation, orgId, refreshPinned]
  );

  const togglePin = useCallback(
    async (messageId: string, pinned: boolean) => {
      await togglePinApi(messageId, pinned);
    },
    []
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      await toggleReactionApi(messageId, emoji);
    },
    []
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== messageId);
        refreshPinned(next);
        return next;
      });
      await deleteMessageApi(messageId);
    },
    [refreshPinned]
  );

  const toggleImportant = useCallback(async (messageId: string) => {
    const current = messagesRef.current.find((m) => m.id === messageId);
    const next = !(current?.metadata?.isImportant as boolean ?? false);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, metadata: { ...m.metadata, isImportant: next } } : m
      )
    );
    await toggleImportantApi(messageId, next);
  }, []);

  const votePoll = useCallback(
    async (messageId: string, optionId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const current = messagesRef.current.find((m) => m.id === messageId);
      const poll = current?.metadata?.poll as { votes?: Record<string, string | string[]> } | undefined;
      const rawVotes = poll?.votes ?? {};
      const currentUserVotes = rawVotes[user.id];
      const currentArr = Array.isArray(currentUserVotes) ? currentUserVotes : currentUserVotes ? [currentUserVotes] : [];
      const hasOption = currentArr.includes(optionId);
      const newArr = hasOption ? currentArr.filter((id) => id !== optionId) : [...currentArr, optionId];
      const newVotes = { ...rawVotes, [user.id]: newArr };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                metadata: {
                  ...m.metadata,
                  poll: { ...(m.metadata?.poll as object ?? {}), votes: newVotes },
                },
              }
            : m
        )
      );
      await votePollApi(messageId, optionId);
    },
    []
  );

  const loadMoreOlder = useCallback(async () => {
    if (!conversation || isLoadingOlder || !hasMoreOlder) return;
    const current = messagesRef.current;
    const oldest = current[0];
    if (!oldest) return;
    setIsLoadingOlder(true);
    try {
      const older = await getMessagesOlderThan(conversation.id, oldest.createdAt, 50);
      if (older.length < 50) setHasMoreOlder(false);
      if (older.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const reactionsMap = await getReactionsForMessages(older.map((m) => m.id), user?.id ?? null);
        const withReactions = older.map((m) => ({
          ...m,
          reactions: reactionsMap.get(m.id) ?? [],
        }));
        withReactions.forEach((m) => {
          if (m.author && m.authorId) authorCacheRef.current.set(m.authorId, m.author);
        });
        setMessages((prev) => [...withReactions, ...prev]);
        refreshPinned([...withReactions, ...messagesRef.current]);
      }
    } finally {
      setIsLoadingOlder(false);
    }
  }, [conversation, isLoadingOlder, hasMoreOlder, refreshPinned]);

  const voteQuick = useCallback(
    async (messageId: string, vote: 'yes' | 'no') => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const qv = (m.metadata?.quickVote as { question?: string; yes: string[]; no: string[] }) ?? { yes: [], no: [] };
          let newYes = (qv.yes ?? []).filter((id) => id !== user.id);
          let newNo = (qv.no ?? []).filter((id) => id !== user.id);
          if (vote === 'yes' && !(qv.yes ?? []).includes(user.id)) newYes = [...newYes, user.id];
          if (vote === 'no' && !(qv.no ?? []).includes(user.id)) newNo = [...newNo, user.id];
          return {
            ...m,
            metadata: { ...m.metadata, quickVote: { ...qv, yes: newYes, no: newNo } },
          };
        })
      );
      await voteQuickApi(messageId, vote);
    },
    []
  );

  return {
    conversation,
    messages,
    pinnedMessages,
    unreadCount,
    isLoading,
    isLoadingOlder,
    hasMoreOlder,
    loadMoreOlder,
    error,
    currentUserId,
    sendMessage,
    togglePin,
    toggleReaction,
    toggleImportant,
    votePoll,
    voteQuick,
    deleteMessage,
  };
}
