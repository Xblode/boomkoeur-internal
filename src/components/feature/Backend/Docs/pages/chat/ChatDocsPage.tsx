'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, RefreshCw, Sparkles, Send, Plus, Image as ImageIcon } from 'lucide-react';
import { Button, IconButton, Textarea } from '@/components/ui/atoms';
import { SectionHeader, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { MessageItem } from '@/components/feature/Backend/Messages/MessageItem';
import { MessagePinnedBar } from '@/components/feature/Backend/Messages/MessagePinnedBar';
import { MessageDateSeparator } from '@/components/feature/Backend/Messages/MessageDateSeparator';
import { MessageAvatarSlot } from '@/components/feature/Backend/Messages/MessageParts';
import type { Message } from '@/types/messages';

// ── Données statiques ────────────────────────────────────────────────────────

const NOOP = () => {};

const BASE: Pick<Message, 'conversationId' | 'orgId' | 'isPinned' | 'relatedEntityType' | 'relatedEntityId' | 'reactions'> = {
  conversationId: 'docs',
  orgId: 'docs',
  isPinned: false,
  relatedEntityType: null,
  relatedEntityId: null,
  reactions: [],
};

const MARIE: Message['author'] = { id: 'u1', name: 'Marie Dupont' };
const LUCAS: Message['author'] = { id: 'u2', name: 'Lucas Martin' };
const SOPHIE: Message['author'] = { id: 'u3', name: 'Sophie Bernard' };

const msg = (overrides: Partial<Message> & Pick<Message, 'id' | 'type' | 'content' | 'createdAt' | 'authorId'>): Message => ({
  ...BASE,
  metadata: {},
  ...overrides,
});

// Messages utilisateur groupés
const MSG_GROUP: Message[] = [
  msg({ id: 'm1', type: 'user', authorId: 'u1', author: MARIE, content: 'Bonjour tout le monde ! On confirme la réunion de planning jeudi à 14h ?', createdAt: new Date('2026-03-11T09:00:00') }),
  msg({ id: 'm2', type: 'user', authorId: 'u1', author: MARIE, content: 'Pensez à préparer vos points bloquants avant de venir 🙏', createdAt: new Date('2026-03-11T09:01:00') }),
];
const MSG_LUCAS: Message = msg({ id: 'm3', type: 'user', authorId: 'u2', author: LUCAS, content: "Oui, jeudi 14h c'est parfait pour moi !", createdAt: new Date('2026-03-11T09:03:00') });

// Message avec réactions
const MSG_REACTIONS: Message = msg({
  id: 'm4', type: 'user', authorId: 'u2', author: LUCAS,
  content: "La démo client s'est super bien passée, ils ont adoré la nouvelle interface 🎉",
  createdAt: new Date('2026-03-11T10:15:00'),
  reactions: [
    { emoji: '👍', userIds: ['u1', 'u3', 'u4'], hasCurrentUser: true },
    { emoji: '❤️', userIds: ['u3'], hasCurrentUser: false },
    { emoji: '🔥', userIds: ['u1', 'u2'], hasCurrentUser: false },
  ],
});

// Message épinglé
const MSG_PINNED: Message = msg({
  id: 'm5', type: 'user', authorId: 'u1', author: MARIE,
  content: 'Réunion de planning jeudi 14h — confirmé ✅',
  createdAt: new Date('2026-03-10T14:00:00'),
  isPinned: true,
});

// Message avec mention
const MSG_MENTION: Message = msg({
  id: 'm6', type: 'user', authorId: 'u3', author: SOPHIE,
  content: '@Lucas Martin peux-tu relire le brief avant demain matin ?',
  createdAt: new Date('2026-03-11T11:00:00'),
  metadata: { mentionedUserIds: ['u2'], mentionedNames: ['Lucas Martin'] },
});

// Message important
const MSG_IMPORTANT: Message = msg({
  id: 'm7', type: 'user', authorId: 'u3', author: SOPHIE,
  content: 'Le dépôt des dossiers est à rendre avant vendredi 18h impérativement.',
  createdAt: new Date('2026-03-11T11:30:00'),
  metadata: { isImportant: true },
});

// Message avec lien + preview
const MSG_LINK: Message = msg({
  id: 'm8', type: 'user', authorId: 'u3', author: SOPHIE,
  content: 'Jetez un œil à la doc Next.js : nextjs.org/docs',
  createdAt: new Date('2026-03-11T12:00:00'),
  metadata: {
    linkPreviews: [{
      url: 'https://nextjs.org/docs',
      title: 'Getting Started: Installation',
      description: 'System Requirements: Node.js 18.17 or later. macOS, Windows, and Linux are supported.',
      siteName: 'Next.js',
      image: 'https://nextjs.org/static/twitter-cards/docs.png',
    }],
  },
});

// Message avec image uploadée
const MSG_IMAGE: Message = msg({
  id: 'm9', type: 'user', authorId: 'u2', author: LUCAS,
  content: '',
  createdAt: new Date('2026-03-11T13:00:00'),
  metadata: {
    attachmentType: 'image',
    attachmentUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    fileName: 'mockup-v3.png',
  },
});

// Message avec fichier Drive
const MSG_FILE: Message = msg({
  id: 'm10', type: 'user', authorId: 'u2', author: LUCAS,
  content: '',
  createdAt: new Date('2026-03-11T13:01:00'),
  metadata: {
    attachmentType: 'drive',
    attachmentUrl: 'https://drive.google.com/file/d/example',
    attachmentName: 'Brief_Q2_2026.pdf',
    attachmentMimeType: 'application/pdf',
  },
});

// Sondage
const MSG_POLL: Message = msg({
  id: 'm11', type: 'user', authorId: 'u2', author: LUCAS,
  content: '',
  createdAt: new Date('2026-03-11T14:00:00'),
  metadata: {
    poll: {
      question: 'Quel jour pour la rétrospective ?',
      options: [
        { id: 'a', label: 'Lundi 14h' },
        { id: 'b', label: 'Mercredi 10h' },
        { id: 'c', label: 'Vendredi 16h' },
      ],
      votes: { u1: 'a', u2: 'b', u3: 'b', u4: 'a', u5: 'c' },
    },
  },
});

// Vote rapide
const MSG_QUICKVOTE: Message = msg({
  id: 'm12', type: 'user', authorId: 'u1', author: MARIE,
  content: '',
  createdAt: new Date('2026-03-11T15:00:00'),
  metadata: {
    quickVote: {
      question: 'Valider la proposition de design ?',
      yes: ['u1', 'u2', 'u3'],
      no: ['u4'],
    },
  },
});

// Vote rapide — avec vote sélectionné (currentUserId = u1)
const MSG_QUICKVOTE_VOTED: Message = msg({
  id: 'm13', type: 'user', authorId: 'u1', author: MARIE,
  content: '',
  createdAt: new Date('2026-03-11T15:01:00'),
  metadata: {
    quickVote: {
      question: 'Valider la proposition de design ?',
      yes: ['u1', 'u2', 'u3', 'me'],
      no: ['u4'],
    },
  },
});

// Message système compact
const MSG_SYS_COMPACT: Message = msg({
  id: 'sys1', type: 'system', authorId: null,
  content: "Marie Dupont a rejoint l'organisation",
  createdAt: new Date('2026-03-11T08:00:00'),
});

const MSG_SYS_COMPACT2: Message = msg({
  id: 'sys2', type: 'system', authorId: null,
  content: 'Lucas Martin a épinglé un message',
  createdAt: new Date('2026-03-11T09:05:00'),
});

// Message système full — événement
const MSG_SYS_EVENT: Message = msg({
  id: 'sys3', type: 'system', authorId: null,
  content: 'Nouvel événement créé',
  createdAt: new Date('2026-03-11T10:00:00'),
  relatedEntityType: 'event',
  relatedEntityId: 'e1',
  metadata: {
    entityId: 'e1',
    title: 'Festival Boomkoeur — Été 2026',
    date: '14 juin 2026',
    time: '18:00–02:00',
    status: 'Confirmé',
    location: 'Paris, Grande Halle',
    artists: ['DJ Snake', 'Polo & Pan'],
    assignees: [],
  },
});

// Message système full — réunion
const MSG_SYS_MEETING: Message = msg({
  id: 'sys4', type: 'system', authorId: null,
  content: 'Réunion planifiée',
  createdAt: new Date('2026-03-11T10:30:00'),
  relatedEntityType: 'meeting',
  relatedEntityId: 'm1',
  metadata: {
    entityId: 'm1',
    title: 'Rétrospective Sprint 12',
    date: '17 Mar 2026 · 14:00–15:00',
    status: 'À venir',
    orderOfDay: ['Bilan sprint', 'Points bloquants', 'Planning S13'],
  },
});

// Messages pour PinnedMessages
const PINNED_MESSAGES: Message[] = [
  { ...MSG_PINNED },
  msg({
    id: 'p2', type: 'user', authorId: 'u2', author: LUCAS,
    content: 'Lien Figma mis à jour : figma.com/file/xxxxx — v2 maquette mobile',
    createdAt: new Date('2026-03-09T16:00:00'),
    isPinned: true,
  }),
];

// ── Wrapper pour isoler les previews ────────────────────────────────────────

function PreviewBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-mono font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">{label}</p>
      <div className="rounded-xl border border-border-custom bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

// ── Composer simplifié (visuel statique) ─────────────────────────────────────
// On ne monte pas le vrai MessageComposer (dépendances orgId/Supabase)
// On reproduit le visuel exact du composant réel.

function ComposerPreview() {
  return (
    <div className="border-t border-border-custom bg-white dark:bg-zinc-950 px-2 sm:px-4 py-3 min-w-0">
      <div className="flex items-end gap-2 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-2">
            <Textarea
              placeholder="Envoyer un message… (@ pour mentionner)"
              rows={1}
              readOnly
              className="flex-1 min-w-0 resize-none bg-transparent border-0 focus-visible:ring-0 shadow-none text-sm cursor-default py-1.5 pl-1 pr-0"
              style={{ minHeight: '34px', maxHeight: '132px' }}
            />
            <div className="flex items-center gap-0.5 shrink-0">
              <IconButton
                icon={<ImageIcon size={18} />}
                ariaLabel="Image"
                variant="ghost"
                size="sm"
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-zinc-500"
              />
              <IconButton
                icon={<Plus size={18} />}
                ariaLabel="Plus"
                variant="ghost"
                size="sm"
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-zinc-500"
              />
              <IconButton
                icon={<Send size={16} />}
                ariaLabel="Envoyer"
                variant="primary"
                size="sm"
                disabled
                className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 opacity-30"
              />
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-zinc-400 mt-1.5 pl-1 hidden sm:block">Ctrl+Enter pour envoyer · @ pour mentionner</p>
    </div>
  );
}

// ── DateSeparator avec synthèse statique ─────────────────────────────────────

function DateSeparatorWithSummary() {
  return (
    <div className="w-full px-2 sm:px-4 py-2">
      {/* Bloc synthèse — même structure qu'un message (avatar + bulle) */}
      <div className="mb-3 px-2 sm:px-4 pt-3">
        <div className="flex items-end gap-2">
          <MessageAvatarSlot
            show
            entityIcon={Sparkles}
            entityAvatarBg="bg-zinc-100 dark:bg-zinc-800"
            entityIconColor="text-zinc-500 dark:text-zinc-400"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1 flex-wrap pl-1">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Lundi 11 mars · 12 messages
              </span>
              <button
                type="button"
                className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <RefreshCw size={11} />
                Regénérer
              </button>
            </div>
            <div className="inline-block max-w-[85%] min-w-0 px-2.5 sm:px-3.5 py-2 text-sm leading-relaxed bg-surface-elevated text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-md">
              <div className="space-y-1.5 min-w-0">
                {[
                  'Réunion de planning confirmée pour jeudi 14h.',
                  'Démo client validée avec succès — interface appréciée.',
                  'Sondage rétrospective : Mercredi 10h en tête (2 votes).',
                ].map((line, i) => (
                  <div key={i} className="text-[11px] text-zinc-600 dark:text-zinc-300 break-words flex gap-2">
                    <span className="shrink-0 text-zinc-400 dark:text-zinc-500">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MessageDateSeparator date={new Date('2026-03-12T00:00:00')} />
    </div>
  );
}

// ── DateSeparator chargement ──────────────────────────────────────────────────

function DateSeparatorLoading() {
  return (
    <div className="w-full px-2 sm:px-4 py-2">
      <div className="mb-3 px-2 sm:px-4 pt-3">
        <div className="flex items-end gap-2">
          <MessageAvatarSlot
            show
            entityIcon={Sparkles}
            entityAvatarBg="bg-zinc-100 dark:bg-zinc-800"
            entityIconColor="text-zinc-500 dark:text-zinc-400"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-1 pl-1">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Lundi 11 mars · 12 messages
              </span>
            </div>
            <div className="inline-block max-w-[85%] min-w-0 px-2.5 sm:px-3.5 py-2 text-sm leading-relaxed bg-surface-elevated text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-bl-md">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" />
                Synthèse en cours…
              </p>
            </div>
          </div>
        </div>
      </div>
      <MessageDateSeparator date={new Date('2026-03-12T00:00:00')} />
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────

function ChatDocsContent() {
  return (
    <div className="space-y-10">

      {/* Messages utilisateur groupés */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessageItem — message utilisateur</CardTitle>
          <CardDescription>
            Bulle avec avatar, nom, heure. Les messages consécutifs du même auteur sont regroupés — l&apos;avatar et le nom n&apos;apparaissent qu&apos;au dernier du groupe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Groupe de messages (même auteur)">
            <div className="py-2">
              <MessageItem message={MSG_GROUP[0]} nextMessage={MSG_GROUP[1]} onTogglePin={NOOP} />
              <MessageItem message={MSG_GROUP[1]} previousMessage={MSG_GROUP[0]} nextMessage={MSG_LUCAS} onTogglePin={NOOP} />
              <MessageItem message={MSG_LUCAS} previousMessage={MSG_GROUP[1]} onTogglePin={NOOP} />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Message de l'utilisateur connecté */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Message de l&apos;utilisateur connecté</CardTitle>
          <CardDescription>
            Les messages de l&apos;utilisateur courant sont alignés à droite avec un fond bleu (#495ef3) pour les distinguer des autres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Nos messages (droite, bleu) vs autres (gauche)">
            <div className="py-2 space-y-2">
              <MessageItem message={MSG_GROUP[0]} nextMessage={MSG_LUCAS} onTogglePin={NOOP} currentUserId="u2" />
              <MessageItem message={MSG_LUCAS} previousMessage={MSG_GROUP[0]} onTogglePin={NOOP} currentUserId="u2" />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Réactions */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Réactions emoji</CardTitle>
          <CardDescription>
            Survolez le message → icône <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">☺+</code> → picker rapide (👍 ❤️ 😂 😮 😢 🔥). Les pills s&apos;affichent sous la bulle. La réaction de l&apos;utilisateur courant est en bleu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Message avec réactions actives">
            <div className="py-2">
              <MessageItem message={MSG_REACTIONS} onTogglePin={NOOP} onToggleReaction={NOOP} currentUserId="u1" />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Message épinglé */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Message épinglé</CardTitle>
          <CardDescription>
            Fond ambre clair, bordure gauche, badge Épinglé à droite du nom. Menu contextuel → &quot;Épingler / Désépingler&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Message épinglé (fond ambre, badge Épinglé)">
            <div className="py-2">
              <MessageItem message={MSG_PINNED} onTogglePin={NOOP} />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Messages épinglés — bandeau */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessagePinnedBar — bandeau en haut du feed</CardTitle>
          <CardDescription>
            Repliable. Affiche les 5 derniers messages épinglés avec auteur, date et extrait. Clic → scroll vers le message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Bandeau messages épinglés">
            <MessagePinnedBar messages={PINNED_MESSAGES} />
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Mention */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Mentions @</CardTitle>
          <CardDescription>
            Tapez <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">@</code> dans le composer pour ouvrir le dropdown (membres, événements, réunions). Le membre mentionné voit le message surligné en bleu avec badge &quot;@ vous&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="Message envoyé avec @mention">
              <div className="py-2">
                <MessageItem message={MSG_MENTION} onTogglePin={NOOP} />
              </div>
            </PreviewBox>
            <PreviewBox label="Reçu par l'utilisateur mentionné (fond bleu)">
              <div className="py-2">
                <MessageItem message={MSG_MENTION} onTogglePin={NOOP} currentUserId="u2" />
              </div>
            </PreviewBox>
          </div>
        </CardContent>
      </Card>

      {/* Message important */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Marquer comme important</CardTitle>
          <CardDescription>
            Menu contextuel → &quot;Marquer comme important&quot;. Fond orange clair + badge ⚡ Important visible pour tous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Message important (fond orange, badge ⚡)">
            <div className="py-2">
              <MessageItem message={MSG_IMPORTANT} onTogglePin={NOOP} onToggleImportant={NOOP} />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Preview lien */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>LinkPreview — aperçu de lien</CardTitle>
          <CardDescription>
            Quand un message contient une URL, une card est générée automatiquement avec l&apos;image, le titre et la description Open Graph.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Message avec preview OG automatique">
            <div className="py-2">
              <MessageItem message={MSG_LINK} onTogglePin={NOOP} />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Pièces jointes */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Pièces jointes</CardTitle>
          <CardDescription>
            Images uploadées (Supabase Storage) affichées en inline. Fichiers Google Drive (documents, vidéos) affichés comme une card cliquable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="Image uploadée (inline)">
              <div className="py-2">
                <MessageItem message={MSG_IMAGE} onTogglePin={NOOP} orgId={null} />
              </div>
            </PreviewBox>
            <PreviewBox label="Fichier Google Drive">
              <div className="py-2">
                <MessageItem message={MSG_FILE} onTogglePin={NOOP} orgId={null} />
              </div>
            </PreviewBox>
          </div>
        </CardContent>
      </Card>

      {/* Sondage */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Sondage</CardTitle>
          <CardDescription>
            Créé depuis le composer (menu <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">+</code> → &quot;Créer un sondage&quot;). Les barres se mettent à jour en temps réel via Realtime Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreviewBox label="Sondage avec votes">
            <div className="py-2">
              <MessageItem message={MSG_POLL} onTogglePin={NOOP} onVotePoll={NOOP} currentUserId="u1" />
            </div>
          </PreviewBox>
        </CardContent>
      </Card>

      {/* Vote rapide */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Vote rapide Oui / Non</CardTitle>
          <CardDescription>
            Créé depuis le composer (menu <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">+</code> → &quot;Vote oui / non&quot;). Vote binaire avec compteurs live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="Sans vote">
              <div className="py-2">
                <MessageItem message={MSG_QUICKVOTE} onTogglePin={NOOP} onVoteQuick={NOOP} currentUserId={null} />
              </div>
            </PreviewBox>
            <PreviewBox label="Avec vote Oui sélectionné">
              <div className="py-2">
                <MessageItem message={MSG_QUICKVOTE_VOTED} onTogglePin={NOOP} onVoteQuick={NOOP} currentUserId="me" />
              </div>
            </PreviewBox>
          </div>
        </CardContent>
      </Card>

      {/* Messages système */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessageItem — messages système (variants)</CardTitle>
          <CardDescription>
            Générés automatiquement lors d&apos;actions. Variant <strong>system-compact</strong> (ligne + texte centré) pour les actions simples. Variant <strong>system-entity</strong> (avatar entité + MessageEntityCard) pour les entités créées.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="compact — action simple (sans entité)">
              <MessageItem message={MSG_SYS_COMPACT} onTogglePin={NOOP} />
            </PreviewBox>
            <PreviewBox label="compact — épinglage">
              <MessageItem message={MSG_SYS_COMPACT2} onTogglePin={NOOP} />
            </PreviewBox>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="full — MessageEntityCard Événement">
              <MessageItem message={MSG_SYS_EVENT} onTogglePin={NOOP} />
            </PreviewBox>
            <PreviewBox label="full — MessageEntityCard Réunion">
              <MessageItem message={MSG_SYS_MEETING} onTogglePin={NOOP} />
            </PreviewBox>
          </div>
        </CardContent>
      </Card>

      {/* DateSeparator */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessageDateSeparator — séparateur de jour</CardTitle>
          <CardDescription>
            Affiché entre les messages quand la date change. Inclut une synthèse IA des messages du jour précédent (générée par Gemini, mise en cache dans <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">message_day_summaries</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <PreviewBox label="En cours de génération">
              <DateSeparatorLoading />
            </PreviewBox>
            <PreviewBox label="Synthèse chargée + ligne de date">
              <DateSeparatorWithSummary />
            </PreviewBox>
          </div>
        </CardContent>
      </Card>

      {/* Composer */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessageComposer — zone de saisie</CardTitle>
          <CardDescription>
            Zone de texte auto-redimensionnable. Bouton image (upload Supabase), menu <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">+</code> (Drive, entité, sondage, vote), bouton envoyer. <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">@</code> pour mentionner membres / événements / réunions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreviewBox label="Composer (Ctrl+Enter pour envoyer · @ pour mentionner)">
            <ComposerPreview />
          </PreviewBox>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: '📷 Image', desc: 'Upload Supabase Storage' },
              { label: '📄 Drive', desc: 'Image ou document depuis Drive' },
              { label: '📅 Entité', desc: 'Tag événement ou réunion' },
              { label: '@ Mention', desc: 'Membre, événement, réunion' },
              { label: '📊 Sondage', desc: 'Plusieurs options' },
              { label: '✅ Vote Oui/Non', desc: 'Vote rapide binaire' },
              { label: '↵ Ctrl+Enter', desc: 'Envoyer le message' },
              { label: '⎋ Escape', desc: 'Fermer dropdown mention' },
            ].map((item) => (
              <div key={item.label} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-border-custom">
                <p className="font-semibold text-zinc-700 dark:text-zinc-300">{item.label}</p>
                <p className="text-zinc-400 dark:text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lien démo */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Démo live</CardTitle>
          <CardDescription>Testez toutes les fonctionnalités directement dans la page Messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="gap-2">
              <MessageSquare size={16} />
              Ouvrir le chat
              <ArrowRight size={14} />
            </Button>
          </Link>
        </CardContent>
      </Card>

    </div>
  );
}

export default function ChatDocsPage() {
  const { setToolbar } = useToolbar();
  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<MessageSquare size={28} />}
          title="Chat"
          subtitle="Exemples visuels de tous les types de messages et fonctionnalités — rendus avec les vrais composants."
        />
      </div>
      <ChatDocsContent />
    </>
  );
}
