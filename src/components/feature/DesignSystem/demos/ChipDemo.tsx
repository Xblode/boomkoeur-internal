import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Chip } from '@/components/ui/atoms';

export const ChipDemo = () => {
  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Chip</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Pastilles supprimables pour tags, filtres, sélections. Style aligné avec EventInfoSection (tags).
          Même palette que Badge et Tag.
        </p>
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Variantes</h4>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Couleurs</p>
              <div className="flex flex-wrap gap-2">
                <Chip label="Default" variant="default" />
                <Chip label="Info" variant="info" />
                <Chip label="Success" variant="success" />
                <Chip label="Warning" variant="warning" />
                <Chip label="Destructive" variant="destructive" />
                <Chip label="Outline" variant="outline" />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Supprimables</p>
              <div className="flex flex-wrap gap-2">
                <Chip label="Tag 1" onDelete={() => {}} />
                <Chip label="Tag 2" variant="info" onDelete={() => {}} />
                <Chip label="Tag 3" variant="success" onDelete={() => {}} />
              </div>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Chip label="Tag" variant="default" />
<Chip label="Supprimable" onDelete={() => removeTag()} />
<Chip label="Info" variant="info" onDelete={() => {}} />`}
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
                  <th className="py-2 pr-4 font-medium">Prop</th>
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-400">
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">label</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2">Texte affiché</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">onDelete</td>
                  <td className="py-2 pr-4">() =&gt; void</td>
                  <td className="py-2">Affiche le bouton X et appelle au clic</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">variant</td>
                  <td className="py-2 pr-4">ChipVariant</td>
                  <td className="py-2">default | secondary | outline | info | success | warning | destructive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage EventInfoSection */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Usage (tags Events)</h4>
        <p className="text-sm text-zinc-500">
          Dans EventInfoSection, les tags utilisent ce style : <code className="text-xs">Chip</code> avec <code className="text-xs">onDelete</code>.
        </p>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`{tags.map(tag => (
  <Chip
    key={tag}
    label={tag}
    variant="default"
    onDelete={() => handleRemoveTag(tag)}
  />
))}`}
        </pre>
      </div>

      {/* Import */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Import</h4>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`import { Chip } from '@/components/ui/atoms';`}
        </pre>
      </div>
    </div>
  );
};

export default ChipDemo;
