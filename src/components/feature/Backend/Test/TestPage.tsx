"use client";

import React, { useEffect, useState } from 'react';
import { useTestLayout } from './TestLayoutConfig';
import {
  Button,
  Heading,
  Text,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Switch,
  Slider,
  Label,
  IconButton,
  Badge,
  Tag,
  Dot,
  Chip,
  Avatar,
  Spinner,
  Skeleton,
  Progress,
  Divider,
  CustomLink,
  Rating,
  InlineEdit,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/atoms';
import {
  BackLink,
  SectionNavLink,
  Breadcrumb,
  EntitySelectorDropdown,
  SidebarCard,
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  FormField,
  DatePicker,
  TimePicker,
  SearchInput,
  FilterField,
  TabSwitcher,
  EventSelector,
  TagMultiSelect,
  MemberPicker,
  PeriodSelector,
  PageAlert,
  EmptyState,
  LoadingState,
  KPICard,
  DataTable,
  TablePagination,
  FilterBar,
  ActionButtons,
  ToggleGroup,
  AssetUploaderPanel,
  StatusBadge,
  EditableCard,
  SettingsCardRow,
} from '@/components/ui/molecules';
import { TEST_SECTIONS } from './TestLayoutConfig';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import {
  PageToolbar,
  PageToolbarFilters,
  PageToolbarActions,
  ToolbarFilterDropdown,
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalThreeColumnLayout,
  Header,
  Footer,
  Sidebar,
  ProfileHeader,
  PageSidebar,
  PageContentLayout,
} from '@/components/ui';
import { footerLinks, footerSocialLinks, backendNavigation, frontendNavigation } from '@/config/navigation';
import { EventCard } from '@/components/feature/Backend/Events/EventCard';
import type { Event } from '@/types/event';
import { Settings, FileDown, FileUp, Plus, Pencil, Trash2, Star, Calendar, MapPin, Users, Wallet, TrendingUp, Layers2, FlaskConical, X } from 'lucide-react';
import { toast } from 'sonner';

// ── Molecules Content (Phase 4) ─────────────────────────────────────────────

function MoleculesContent() {
  const [moleculesPeriod, setMoleculesPeriod] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');
  const [moleculesYear, setMoleculesYear] = useState(new Date().getFullYear());
  const [moleculesMonth, setMoleculesMonth] = useState(1);
  const [moleculesFilterOpen, setMoleculesFilterOpen] = useState(false);
  const [moleculesFilterCount, setMoleculesFilterCount] = useState(0);
  const [moleculesToggle, setMoleculesToggle] = useState('month');
  const [moleculesSelectedTags, setMoleculesSelectedTags] = useState<string[]>([]);
  const [moleculesSelectedEventIds, setMoleculesSelectedEventIds] = useState<string[]>([]);
  const [moleculesPage, setMoleculesPage] = useState(1);
  const [moleculesDate, setMoleculesDate] = useState<Date | undefined>(new Date());
  const [moleculesTime, setMoleculesTime] = useState('14:00');
  const [moleculesEntity, setMoleculesEntity] = useState<number | null>(2025);
  const [moleculesTab, setMoleculesTab] = useState<'campagne' | 'stats'>('campagne');
  const [moleculesSearch, setMoleculesSearch] = useState('');
  const [moleculesEditableCardOpen, setMoleculesEditableCardOpen] = useState(false);
  const [moleculesEditableCardTitle, setMoleculesEditableCardTitle] = useState('');

  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'Concert Jazz',
      date: new Date('2025-03-15T20:00:00'),
      endTime: '02:00',
      location: 'Paris',
      description: 'Soirée jazz',
      status: 'confirmed',
      artists: [{ id: 'a1', name: 'DJ Martin', genre: 'Jazz', type: 'dj' }],
      linkedElements: [],
      tags: ['Soirée', 'Jazz'],
      comments: [{ id: 'c1', author: 'Admin', content: 'Super événement', createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Festival Rock',
      date: new Date('2025-06-20T18:00:00'),
      location: 'Lyon',
      description: 'Festival',
      status: 'preparation',
      artists: [],
      linkedElements: [],
      tags: ['Festival', 'Rock'],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTags = [
    { id: 't1', name: 'Urgent', color: '#ef4444' },
    { id: 't2', name: 'Important', color: '#f59e0b' },
    { id: 't3', name: 'Archive', color: '#6b7280' },
  ];

  const mockTableData = [
    { id: '1', nom: 'Dupont', email: 'dupont@example.com', statut: 'Actif' },
    { id: '2', nom: 'Martin', email: 'martin@example.com', statut: 'En attente' },
    { id: '3', nom: 'Bernard', email: 'bernard@example.com', statut: 'Inactif' },
  ];

  return (
    <div className="space-y-10">
      {/* 1. Layout & Navigation */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Layout &amp; Navigation</Heading>
        <div className="space-y-4">
          <div>
            <Text variant="small" className="block mb-2">BackLink</Text>
            <BackLink href="/dashboard" label="Retour au dashboard" />
          </div>
          <div>
            <Text variant="small" className="block mb-2">SectionNavLink</Text>
            <div className="flex flex-col gap-1 w-48">
              <SectionNavLink href="#" icon={<Calendar size={16} />} label="Informations" active={true} />
              <SectionNavLink href="#" icon={<Users size={16} />} label="Artistes" active={false} />
            </div>
          </div>
          <div>
            <Text variant="small" className="block mb-2">Breadcrumb</Text>
            <Breadcrumb />
          </div>
          <div>
            <Text variant="small" className="block mb-2">EntitySelectorDropdown</Text>
            <div className="w-48">
              <EntitySelectorDropdown
                value={moleculesEntity}
                options={[2024, 2025, 2026]}
                onSelect={setMoleculesEntity}
                renderValue={(v) => `Année ${v}`}
                renderOption={(v) => `Année ${v}`}
                placeholder="Sélectionner une année"
              />
            </div>
          </div>
          <div>
            <Text variant="small" className="block mb-2">SidebarCard</Text>
            <div className="flex flex-col gap-2 max-w-xs">
              <SidebarCard icon={Calendar} title="Prochain événement" subtitle="15 mars 2025" href="#" />
              <SidebarCard icon={Users} title="Réunion équipe" subtitle="Demain 10h" onClick={() => toast.info('Clic')} />
            </div>
          </div>
        </div>
      </CardContent></Card>

      {/* 2. Headers */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>SectionHeader</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">Simple (icon + title)</Text>
            <SectionHeader icon={<Wallet size={28} />} title="Trésorerie" />
          </div>
          <div>
            <Text variant="small" className="block mb-2">Avec sous-titre</Text>
            <SectionHeader
              icon={<Layers2 size={28} />}
              title="Molecules"
              subtitle="Tous les composants molecules du design system avec leurs variantes, en mise en situation."
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">Avec métadonnées (mode détail)</Text>
            <SectionHeader
              title="Détail d&apos;un événement"
              icon={<Calendar size={28} />}
              metadata={[
                [
                  { icon: Calendar, label: 'Date', value: <span>15 mars 2025</span> },
                  { icon: MapPin, label: 'Lieu', value: <span>Paris</span> },
                ],
                [
                  { icon: Users, label: 'Participants', value: <span>42</span> },
                  { icon: Wallet, label: 'Budget', value: <span>5 000 €</span> },
                ],
              ]}
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">Avec actions</Text>
            <SectionHeader
              icon={<TrendingUp size={28} />}
              title="Évolution"
              actions={<Button size="sm">Filtrer</Button>}
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">Avec filters (recherche + selects)</Text>
            <SectionHeader
              icon={<Calendar size={28} />}
              title="Liste avec filtres"
              subtitle="Pattern utilisé sur Events, Réunions, Produits, Commercial"
              actions={<Button size="sm" variant="primary">Action</Button>}
              filters={
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <SearchInput
                    label="Recherche"
                    placeholder="Rechercher..."
                    value={moleculesSearch}
                    onChange={setMoleculesSearch}
                  />
                  <FilterField label="Statut">
                    <Select
                      value="all"
                      onChange={() => {}}
                      options={[
                        { value: 'all', label: 'Tous' },
                        { value: 'active', label: 'Actif' },
                        { value: 'archived', label: 'Archivé' },
                      ]}
                    />
                  </FilterField>
                  <FilterField label="Type">
                    <Select
                      value="all"
                      onChange={() => {}}
                      options={[
                        { value: 'all', label: 'Tous les types' },
                        { value: 'a', label: 'Type A' },
                        { value: 'b', label: 'Type B' },
                      ]}
                    />
                  </FilterField>
                  <FilterField label="Tri">
                    <Select
                      value="date"
                      onChange={() => {}}
                      options={[
                        { value: 'date', label: 'Date' },
                        { value: 'name', label: 'Nom' },
                      ]}
                    />
                  </FilterField>
                </div>
              }
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 2b. TabSwitcher */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>TabSwitcher</Heading>
        <div className="space-y-4">
          <Text variant="small" className="block">
            Onglets avec indicateur souligné (style Campagne / Statistiques).
          </Text>
          <TabSwitcher<'campagne' | 'stats'>
            options={[
              { value: 'campagne', label: 'Campagne' },
              { value: 'stats', label: 'Statistiques' },
            ]}
            value={moleculesTab}
            onChange={setMoleculesTab}
          />
          <p className="text-sm text-zinc-500">
            Onglet actif : <strong>{moleculesTab}</strong>
          </p>
        </div>
      </CardContent></Card>

      {/* 3. Cards */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Cards</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Titre de la carte</CardTitle>
              <CardDescription>Description optionnelle de la carte.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Contenu de la carte. Peut contenir du texte, des formulaires, etc.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          <Card title="Carte avec titre inline" description="Via les props title et description.">
            <p className="p-4 text-sm">Contenu compact.</p>
          </Card>
          <Card variant="poster" className="overflow-hidden flex flex-col">
            <div className="p-2 pt-2">
              <CardMedia aspectRatio="video" placeholder>
                <Calendar size={48} className="text-zinc-600" />
              </CardMedia>
            </div>
            <CardContent className="p-4 flex-1">
              <h3 className="font-bold text-lg text-white">Card variant=&quot;poster&quot; + CardMedia</h3>
              <p className="text-sm text-zinc-400 mt-1">Aspect ratio video (16:9) ou square.</p>
            </CardContent>
            <CardFooter variant="poster" className="px-4 py-3">
              <Button size="sm" variant="ghost" className="text-zinc-400">Action</Button>
            </CardFooter>
          </Card>
          <Card variant="list" className="overflow-hidden flex flex-col max-w-xs">
            <CardContent className="p-4 flex flex-col gap-2">
              <p className="text-xs text-zinc-400">Card variant=&quot;list&quot;</p>
              <h3 className="font-bold text-lg text-white">Grille Product / Event / Meeting</h3>
              <p className="text-sm text-zinc-400">Fond sombre bg-card-bg, bordure zinc-800.</p>
            </CardContent>
          </Card>
          <Card variant="settings" title="Card variant=&quot;settings&quot;" description="Pages Apparence, Admin, Profile.">
            <CardContent className="p-0 divide-y divide-border-custom">
              <SettingsCardRow label="Exemple de ligne" description="Label à gauche, contrôle à droite.">
                <Button variant="outline" size="sm">Contrôle</Button>
              </SettingsCardRow>
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          <Text variant="small" className="block mb-2">EventCard</Text>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                onEdit={() => toast.info(`Éditer ${evt.name}`)}
                onDelete={() => toast.error(`Supprimer ${evt.name}`)}
                onDuplicate={() => toast.success(`Dupliquer ${evt.name}`)}
                onClick={() => toast.info(`Clic sur ${evt.name}`)}
              />
            ))}
          </div>
        </div>
        <div className="mt-6">
          <Text variant="small" className="block mb-2">EditableCard</Text>
          <Text variant="muted" className="text-sm block mb-4">Carte éditable avec zone déroulante au clic sur Éditer.</Text>
          <div className="max-w-md">
            <EditableCard
              isEditing={moleculesEditableCardOpen}
              onEdit={() => setMoleculesEditableCardOpen(true)}
              onCloseEdit={() => setMoleculesEditableCardOpen(false)}
              onDelete={() => { toast.error('Supprimer'); setMoleculesEditableCardOpen(false); }}
              headerContent={
                <>
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar size={16} className="text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shrink-0">
                        Point
                      </span>
                      <p className="text-sm font-medium leading-snug">Exemple de carte éditable</p>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Cliquez sur Éditer pour dérouler la zone de formulaire.</p>
                  </div>
                </>
              }
              editContent={
                <>
                  <div>
                    <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Titre</Label>
                    <Input placeholder="Titre du point" value={moleculesEditableCardTitle} onChange={(e) => setMoleculesEditableCardTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-zinc-500 mb-1.5 block uppercase tracking-wide">Description</Label>
                    <Input placeholder="Description optionnelle" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setMoleculesEditableCardOpen(false)}>Annuler</Button>
                    <Button variant="primary" size="sm" onClick={() => { toast.success('Sauvegardé'); setMoleculesEditableCardOpen(false); }}>Enregistrer</Button>
                  </div>
                </>
              }
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 4. Formulaires */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Formulaires</Heading>
        <div className="grid gap-6 md:grid-cols-2">
          <FormField label="Champ avec label" htmlFor="mf-1" description="Description d&apos;aide.">
            <Input id="mf-1" placeholder="Saisir..." />
          </FormField>
          <FormField label="Champ avec erreur" htmlFor="mf-2" error="Ce champ est requis">
            <Input id="mf-2" placeholder="Erreur" />
          </FormField>
          <div>
            <Label className="block mb-2">DatePicker</Label>
            <DatePicker date={moleculesDate} onSelect={setMoleculesDate} placeholder="Choisir une date" />
          </div>
          <div>
            <Label className="block mb-2">TimePicker</Label>
            <TimePicker time={moleculesTime} onChange={setMoleculesTime} />
          </div>
          <div>
            <Label className="block mb-2">SearchInput</Label>
            <SearchInput
              label="Recherche (filtres)"
              placeholder="Nom, SKU..."
              value={moleculesSearch}
              onChange={setMoleculesSearch}
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 5. Sélecteurs */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Sélecteurs</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">EventSelector</Text>
            <EventSelector
              availableEvents={mockEvents}
              selectedEventIds={moleculesSelectedEventIds}
              onEventToggle={(id) => setMoleculesSelectedEventIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
              placeholder="Lier à un événement"
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">TagMultiSelect</Text>
            <TagMultiSelect
              value={moleculesSelectedTags}
              onChange={setMoleculesSelectedTags}
              placeholder="Ajouter une étiquette..."
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">MemberPicker</Text>
            <MemberPicker value={[]} onChange={() => {}} />
          </div>
          <div>
            <Text variant="small" className="block mb-2">PeriodSelector</Text>
            <PeriodSelector
              periodType={moleculesPeriod}
              onPeriodTypeChange={setMoleculesPeriod}
              selectedYear={moleculesYear}
              onYearChange={setMoleculesYear}
              selectedMonth={moleculesMonth}
              onMonthChange={setMoleculesMonth}
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 6. Feedback */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Feedback</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">PageAlert (contrôlé par les boutons Démo)</Text>
            <Text variant="muted" className="text-sm">Utilisez les boutons de la section Démo pour afficher des alertes.</Text>
          </div>
          <div>
            <Text variant="small" className="block mb-2">EmptyState</Text>
            <div className="grid gap-4 md:grid-cols-2">
              <EmptyState title="Aucun élément" description="Ajoutez votre premier élément pour commencer." variant="compact" />
              <EmptyState title="Liste vide" variant="inline" action={<Button size="sm">Créer</Button>} />
            </div>
          </div>
          <div>
            <Text variant="small" className="block mb-2">LoadingState</Text>
            <div className="h-40 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
              <LoadingState message="Chargement des données..." />
            </div>
          </div>
        </div>
      </CardContent></Card>

      {/* 7. Données */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Données</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">KPICard</Text>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard label="Bénévoles" value={12} icon={Users} />
              <KPICard label="Revenus" value="5 000" unit="€" icon={Wallet} />
              <KPICard label="Trésorerie" value={24500} unit="€" icon={Wallet} />
              <KPICard label="Revenus" value={12500} unit="€" icon={TrendingUp} trend={8.2} trendLabel="vs N-1" />
            </div>
          </div>
          <div>
            <Text variant="small" className="block mb-2">DataTable + TablePagination</Text>
            <DataTable
              data={mockTableData}
              columns={[
                { key: 'nom', label: 'Nom', sortable: true },
                { key: 'email', label: 'Email' },
                { key: 'statut', label: 'Statut', render: (r) => <StatusBadge label={r.statut} variant="neutral" /> },
              ]}
              emptyMessage="Aucune donnée"
            />
            <TablePagination
              currentPage={moleculesPage}
              totalPages={3}
              totalItems={25}
              itemsPerPage={10}
              onPageChange={setMoleculesPage}
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 8. Actions */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Actions</Heading>
        <div className="space-y-6">
          <div>
            <Text variant="small" className="block mb-2">ToolbarFilterDropdown</Text>
            <Text variant="muted" className="text-sm">Utilisé dans la toolbar de la section Démo.</Text>
          </div>
          <div>
            <Text variant="small" className="block mb-2">FilterBar</Text>
            <FilterBar
              showFilters={moleculesFilterOpen}
              onToggleFilters={() => setMoleculesFilterOpen((o) => !o)}
              activeFiltersCount={moleculesFilterCount}
              onResetFilters={() => setMoleculesFilterCount(0)}
            >
              <Input placeholder="Filtre 1" size="sm" />
              <Input placeholder="Filtre 2" size="sm" />
              <Select options={[{ value: 'a', label: 'Option A' }, { value: 'b', label: 'Option B' }]} size="sm" />
            </FilterBar>
          </div>
          <div>
            <Text variant="small" className="block mb-2">ActionButtons</Text>
            <ActionButtons
              buttons={[
                { label: 'Modifier', icon: Pencil, onClick: () => toast.info('Modifier') },
                { label: 'Supprimer', icon: Trash2, onClick: () => toast.error('Supprimer'), variant: 'destructive' },
              ]}
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">ToggleGroup</Text>
            <ToggleGroup
              options={[
                { value: 'month', label: 'Mois' },
                { value: 'quarter', label: 'Trimestre' },
                { value: 'year', label: 'Année' },
              ]}
              value={moleculesToggle}
              onChange={(v) => setMoleculesToggle(v as string)}
            />
          </div>
        </div>
      </CardContent></Card>

      {/* 9. Médias */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>Médias</Heading>
        <div>
          <Text variant="small" className="block mb-2">AssetUploaderPanel</Text>
          <AssetUploaderPanel
            files={[]}
            onFileAdd={(_file) => { toast.success('Fichier ajouté'); }}
            onFileRemove={() => {}}
            allowMultiple
            title="Documents"
          />
        </div>
      </CardContent></Card>

      {/* 10. Badges */}
      <Card variant="outline"><CardContent className="p-6 space-y-4">
        <Heading level={4}>StatusBadge</Heading>
        <div className="flex flex-wrap gap-2">
          <StatusBadge label="Succès" variant="success" />
          <StatusBadge label="Attention" variant="warning" />
          <StatusBadge label="Erreur" variant="danger" />
          <StatusBadge label="Info" variant="info" />
          <StatusBadge label="Neutre" variant="neutral" />
          <StatusBadge label="En cours" variant="default" pulse showIcon={false} />
        </div>
      </CardContent></Card>
    </div>
  );
}

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

export default function TestPage() {
  const { activeSection, setPageAlert } = useTestLayout();
  const { setToolbar } = useToolbar();
  const activeConfig = TEST_SECTIONS.find((s) => s.id === activeSection);

  const sectionHeaderNode =
    activeConfig != null ? (
      <div className="mb-6">
        <SectionHeader
          icon={activeConfig.headerIcon}
          title={activeConfig.label}
          subtitle={activeConfig.subtitle}
        />
      </div>
    ) : null;

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [atomsSwitch, setAtomsSwitch] = useState(false);
  const [atomsRadio, setAtomsRadio] = useState('option-a');
  const [atomsCheckbox, setAtomsCheckbox] = useState(false);
  const [atomsSlider, setAtomsSlider] = useState(50);
  const [atomsRating, setAtomsRating] = useState(4);
  const [atomsInlineEdit, setAtomsInlineEdit] = useState('Texte éditable');
  const [atomsInlineEditSm, setAtomsInlineEditSm] = useState('Compact');
  const [atomsTableNom, setAtomsTableNom] = useState('Dupont');
  const [atomsTableEmail, setAtomsTableEmail] = useState('dupont@example.com');
  const [atomsTableStatut, setAtomsTableStatut] = useState('actif');
  const [atomsAddableRows, setAtomsAddableRows] = useState<{ nom: string; email: string; statut: string }[]>([
    { nom: 'Dupont', email: 'dupont@example.com', statut: 'Actif' },
    { nom: 'Martin', email: 'martin@example.com', statut: 'En attente' },
  ]);

  const activeFiltersCount =
    (filterType !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  useEffect(() => {
    setToolbar(
      <PageToolbar
        filters={
          <PageToolbarFilters>
            <ToolbarFilterDropdown
              label="Filtres"
              activeCount={activeFiltersCount}
              open={filterDropdownOpen}
              onOpenChange={setFilterDropdownOpen}
            >
              <div className="space-y-4">
                <div>
                  <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                    Recherche
                  </Label>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    size="xs"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                    Type
                  </Label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    size="xs"
                    options={[
                      { value: 'all', label: 'Tous' },
                      { value: 'type-a', label: 'Type A' },
                      { value: 'type-b', label: 'Type B' },
                    ]}
                  />
                </div>
                <div>
                  <Label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 uppercase">
                    Statut
                  </Label>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    size="xs"
                    options={[
                      { value: 'all', label: 'Tous' },
                      { value: 'pending', label: 'En attente' },
                      { value: 'done', label: 'Terminé' },
                    ]}
                  />
                </div>
                {(activeFiltersCount > 0 || searchQuery) && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterStatus('all');
                      setFilterDropdownOpen(false);
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </ToolbarFilterDropdown>
            <span className="text-zinc-500 text-sm">|</span>
            <div className="w-[140px]">
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                size="xs"
                options={[
                  { value: 'all', label: 'Tous les types' },
                  { value: 'type-a', label: 'Type A' },
                  { value: 'type-b', label: 'Type B' },
                ]}
              />
            </div>
          </PageToolbarFilters>
        }
        actions={
          <PageToolbarActions>
            <Button
              onClick={() => {
                toast.info('Paramètres');
              }}
            >
              <Settings className="w-3 h-3 mr-1.5" />
              Paramètres
            </Button>
            <Button
              onClick={() => {
                toast.success('Export réussi');
              }}
            >
              <FileDown className="w-3 h-3 mr-1.5" />
              Export
            </Button>
            <Button
              onClick={() => {
                toast.info('Import');
              }}
            >
              <FileUp className="w-3 h-3 mr-1.5" />
              Import
            </Button>
            <Button
              onClick={() => {
                toast.success('Nouvelle création');
              }}
            >
              <Plus className="w-3 h-3 mr-1.5" />
              Nouvelle
            </Button>
          </PageToolbarActions>
        }
      />
    );
    return () => setToolbar(null);
  }, [
    setToolbar,
    filterDropdownOpen,
    activeFiltersCount,
    searchQuery,
    filterType,
    filterStatus,
  ]);

  if (activeSection === 'demo') {
    return (
      <>
        {sectionHeaderNode}
        <div className="space-y-6">
        <Text variant="muted">
          Cette page teste le layout unifié avec tous les composants de référence :
        </Text>
        <ul className="list-disc list-inside space-y-2 text-zinc-600 dark:text-zinc-400 text-sm">
          <li>BackLink (Retour au dashboard)</li>
          <li>EntitySelectorDropdown (sélecteur d&apos;année)</li>
          <li>SectionNavLink (Démo, Alertes, Atoms, Molecules, Référence)</li>
          <li>SidebarCard (Layout de référence)</li>
          <li>PageAlert (zone d&apos;alerte au-dessus de la toolbar)</li>
          <li>PageToolbar : ToolbarFilterDropdown, Select inline, actions (Paramètres, Export, Import, Nouvelle)</li>
          <li>SectionHeader (titre de section avec icône)</li>
        </ul>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageAlert({ variant: 'info', message: 'Message informatif' })}
          >
            Alerte Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageAlert({ variant: 'warning', message: 'Attention : action requise' })}
          >
            Alerte Warning
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageAlert({ variant: 'error', message: 'Erreur critique détectée' })}
          >
            Alerte Error
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageAlert({ variant: 'success', message: 'Opération réussie !' })}
          >
            Alerte Success
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPageAlert(null)}>
            Masquer l&apos;alerte
          </Button>
        </div>
      </div>
      </>
    );
  }

  if (activeSection === 'alertes') {
    return (
      <>
        {sectionHeaderNode}
        <div className="space-y-6">
          <Text variant="muted">
            La zone d&apos;alerte permet d&apos;afficher des messages contextuels en haut du contenu,
            au-dessus de la toolbar. Utile pour les notifications de page, avertissements, etc.
          </Text>
        </div>
      </>
    );
  }

  if (activeSection === 'atoms') {
    return (
      <>
        {sectionHeaderNode}
        <div className="space-y-10">
        {/* Tokens — Radius & Spacing */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Tokens (radius & spacing)</Heading>
          <Text variant="muted" className="text-sm">
            Source de vérité pour boutons, cards, inputs. Utiliser rounded-sm, rounded-md, rounded-lg, p-4, gap-2, etc.
          </Text>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Text variant="small" className="block mb-2">Radius</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="w-12 h-12 rounded-sm bg-zinc-200 dark:bg-zinc-700" title="rounded-sm" />
                <div className="w-12 h-12 rounded-md bg-zinc-200 dark:bg-zinc-700" title="rounded-md" />
                <div className="w-12 h-12 rounded-lg bg-zinc-200 dark:bg-zinc-700" title="rounded-lg" />
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-700" title="rounded-xl" />
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-700" title="rounded-2xl" />
                <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700" title="rounded-full" />
              </div>
              <Text variant="muted" className="text-xs mt-2">sm (4px) · md (8px) · lg (12px) · xl (16px) · 2xl (24px) · full</Text>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Spacing</Text>
              <div className="flex flex-wrap gap-2">
                <span className="px-1 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-xs">gap-1</span>
                <span className="px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-xs">gap-2</span>
                <span className="px-3 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-xs">gap-3</span>
                <span className="px-4 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-xs">gap-4</span>
                <span className="px-6 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-xs">gap-6</span>
              </div>
              <Text variant="muted" className="text-xs mt-2">1 (4px) · 2 (8px) · 3 (12px) · 4 (16px) · 6 (24px)</Text>
            </div>
          </div>
        </CardContent></Card>

        {/* Avatar */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Avatar</Heading>
          <div className="flex items-center gap-4">
            <Avatar fallback="JD" size="xl" />
            <Avatar fallback="AB" size="lg" />
            <Avatar fallback="XY" size="md" />
            <Avatar fallback="U" size="sm" />
          </div>
        </CardContent></Card>

        {/* Badge */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Badge</Heading>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </CardContent></Card>

        {/* Tag */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Tag</Heading>
          <div className="flex flex-wrap gap-2">
            <Tag variant="default">Default</Tag>
            <Tag variant="secondary">Secondary</Tag>
            <Tag variant="info" showDot>Info</Tag>
            <Tag variant="success" showDot>Success</Tag>
            <Tag variant="warning" showDot>Warning</Tag>
            <Tag variant="destructive" showDot>Destructive</Tag>
          </div>
        </CardContent></Card>

        {/* Dot */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Dot</Heading>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Dot variant="success" />
              <span className="text-sm">success</span>
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="warning" />
              <span className="text-sm">warning</span>
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="error" />
              <span className="text-sm">error</span>
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="info" />
              <span className="text-sm">info</span>
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="neutral" />
              <span className="text-sm">neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <Dot variant="warning" animate />
              <span className="text-sm">animate</span>
            </div>
          </div>
        </CardContent></Card>

        {/* Typographie */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Typographie</Heading>
          <div className="space-y-2">
            <Heading level={1}>Heading 1</Heading>
            <Heading level={2}>Heading 2</Heading>
            <Heading level={3}>Heading 3</Heading>
            <Heading level={4}>Heading 4</Heading>
            <Heading level={5}>Heading 5</Heading>
            <Heading level={6}>Heading 6</Heading>
          </div>
          <Divider />
          <div className="space-y-2">
            <Text variant="lead">Texte lead — introduction ou accroche</Text>
            <Text variant="default">Texte par défaut avec leading-7 pour une bonne lisibilité.</Text>
            <Text variant="large">Texte large et semi-bold</Text>
            <Text variant="small">Texte small, compact</Text>
            <Text variant="muted">Texte muted pour informations secondaires</Text>
          </div>
        </CardContent></Card>

        {/* Formulaire complet */}
        <Card variant="outline"><CardContent className="p-6 space-y-6">
          <Heading level={4}>Formulaire</Heading>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="input-default" className="block mb-1.5">Input default</Label>
                <Input id="input-default" placeholder="Placeholder..." />
              </div>
              <div>
                <Label htmlFor="input-sm" className="block mb-1.5">Input sm</Label>
                <Input id="input-sm" size="sm" placeholder="Compact..." />
              </div>
              <div>
                <Label htmlFor="input-xs" className="block mb-1.5">Input xs (toolbar)</Label>
                <Input id="input-xs" size="xs" placeholder="Toolbar..." />
              </div>
              <div>
                <Label htmlFor="input-error" className="block mb-1.5">Input erreur</Label>
                <Input id="input-error" error="Champ requis" placeholder="Avec erreur" />
              </div>
              <div>
                <Label htmlFor="select-default" className="block mb-1.5">Select default</Label>
                <Select
                  id="select-default"
                  options={[
                    { value: '', label: 'Choisir...' },
                    { value: 'a', label: 'Option A' },
                    { value: 'b', label: 'Option B' },
                    { value: 'c', label: 'Option C' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="select-sm" className="block mb-1.5">Select sm</Label>
                <Select
                  id="select-sm"
                  size="sm"
                  options={[
                    { value: 'a', label: 'Option A' },
                    { value: 'b', label: 'Option B' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="select-xs" className="block mb-1.5">Select xs (toolbar)</Label>
                <Select
                  id="select-xs"
                  size="xs"
                  options={[
                    { value: 'a', label: 'Option A' },
                    { value: 'b', label: 'Option B' },
                  ]}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="textarea" className="block mb-1.5">Textarea</Label>
                <Textarea id="textarea" placeholder="Description..." rows={4} />
              </div>
              <div>
                <Label className="block mb-1.5">InlineEdit</Label>
                <div className="space-y-4">
                  <InlineEdit
                    value={atomsInlineEdit}
                    onChange={(e) => setAtomsInlineEdit(e.target.value)}
                    onBlur={() => toast.success('Sauvegardé')}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setAtomsInlineEdit('Texte éditable');
                    }}
                    placeholder="Cliquez pour éditer"
                    variant="title"
                  />
                  <InlineEdit
                    value={atomsInlineEdit}
                    onChange={(e) => setAtomsInlineEdit(e.target.value)}
                    placeholder="Variant default"
                    variant="default"
                    className="w-full min-w-0"
                  />
                  <InlineEdit
                    value={atomsInlineEditSm}
                    onChange={(e) => setAtomsInlineEditSm(e.target.value)}
                    placeholder="Variant sm"
                    variant="sm"
                    showEditIcon={false}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox id="cb1" checked={atomsCheckbox} onChange={(e) => setAtomsCheckbox(e.target.checked)} />
                  <Label htmlFor="cb1">Checkbox</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={atomsSwitch} onCheckedChange={setAtomsSwitch} />
                  <Label>Switch</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Radio</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Radio name="atoms-radio" id="r1" value="option-a" checked={atomsRadio === 'option-a'} onChange={() => setAtomsRadio('option-a')} />
                    <Label htmlFor="r1">Option A</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Radio name="atoms-radio" id="r2" value="option-b" checked={atomsRadio === 'option-b'} onChange={() => setAtomsRadio('option-b')} />
                    <Label htmlFor="r2">Option B</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label className="block mb-1.5">Slider : {atomsSlider}</Label>
                <Slider min={0} max={100} value={atomsSlider} onChange={(e) => setAtomsSlider(Number(e.target.value))} />
              </div>
            </div>
          </div>
        </CardContent></Card>

        {/* Boutons */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Boutons</Heading>
          <div className="space-y-4">
            <div>
              <Text variant="small" className="block mb-2">Button</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="primary" size="xs">Primary xs (toolbar)</Button>
                <Button variant="primary" size="sm">Primary sm</Button>
                <Button variant="primary" size="md">Primary md</Button>
                <Button variant="primary" size="lg">Primary lg</Button>
              </div>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Variantes</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="secondary" size="sm">Secondary</Button>
                <Button variant="outline" size="sm">Outline</Button>
                <Button variant="ghost" size="sm">Ghost</Button>
                <Button variant="destructive" size="sm">Destructive</Button>
              </div>
            </div>
            <div>
              <Text variant="small" className="block mb-2">IconButton</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <IconButton icon={<Pencil size={14} />} ariaLabel="Modifier" variant="outline" size="xs" />
                <IconButton icon={<Trash2 size={16} />} ariaLabel="Supprimer" variant="outline" size="sm" />
                <IconButton icon={<Star size={18} />} ariaLabel="Favoris" variant="outline" size="md" />
                <IconButton icon={<Star size={20} />} ariaLabel="Favoris" variant="outline" size="lg" />
              </div>
            </div>
            <div>
              <Text variant="small" className="block mb-2">États</Text>
              <div className="flex flex-wrap gap-2 items-center">
                <Button variant="outline" size="sm" disabled>Disabled</Button>
                <Button variant="primary" size="sm" loading>Chargement</Button>
              </div>
            </div>
          </div>
        </CardContent></Card>

        {/* Chips */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Chips</Heading>
          <div className="flex flex-wrap gap-2">
            <Chip label="Default" />
            <Chip label="Secondary" variant="secondary" />
            <Chip label="Outline" variant="outline" />
            <Chip label="Info" variant="info" />
            <Chip label="Success" variant="success" />
            <Chip label="Warning" variant="warning" />
            <Chip label="Destructive" variant="destructive" />
            <Chip label="Supprimable" onDelete={() => {}} />
          </div>
        </CardContent></Card>

        {/* Feedback & chargement */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Feedback</Heading>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <Label>Progress</Label>
              <Progress value={65} />
              <Progress value={100} indicatorClassName="bg-green-500" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent></Card>

        {/* Rating & liens */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Rating & Liens</Heading>
          <div className="flex flex-wrap items-center gap-8">
            <div>
              <Label className="block mb-2">Rating (interactif)</Label>
              <Rating value={atomsRating} onChange={setAtomsRating} />
            </div>
            <div>
              <Label className="block mb-2">Rating (lecture seule)</Label>
              <Rating value={4} readOnly />
            </div>
            <div className="flex flex-col gap-2">
              <CustomLink href="#">Lien default</CustomLink>
              <CustomLink href="#" variant="muted">Lien muted</CustomLink>
              <CustomLink href="#" variant="underline">Lien underline</CustomLink>
            </div>
          </div>
        </CardContent></Card>

        {/* Divider */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Divider</Heading>
          <Divider />
          <Divider text="ou" />
          <div className="flex items-center h-8">
            <span>Gauche</span>
            <Divider orientation="vertical" />
            <span>Droite</span>
          </div>
        </CardContent></Card>

        {/* Table */}
        <Card variant="outline"><CardContent className="p-6 space-y-4">
          <Heading level={4}>Table</Heading>
          <Text variant="muted" className="text-sm block mb-4">
            Composant Table atomique réutilisable. Utilisez Table, TableHeader, TableBody, TableRow, TableHead, TableCell pour composer vos tableaux.
          </Text>
          <div className="space-y-6">
            <div>
              <Text variant="small" className="block mb-2">Variant default (largeurs optimales par défaut, personnalisables)</Text>
              <Table>
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead align="right" sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Dupont</TableCell>
                    <TableCell>dupont@example.com</TableCell>
                    <TableCell align="right">Actif</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Martin</TableCell>
                    <TableCell>martin@example.com</TableCell>
                    <TableCell align="right">En attente</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bernard</TableCell>
                    <TableCell>bernard@example.com</TableCell>
                    <TableCell align="right">Inactif</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Variant bordered + actions au hover (1ère colonne)</Text>
              <Table variant="bordered">
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={120}>Colonne 1</TableHead>
                    <TableHead align="center" sortable minWidth={80} defaultWidth={180}>Colonne 2</TableHead>
                    <TableHead align="right" sortable minWidth={60} defaultWidth={100}>Colonne 3</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    clickable
                    rowActions={[
                      { icon: <Pencil size={14} />, onClick: () => toast.info('Éditer Ligne 1'), label: 'Éditer' },
                      { icon: <Trash2 size={14} />, onClick: () => toast.error('Supprimer Ligne 1'), label: 'Supprimer' },
                    ]}
                  >
                    <TableCell>Ligne 1</TableCell>
                    <TableCell align="center">Centre</TableCell>
                    <TableCell align="right">Droite</TableCell>
                  </TableRow>
                  <TableRow
                    clickable
                    rowActions={[
                      { icon: <Pencil size={14} />, onClick: () => toast.info('Éditer Ligne 2'), label: 'Éditer' },
                      { icon: <Trash2 size={14} />, onClick: () => toast.error('Supprimer Ligne 2'), label: 'Supprimer' },
                    ]}
                  >
                    <TableCell>Ligne 2</TableCell>
                    <TableCell align="center">Centre</TableCell>
                    <TableCell align="right">Droite</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Lignes dépliables (chevron = contenu sous la ligne)</Text>
              <Table variant="bordered" expandable>
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    expandContent={
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        <p><strong>Détails :</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                      </div>
                    }
                  >
                    <TableCell>Dupont</TableCell>
                    <TableCell>dupont@example.com</TableCell>
                    <TableCell align="right">Actif</TableCell>
                  </TableRow>
                  <TableRow
                    expandContent={
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        <p>Contenu déplié pour Martin.</p>
                      </div>
                    }
                  >
                    <TableCell>Martin</TableCell>
                    <TableCell>martin@example.com</TableCell>
                    <TableCell align="right">En attente</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Bernard</TableCell>
                    <TableCell>bernard@example.com</TableCell>
                    <TableCell align="right">Inactif</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Cellules éditables (hover = bordure, clic = InlineEdit)</Text>
              <Table variant="bordered">
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell
                      editable
                      value={atomsTableNom}
                      onChange={(e) => setAtomsTableNom(e.target.value)}
                      onBlur={() => toast.success('Nom sauvegardé')}
                    />
                    <TableCell
                      editable
                      value={atomsTableEmail}
                      onChange={(e) => setAtomsTableEmail(e.target.value)}
                      onBlur={() => toast.success('Email sauvegardé')}
                    />
                    <TableCell
                      select
                      selectOptions={[
                        { value: 'actif', label: 'Actif' },
                        { value: 'attente', label: 'En attente' },
                        { value: 'inactif', label: 'Inactif' },
                      ]}
                      selectValue={atomsTableStatut}
                      onSelectChange={(e) => {
                        setAtomsTableStatut(e.target.value);
                        toast.success('Statut mis à jour');
                      }}
                    />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div>
              <Text variant="small" className="block mb-2">Ligne d&apos;ajout (placeholder &quot;+ Ajouter une ligne&quot;, validation blur/Enter)</Text>
              <Table variant="bordered" addable onAddRow={(values) => {
                setAtomsAddableRows((prev) => [
                  ...prev,
                  { nom: values[0] ?? '', email: values[1] ?? '', statut: values[2] ?? '' },
                ]);
                toast.success('Ligne ajoutée');
              }}>
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atomsAddableRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.nom}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell align="right">{r.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent></Card>
      </div>
      </>
    );
  }

  if (activeSection === 'molecules') {
    return (
      <>
        {sectionHeaderNode}
        <MoleculesContent />
      </>
    );
  }

  if (activeSection === 'organisms') {
    return (
      <>
        {sectionHeaderNode}
        <OrganismsContent />
      </>
    );
  }

  if (activeSection === 'reference') {
    return (
      <>
        {sectionHeaderNode}
        <div className="space-y-8">
        <Heading level={3}>Hiérarchie des layouts</Heading>
        <Text>
          <strong>1. BackendLayout</strong> (app/dashboard/layout.tsx) — Header fixe, Sidebar nav principale, Toolbar globale (masquée sur pages detail).
        </Text>
        <Text>
          <strong>2. PageLayout</strong> (TestLayout, FinanceLayout, etc.) — PageSidebar + PageContentLayout.
        </Text>
        <Text>
          <strong>3. Éléments flottants</strong> — CommentsChatPanel, Modal (optionnels).
        </Text>

        <Heading level={3}>Composants par slot</Heading>
        <div className="space-y-4 text-sm">
          <div>
            <Heading level={5}>PageSidebar</Heading>
            <Text variant="muted">
              backLink, entitySelector, sections, activeSectionId, onSectionChange, basePath, children (SidebarCard).
            </Text>
          </div>
          <div>
            <Heading level={5}>PageContentLayout</Heading>
            <Text variant="muted">
              alert (PageAlert), toolbar, sectionHeader (SectionHeader), maxWidth, children.
            </Text>
          </div>
          <div>
            <Heading level={5}>PageToolbar / ToolbarFilterDropdown</Heading>
            <Text variant="muted">
              filters (ToolbarFilterDropdown, Select), actions (Button via PageToolbarActions).
            </Text>
          </div>
          <div>
            <Heading level={5}>PageAlert</Heading>
            <Text variant="muted">
              variant: info | warning | error | success, message, onDismiss.
            </Text>
          </div>
          <div>
            <Heading level={5}>SectionHeader</Heading>
            <Text variant="muted">
              title, icon?, subtitle?, actions?, metadata?, tags?, gridColumns?.
            </Text>
          </div>
          <div>
            <Heading level={5}>SectionNavLink</Heading>
            <Text variant="muted">
              href ou onClick, icon, label, active.
            </Text>
          </div>
          <div>
            <Heading level={5}>BackLink</Heading>
            <Text variant="muted">
              href, label.
            </Text>
          </div>
          <div>
            <Heading level={5}>EntitySelectorDropdown</Heading>
            <Text variant="muted">
              value, options, onSelect, renderOption?, renderValue?, placeholder.
            </Text>
          </div>
          <div>
            <Heading level={5}>SidebarCard</Heading>
            <Text variant="muted">
              icon, title, subtitle?, href?, onClick?.
            </Text>
          </div>
        </div>

        <Heading level={3}>Schéma de structure</Heading>
        <pre className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg text-xs overflow-x-auto">
{`BackendLayout
├── Header (52px)
├── Sidebar (200px/52px)
└── Content
    └── PageLayout (flex)
        ├── PageSidebar (256px)
        │   ├── BackLink
        │   ├── EntitySelectorDropdown
        │   ├── SectionNavLink[]
        │   └── SidebarCard[] (children)
        └── PageContentLayout
            ├── PageAlert (sticky)
            ├── PageToolbar (sticky)
            │   ├── filters: ToolbarFilterDropdown, Select
            │   └── actions: Button[] (dernier = primary)
            ├── SectionHeader
            └── children`}
        </pre>
      </div>
      </>
    );
  }

  return null;
}
