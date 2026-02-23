import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { Plus, Trash2, Download } from 'lucide-react';

export const ButtonDemo = () => {
  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Button</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Bouton avec variantes de style et tailles. Design sobre, transition douce, état de chargement intégré.
          Compatible avec les attributs HTML natifs (<code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">onClick</code>, <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs">disabled</code>, etc.).
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
                  <td className="py-2 pr-4 font-mono text-xs">variant</td>
                  <td className="py-2 pr-4">&apos;primary&apos; | &apos;secondary&apos; | &apos;outline&apos; | &apos;ghost&apos; | &apos;destructive&apos;</td>
                  <td className="py-2 pr-4">primary</td>
                  <td className="py-2">Style visuel du bouton</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">size</td>
                  <td className="py-2 pr-4">&apos;sm&apos; | &apos;md&apos; | &apos;lg&apos;</td>
                  <td className="py-2 pr-4">md</td>
                  <td className="py-2">Taille du bouton</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">loading</td>
                  <td className="py-2 pr-4">boolean</td>
                  <td className="py-2 pr-4">false</td>
                  <td className="py-2">Affiche un spinner et désactive le clic</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">disabled</td>
                  <td className="py-2 pr-4">boolean</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Désactive le bouton (attribut natif)</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">className</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Classes CSS additionnelles</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">children</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Contenu du bouton (texte, icône)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variantes</h4>
        <p className="text-sm text-zinc-500">
          Cinq variantes : primary (action principale), secondary, outline, ghost, destructive (actions dangereuses).
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>`}
        </pre>
      </div>

      {/* Sizes */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Tailles</h4>
        <p className="text-sm text-zinc-500">
          Trois tailles : <code className="text-xs">sm</code>, <code className="text-xs">md</code> (défaut), <code className="text-xs">lg</code>.
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="outline" size="md">Medium</Button>
              <Button variant="outline" size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
        </pre>
      </div>

      {/* States */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">États</h4>
        <p className="text-sm text-zinc-500">
          État de chargement (<code className="text-xs">loading</code>) et désactivé (<code className="text-xs">disabled</code>).
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button loading>Chargement</Button>
              <Button disabled>Désactivé</Button>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Button loading>Chargement</Button>
<Button disabled>Désactivé</Button>`}
        </pre>
      </div>

      {/* With icon */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Avec icône</h4>
        <p className="text-sm text-zinc-500">
          Placez une icône Lucide dans le <code className="text-xs">children</code> avec un espacement (<code className="text-xs">gap</code> ou <code className="text-xs">mr-1</code>).
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary" size="sm">
                <Plus size={14} className="mr-1.5" />
                Ajouter
              </Button>
              <Button variant="outline" size="sm">
                <Download size={14} className="mr-1.5" />
                Télécharger
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 size={14} className="mr-1.5" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Button variant="primary" size="sm">
  <Plus size={14} className="mr-1.5" />
  Ajouter
</Button>`}
        </pre>
      </div>

      {/* Import */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Import</h4>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`import { Button } from '@/components/ui/atoms';
import { Plus } from 'lucide-react';`}
        </pre>
      </div>
    </div>
  );
};

export default ButtonDemo;
