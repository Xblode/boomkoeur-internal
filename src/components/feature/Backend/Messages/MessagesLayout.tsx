'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks';
import { useOrgOptional } from '@/components/providers/OrgProvider';
import { usePageLayout } from '@/components/providers/PageLayoutProvider';
import { supabase } from '@/lib/supabase/client';
import { updateMessageMetadata } from '@/lib/supabase/messages';
import { extractUrls } from '@/lib/url-utils';
import { MessagesSidebar } from './MessagesSidebar';
import { MessageFeed } from './MessageFeed';
import { MessageJournal } from './MessageJournal';
import type { PickedEntity } from './MessageComposerModals';
import type { PollData } from './MessageComposerModals';

function entityLabel(type: string) {
  return type === 'event' ? 'événement' : 'réunion';
}

async function fetchLinkPreviews(urls: string[]): Promise<Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }>> {
  const previews: Array<{ url: string; title?: string; description?: string; image?: string; siteName?: string }> = [];
  for (const url of urls.slice(0, 3)) {
    try {
      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title || data.description || data.image) {
          previews.push({ url: data.url, title: data.title, description: data.description, image: data.image, siteName: data.siteName });
        }
      }
    } catch {
      // ignore
    }
  }
  return previews;
}

interface MessagesLayoutProps {
  className?: string;
}

