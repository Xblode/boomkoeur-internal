/**
 * Service Messages - Supabase
 * CRUD pour la messagerie interne + helpers conversation générale
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type { Conversation, Message, MessageAuthor, MessageReaction, SendMessageInput } from '@/types/messages';

// --- DB row types ---

interface DbConversation {
  id: string;
  org_id: string;
  type: string;
  title: string;
  created_at: string;
}

interface DbMessage {
  id: string;
  conversation_id: string;
  org_id: string;
  author_id: string | null;
  type: string;
  content: string;
  created_at: string;
  is_pinned: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  metadata: Record<string, unknown>;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  } | null;
}

// --- Mappers ---

function mapDbConversation(row: DbConversation): Conversation {
  return {
    id: row.id,
    orgId: row.org_id,
    type: row.type as 'general',
    title: row.title,
    createdAt: new Date(row.created_at),
  };
}

function mapDbMessage(row: DbMessage): Message {
  let author: MessageAuthor | undefined;
  if (row.profiles) {
    const name = [row.profiles.first_name, row.profiles.last_name].filter(Boolean).join(' ') || 'Utilisateur';
    author = {
      id: row.profiles.id,
      name,
      avatar: row.profiles.avatar ?? undefined,
    };
  }

  return {
    id: row.id,
    conversationId: row.conversation_id,
    orgId: row.org_id,
    authorId: row.author_id,
    author,
    type: row.type as Message['type'],
    content: row.content,
    createdAt: new Date(row.created_at),
    isPinned: row.is_pinned,
    relatedEntityType: row.related_entity_type as Message['relatedEntityType'],
    relatedEntityId: row.related_entity_id,
    metadata: row.metadata ?? {},
  };
}

// --- API ---

export async function getOrCreateGeneralConversation(orgId?: string | null): Promise<Conversation> {
  const resolvedOrgId = orgId ?? getActiveOrgId();
  if (!resolvedOrgId) throw new Error('Aucune organisation active');

  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('org_id', resolvedOrgId)
    .eq('type', 'general')
    .single();

  if (existing) return mapDbConversation(existing as DbConversation);

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ org_id: resolvedOrgId, type: 'general', title: 'Général' })
    .select()
    .single();

  if (error) throw error;
  return mapDbConversation(created as DbConversation);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:author_id(id, first_name, last_name, avatar)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => mapDbMessage(row as unknown as DbMessage));
}

export async function getPinnedMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:author_id(id, first_name, last_name, avatar)')
    .eq('conversation_id', conversationId)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDbMessage(row as unknown as DbMessage));
}

export async function sendMessage(conversationId: string, input: SendMessageInput): Promise<Message> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');

  const { data: { user } } = await supabase.auth.getUser();
  const authorId = input.type === 'system' ? null : (user?.id ?? null);

  const insertPayload: Record<string, unknown> = {
    conversation_id: conversationId,
    org_id: orgId,
    author_id: authorId,
    type: input.type ?? 'user',
    content: input.content,
    related_entity_type: input.relatedEntityType ?? null,
    related_entity_id: input.relatedEntityId ?? null,
    metadata: input.metadata ?? {},
  };
  if (input.createdAt) {
    insertPayload.created_at = input.createdAt;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(insertPayload)
    .select('*, profiles:author_id(id, first_name, last_name, avatar)')
    .single();

  if (error) throw error;
  return mapDbMessage(data as unknown as DbMessage);
}

export async function updateMessageMetadata(
  messageId: string,
  metadataPatch: Record<string, unknown>
): Promise<void> {
  const { data } = await supabase
    .from('messages')
    .select('metadata')
    .eq('id', messageId)
    .single();

  const current = (data?.metadata as Record<string, unknown>) ?? {};
  const merged = { ...current, ...metadataPatch };

  const { error } = await supabase
    .from('messages')
    .update({ metadata: merged })
    .eq('id', messageId);

  if (error) throw error;
}

export async function togglePin(messageId: string, pinned: boolean): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ is_pinned: pinned })
    .eq('id', messageId);

  if (error) throw error;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (error) throw error;
}

export async function getReactionsForMessages(
  messageIds: string[],
  currentUserId: string | null
): Promise<Map<string, MessageReaction[]>> {
  if (messageIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from('message_reactions')
    .select('message_id, emoji, user_id')
    .in('message_id', messageIds);

  if (error) return new Map();

  const byMessage = new Map<string, Map<string, string[]>>();
  for (const row of data ?? []) {
    const mid = row.message_id as string;
    const emoji = row.emoji as string;
    const uid = row.user_id as string;
    if (!byMessage.has(mid)) byMessage.set(mid, new Map());
    const byEmoji = byMessage.get(mid)!;
    if (!byEmoji.has(emoji)) byEmoji.set(emoji, []);
    byEmoji.get(emoji)!.push(uid);
  }

  const result = new Map<string, MessageReaction[]>();
  for (const [mid, byEmoji] of byMessage) {
    const reactions: MessageReaction[] = [];
    for (const [emoji, userIds] of byEmoji) {
      reactions.push({
        emoji,
        userIds,
        hasCurrentUser: currentUserId ? userIds.includes(currentUserId) : false,
      });
    }
    result.set(mid, reactions);
  }
  return result;
}

export async function toggleReaction(messageId: string, emoji: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('message_reactions')
    .select('id')
    .eq('message_id', messageId)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .single();

  if (existing) {
    await supabase.from('message_reactions').delete().eq('id', existing.id);
  } else {
    await supabase.from('message_reactions').insert({ message_id: messageId, user_id: user.id, emoji });
  }
}

export async function votePoll(messageId: string, optionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('messages')
    .select('metadata')
    .eq('id', messageId)
    .single();

  const meta = (data?.metadata as Record<string, unknown>) ?? {};
  const poll = (meta.poll as Record<string, unknown>) ?? {};
  const options = (poll.options as { id: string; label: string }[]) ?? [];
  const votes = (poll.votes as Record<string, string>) ?? {};

  if (!options.some((o) => o.id === optionId)) return;

  const newVotes = { ...votes, [user.id]: optionId };
  await supabase
    .from('messages')
    .update({ metadata: { ...meta, poll: { ...poll, votes: newVotes } } })
    .eq('id', messageId);
}

export async function voteQuick(messageId: string, vote: 'yes' | 'no'): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data } = await supabase
    .from('messages')
    .select('metadata')
    .eq('id', messageId)
    .single();

  const meta = (data?.metadata as Record<string, unknown>) ?? {};
  const qv = (meta.quickVote as Record<string, unknown>) ?? {};
  const yes = (qv.yes as string[]) ?? [];
  const no = (qv.no as string[]) ?? [];

  const alreadyYes = yes.includes(user.id);
  const alreadyNo = no.includes(user.id);

  let newYes = yes.filter((id) => id !== user.id);
  let newNo = no.filter((id) => id !== user.id);

  if (vote === 'yes' && !alreadyYes) newYes = [...newYes, user.id];
  if (vote === 'no' && !alreadyNo) newNo = [...newNo, user.id];

  await supabase
    .from('messages')
    .update({ metadata: { ...meta, quickVote: { ...qv, yes: newYes, no: newNo } } })
    .eq('id', messageId);
}

export async function toggleImportant(messageId: string, isImportant: boolean): Promise<void> {
  const { data } = await supabase
    .from('messages')
    .select('metadata')
    .eq('id', messageId)
    .single();

  const currentMeta = (data?.metadata as Record<string, unknown>) ?? {};
  await supabase
    .from('messages')
    .update({ metadata: { ...currentMeta, isImportant } })
    .eq('id', messageId);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('conversation_reads').upsert(
    { user_id: user.id, conversation_id: conversationId, last_read_at: new Date().toISOString() },
    { onConflict: 'user_id,conversation_id', ignoreDuplicates: false }
  );
}

export async function getUnreadCount(conversationId: string): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: read } = await supabase
    .from('conversation_reads')
    .select('last_read_at')
    .eq('user_id', user.id)
    .eq('conversation_id', conversationId)
    .single();

  const lastRead = read?.last_read_at ? new Date(read.last_read_at) : new Date(0);

  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .gt('created_at', lastRead.toISOString());

  if (error) return 0;
  return count ?? 0;
}
