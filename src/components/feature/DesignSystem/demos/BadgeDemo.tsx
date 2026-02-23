import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Badge } from '@/components/ui/atoms';

export const BadgeDemo = () => {
  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Badge</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Étiquettes pour statuts, catégories et feedback. Couleurs alignées avec EventStatusBadge (page Events).
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variantes</h4>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Feedback (Events)</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning">Idée</Badge>
                <Badge variant="info">Préparation</Badge>
                <Badge variant="success">Confirmé</Badge>
                <Badge variant="secondary">Terminé</Badge>
                <Badge variant="secondary">Archivé</Badge>
                <Badge variant="destructive">Erreur</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Tous les variants</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="error">Error</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Badge variant="warning">Idée</Badge>
<Badge variant="info">Préparation</Badge>
<Badge variant="success">Confirmé</Badge>
<Badge variant="secondary">Terminé</Badge>
<Badge variant="destructive">Erreur</Badge>`}
        </pre>
      </div>

      {/* Props */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Props</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 pr-4 font-medium">Variant</th>
                  <th className="py-2 font-medium">Usage</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">default</td>
                  <td className="py-2">Fond noir, texte blanc</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">secondary</td>
                  <td className="py-2">Neutre (Terminé, Archivé)</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">outline</td>
                  <td className="py-2">Bordure seule</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">info</td>
                  <td className="py-2">Préparation</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">success</td>
                  <td className="py-2">Confirmé</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">warning</td>
                  <td className="py-2">Idée</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">destructive / error</td>
                  <td className="py-2">Erreur, actions destructives</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Import */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Import</h4>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`import { Badge } from '@/components/ui/atoms';`}
        </pre>
      </div>
    </div>
  );
};

export default BadgeDemo;