export function MessagesLayout({ className }: MessagesLayoutProps) {
  const pathname = usePathname();
  const isJournalPage = pathname?.endsWith('/journal') ?? false;
  const orgContext = useOrgOptional();
  const orgName = orgContext?.activeOrg?.name;
  const orgId = orgContext?.activeOrg?.id ?? null;
  const canDeleteSystemMessages = orgContext?.isAdmin ?? false;
  const { conversation, messages, pinnedMessages, isLoading, isLoadingOlder, hasMoreOlder, loadMoreOlder, error, currentUserId, sendMessage, togglePin, toggleReaction, toggleImportant, votePoll, voteQuick, deleteMessage } = useMessages();
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;
  const [journalRefreshKey, setJournalRefreshKey] = useState(0);
  const refreshJournal = useCallback(() => setJournalRefreshKey((k) => k + 1), []);
  const { setFullBleed, setNoPadding } = usePageLayout();

  useEffect(() => {
    setFullBleed(true);
    setNoPadding(true);
    return () => {
      setFullBleed(false);
      setNoPadding(false);
    };
  }, [setFullBleed, setNoPadding]);

  const handleSend = async (
    content: string,
    mentions: PickedEntity[] = [],
    memberMentions: { id: string; name: string }[] = [],
  ) => {
    const memberIds = memberMentions.map((m) => m.id);
    const memberNames = memberMentions.map((m) => m.name);
    const mentionMeta = memberIds.length > 0
      ? { mentionedUserIds: memberIds, mentionedNames: memberNames }
      : {};

    if (mentions.length === 0) {
      if (content.trim()) {
        const msg = await sendMessage({ content: content.trim(), metadata: mentionMeta });
        const urls = extractUrls(content.trim());
        if (msg && urls.length > 0) {
          fetchLinkPreviews(urls).then((previews) => {
            if (previews.length > 0) {
              updateMessageMetadata(msg.id, { linkPreviews: previews }).catch(() => {});
            }
          }).catch(() => {});
        }
      }
      return;
    }

    // Texte sans les @mentions pour savoir si l'utilisateur a écrit autre chose
    let cleanContent = content;
    for (const m of mentions) {
      const name = m.metadata.title as string | undefined;
      if (name) cleanContent = cleanContent.replaceAll(`@${name}`, '');
    }
    cleanContent = cleanContent.trim();
    const hasText = cleanContent.length > 0;

    const addLinkPreviews = async (msg: Awaited<ReturnType<typeof sendMessage>>, text: string) => {
      const urls = extractUrls(text);
      if (msg && urls.length > 0) {
        const previews = await fetchLinkPreviews(urls);
        if (previews.length > 0) {
          await updateMessageMetadata(msg.id, { linkPreviews: previews });
        }
      }
    };

    if (mentions.length === 1) {
      const entity = mentions[0];
      const title = entity.metadata.title as string | undefined;
      const entityNames = title ? [title] : [];
      const allMentionedNames = [...entityNames, ...memberNames];
      const nameMeta = allMentionedNames.length > 0 ? { mentionedNames: allMentionedNames } : {};
      const msg = await sendMessage({
        content: hasText ? content : `[${entityLabel(entity.entityType)}: ${title ?? ''}]`,
        metadata: hasText
          ? { ...entity.metadata, ...mentionMeta, ...nameMeta }
          : { ...entity.metadata, cardOnly: true, ...mentionMeta },
        relatedEntityType: entity.entityType,
        relatedEntityId: entity.entityId,
      });
      if (hasText) addLinkPreviews(msg, content).catch(() => {});
    } else {
      if (hasText) {
        const entityNames = mentions.map((m) => m.metadata.title as string).filter(Boolean);
        const allMentionedNames = [...entityNames, ...memberNames];
        const nameMeta = allMentionedNames.length > 0 ? { mentionedNames: allMentionedNames } : {};
        const msg = await sendMessage({ content, metadata: { ...mentionMeta, ...nameMeta } });
        addLinkPreviews(msg, content).catch(() => {});
      }
      for (const entity of mentions) {
        const title = entity.metadata.title as string | undefined;
        await sendMessage({
          content: `[${entityLabel(entity.entityType)}: ${title ?? ''}]`,
          metadata: { ...entity.metadata, cardOnly: true, ...mentionMeta },
          relatedEntityType: entity.entityType,
          relatedEntityId: entity.entityId,
        });
      }
    }
  };

  const handleTogglePin = async (messageId: string, pinned: boolean) => {
    await togglePin(messageId, pinned);
  };

  const handleEditPoll = useCallback(
    async (messageId: string, newPoll: PollData) => {
      const msg = messages.find((m) => m.id === messageId);
      const currentPoll = msg?.metadata?.poll as { votes?: Record<string, string | string[]> } | undefined;
      const existingVotes = currentPoll?.votes ?? {};
      const validOptionIds = new Set(newPoll.options.map((o) => o.id));
      const filteredVotes: Record<string, string[]> = {};
      for (const [uid, v] of Object.entries(existingVotes)) {
        const arr = Array.isArray(v) ? v : v ? [v] : [];
        const kept = arr.filter((id) => validOptionIds.has(id));
        if (kept.length > 0) filteredVotes[uid] = kept;
      }
      await updateMessageMetadata(messageId, {
        poll: {
          question: newPoll.question,
          options: newPoll.options,
          votes: filteredVotes,
        },
      });
    },
    [messages]
  );

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleSendImage = async (file: File) => {
    if (!orgId || !conversation) return;
    setUploadingImage(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${orgId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      const { data, error } = await supabase.storage
        .from('messages-attachments')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('messages-attachments').getPublicUrl(data.path);
      await sendMessage({
        content: `[Image: ${file.name}]`,
        metadata: { attachmentType: 'image', attachmentUrl: urlData.publicUrl, fileName: file.name },
      });
    } catch (err) {
      console.error('Upload image error:', err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendDriveFile = async (url: string, name?: string, mimeType?: string) => {
    const fileIdMatch = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
    const fileId = fileIdMatch?.[1] ?? null;
    await sendMessage({
      content: name ? `[Fichier partagé: ${name}]` : '[Fichier partagé]',
      metadata: { attachmentType: 'drive', attachmentUrl: url, attachmentName: name, attachmentMimeType: mimeType, driveFileId: fileId },
    });
  };

  const handleSendPoll = async (poll: PollData) => {
    await sendMessage({
      content: `Sondage: ${poll.question}`,
      metadata: { poll: { question: poll.question, options: poll.options, votes: {} } },
    });
  };

  const handleSendQuickVote = async (quickVote: { question?: string; yes: string[]; no: string[] }) => {
    const label = quickVote.question || 'Vote oui / non';
    await sendMessage({
      content: `Vote: ${label}`,
      metadata: { quickVote: { question: quickVote.question, yes: quickVote.yes, no: quickVote.no } },
    });
  };

  const handleSendEntity = async (entity: PickedEntity) => {
    const title = entity.metadata.title as string | undefined;
    await sendMessage({
      content: `[${entityLabel(entity.entityType)}: ${title ?? ''}]`,
      metadata: { ...entity.metadata, cardOnly: true },
      relatedEntityType: entity.entityType,
      relatedEntityId: entity.entityId,
    });
  };

  return (
    <div className={cn('flex h-full min-w-0 bg-backend', className)}>
      <MessagesSidebar
        orgId={orgId}
        orgName={orgName}
        journalRefreshKey={journalRefreshKey}
        onSendMessage={async (input) => { await sendMessage(input); }}
        lastMessageId={lastMessageId}
        onAddReaction={toggleReaction}
        currentPath={pathname ?? ''}
      />
      {isJournalPage ? (
        <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6">
          <MessageJournal />
        </div>
      ) : (
        <MessageFeed
          messages={messages}
          pinnedMessages={pinnedMessages}
          isLoading={isLoading}
          isLoadingOlder={isLoadingOlder}
          hasMoreOlder={hasMoreOlder}
          onLoadMoreOlder={loadMoreOlder}
          error={error}
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendDriveFile={handleSendDriveFile}
          onSendEntity={handleSendEntity}
          onSendPoll={handleSendPoll}
          orgId={orgId}
          currentUserId={currentUserId}
          onTogglePin={handleTogglePin}
          onToggleReaction={toggleReaction}
          onToggleImportant={toggleImportant}
          onVotePoll={votePoll}
          onVoteQuick={voteQuick}
          onEditPoll={handleEditPoll}
          onSendQuickVote={handleSendQuickVote}
          onDelete={deleteMessage}
          canEditPoll={canDeleteSystemMessages}
          canDeleteSystemMessages={canDeleteSystemMessages}
          canRegenerateSummary={canDeleteSystemMessages}
          onSummarySaved={refreshJournal}
          className="flex-1 min-w-0"
        />
      )}
    </div>
  );
}
