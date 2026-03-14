export type MessageType = 'user' | 'system';
export type RelatedEntityType = 'post' | 'event' | 'meeting';

export type Conversation = {
  id: string;
  orgId: string;
  type: 'general';
  title: string;
  createdAt: Date;
};

export type MessageAuthor = {
  id: string;
  name: string;
  avatar?: string;
};

export type MessageReaction = {
  emoji: string;
  userIds: string[];
  hasCurrentUser: boolean;
};

export type MessageSeenByUser = {
  id: string;
  name: string;
  avatar?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  orgId: string;
  authorId: string | null;
  author?: MessageAuthor;
  type: MessageType;
  content: string;
  createdAt: Date;
  isPinned: boolean;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
  metadata: Record<string, unknown>;
  reactions?: MessageReaction[];
};

export type SendMessageInput = {
  content: string;
  type?: MessageType;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  metadata?: Record<string, unknown>;
  /** Pour les tests uniquement : override de la date d'envoi (ISO string) */
  createdAt?: string;
};
