'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Heading,
  Text,
  Input,
  Select,
  Label,
} from '@/components/ui/atoms';
import {
  Card,
  CardContent,
  SectionHeader,
  EntitySelectorDropdown,
  SidebarCard,
  PageAlert,
} from '@/components/ui/molecules';
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalThreeColumnLayout,
  PageToolbar,
  PageToolbarFilters,
  PageToolbarActions,
  ProfileHeader,
  Footer,
  Header,
  Sidebar,
  PageSidebar,
  PageContentLayout,
} from '@/components/ui';
import { footerLinks, footerSocialLinks, backendNavigation, frontendNavigation } from '@/config/navigation';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { FlaskConical, Calendar, Users, X, Layers3 } from 'lucide-react';
import { toast } from 'sonner';

// ── Organisms Content ───────────────────────────────────────────────────────

function OrganismsContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalExplicitOpen, setModalExplicitOpen] = useState(false);
  const [modalFullBleedOpen, setModalFullBleedOpen] = useState(false);
  const [modalThreeColOpen, setModalThreeColOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md');
  const [organismsYear, setOrganismsYear] = useState(new Date().getFullYear());
  const [organismsSection, setOrganismsSection] = useState('infos');

  const mockUser = {
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'Administrateur',
    location: 'Paris, France',
    website: 'https://example.com',
    bio: 'Développeur passionné par le design system et les interfaces utilisateur modernes.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/png?seed=Jean',
  };

  return (
    <div className="space-y-10">
      {/* 1. Modal */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Modal</Heading>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => setModalOpen(true)}>Ouvrir Modal</Button>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Taille :</Label>
              <Select
                value={modalSize}
                onChange={(e) => setModalSize(e.target.value as 'sm' | 'md' | 'lg' | 'xl' | '2xl')}
                size="sm"
                options={[
                  { value: 'sm', label: 'sm' },
                  { value: 'md', label: 'md' },
                  { value: 'lg', label: 'lg' },
                  { value: 'xl', label: 'xl' },
                  { value: '2xl', label: '2xl' },
                ]}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Text variant="small" className="block">Modal simple (padding par défaut)</Text>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Exemple de modal" size={modalSize}>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Contenu du modal. Vous pouvez y placer des formulaires, des messages ou tout autre contenu.
              </p>
              <ModalFooter>
                <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>Annuler</Button>
                <Button variant="primary" size="sm" onClick={() => { toast.success('Confirmé'); setModalOpen(false); }}>Confirmer</Button>
              </ModalFooter>
            </Modal>
          </div>
          <div>
            <Text variant="small" className="block mb-2">Modal avec ModalHeader / ModalContent / ModalFooter explicites</Text>
            <Text variant="muted" className="text-sm block mb-2">Structure explicite : container sans padding, chaque section avec son padding.</Text>
            <Button variant="outline" size="sm" onClick={() => setModalExplicitOpen(true)}>Ouvrir modal structure explicite</Button>
            <Modal isOpen={modalExplicitOpen} onClose={() => setModalExplicitOpen(false)} size="md">
              <ModalHeader>
                <h2 className="text-xl font-bold text-foreground">Titre personnalisé</h2>
                <Button variant="ghost" size="sm" onClick={() => setModalExplicitOpen(false)} aria-label="Fermer">
                  <X className="w-4 h-4" />
                </Button>
              </ModalHeader>
              <ModalContent>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Contenu avec padding propre. Le container n&apos;a pas de padding.
                </p>
              </ModalContent>
              <ModalFooter>
                <Button variant="outline" size="sm" onClick={() => setModalExplicitOpen(false)}>Annuler</Button>
                <Button variant="primary" size="sm" onClick={() => { toast.success('Confirmé'); setModalExplicitOpen(false); }}>Confirmer</Button>
              </ModalFooter>
            </Modal>
          </div>
          <div>
            <Text variant="small" className="block mb-2">Modal variant="fullBleed" (structure type bénévoles/artistes, sans 3 colonnes)</Text>
            <Text variant="muted" className="text-sm block mb-2">Header + zone contenu full-bleed avec border-t + footer fixe.</Text>
            <Button variant="outline" size="sm" onClick={() => setModalFullBleedOpen(true)}>Ouvrir modal variant="fullBleed"</Button>
            <Modal
              isOpen={modalFullBleedOpen}
              onClose={() => setModalFullBleedOpen(false)}
              title="Structure full-bleed"
              size="lg"
              variant="fullBleed"
            >
              <div className="grid overflow-hidden h-full min-h-[300px]" style={{ gridTemplateColumns: '200px 1fr' }}>
                <aside className="border-r border-border-custom p-4 bg-zinc-50/30 dark:bg-zinc-900/20">
                  <p className="text-xs font-medium text-zinc-500 uppercase">Sidebar</p>
                  <p className="text-sm mt-2">Navigation ou filtres</p>
                </aside>
                <div className="overflow-y-auto p-5">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Zone principale. Même structure que bénévoles/artistes mais avec 2 colonnes au lieu de 3.</p>
                </div>
              </div>
              <ModalFooter>
                <Button variant="outline" size="sm" onClick={() => setModalFullBleedOpen(false)}>Annuler</Button>
                <Button variant="primary" size="sm" onClick={() => { toast.success('Confirmé'); setModalFullBleedOpen(false); }}>Confirmer</Button>
              </ModalFooter>
            </Modal>
          </div>
          <div>
            <Text variant="small" className="block mb-2">ModalThreeColumnLayout</Text>
            <Text variant="muted" className="text-sm block mb-2">Layout 3 colonnes (sidebar 250px | liste | détail) pour modals Artistes/Bénévoles.</Text>
            <Button variant="outline" size="sm" onClick={() => setModalThreeColOpen(true)}>Ouvrir ModalThreeColumnLayout</Button>
            <Modal
              isOpen={modalThreeColOpen}
              onClose={() => setModalThreeColOpen(false)}
              title="ModalThreeColumnLayout"
              size="lg"
              variant="fullBleed"
            >
              <ModalThreeColumnLayout
                sidebar={
                  <>
                    <div className="p-3 border-b border-border-custom">
                      <Input placeholder="Rechercher..." className="h-7 text-xs" fullWidth />
                    </div>
                    <nav className="p-2 space-y-0.5">
                      <Button variant="ghost" size="sm" className="w-full justify-start">Option 1</Button>
                      <Button variant="ghost" size="sm" className="w-full justify-start bg-zinc-100 dark:bg-zinc-800">Option 2</Button>
                    </nav>
                  </>
                }
                list={
                  <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                    <p className="px-2 py-4 text-sm text-zinc-500">Liste scrollable (ex: artistes, bénévoles)</p>
                  </div>
                }
                detail={
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Panneau détail. Sélectionnez un élément dans la liste.</p>
                }
              />
              <ModalFooter>
                <Button variant="ghost" size="sm" onClick={() => setModalThreeColOpen(false)}>Fermer</Button>
              </ModalFooter>
            </Modal>
          </div>
        </div>
      </CardContent></Card>

      {/* 2. PageToolbar */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>PageToolbar</Heading>
        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <PageToolbar
            filters={
              <PageToolbarFilters>
                <Select value="all" onChange={() => {}} size="xs" options={[{ value: 'all', label: 'Tous' }, { value: 'a', label: 'Type A' }]} />
                <Select value="date" onChange={() => {}} size="xs" options={[{ value: 'date', label: 'Date' }, { value: 'name', label: 'Nom' }]} />
              </PageToolbarFilters>
            }
            actions={
              <PageToolbarActions>
                <Button size="xs">Export</Button>
                <Button size="xs">Nouveau</Button>
              </PageToolbarActions>
            }
          />
        </div>
      </CardContent></Card>

      {/* 3. ProfileHeader */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>ProfileHeader</Heading>
        <ProfileHeader user={mockUser} />
      </CardContent></Card>

      {/* 4. Footer */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Footer</Heading>
        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <Footer links={footerLinks} socialLinks={footerSocialLinks} />
        </div>
      </CardContent></Card>

      {/* 5. Header */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Header</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">Variant default (frontend)</Text>
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-14">
              <Header navigation={frontendNavigation} variant="default" />
            </div>
          </div>
          <div>
            <Text variant="small" className="block mb-2">Variant admin (dashboard)</Text>
            <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-14">
              <Header navigation={[]} variant="admin" />
            </div>
          </div>
        </div>
      </CardContent></Card>

      {/* 6. Sidebar */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Sidebar</Heading>
        <Text variant="muted" className="text-sm block mb-4">Aperçu dans un conteneur (hauteur 400px).</Text>
        <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[400px]">
          <Sidebar items={backendNavigation} mode="expanded" className="!relative !top-0 !left-0 !h-full" />
        </div>
      </CardContent></Card>

      {/* 7. PageSidebar */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>PageSidebar</Heading>
        <div className="flex gap-4">
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 w-64 shrink-0">
            <PageSidebar
              backLink={{ href: '/dashboard', label: 'Retour au dashboard' }}
              entitySelector={
                <EntitySelectorDropdown<number>
                  value={organismsYear}
                  options={[2024, 2025, 2026]}
                  onSelect={setOrganismsYear}
                  renderValue={(v) => `Année ${v}`}
                  renderOption={(v) => v}
                  placeholder="Année"
                />
              }
              sectionGroups={[
                {
                  title: 'Design System',
                  sections: [
                    { id: 'infos', label: 'Informations', icon: <Calendar size={16} /> },
                    { id: 'artistes', label: 'Artistes', icon: <Users size={16} /> },
                  ],
                },
              ]}
              activeSectionId={organismsSection}
              onSectionChange={setOrganismsSection}
              children={
                <div className="mt-4 space-y-2">
                  <SidebarCard icon={FlaskConical} title="Layout de référence" subtitle="Source de vérité" />
                </div>
              }
            />
          </div>
          <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
            <Text variant="muted" className="text-sm">Zone de contenu (à droite de PageSidebar).</Text>
          </div>
        </div>
      </CardContent></Card>

      {/* 8. PageContentLayout */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>PageContentLayout</Heading>
        <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 h-[400px] flex flex-col">
          <PageContentLayout
            alert={<PageAlert variant="info" message="Exemple d&apos;alerte de page" onDismiss={() => {}} />}
            toolbar={
              <PageToolbar
                filters={<PageToolbarFilters><span className="text-xs text-zinc-400">Filtres</span></PageToolbarFilters>}
                actions={<PageToolbarActions><Button size="xs">Action</Button></PageToolbarActions>}
              />
            }
            sectionHeader={<SectionHeader icon={<Calendar size={28} />} title="Titre de section" subtitle="Sous-titre optionnel" />}
            maxWidth="6xl"
          >
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Contenu principal de la page.</p>
          </PageContentLayout>
        </div>
      </CardContent></Card>

      {/* 9. DashboardShell */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>DashboardShell</Heading>
        <Text variant="muted" className="text-sm block mb-4">
          Structure unique pour les pages détail. Lit les providers (PageSidebar, Toolbar, Alert, ChatPanel) et affiche les slots.
          Utilisé automatiquement sur les routes configurées dans <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">config/layout.ts</code>.
        </Text>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-xs overflow-x-auto">
{`DashboardShell
├── PageSidebar (si config)
│   ├── BackLink
│   ├── EntitySelectorDropdown
│   ├── SectionNavLink[]
│   └── SidebarCard[] (children)
└── Main
    ├── PageAlert (slot)
    ├── Toolbar (slot)
    └── children (contenu scrollable)`}
        </pre>
      </CardContent></Card>
    </div>
  );
}

// ── Organisms Page ───────────────────────────────────────────────────────────

export default function OrganismsPage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<Layers3 size={28} />}
          title="Organisms"
          subtitle="Tous les composants organisms du design system."
        />
      </div>
      <OrganismsContent />
    </>
  );
}
