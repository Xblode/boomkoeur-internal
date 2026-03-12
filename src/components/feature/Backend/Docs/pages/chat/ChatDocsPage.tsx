'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import {
  Heading,
  Text,
  Button,
} from '@/components/ui/atoms';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CodeSnippet,
} from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';

// ── Chat Docs Content ────────────────────────────────────────────────────────

function ChatDocsContent() {
  const CHAT_OPTIONS = [
    { prop: 'MessagesLayout', type: 'ReactNode', desc: 'Layout principal : sidebar + feed ou journal' },
    { prop: 'MessagesSidebar', type: 'ReactNode', desc: 'Sidebar : conversations, journal, actions démo' },
    { prop: 'MessageFeed', type: 'ReactNode', desc: 'Feed : messages épinglés, liste, composer' },
    { prop: 'MessageItem', type: 'ReactNode', desc: 'Un message (user ou system) avec regroupement par auteur' },
    { prop: 'MessageComposer', type: 'ReactNode', desc: 'Zone de saisie + pièces jointes, sondages, votes' },
    { prop: 'PinnedMessages', type: 'ReactNode', desc: 'Bloc messages épinglés, repliable' },
    { prop: 'DateSeparator', type: 'ReactNode', desc: 'Séparateur de jour avec synthèse IA + messages épinglés' },
    { prop: 'SystemMessage', type: 'ReactNode', desc: 'Message système (variant compact ou full avec BusinessCard)' },
    { prop: 'BusinessCard', type: 'ReactNode', desc: 'Carte événement, réunion ou post' },
    { prop: 'LinkPreview', type: 'ReactNode', desc: 'Preview OG des liens (image, titre, description)' },
  ];

  const MESSAGE_ITEM_OPTIONS = [
    { prop: 'message', type: 'Message', desc: 'Message à afficher' },
    { prop: 'previousMessage', type: 'Message?', desc: 'Pour regroupement (avatar sur dernier du groupe)' },
    { prop: 'nextMessage', type: 'Message?', desc: 'Pour regroupement' },
    { prop: 'onTogglePin', type: '(id, pinned) => void', desc: 'Épingler / désépingler' },
    { prop: 'onToggleReaction', type: '(emoji) => void', desc: 'Ajouter / retirer réaction' },
    { prop: 'onToggleImportant', type: '() => void', desc: 'Marquer important' },
    { prop: 'onVotePoll', type: '(optionId) => void', desc: 'Voter au sondage' },
    { prop: 'onVoteQuick', type: '(yes|no) => void', desc: 'Vote rapide oui/non' },
  ];

  const SYSTEM_MESSAGE_VARIANTS = [
    { variant: 'compact', desc: 'Style séparateur : ligne + texte (2 lignes max) + ligne. Sans avatar. Utilisé automatiquement pour les messages sans entité.' },
    { variant: 'full', desc: 'Avatar + bulle avec bordure colorée. Avec BusinessCard si entité (événement, réunion, post).' },
  ];

  const SYSTEM_MESSAGE_PROPS = [
    { prop: 'message', type: 'Message', desc: 'Message système à afficher' },
    { prop: 'isFirst', type: 'boolean', desc: 'Premier du groupe (padding)' },
    { prop: 'isLast', type: 'boolean', desc: 'Dernier du groupe (affiche avatar)' },
    { prop: 'isLastOfDay', type: 'boolean', desc: 'Dernier message du jour (marge)' },
    { prop: 'onDelete', type: '(id) => void', desc: 'Callback suppression' },
    { prop: 'canDelete', type: 'boolean', desc: 'Affiche le bouton supprimer' },
  ];

  const codeExample = `import { MessagesLayout } from '@/components/feature/Backend/Messages';

// Page Messages
export default function MessagesPage() {
  return <MessagesLayout />;
}

// Page Journal (même layout, sidebar + JournalView)
export default function JournalPage() {
  return <MessagesLayout />;
}`;

  return (
    <div className="space-y-10">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Structure du module Chat</CardTitle>
          <CardDescription>
            Le chat est dans <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">components/feature/Backend/Messages/</code>.
            Import depuis <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">@/components/feature/Backend/Messages</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>MessagesLayout</strong> : orchestre la sidebar (MessagesSidebar) et le contenu (MessageFeed ou JournalView selon la route).</p>
            <p><strong>MessageFeed</strong> : PinnedMessages + liste de messages (DateSeparator + MessageItem) + MessageComposer.</p>
            <p><strong>MessageItem</strong> : affiche un message user (bulle, avatar) ou system (compact ou full). Regroupement par auteur : avatar sur le dernier message du groupe.</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Composants principaux</CardTitle>
          <CardDescription>
            Liste des composants du module Messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-custom">
                  <th className="text-left py-2 px-3 font-semibold">Composant</th>
                  <th className="text-left py-2 px-3 font-semibold">Type</th>
                  <th className="text-left py-2 px-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {CHAT_OPTIONS.map((o) => (
                  <tr key={o.prop} className="border-b border-border-custom/50">
                    <td className="py-2 px-3 font-mono text-xs">{o.prop}</td>
                    <td className="py-2 px-3 font-mono text-xs text-zinc-500">{o.type}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{o.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>MessageItem — props</CardTitle>
          <CardDescription>
            Props principales pour afficher un message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border-custom">
                  <th className="text-left py-2 px-3 font-semibold">Prop</th>
                  <th className="text-left py-2 px-3 font-semibold">Type</th>
                  <th className="text-left py-2 px-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {MESSAGE_ITEM_OPTIONS.map((o) => (
                  <tr key={o.prop} className="border-b border-border-custom/50">
                    <td className="py-2 px-3 font-mono text-xs">{o.prop}</td>
                    <td className="py-2 px-3 font-mono text-xs text-zinc-500">{o.type}</td>
                    <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{o.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>SystemMessage — variants et props</CardTitle>
          <CardDescription>
            Composant unique pour les messages système. Variant compact ou full selon la présence d&apos;une entité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Heading level={5} className="mb-2">Variants</Heading>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left py-2 px-3 font-semibold">Variant</th>
                    <th className="text-left py-2 px-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {SYSTEM_MESSAGE_VARIANTS.map((o) => (
                    <tr key={o.variant} className="border-b border-border-custom/50">
                      <td className="py-2 px-3 font-mono text-xs">{o.variant}</td>
                      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{o.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <Heading level={5} className="mb-2">Props</Heading>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-custom">
                    <th className="text-left py-2 px-3 font-semibold">Prop</th>
                    <th className="text-left py-2 px-3 font-semibold">Type</th>
                    <th className="text-left py-2 px-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {SYSTEM_MESSAGE_PROPS.map((o) => (
                    <tr key={o.prop} className="border-b border-border-custom/50">
                      <td className="py-2 px-3 font-mono text-xs">{o.prop}</td>
                      <td className="py-2 px-3 font-mono text-xs text-zinc-500">{o.type}</td>
                      <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">{o.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Exemple d&apos;utilisation</CardTitle>
          <CardDescription>
            Le composant MessagesLayout nécessite une organisation active (OrgProvider) et le hook useMessages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeSnippet code={codeExample} language="tsx" />
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Démo live</CardTitle>
          <CardDescription>
            Le chat complet est disponible sur la page Messages. Testez les messages épinglés, les réactions, les sondages, les votes rapides, les previews de liens et les messages système.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/messages">
            <Button variant="outline" className="gap-2">
              <MessageSquare size={16} />
              Ouvrir la page Messages
              <ArrowRight size={14} />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Heading level={5} className="mb-1">Messages</Heading>
            <Text variant="muted" className="text-sm">
              Regroupement par auteur (avatar sur dernier message), messages épinglés, réactions emoji, mentions @, liens avec preview OG.
            </Text>
          </div>
          <div>
            <Heading level={5} className="mb-1">Messages système</Heading>
            <Text variant="muted" className="text-sm">
              Variant compact (style séparateur) ou full avec BusinessCard (événement, réunion, post). Badge « X éléments manquants » sur mobile.
            </Text>
          </div>
          <div>
            <Heading level={5} className="mb-1">Composer</Heading>
            <Text variant="muted" className="text-sm">
              Texte, images, fichiers Drive, mentions @, sondages, votes rapides, cartes d&apos;entités.
            </Text>
          </div>
          <div>
            <Heading level={5} className="mb-1">Journal</Heading>
            <Text variant="muted" className="text-sm">
              Synthèses IA par jour (DateSeparator), accessible via la sidebar.
            </Text>
          </div>
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
          subtitle="Documentation du module Messages : structure, composants et référence."
        />
      </div>
      <ChatDocsContent />
    </>
  );
}
