import React from 'react';
import { Card, CardContent } from '@/components/ui/molecules';
import { Tag, Dot } from '@/components/ui/atoms';

export const StatusDemo = () => {
  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Tag / Dot</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Tag : étiquettes avec variantes de couleur (alignées Badge/Chip, style EventInfoSection).
          Dot : indicateur de statut, optionnel avec animation.
        </p>
      </div>

      {/* Tag */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Tag</h4>
        <p className="text-sm text-zinc-500">
          Même palette que Badge : default, info, success, warning, destructive. Option <code className="text-xs">showDot</code> pour un point indicateur.
        </p>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Sans point</p>
              <div className="flex flex-wrap gap-2">
                <Tag variant="default">Default</Tag>
                <Tag variant="info">Info</Tag>
                <Tag variant="success">Success</Tag>
                <Tag variant="warning">Warning</Tag>
                <Tag variant="destructive">Destructive</Tag>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Avec point (showDot)</p>
              <div className="flex flex-wrap gap-2">
                <Tag variant="default" showDot>Default</Tag>
                <Tag variant="info" showDot>Info</Tag>
                <Tag variant="success" showDot>Success</Tag>
                <Tag variant="warning" showDot>Warning</Tag>
              </div>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Tag variant="default">Default</Tag>
<Tag variant="info">Info</Tag>
<Tag variant="success" showDot>Success</Tag>`}
        </pre>
      </div>

      {/* Dot */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Dot</h4>
        <p className="text-sm text-zinc-500">
          Point indicateur de statut. Option <code className="text-xs">animate</code> pour effet ping (ex. &quot;en direct&quot;).
        </p>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Dot variant="neutral" />
                <span className="text-sm">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot variant="info" />
                <span className="text-sm">Info</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot variant="success" />
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot variant="warning" />
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot variant="error" />
                <span className="text-sm">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <Dot variant="success" animate />
                <span className="text-sm">Live</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`<Dot variant="success" />
<Dot variant="success" animate />`}
        </pre>
      </div>

      {/* Props */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Props</h4>
          <div className="overflow-x-auto space-y-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Tag</p>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 pr-4 font-medium">Prop</th>
                    <th className="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600 dark:text-zinc-400">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4 font-mono text-xs">variant</td>
                    <td className="py-2">default | info | success | warning | destructive</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4 font-mono text-xs">showDot</td>
                    <td className="py-2">Affiche un point à gauche</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Dot</p>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="py-2 pr-4 font-medium">Prop</th>
                    <th className="py-2 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600 dark:text-zinc-400">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4 font-mono text-xs">variant</td>
                    <td className="py-2">neutral | info | success | warning | error</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4 font-mono text-xs">animate</td>
                    <td className="py-2">Effet ping (ex. statut live)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import */}
      <div className="space-y-2">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Import</h4>
        <pre className="text-xs bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`import { Tag, Dot } from '@/components/ui/atoms';`}
        </pre>
      </div>
    </div>
  );
};

export default StatusDemo;
