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
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardMedia,
  BackLink,
  SectionNavLink,
  Breadcrumb,
  EntitySelectorDropdown,
  SidebarCard,
  SectionHeader,
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
  EtatPicker,
} from '@/components/ui/molecules';
import { EventCard } from '@/components/feature/Backend/Events/EventCard';
import { DrivePickerModal } from '@/components/feature/Backend/Events/DrivePickerModal';
import type { Event } from '@/types/event';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, Wallet, TrendingUp, Layers2, Pencil, Trash2 } from 'lucide-react';

// ── Molecules Content ───────────────────────────────────────────────────────

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
  const [moleculesDrivePickerOpen, setMoleculesDrivePickerOpen] = useState(false);
  const [moleculesEtatStatus, setMoleculesEtatStatus] = useState('prochainement');
  const [moleculesEtatTaskType, setMoleculesEtatTaskType] = useState<'tache' | 'jalon'>('tache');

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
          <div>
            <Text variant="small" className="block mb-2">DrivePicker</Text>
            <Button variant="outline" size="sm" onClick={() => setMoleculesDrivePickerOpen(true)}>
              Ouvrir le DrivePicker
            </Button>
            <DrivePickerModal
              isOpen={moleculesDrivePickerOpen}
              onClose={() => setMoleculesDrivePickerOpen(false)}
              onSelect={(url, name) => {
                toast.success(`Fichier sélectionné : ${name || url}`);
                setMoleculesDrivePickerOpen(false);
              }}
              orgId="demo-org-id"
              mode="document"
            />
          </div>
          <div>
            <Text variant="small" className="block mb-2">EtatPicker</Text>
            <div className="flex items-center gap-4">
              <EtatPicker
                statusId={moleculesEtatStatus}
                taskType={moleculesEtatTaskType}
                onStatusChange={setMoleculesEtatStatus}
                onTaskTypeChange={setMoleculesEtatTaskType}
              />
              <Text variant="muted" className="text-xs">
                Statut: <strong>{moleculesEtatStatus}</strong> | Type: <strong>{moleculesEtatTaskType}</strong>
              </Text>
            </div>
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

// ── Molecules Page ───────────────────────────────────────────────────────────

export default function MoleculesPage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<Layers2 size={28} />}
          title="Molecules"
          subtitle="Tous les composants molecules du design system avec leurs variantes, en mise en situation."
        />
      </div>
      <MoleculesContent />
    </>
  );
}
