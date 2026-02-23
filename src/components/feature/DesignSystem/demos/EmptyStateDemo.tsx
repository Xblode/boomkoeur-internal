import React from 'react';
import { EmptyState, Card, CardContent } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { FileText, Inbox, Search, Plus } from 'lucide-react';

export const EmptyStateDemo = () => {
  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">EmptyState</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Composant d&apos;affichage lorsqu&apos;aucune donnée n&apos;est disponible. Bordure dashed, fond transparent,
          icône optionnelle. Trois variantes selon le contexte : <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">full</code>,{' '}
          <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">compact</code>,{' '}
          <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">inline</code>.
        </p>
      </div>

      {/* Props */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Props</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 pr-4 font-medium">Prop</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Défaut</th>
                  <th className="py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">icon</td>
                  <td className="py-2 pr-4">LucideIcon</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Icône Lucide à afficher</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">title</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Titre principal (requis)</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">description</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Description optionnelle</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">action</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Bouton ou lien d&apos;action</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">variant</td>
                  <td className="py-2 pr-4">&apos;full&apos; | &apos;compact&apos; | &apos;inline&apos;</td>
                  <td className="py-2 pr-4">full</td>
                  <td className="py-2">Taille et densité visuelle</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">className</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Classes CSS additionnelles</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Variant: full */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variante full (défaut)</h4>
        <p className="text-sm text-zinc-500">
          Sections principales, listes vides, zones de contenu. <code className="text-xs">min-h-[300px]</code>, icône <code className="text-xs">w-8</code>, padding <code className="text-xs">p-16</code>.
        </p>
        <div className="min-h-[320px]">
          <EmptyState
            icon={FileText}
            title="Aucun post planifié"
            description="Commence par noter les posts et stories dont tu as besoin pour communiquer cet événement."
            action={
              <Button variant="outline" size="sm">
                <Plus size={14} /> Ajouter un post
              </Button>
            }
            variant="full"
          />
        </div>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<EmptyState
  icon={FileText}
  title="Aucun post planifié"
  description="Commence par noter les posts..."
  action={<Button variant="outline" size="sm">Ajouter</Button>}
  variant="full"
/>`}
        </pre>
      </div>

      {/* Variant: compact */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variante compact</h4>
        <p className="text-sm text-zinc-500">
          Cartes, panneaux secondaires. Plus petit : <code className="text-xs">min-h-[200px]</code>, icône <code className="text-xs">w-6</code>.
        </p>
        <div className="min-h-[220px]">
          <EmptyState
            icon={Inbox}
            title="Aucune donnée"
            description="Les données apparaîtront ici une fois disponibles."
            action={<Button variant="outline" size="sm">Actualiser</Button>}
            variant="compact"
          />
        </div>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<EmptyState
  icon={Inbox}
  title="Aucune donnée"
  description="Les données apparaîtront ici..."
  action={<Button variant="outline" size="sm">Actualiser</Button>}
  variant="compact"
/>`}
        </pre>
      </div>

      {/* Variant: inline */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variante inline</h4>
        <p className="text-sm text-zinc-500">
          Tableaux, listes imbriquées, modals. Minimal : <code className="text-xs">py-8</code>, icône <code className="text-xs">w-5</code>, bordure fine.
        </p>
        <div className="max-w-md">
          <EmptyState
            icon={Search}
            title="Aucun artiste"
            description="Recherchez ou ajoutez un artiste."
            variant="inline"
          />
        </div>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<EmptyState
  icon={Search}
  title="Aucun artiste"
  description="Recherchez ou ajoutez un artiste."
  variant="inline"
/>`}
        </pre>
      </div>

      {/* Options minimales */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Options minimales</h4>
        <p className="text-sm text-zinc-500">
          Seul <code className="text-xs">title</code> est requis. Icône, description et action sont optionnels.
        </p>
        <div className="min-h-[220px]">
          <EmptyState title="Aucun élément" variant="compact" />
        </div>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<EmptyState title="Aucun élément" variant="compact" />`}
        </pre>
      </div>

      {/* Import */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Import</h4>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`import { EmptyState } from '@/components/ui/molecules';
import { FileText } from 'lucide-react';`}
        </pre>
      </div>
    </div>
  );
};

export default EmptyStateDemo;
