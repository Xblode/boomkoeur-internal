'use client';

import React, { useEffect, useState } from 'react';
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
  TableAddSubTaskRow,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/atoms';
import { Card, CardContent, SectionHeader, EtatPicker } from '@/components/ui/molecules';
import { DOCS_SECTIONS } from '../../DocsLayoutConfig';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { CircleDot, Pencil, Trash2, Tags, MoreVertical, Star, Plus } from 'lucide-react';
import { toast } from 'sonner';

type SubTaskItem = {
  id: string;
  nom: string;
  email: string;
  statut: string;
  subTasks?: SubTaskItem[];
};

type AllOptionsSubTaskItem = {
  id: number;
  nom: string;
  email: string;
  statut: string;
  subTasks?: AllOptionsSubTaskItem[];
};

const ATOMS_SUBTITLE = DOCS_SECTIONS.find((s) => s.id === 'atoms')?.subtitle;

export default function AtomsPage() {
  const { setToolbar } = useToolbar();

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
  const [atomsSelectedRows, setAtomsSelectedRows] = useState<Set<number>>(new Set());
  const [atomsAllOptionsRows, setAtomsAllOptionsRows] = useState<
    { id: number; nom: string; email: string; statut: string }[]
  >([
    { id: 0, nom: 'Dupont', email: 'dupont@example.com', statut: 'Actif' },
    { id: 1, nom: 'Martin', email: 'martin@example.com', statut: 'En attente' },
    { id: 2, nom: 'Bernard', email: 'bernard@example.com', statut: 'Inactif' },
  ]);
  const [atomsAllOptionsSelected, setAtomsAllOptionsSelected] = useState<Set<number>>(new Set());
  const [atomsAllOptionsEditable, setAtomsAllOptionsEditable] = useState({
    nom: 'Dupont',
    email: 'dupont@example.com',
    statut: 'Actif',
  });
  const [atomsAllOptionsTagsOpen, setAtomsAllOptionsTagsOpen] = useState<Set<number>>(new Set());
  const [atomsAllOptionsRowTags, setAtomsAllOptionsRowTags] = useState<Record<number, string[]>>({});
  const [atomsStatusPickerState, setAtomsStatusPickerState] = useState<Record<string, { status: string; taskType: 'tache' | 'jalon' }>>({
    dupont: { status: 'prochainement', taskType: 'tache' },
    martin: { status: 'en_cours', taskType: 'tache' },
    bernard: { status: 'termine', taskType: 'tache' },
  });
  const [atomsAllOptionsStatusState, setAtomsAllOptionsStatusState] = useState<Record<number, { status: string; taskType: 'tache' | 'jalon' }>>({
    0: { status: 'prochainement', taskType: 'tache' },
    1: { status: 'en_cours', taskType: 'tache' },
    2: { status: 'termine', taskType: 'tache' },
  });
  const [atomsStatusPickerExpandedIds, setAtomsStatusPickerExpandedIds] = useState<Set<string>>(new Set());
  const [atomsStatusPickerAddingTo, setAtomsStatusPickerAddingTo] = useState<{
    parentKey: string;
    parentSubTaskId: string | null;
  } | null>(null);
  const [atomsStatusPickerSubTaskStatusState, setAtomsStatusPickerSubTaskStatusState] = useState<
    Record<string, { status: string; taskType: 'tache' | 'jalon' }>
  >({});
  const [atomsStatusPickerSubTasks, setAtomsStatusPickerSubTasks] = useState<
    Record<string, SubTaskItem[]>
  >({
    dupont: [
      {
        id: 'st1',
        nom: 'Sous-tâche Dupont',
        email: 'st@example.com',
        statut: 'En cours',
        subTasks: [{ id: 'st1-1', nom: 'Sous-sous-tâche', email: 'ss@example.com', statut: 'À faire' }],
      },
    ],
    martin: [],
    bernard: [],
  });
  const [atomsAllOptionsSubTasks, setAtomsAllOptionsSubTasks] = useState<
    Record<number, AllOptionsSubTaskItem[]>
  >({
    1: [
      {
        id: -1,
        nom: 'Sous-tâche Martin',
        email: 'st@example.com',
        statut: 'En cours',
        subTasks: [{ id: -2, nom: 'Sous-sous-tâche', email: 'ss@example.com', statut: 'À faire' }],
      },
    ],
  });
  const [atomsAllOptionsAddingTo, setAtomsAllOptionsAddingTo] = useState<{
    parentId: number;
    parentSubTaskId: number | null;
  } | null>(null);
  const [atomsAllOptionsExpandedIds, setAtomsAllOptionsExpandedIds] = useState<Set<string>>(new Set());
  const [atomsAllOptionsSubTasksSelected, setAtomsAllOptionsSubTasksSelected] = useState<Set<string>>(new Set());
  const [atomsAllOptionsSubTaskStatusState, setAtomsAllOptionsSubTaskStatusState] = useState<
    Record<string, { status: string; taskType: 'tache' | 'jalon' }>
  >({});

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<CircleDot size={28} />}
          title="Atoms"
          subtitle={ATOMS_SUBTITLE}
        />
      </div>
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
              <Text variant="small" className="block mb-2">Sélecteur d&apos;état (cercle dashed dans la 1ère colonne)</Text>
              <Table variant="bordered" statusColumn expandable>
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    statusContent={
                      <EtatPicker
                        statusId={atomsStatusPickerState.dupont?.status ?? 'prochainement'}
                        taskType={atomsStatusPickerState.dupont?.taskType ?? 'tache'}
                        onStatusChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, dupont: { ...(s.dupont ?? { status: 'prochainement', taskType: 'tache' }), status: v } }))}
                        onTaskTypeChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, dupont: { ...(s.dupont ?? { status: 'prochainement', taskType: 'tache' }), taskType: v } }))}
                      />
                    }
                    expanded={atomsStatusPickerExpandedIds.has('dupont')}
                    onExpandToggle={() =>
                      setAtomsStatusPickerExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has('dupont')) next.delete('dupont');
                        else next.add('dupont');
                        return next;
                      })
                    }
                    subTaskRows={(() => {
                      const addSubTask = (
                        parentKey: string,
                        parentSubTaskId: string | null,
                        vals: string[]
                      ) => {
                        const newItem: SubTaskItem = {
                          id: `${parentKey}-${Date.now()}`,
                          nom: vals[0] ?? '',
                          email: vals[1] ?? '',
                          statut: vals[2] ?? '',
                        };
                        const addToSubTask = (tasks: SubTaskItem[]): SubTaskItem[] =>
                          tasks.map((t) =>
                            t.id === parentSubTaskId
                              ? { ...t, subTasks: [...(t.subTasks ?? []), newItem] }
                              : { ...t, subTasks: t.subTasks ? addToSubTask(t.subTasks) : undefined }
                          );
                        setAtomsStatusPickerSubTasks((prev) => ({
                          ...prev,
                          [parentKey]: parentSubTaskId
                            ? addToSubTask(prev[parentKey] ?? [])
                            : [...(prev[parentKey] ?? []), newItem],
                        }));
                        toast.success('Sous-tâche ajoutée');
                      };
                      const renderSubTasks = (
                        tasks: SubTaskItem[],
                        depth: number,
                        pKey: string,
                        pSubId: string | null,
                        pathPrefix: string
                      ) => (
                        <>
                          {tasks.map((st) => {
                            const stPath = `${pathPrefix}-${st.id}`;
                            const isAddingHere =
                              atomsStatusPickerAddingTo?.parentKey === pKey &&
                              atomsStatusPickerAddingTo?.parentSubTaskId === st.id;
                            return (
                              <TableRow
                                key={st.id}
                                statusContent={
                                  <EtatPicker
                                    statusId={atomsStatusPickerSubTaskStatusState[stPath]?.status ?? 'prochainement'}
                                    taskType={atomsStatusPickerSubTaskStatusState[stPath]?.taskType ?? 'tache'}
                                    onStatusChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), status: v },
                                      }))
                                    }
                                    onTaskTypeChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), taskType: v },
                                      }))
                                    }
                                  />
                                }
                                expanded={atomsStatusPickerExpandedIds.has(stPath)}
                                onExpandToggle={() =>
                                  setAtomsStatusPickerExpandedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(stPath)) next.delete(stPath);
                                    else next.add(stPath);
                                    return next;
                                  })
                                }
                                subTaskRows={
                                  <>
                                    {st.subTasks?.length
                                      ? renderSubTasks(st.subTasks, depth + 1, pKey, st.id, stPath)
                                      : null}
                                    {isAddingHere && (
                                      <TableAddSubTaskRow
                                        onValidate={(vals) => addSubTask(pKey, st.id, vals)}
                                        onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                        indentLevel={depth + 1}
                                      />
                                    )}
                                  </>
                                }
                                hasSubTasks={(st.subTasks?.length ?? 0) > 0}
                                onAddSubTask={() => {
                                  setAtomsStatusPickerAddingTo({ parentKey: pKey, parentSubTaskId: st.id });
                                  setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add(stPath));
                                }}
                              >
                                <TableCell indentLevel={depth} noHoverBorder>
                                  {st.nom}
                                </TableCell>
                                <TableCell>{st.email}</TableCell>
                                <TableCell align="right">{st.statut}</TableCell>
                              </TableRow>
                            );
                          })}
                          {atomsStatusPickerAddingTo?.parentKey === pKey &&
                            atomsStatusPickerAddingTo?.parentSubTaskId === pSubId && (
                              <TableAddSubTaskRow
                                onValidate={(vals) => addSubTask(pKey, pSubId, vals)}
                                onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                indentLevel={depth}
                              />
                            )}
                        </>
                      );
                      return renderSubTasks(
                        atomsStatusPickerSubTasks.dupont ?? [],
                        1,
                        'dupont',
                        null,
                        'dupont'
                      );
                    })()}
                    hasSubTasks={(atomsStatusPickerSubTasks.dupont ?? []).length > 0}
                    onAddSubTask={() => {
                      setAtomsStatusPickerAddingTo({ parentKey: 'dupont', parentSubTaskId: null });
                      setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add('dupont'));
                    }}
                  >
                    <TableCell noHoverBorder>Dupont</TableCell>
                    <TableCell>dupont@example.com</TableCell>
                    <TableCell align="right">Actif</TableCell>
                  </TableRow>
                  <TableRow
                    statusContent={
                      <EtatPicker
                        statusId={atomsStatusPickerState.martin?.status ?? 'prochainement'}
                        taskType={atomsStatusPickerState.martin?.taskType ?? 'tache'}
                        onStatusChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, martin: { ...(s.martin ?? { status: 'prochainement', taskType: 'tache' }), status: v } }))}
                        onTaskTypeChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, martin: { ...(s.martin ?? { status: 'prochainement', taskType: 'tache' }), taskType: v } }))}
                      />
                    }
                    expanded={atomsStatusPickerExpandedIds.has('martin')}
                    onExpandToggle={() =>
                      setAtomsStatusPickerExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has('martin')) next.delete('martin');
                        else next.add('martin');
                        return next;
                      })
                    }
                    subTaskRows={(() => {
                      const addSubTask = (
                        parentKey: string,
                        parentSubTaskId: string | null,
                        vals: string[]
                      ) => {
                        const newItem: SubTaskItem = {
                          id: `${parentKey}-${Date.now()}`,
                          nom: vals[0] ?? '',
                          email: vals[1] ?? '',
                          statut: vals[2] ?? '',
                        };
                        const addToSubTask = (tasks: SubTaskItem[]): SubTaskItem[] =>
                          tasks.map((t) =>
                            t.id === parentSubTaskId
                              ? { ...t, subTasks: [...(t.subTasks ?? []), newItem] }
                              : { ...t, subTasks: t.subTasks ? addToSubTask(t.subTasks) : undefined }
                          );
                        setAtomsStatusPickerSubTasks((prev) => ({
                          ...prev,
                          [parentKey]: parentSubTaskId
                            ? addToSubTask(prev[parentKey] ?? [])
                            : [...(prev[parentKey] ?? []), newItem],
                        }));
                        toast.success('Sous-tâche ajoutée');
                      };
                      const renderSubTasks = (
                        tasks: SubTaskItem[],
                        depth: number,
                        pKey: string,
                        pSubId: string | null,
                        pathPrefix: string
                      ) => (
                        <>
                          {tasks.map((st) => {
                            const stPath = `${pathPrefix}-${st.id}`;
                            const isAddingHere =
                              atomsStatusPickerAddingTo?.parentKey === pKey &&
                              atomsStatusPickerAddingTo?.parentSubTaskId === st.id;
                            return (
                              <TableRow
                                key={st.id}
                                statusContent={
                                  <EtatPicker
                                    statusId={atomsStatusPickerSubTaskStatusState[stPath]?.status ?? 'prochainement'}
                                    taskType={atomsStatusPickerSubTaskStatusState[stPath]?.taskType ?? 'tache'}
                                    onStatusChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), status: v },
                                      }))
                                    }
                                    onTaskTypeChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), taskType: v },
                                      }))
                                    }
                                  />
                                }
                                expanded={atomsStatusPickerExpandedIds.has(stPath)}
                                onExpandToggle={() =>
                                  setAtomsStatusPickerExpandedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(stPath)) next.delete(stPath);
                                    else next.add(stPath);
                                    return next;
                                  })
                                }
                                subTaskRows={
                                  <>
                                    {st.subTasks?.length
                                      ? renderSubTasks(st.subTasks, depth + 1, pKey, st.id, stPath)
                                      : null}
                                    {isAddingHere && (
                                      <TableAddSubTaskRow
                                        onValidate={(vals) => addSubTask(pKey, st.id, vals)}
                                        onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                        indentLevel={depth + 1}
                                      />
                                    )}
                                  </>
                                }
                                hasSubTasks={(st.subTasks?.length ?? 0) > 0}
                                onAddSubTask={() => {
                                  setAtomsStatusPickerAddingTo({ parentKey: pKey, parentSubTaskId: st.id });
                                  setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add(stPath));
                                }}
                              >
                                <TableCell indentLevel={depth} noHoverBorder>
                                  {st.nom}
                                </TableCell>
                                <TableCell>{st.email}</TableCell>
                                <TableCell align="right">{st.statut}</TableCell>
                              </TableRow>
                            );
                          })}
                          {atomsStatusPickerAddingTo?.parentKey === pKey &&
                            atomsStatusPickerAddingTo?.parentSubTaskId === pSubId && (
                              <TableAddSubTaskRow
                                onValidate={(vals) => addSubTask(pKey, pSubId, vals)}
                                onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                indentLevel={depth}
                              />
                            )}
                        </>
                      );
                      return renderSubTasks(
                        atomsStatusPickerSubTasks.martin ?? [],
                        1,
                        'martin',
                        null,
                        'martin'
                      );
                    })()}
                    hasSubTasks={(atomsStatusPickerSubTasks.martin ?? []).length > 0}
                    onAddSubTask={() => {
                      setAtomsStatusPickerAddingTo({ parentKey: 'martin', parentSubTaskId: null });
                      setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add('martin'));
                    }}
                  >
                    <TableCell noHoverBorder>Martin</TableCell>
                    <TableCell>martin@example.com</TableCell>
                    <TableCell align="right">En attente</TableCell>
                  </TableRow>
                  <TableRow
                    statusContent={
                      <EtatPicker
                        statusId={atomsStatusPickerState.bernard?.status ?? 'prochainement'}
                        taskType={atomsStatusPickerState.bernard?.taskType ?? 'tache'}
                        onStatusChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, bernard: { ...(s.bernard ?? { status: 'prochainement', taskType: 'tache' }), status: v } }))}
                        onTaskTypeChange={(v) => setAtomsStatusPickerState((s) => ({ ...s, bernard: { ...(s.bernard ?? { status: 'prochainement', taskType: 'tache' }), taskType: v } }))}
                      />
                    }
                    expanded={atomsStatusPickerExpandedIds.has('bernard')}
                    onExpandToggle={() =>
                      setAtomsStatusPickerExpandedIds((prev) => {
                        const next = new Set(prev);
                        if (next.has('bernard')) next.delete('bernard');
                        else next.add('bernard');
                        return next;
                      })
                    }
                    subTaskRows={(() => {
                      const addSubTask = (
                        parentKey: string,
                        parentSubTaskId: string | null,
                        vals: string[]
                      ) => {
                        const newItem: SubTaskItem = {
                          id: `${parentKey}-${Date.now()}`,
                          nom: vals[0] ?? '',
                          email: vals[1] ?? '',
                          statut: vals[2] ?? '',
                        };
                        const addToSubTask = (tasks: SubTaskItem[]): SubTaskItem[] =>
                          tasks.map((t) =>
                            t.id === parentSubTaskId
                              ? { ...t, subTasks: [...(t.subTasks ?? []), newItem] }
                              : { ...t, subTasks: t.subTasks ? addToSubTask(t.subTasks) : undefined }
                          );
                        setAtomsStatusPickerSubTasks((prev) => ({
                          ...prev,
                          [parentKey]: parentSubTaskId
                            ? addToSubTask(prev[parentKey] ?? [])
                            : [...(prev[parentKey] ?? []), newItem],
                        }));
                        toast.success('Sous-tâche ajoutée');
                      };
                      const renderSubTasks = (
                        tasks: SubTaskItem[],
                        depth: number,
                        pKey: string,
                        pSubId: string | null,
                        pathPrefix: string
                      ) => (
                        <>
                          {tasks.map((st) => {
                            const stPath = `${pathPrefix}-${st.id}`;
                            const isAddingHere =
                              atomsStatusPickerAddingTo?.parentKey === pKey &&
                              atomsStatusPickerAddingTo?.parentSubTaskId === st.id;
                            return (
                              <TableRow
                                key={st.id}
                                statusContent={
                                  <EtatPicker
                                    statusId={atomsStatusPickerSubTaskStatusState[stPath]?.status ?? 'prochainement'}
                                    taskType={atomsStatusPickerSubTaskStatusState[stPath]?.taskType ?? 'tache'}
                                    onStatusChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), status: v },
                                      }))
                                    }
                                    onTaskTypeChange={(v) =>
                                      setAtomsStatusPickerSubTaskStatusState((s) => ({
                                        ...s,
                                        [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), taskType: v },
                                      }))
                                    }
                                  />
                                }
                                expanded={atomsStatusPickerExpandedIds.has(stPath)}
                                onExpandToggle={() =>
                                  setAtomsStatusPickerExpandedIds((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(stPath)) next.delete(stPath);
                                    else next.add(stPath);
                                    return next;
                                  })
                                }
                                subTaskRows={
                                  <>
                                    {st.subTasks?.length
                                      ? renderSubTasks(st.subTasks, depth + 1, pKey, st.id, stPath)
                                      : null}
                                    {isAddingHere && (
                                      <TableAddSubTaskRow
                                        onValidate={(vals) => addSubTask(pKey, st.id, vals)}
                                        onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                        indentLevel={depth + 1}
                                      />
                                    )}
                                  </>
                                }
                                hasSubTasks={(st.subTasks?.length ?? 0) > 0}
                                onAddSubTask={() => {
                                  setAtomsStatusPickerAddingTo({ parentKey: pKey, parentSubTaskId: st.id });
                                  setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add(stPath));
                                }}
                              >
                                <TableCell indentLevel={depth} noHoverBorder>
                                  {st.nom}
                                </TableCell>
                                <TableCell>{st.email}</TableCell>
                                <TableCell align="right">{st.statut}</TableCell>
                              </TableRow>
                            );
                          })}
                          {atomsStatusPickerAddingTo?.parentKey === pKey &&
                            atomsStatusPickerAddingTo?.parentSubTaskId === pSubId && (
                              <TableAddSubTaskRow
                                onValidate={(vals) => addSubTask(pKey, pSubId, vals)}
                                onCancel={() => setAtomsStatusPickerAddingTo(null)}
                                indentLevel={depth}
                              />
                            )}
                        </>
                      );
                      return renderSubTasks(
                        atomsStatusPickerSubTasks.bernard ?? [],
                        1,
                        'bernard',
                        null,
                        'bernard'
                      );
                    })()}
                    hasSubTasks={(atomsStatusPickerSubTasks.bernard ?? []).length > 0}
                    onAddSubTask={() => {
                      setAtomsStatusPickerAddingTo({ parentKey: 'bernard', parentSubTaskId: null });
                      setAtomsStatusPickerExpandedIds((prev) => new Set(prev).add('bernard'));
                    }}
                  >
                    <TableCell noHoverBorder>Bernard</TableCell>
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
            <div>
              <Text variant="small" className="block mb-2">Colonne sélection (grip + checkbox, visible au hover)</Text>
              <Table
                variant="bordered"
                selectionColumn
                selectAllChecked={atomsSelectedRows.size === 3}
                onSelectAllChange={(checked) =>
                  setAtomsSelectedRows(checked ? new Set([0, 1, 2]) : new Set())
                }
              >
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>Email</TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    selected={atomsSelectedRows.has(0)}
                    onSelectChange={(checked) => setAtomsSelectedRows((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(0); else next.delete(0);
                      return next;
                    })}
                  >
                    <TableCell>Dupont</TableCell>
                    <TableCell>dupont@example.com</TableCell>
                    <TableCell align="right">Actif</TableCell>
                  </TableRow>
                  <TableRow
                    selected={atomsSelectedRows.has(1)}
                    onSelectChange={(checked) => setAtomsSelectedRows((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(1); else next.delete(1);
                      return next;
                    })}
                  >
                    <TableCell>Martin</TableCell>
                    <TableCell>martin@example.com</TableCell>
                    <TableCell align="right">En attente</TableCell>
                  </TableRow>
                  <TableRow
                    selected={atomsSelectedRows.has(2)}
                    onSelectChange={(checked) => setAtomsSelectedRows((prev) => {
                      const next = new Set(prev);
                      if (checked) next.add(2); else next.delete(2);
                      return next;
                    })}
                  >
                    <TableCell>Bernard</TableCell>
                    <TableCell>bernard@example.com</TableCell>
                    <TableCell align="right">Inactif</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {atomsSelectedRows.size > 0 && (
                <Text variant="muted" className="text-xs mt-2">
                  {atomsSelectedRows.size} ligne(s) sélectionnée(s)
                </Text>
              )}
            </div>
            <div>
              <Text variant="small" className="block mb-2">
                Toutes les options combinées (sélection, status, expandable, addable, rowActions, editable, select)
              </Text>
              <Table
                selectionColumn
                statusColumn
                expandable
                addable
                selectAllChecked={(() => {
                  const allSubPaths = (() => {
                    const paths: string[] = [];
                    const collect = (arr: AllOptionsSubTaskItem[], prefix: string) => {
                      arr.forEach((st) => {
                        const p = `${prefix}-${st.id}`;
                        paths.push(p);
                        if (st.subTasks?.length) collect(st.subTasks, p);
                      });
                    };
                    atomsAllOptionsRows.forEach((r) => {
                      const tasks = atomsAllOptionsSubTasks[r.id] ?? [];
                      collect(tasks, String(r.id));
                    });
                    return paths;
                  })();
                  const totalCount = atomsAllOptionsRows.length + allSubPaths.length;
                  const selectedCount =
                    atomsAllOptionsSelected.size + atomsAllOptionsSubTasksSelected.size;
                  return totalCount > 0 && selectedCount === totalCount;
                })()}
                onSelectAllChange={(checked) => {
                  if (checked) {
                    setAtomsAllOptionsSelected(new Set(atomsAllOptionsRows.map((r) => r.id)));
                    const subPaths: string[] = [];
                    const collect = (arr: AllOptionsSubTaskItem[], prefix: string) => {
                      arr.forEach((st) => {
                        const p = `${prefix}-${st.id}`;
                        subPaths.push(p);
                        if (st.subTasks?.length) collect(st.subTasks, p);
                      });
                    };
                    atomsAllOptionsRows.forEach((r) => {
                      collect(atomsAllOptionsSubTasks[r.id] ?? [], String(r.id));
                    });
                    setAtomsAllOptionsSubTasksSelected(new Set(subPaths));
                    setAtomsAllOptionsExpandedIds((prev) => {
                      const next = new Set(prev);
                      atomsAllOptionsRows.forEach((r) => next.add(String(r.id)));
                      subPaths.forEach((p) => next.add(p));
                      return next;
                    });
                  } else {
                    setAtomsAllOptionsSelected(new Set());
                    setAtomsAllOptionsSubTasksSelected(new Set());
                    setAtomsAllOptionsExpandedIds(new Set());
                  }
                }}
                onAddRow={(values) => {
                  const nextId =
                    atomsAllOptionsRows.length > 0
                      ? Math.max(...atomsAllOptionsRows.map((r) => r.id)) + 1
                      : 0;
                  setAtomsAllOptionsRows((prev) => [
                    ...prev,
                    {
                      id: nextId,
                      nom: values[0] ?? '',
                      email: values[1] ?? '',
                      statut: values[2] ?? '',
                    },
                  ]);
                  setAtomsAllOptionsStatusState((prev) => ({
                    ...prev,
                    [nextId]: { status: 'prochainement', taskType: 'tache' },
                  }));
                  toast.success('Ligne ajoutée');
                }}
              >
                <TableHeader>
                  <TableRow hoverCellOnly>
                    <TableHead sortable minWidth={300} defaultWidth={300}>
                      Nom
                    </TableHead>
                    <TableHead sortable minWidth={100} defaultWidth={220}>
                      Email
                    </TableHead>
                    <TableHead sortable minWidth={60} defaultWidth={100}>
                      Statut
                    </TableHead>
                    <TableHead align="center" minWidth={48} defaultWidth={48} maxWidth={48}>
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-600">
                        <Plus size={14} />
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atomsAllOptionsRows.map((r, i) => {
                    const isFirst = i === 0;
                    const isSecondEditable = i === 1;
                    const isEditable = isFirst || isSecondEditable;
                    return (
                      <TableRow
                        key={r.id}
                        selected={atomsAllOptionsSelected.has(r.id)}
                        onSelectChange={(checked) =>
                          setAtomsAllOptionsSelected((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(r.id);
                            else next.delete(r.id);
                            return next;
                          })
                        }
                        clickable
                        expanded={atomsAllOptionsExpandedIds.has(String(r.id))}
                        onExpandToggle={() =>
                          setAtomsAllOptionsExpandedIds((prev) => {
                            const next = new Set(prev);
                            const key = String(r.id);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          })
                        }
                        subTaskRows={(() => {
                          const addSubTask = (
                            parentId: number,
                            parentSubTaskId: number | null,
                            vals: string[]
                          ) => {
                            const newItem: AllOptionsSubTaskItem = {
                              id: Date.now(),
                              nom: vals[0] ?? '',
                              email: vals[1] ?? '',
                              statut: vals[2] ?? '',
                            };
                            const addToSubTask = (tasks: AllOptionsSubTaskItem[]): AllOptionsSubTaskItem[] =>
                              tasks.map((t) =>
                                t.id === parentSubTaskId
                                  ? { ...t, subTasks: [...(t.subTasks ?? []), newItem] }
                                  : { ...t, subTasks: t.subTasks ? addToSubTask(t.subTasks) : undefined }
                              );
                            setAtomsAllOptionsSubTasks((prev) => ({
                              ...prev,
                              [parentId]: parentSubTaskId
                                ? addToSubTask(prev[parentId] ?? [])
                                : [...(prev[parentId] ?? []), newItem],
                            }));
                            toast.success('Sous-tâche ajoutée');
                          };
                          const removeSubTask = (
                            parentId: number,
                            parentSubTaskId: number | null,
                            subTaskId: number,
                            subTaskPath: string
                          ) => {
                            const removeFrom = (arr: AllOptionsSubTaskItem[]): AllOptionsSubTaskItem[] =>
                              arr.filter((t) => t.id !== subTaskId);
                            const removeNested = (arr: AllOptionsSubTaskItem[]): AllOptionsSubTaskItem[] =>
                              arr.map((t) =>
                                t.id === parentSubTaskId
                                  ? { ...t, subTasks: (t.subTasks ?? []).filter((n) => n.id !== subTaskId) }
                                  : { ...t, subTasks: t.subTasks ? removeNested(t.subTasks) : undefined }
                              );
                            setAtomsAllOptionsSubTasks((prev) => ({
                              ...prev,
                              [parentId]: parentSubTaskId
                                ? removeNested(prev[parentId] ?? [])
                                : removeFrom(prev[parentId] ?? []),
                            }));
                            setAtomsAllOptionsSubTasksSelected((prev) => {
                              const next = new Set(prev);
                              prev.forEach((id) => {
                                if (id === subTaskPath || id.startsWith(`${subTaskPath}-`)) next.delete(id);
                              });
                              return next;
                            });
                            setAtomsAllOptionsSubTaskStatusState((prev) => {
                              const { [subTaskPath]: _, ...rest } = prev;
                              return Object.fromEntries(
                                Object.entries(rest).filter(([k]) => !k.startsWith(`${subTaskPath}-`))
                              );
                            });
                            setAtomsAllOptionsExpandedIds((prev) => {
                              const next = new Set(prev);
                              next.delete(subTaskPath);
                              prev.forEach((id) => {
                                if (id.startsWith(`${subTaskPath}-`)) next.delete(id);
                              });
                              return next;
                            });
                            toast.error('Sous-tâche supprimée');
                          };
                          const renderSubTasks = (
                            tasks: AllOptionsSubTaskItem[],
                            depth: number,
                            pathPrefix: string,
                            parentSubTaskId: number | null
                          ) => (
                            <>
                              {tasks.map((st) => {
                                const stPath = `${pathPrefix}-${st.id}`;
                                const isAddingHere =
                                  atomsAllOptionsAddingTo?.parentId === r.id &&
                                  atomsAllOptionsAddingTo?.parentSubTaskId === st.id;
                                return (
                                  <TableRow
                                    key={st.id}
                                    selected={atomsAllOptionsSubTasksSelected.has(stPath)}
                                    onSelectChange={(checked) =>
                                      setAtomsAllOptionsSubTasksSelected((prev) => {
                                        const next = new Set(prev);
                                        if (checked) next.add(stPath);
                                        else next.delete(stPath);
                                        return next;
                                      })
                                    }
                                    statusContent={
                                      <EtatPicker
                                        statusId={atomsAllOptionsSubTaskStatusState[stPath]?.status ?? 'prochainement'}
                                        taskType={atomsAllOptionsSubTaskStatusState[stPath]?.taskType ?? 'tache'}
                                        onStatusChange={(v) =>
                                          setAtomsAllOptionsSubTaskStatusState((s) => ({
                                            ...s,
                                            [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), status: v },
                                          }))
                                        }
                                        onTaskTypeChange={(v) =>
                                          setAtomsAllOptionsSubTaskStatusState((s) => ({
                                            ...s,
                                            [stPath]: { ...(s[stPath] ?? { status: 'prochainement', taskType: 'tache' }), taskType: v },
                                          }))
                                        }
                                      />
                                    }
                                    expanded={atomsAllOptionsExpandedIds.has(stPath)}
                                    onExpandToggle={() =>
                                      setAtomsAllOptionsExpandedIds((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(stPath)) next.delete(stPath);
                                        else next.add(stPath);
                                        return next;
                                      })
                                    }
                                    subTaskRows={
                                      <>
                                        {st.subTasks?.length
                                          ? renderSubTasks(st.subTasks, depth + 1, stPath, st.id)
                                          : null}
                                        {atomsAllOptionsAddingTo?.parentId === r.id &&
                                          atomsAllOptionsAddingTo?.parentSubTaskId === st.id && (
                                            <TableAddSubTaskRow
                                              onValidate={(vals) => addSubTask(r.id, st.id, vals)}
                                              onCancel={() => setAtomsAllOptionsAddingTo(null)}
                                              indentLevel={depth + 1}
                                            />
                                          )}
                                      </>
                                    }
                                    hasSubTasks={(st.subTasks?.length ?? 0) > 0}
                                    onAddSubTask={() => {
                                      setAtomsAllOptionsAddingTo({ parentId: r.id, parentSubTaskId: st.id });
                                      setAtomsAllOptionsExpandedIds((prev) => new Set(prev).add(stPath));
                                    }}
                                  >
                                    <TableCell indentLevel={depth} noHoverBorder>
                                      {st.nom}
                                    </TableCell>
                                    <TableCell>{st.email}</TableCell>
                                    <TableCell align="right">{st.statut}</TableCell>
                                    <TableCell noHoverBorder align="center" className="w-12 max-w-12">
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <button
                                            type="button"
                                            className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover/row:opacity-100"
                                            aria-label="Actions"
                                          >
                                            <MoreVertical size={14} />
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-40 p-1">
                                          <button
                                            type="button"
                                            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                                            onClick={() => removeSubTask(r.id, parentSubTaskId, st.id, stPath)}
                                          >
                                            <Trash2 size={14} />
                                            Supprimer
                                          </button>
                                        </PopoverContent>
                                      </Popover>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              {atomsAllOptionsAddingTo?.parentId === r.id &&
                                atomsAllOptionsAddingTo?.parentSubTaskId === null && (
                                  <TableAddSubTaskRow
                                    onValidate={(vals) => addSubTask(r.id, null, vals)}
                                    onCancel={() => setAtomsAllOptionsAddingTo(null)}
                                    indentLevel={1}
                                  />
                                )}
                            </>
                          );
                          return renderSubTasks(atomsAllOptionsSubTasks[r.id] ?? [], 1, String(r.id), null);
                        })()}
                        hasSubTasks={(atomsAllOptionsSubTasks[r.id] ?? []).length > 0}
                        onAddSubTask={() => {
                          setAtomsAllOptionsAddingTo({ parentId: r.id, parentSubTaskId: null });
                          setAtomsAllOptionsExpandedIds((prev) => new Set(prev).add(String(r.id)));
                        }}
                        statusContent={
                          <EtatPicker
                            statusId={atomsAllOptionsStatusState[r.id]?.status ?? 'prochainement'}
                            taskType={atomsAllOptionsStatusState[r.id]?.taskType ?? 'tache'}
                            onStatusChange={(v) =>
                              setAtomsAllOptionsStatusState((s) => ({
                                ...s,
                                [r.id]: { ...(s[r.id] ?? { status: 'prochainement', taskType: 'tache' }), status: v },
                              }))
                            }
                            onTaskTypeChange={(v) =>
                              setAtomsAllOptionsStatusState((s) => ({
                                ...s,
                                [r.id]: { ...(s[r.id] ?? { status: 'prochainement', taskType: 'tache' }), taskType: v },
                              }))
                            }
                          />
                        }
                        showTagsEditor={atomsAllOptionsTagsOpen.has(r.id)}
                        tagsConfig={{
                          value: atomsAllOptionsRowTags[r.id] ?? [],
                          onChange: (v) =>
                            setAtomsAllOptionsRowTags((prev) => ({ ...prev, [r.id]: v })),
                        }}
                        rowActions={[
                          ...((atomsAllOptionsRowTags[r.id] ?? []).length === 0
                            ? [
                                {
                                  icon: <Tags size={14} />,
                                  onClick: () =>
                                    setAtomsAllOptionsTagsOpen((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(r.id)) next.delete(r.id);
                                      else next.add(r.id);
                                      return next;
                                    }),
                                  label: 'Tags',
                                },
                              ]
                            : []),
                          {
                            icon: <Pencil size={14} />,
                            onClick: () => toast.info(`Éditer ${r.nom}`),
                            label: 'Éditer',
                            activatesInlineEdit: true,
                          },
                        ]}
                      >
                        {isEditable ? (
                          <>
                            <TableCell
                              noHoverBorder
                              editable
                              value={isFirst ? atomsAllOptionsEditable.nom : r.nom}
                              onChange={(e) => {
                                if (isFirst) {
                                  setAtomsAllOptionsEditable((prev) => ({
                                    ...prev,
                                    nom: e.target.value,
                                  }));
                                } else {
                                  setAtomsAllOptionsRows((prev) =>
                                    prev.map((row, idx) =>
                                      idx === i ? { ...row, nom: e.target.value } : row
                                    )
                                  );
                                }
                              }}
                              onBlur={() => toast.success('Nom sauvegardé')}
                            />
                            <TableCell
                              editable
                              value={isFirst ? atomsAllOptionsEditable.email : r.email}
                              onChange={(e) => {
                                if (isFirst) {
                                  setAtomsAllOptionsEditable((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }));
                                } else {
                                  setAtomsAllOptionsRows((prev) =>
                                    prev.map((row, idx) =>
                                      idx === i ? { ...row, email: e.target.value } : row
                                    )
                                  );
                                }
                              }}
                              onBlur={() => toast.success('Email sauvegardé')}
                            />
                            <TableCell
                              select
                              selectOptions={[
                                { value: 'Actif', label: 'Actif' },
                                { value: 'En attente', label: 'En attente' },
                                { value: 'Inactif', label: 'Inactif' },
                              ]}
                              selectValue={isFirst ? atomsAllOptionsEditable.statut : r.statut}
                              onSelectChange={(e) => {
                                const val = e.target.value;
                                if (isFirst) {
                                  setAtomsAllOptionsEditable((prev) => ({
                                    ...prev,
                                    statut: val,
                                  }));
                                } else {
                                  setAtomsAllOptionsRows((prev) =>
                                    prev.map((row, idx) =>
                                      idx === i ? { ...row, statut: val } : row
                                    )
                                  );
                                }
                                toast.success('Statut mis à jour');
                              }}
                            />
                            <TableCell noHoverBorder align="center" className="w-12 max-w-12">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover/row:opacity-100"
                                    aria-label="Actions"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-40 p-1">
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                                    onClick={() => {
                                      setAtomsAllOptionsRows((prev) => prev.filter((x) => x.id !== r.id));
                                      setAtomsAllOptionsSelected((prev) => {
                                        const next = new Set(prev);
                                        next.delete(r.id);
                                        return next;
                                      });
                                      setAtomsAllOptionsTagsOpen((prev) => {
                                        const next = new Set(prev);
                                        next.delete(r.id);
                                        return next;
                                      });
                                      setAtomsAllOptionsRowTags((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsStatusState((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsSubTasks((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsAddingTo((prev) =>
                                        prev?.parentId === r.id ? null : prev
                                      );
                                      setAtomsAllOptionsExpandedIds((prev) => {
                                        const next = new Set(prev);
                                        next.delete(String(r.id));
                                        prev.forEach((id) => {
                                          if (id.startsWith(`${r.id}-`)) next.delete(id);
                                        });
                                        return next;
                                      });
                                      toast.error('Ligne supprimée');
                                    }}
                                  >
                                    <Trash2 size={14} />
                                    Supprimer
                                  </button>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell noHoverBorder>{r.nom}</TableCell>
                            <TableCell>{r.email}</TableCell>
                            <TableCell align="right">{r.statut}</TableCell>
                            <TableCell noHoverBorder align="center" className="w-12 max-w-12">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="p-1 rounded text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover/row:opacity-100"
                                    aria-label="Actions"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-40 p-1">
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                                    onClick={() => {
                                      setAtomsAllOptionsRows((prev) => prev.filter((x) => x.id !== r.id));
                                      setAtomsAllOptionsSelected((prev) => {
                                        const next = new Set(prev);
                                        next.delete(r.id);
                                        return next;
                                      });
                                      setAtomsAllOptionsTagsOpen((prev) => {
                                        const next = new Set(prev);
                                        next.delete(r.id);
                                        return next;
                                      });
                                      setAtomsAllOptionsRowTags((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsStatusState((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsSubTasks((prev) => {
                                        const { [r.id]: _, ...rest } = prev;
                                        return rest;
                                      });
                                      setAtomsAllOptionsAddingTo((prev) =>
                                        prev?.parentId === r.id ? null : prev
                                      );
                                      setAtomsAllOptionsExpandedIds((prev) => {
                                        const next = new Set(prev);
                                        next.delete(String(r.id));
                                        prev.forEach((id) => {
                                          if (id.startsWith(`${r.id}-`)) next.delete(id);
                                        });
                                        return next;
                                      });
                                      toast.error('Ligne supprimée');
                                    }}
                                  >
                                    <Trash2 size={14} />
                                    Supprimer
                                  </button>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {atomsAllOptionsSelected.size > 0 && (
                <Text variant="muted" className="text-xs mt-2">
                  {atomsAllOptionsSelected.size} ligne(s) sélectionnée(s)
                </Text>
              )}
            </div>
          </div>
        </CardContent></Card>
      </div>
    </>
  );
}
