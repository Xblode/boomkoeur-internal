'use client';

import React, { useEffect, useState } from 'react';
import { Table2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Heading,
  Text,
  Select,
  Switch,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/atoms';
import {
  SectionHeader,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EtatPicker,
  CodeSnippet,
} from '@/components/ui/molecules';
import { useToolbar } from '@/components/providers/ToolbarProvider';
import { cn } from '@/lib/utils';

// ── Wrapper pour tooltip + focus au hover dans la doc Table ───────────────────

function DocEl({ name, children, className = '' }: { name: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      title={name}
      className={cn('inline-block rounded px-0.5 -mx-0.5 min-w-0 hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-shadow', className)}
    >
      {children}
    </span>
  );
}

// ── Table Docs Content ────────────────────────────────────────────────────────

function TableDocsContent() {
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [docsSelected, setDocsSelected] = useState<Set<number>>(new Set());
  const [docsTableVariant, setDocsTableVariant] = useState<'default' | 'bordered' | 'striped'>('bordered');
  const [docsResizable, setDocsResizable] = useState(true);
  const [docsFillColumn, setDocsFillColumn] = useState(true);
  const [docsSelectionColumn, setDocsSelectionColumn] = useState(true);
  const [docsStatusColumn, setDocsStatusColumn] = useState(true);
  const [docsExpandable, setDocsExpandable] = useState(true);
  const [docsAddable, setDocsAddable] = useState(true);
  const [docsHoverCellOnly, setDocsHoverCellOnly] = useState(true);
  const [codeSnippetOpen, setCodeSnippetOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateTableCode = () => {
    const props: string[] = [`variant="${docsTableVariant}"`];
    if (docsSelectionColumn) props.push('selectionColumn');
    if (docsStatusColumn) props.push('statusColumn');
    if (docsExpandable) props.push('expandable');
    if (docsAddable) props.push('addable');
    if (!docsResizable) props.push('resizable={false}');
    if (!docsFillColumn) props.push('fillColumn={false}');
    if (docsSelectionColumn) {
      props.push('selectAllChecked={...}');
      props.push('onSelectAllChange={(checked) => {...}}');
    }
    if (docsAddable) props.push('onAddRow={(vals) => {...}}');

    const propsStr = props.map((p) => `  ${p}`).join('\n');
    const headerRow = docsHoverCellOnly ? '<TableRow hoverCellOnly>' : '<TableRow>';

    const code = `<Table\n${propsStr}\n>\n  <TableHeader>\n    ${headerRow}\n      <TableHead sortable minWidth={80} defaultWidth={140}>Nom</TableHead>\n      <TableHead sortable minWidth={100} defaultWidth={180}>Email</TableHead>\n      <TableHead sortable minWidth={60} defaultWidth={100}>Statut</TableHead>\n      <TableHead align="center" minWidth={48} defaultWidth={48} maxWidth={48}>+</TableHead>\n    </TableRow>\n  </TableHeader>\n  <TableBody>\n    <TableRow\n      selected={...}\n      onSelectChange={(c) => {...}}\n      expanded={...}\n      onExpandToggle={() => {...}}\n      statusContent={<EtatPicker ... />}\n      rowActions={[{ icon: <Pencil />, label: 'Éditer', onClick: () => {}, activatesInlineEdit: true }]}\n      subTaskRows={...}\n      hasSubTasks\n      onAddSubTask={() => {}}\n    >\n      <TableCell noHoverBorder>Dupont</TableCell>\n      <TableCell>dupont@example.com</TableCell>\n      <TableCell align="right">Actif</TableCell>\n      <TableCell noHoverBorder align="center" className="w-12">...</TableCell>\n    </TableRow>\n    {/* Martin, Bernard... */}\n  </TableBody>\n</Table>`;
    setGeneratedCode(code);
    setCodeSnippetOpen(true);
  };

  const TABLE_OPTIONS = [
    { prop: 'variant', type: "'default' | 'bordered' | 'striped'", desc: 'Style visuel du tableau' },
    { prop: 'resizable', type: 'boolean', desc: 'Colonnes redimensionnables (défaut: true)' },
    { prop: 'fillColumn', type: 'boolean', desc: 'Colonne flexible qui comble l\'espace (défaut: true)' },
    { prop: 'expandable', type: 'boolean', desc: 'Lignes dépliables avec expandContent' },
    { prop: 'addable', type: 'boolean', desc: 'Ligne "+ Ajouter une ligne" en bas' },
    { prop: 'onAddRow', type: '(values: string[]) => void', desc: 'Callback à la validation' },
    { prop: 'selectionColumn', type: 'boolean', desc: 'Colonne grip + checkbox (sélection)' },
    { prop: 'selectAllChecked', type: 'boolean', desc: 'État "tout sélectionner"' },
    { prop: 'onSelectAllChange', type: '(checked: boolean) => void', desc: 'Callback tout sélectionner' },
    { prop: 'statusColumn', type: 'boolean', desc: 'Sélecteur d\'état (cercle) à gauche' },
  ];

  const TABLE_ROW_OPTIONS = [
    { prop: 'clickable', type: 'boolean', desc: 'Ligne cliquable' },
    { prop: 'hoverCellOnly', type: 'boolean', desc: 'Hover uniquement sur les cellules' },
    { prop: 'expandContent', type: 'ReactNode', desc: 'Contenu déplié' },
    { prop: 'expanded', type: 'boolean', desc: 'État déplié (contrôlé)' },
    { prop: 'onExpandToggle', type: '() => void', desc: 'Callback déplier/replier' },
    { prop: 'selected', type: 'boolean', desc: 'Ligne sélectionnée' },
    { prop: 'onSelectChange', type: '(checked: boolean) => void', desc: 'Callback checkbox' },
    { prop: 'statusContent', type: 'ReactNode', desc: 'Contenu du sélecteur d\'état (ex: EtatPicker)' },
    { prop: 'rowActions', type: 'TableRowAction[]', desc: 'Boutons d\'action au hover' },
    { prop: 'subTaskRows', type: 'ReactNode', desc: 'Lignes sous-tâches' },
    { prop: 'hasSubTasks', type: 'boolean', desc: 'Affiche le chevron' },
    { prop: 'onAddSubTask', type: '() => void', desc: 'Callback ajouter sous-tâche' },
  ];

  const TABLE_CELL_OPTIONS = [
    { prop: 'align', type: "'left' | 'center' | 'right'", desc: 'Alignement' },
    { prop: 'editable', type: 'boolean', desc: 'Cellule éditable' },
    { prop: 'value', type: 'string', desc: 'Valeur (éditable)' },
    { prop: 'onChange', type: '(e: ChangeEvent) => void', desc: 'Callback édition' },
    { prop: 'select', type: 'boolean', desc: 'Cellule avec Select' },
    { prop: 'selectOptions', type: 'TableCellSelectOption[]', desc: 'Options du Select' },
    { prop: 'noHoverBorder', type: 'boolean', desc: 'Pas de bordure au hover' },
    { prop: 'indentLevel', type: 'number', desc: 'Indentation (0, 1, 2...)' },
  ];

  const TABLE_HEAD_OPTIONS = [
    { prop: 'align', type: "'left' | 'center' | 'right'", desc: 'Alignement' },
    { prop: 'sortable', type: 'boolean', desc: 'Colonne triable' },
    { prop: 'minWidth', type: 'number', desc: 'Largeur minimale (px)' },
    { prop: 'defaultWidth', type: 'number', desc: 'Largeur par défaut (px)' },
    { prop: 'maxWidth', type: 'number', desc: 'Largeur maximale (px)' },
  ];

  return (
    <div className="space-y-10">
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Structure du composant Table</CardTitle>
          <CardDescription>
            Le composant Table est découpé en plusieurs fichiers dans <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">components/ui/atoms/Table/</code> : Table.tsx, TableHeader.tsx, TableBody.tsx, TableRow.tsx, TableHead.tsx, TableCell.tsx, TableAddSubTaskRow.tsx. Import depuis <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">@/components/ui/atoms</code>.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Options du composant Table</CardTitle>
          <CardDescription>
            Liste complète des props pour Table, TableRow, TableCell et TableHead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Heading level={5} className="mb-3">Table</Heading>
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
                  {TABLE_OPTIONS.map((o) => (
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
          <div>
            <Heading level={5} className="mb-3">TableRow</Heading>
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
                  {TABLE_ROW_OPTIONS.map((o) => (
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
          <div>
            <Heading level={5} className="mb-3">TableCell</Heading>
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
                  {TABLE_CELL_OPTIONS.map((o) => (
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
          <div>
            <Heading level={5} className="mb-3">TableHead</Heading>
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
                  {TABLE_HEAD_OPTIONS.map((o) => (
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

          <div>
            <Heading level={5} className="mb-3">Colonnes spéciales</Heading>
            <Text variant="muted" className="mb-4 text-sm">
              Le tableau « Toutes les options combinées » utilise deux types de colonnes particulières, injectées ou ajoutées manuellement.
            </Text>
            <div className="space-y-4">
              <div className="rounded-lg border border-border-custom p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Heading level={6} className="mb-2">1. Colonne de sélection (1ère colonne)</Heading>
                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><strong>Activation :</strong> <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">selectionColumn=true</code> sur Table</li>
                  <li><strong>Contenu :</strong> Grip (GripVertical) pour déplacer la ligne + Checkbox pour sélectionner</li>
                  <li><strong>Comportement :</strong> Injectée automatiquement par TableHeader à gauche de toutes les colonnes</li>
                  <li><strong>Visibilité :</strong> Grip et checkbox visibles au hover sur la ligne (opacity-0 → opacity-100)</li>
                  <li><strong>Header :</strong> Checkbox « tout sélectionner » contrôlée par <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">selectAllChecked</code> et <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">onSelectAllChange</code></li>
                </ul>
              </div>
              <div className="rounded-lg border border-border-custom p-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Heading level={6} className="mb-2">2. Colonne actions (dernière colonne)</Heading>
                <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                  <li><strong>Activation :</strong> Colonne ajoutée manuellement (TableHead + TableCell pour chaque ligne)</li>
                  <li><strong>Header :</strong> Icône Plus (⊕) — souvent utilisée pour l&apos;ajout de sous-tâches ou comme indicateur visuel</li>
                  <li><strong>Body :</strong> Icône 3 points (MoreVertical) dans un Popover — au clic, affiche les actions (ex. Supprimer)</li>
                  <li><strong>Convention :</strong> <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">noHoverBorder</code> et <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">align="center"</code> sur les cellules, largeur fixe (ex. w-12 max-w-12)</li>
                  <li><strong>Note :</strong> La colonne fill (flexible) est ajoutée automatiquement à droite par <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">fillColumn</code></li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Tableau interactif — toutes les options</CardTitle>
          <CardDescription>
            Configurez les options ci-dessous pour voir le tableau se mettre à jour. Cliquez sur « Générer le code » pour obtenir le JSX correspondant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="rounded-lg border border-border-custom overflow-hidden">
              <Table
                variant={docsTableVariant}
                resizable={docsResizable}
                fillColumn={docsFillColumn}
                selectionColumn={docsSelectionColumn}
                statusColumn={docsStatusColumn}
                expandable={docsExpandable}
                addable={docsAddable}
                selectAllChecked={docsSelectionColumn && docsSelected.size === 3}
                onSelectAllChange={
                  docsSelectionColumn
                    ? (checked) => setDocsSelected(checked ? new Set([0, 1, 2]) : new Set())
                    : undefined
                }
                onAddRow={docsAddable ? (vals) => toast.success(`Ajouté: ${vals[0]}`) : undefined}
              >
                <TableHeader>
                  <TableRow {...(docsHoverCellOnly ? { hoverCellOnly: true } : {})}>
                    <TableHead key="nom" sortable minWidth={80} defaultWidth={140}>
                      Nom
                    </TableHead>
                    <TableHead key="email" sortable minWidth={100} defaultWidth={180}>
                      Email
                    </TableHead>
                    <TableHead key="statut" sortable minWidth={60} defaultWidth={100}>
                      Statut
                    </TableHead>
                    <TableHead key="actions" align="center" minWidth={48} defaultWidth={48} maxWidth={48}>
                      +
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    selected={docsSelectionColumn && docsSelected.has(0)}
                    onSelectChange={
                      docsSelectionColumn
                        ? (c) =>
                            setDocsSelected((p) => {
                              const n = new Set(p);
                              if (c) n.add(0);
                              else n.delete(0);
                              return n;
                            })
                        : undefined
                    }
                    clickable
                    expanded={docsExpandable ? docsExpanded : undefined}
                    onExpandToggle={docsExpandable ? () => setDocsExpanded(!docsExpanded) : undefined}
                    statusContent={
                      docsStatusColumn ? (
                        <EtatPicker
                          statusId="prochainement"
                          taskType="tache"
                          onStatusChange={() => {}}
                          onTaskTypeChange={() => {}}
                        />
                      ) : undefined
                    }
                    rowActions={
                      docsExpandable && docsStatusColumn
                        ? [
                            {
                              icon: <Pencil size={14} />,
                              label: 'Éditer',
                              onClick: () => {},
                              activatesInlineEdit: true,
                            },
                          ]
                        : undefined
                    }
                    subTaskRows={
                      docsExpandable && docsStatusColumn ? (
                        <TableRow>
                          <TableCell indentLevel={1} noHoverBorder>
                            Sous-tâche 1
                          </TableCell>
                          <TableCell>Sous-email</TableCell>
                          <TableCell align="right">En cours</TableCell>
                          <TableCell noHoverBorder align="center" className="w-12" />
                        </TableRow>
                      ) : undefined
                    }
                    hasSubTasks={docsExpandable && docsStatusColumn}
                    onAddSubTask={
                      docsExpandable && docsStatusColumn ? () => toast.info('Ajouter sous-tâche') : undefined
                    }
                    expandContent={
                      docsExpandable && !docsStatusColumn ? (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                          <p>
                            <strong>Détails :</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                          </p>
                          <p>
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                            ea commodo consequat.
                          </p>
                        </div>
                      ) : undefined
                    }
                  >
                    <TableCell noHoverBorder>Dupont</TableCell>
                    <TableCell>dupont@example.com</TableCell>
                    <TableCell align="right">Actif</TableCell>
                    <TableCell noHoverBorder align="center" className="w-12">
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
                            onClick={() => toast.error('Supprimer')}
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    selected={docsSelectionColumn && docsSelected.has(1)}
                    onSelectChange={
                      docsSelectionColumn
                        ? (c) =>
                            setDocsSelected((p) => {
                              const n = new Set(p);
                              if (c) n.add(1);
                              else n.delete(1);
                              return n;
                            })
                        : undefined
                    }
                    expandContent={
                      docsExpandable && !docsStatusColumn ? (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          <p>Contenu déplié pour Martin.</p>
                        </div>
                      ) : undefined
                    }
                  >
                    <TableCell noHoverBorder>Martin</TableCell>
                    <TableCell>martin@example.com</TableCell>
                    <TableCell align="right">En attente</TableCell>
                    <TableCell noHoverBorder align="center" className="w-12">
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
                            onClick={() => toast.error('Supprimer')}
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    selected={docsSelectionColumn && docsSelected.has(2)}
                    onSelectChange={
                      docsSelectionColumn
                        ? (c) =>
                            setDocsSelected((p) => {
                              const n = new Set(p);
                              if (c) n.add(2);
                              else n.delete(2);
                              return n;
                            })
                        : undefined
                    }
                    expandContent={
                      docsExpandable && !docsStatusColumn ? (
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">
                          <p>Contenu déplié pour Bernard.</p>
                        </div>
                      ) : undefined
                    }
                  >
                    <TableCell noHoverBorder>Bernard</TableCell>
                    <TableCell>bernard@example.com</TableCell>
                    <TableCell align="right">Inactif</TableCell>
                    <TableCell noHoverBorder align="center" className="w-12">
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
                            onClick={() => toast.error('Supprimer')}
                          >
                            <Trash2 size={14} />
                            Supprimer
                          </button>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>variant</Label>
              <Select
                value={docsTableVariant}
                onChange={(e) =>
                  setDocsTableVariant(e.target.value as 'default' | 'bordered' | 'striped')
                }
                options={[
                  { value: 'default', label: 'default' },
                  { value: 'bordered', label: 'bordered' },
                  { value: 'striped', label: 'striped' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-resizable"
                checked={docsResizable}
                onCheckedChange={setDocsResizable}
              />
              <Label htmlFor="docs-resizable">resizable</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-fillColumn"
                checked={docsFillColumn}
                onCheckedChange={setDocsFillColumn}
              />
              <Label htmlFor="docs-fillColumn">fillColumn</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-selectionColumn"
                checked={docsSelectionColumn}
                onCheckedChange={setDocsSelectionColumn}
              />
              <Label htmlFor="docs-selectionColumn">selectionColumn</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-statusColumn"
                checked={docsStatusColumn}
                onCheckedChange={setDocsStatusColumn}
              />
              <Label htmlFor="docs-statusColumn">statusColumn</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-expandable"
                checked={docsExpandable}
                onCheckedChange={setDocsExpandable}
              />
              <Label htmlFor="docs-expandable">expandable</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-addable"
                checked={docsAddable}
                onCheckedChange={setDocsAddable}
              />
              <Label htmlFor="docs-addable">addable</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="docs-hoverCellOnly"
                checked={docsHoverCellOnly}
                onCheckedChange={setDocsHoverCellOnly}
              />
              <Label htmlFor="docs-hoverCellOnly">hoverCellOnly (header)</Label>
            </div>
          </div>

          <Button variant="outline" className="mt-4" onClick={generateTableCode}>
            Générer le code
          </Button>

          {codeSnippetOpen && (
            <CodeSnippet code={generatedCode} className="mt-4" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TableDocsPage() {
  const { setToolbar } = useToolbar();

  useEffect(() => {
    setToolbar(null);
    return () => setToolbar(null);
  }, [setToolbar]);

  return (
    <>
      <div className="mb-6">
        <SectionHeader
          icon={<Table2 size={28} />}
          title="Table"
          subtitle="Documentation du composant Table : options, exemples et référence."
        />
      </div>
      <TableDocsContent />
    </>
  );
}
