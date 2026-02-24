'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { ChatComment } from '@/components/ui/molecules/ChatPanel';

export interface ChatPanelConfig {
  comments: ChatComment[];
  onSendComment: (author: string, content: string) => void;
  /** Masque le champ auteur et utilise l'utilisateur connecté */
  hideAuthorInput?: boolean;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

interface ChatPanelContextType {
  config: ChatPanelConfig | null;
  setChatPanelConfig: (config: ChatPanelConfig | null) => void;
}

const ChatPanelContext = createContext<ChatPanelContextType | undefined>(undefined);

/**
 * ChatPanelProvider - Active le ChatPanel maître.
 * Quand config est fournie, le ChatPanel s'affiche. Sinon, masqué.
 */
export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [config, setChatPanelConfig] = useState<ChatPanelConfig | null>(null);

  return (
    <ChatPanelContext.Provider value={{ config, setChatPanelConfig }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  const context = useContext(ChatPanelContext);
  if (context === undefined) {
    throw new Error('useChatPanel must be used within a ChatPanelProvider');
  }
  return context;
}
