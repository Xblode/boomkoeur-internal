import React, { useState } from 'react';
import { SectionHeader, Card, CardContent, TagMultiSelect } from '@/components/ui/molecules';
import { Button } from '@/components/ui/atoms';
import { Calendar, MapPin, Users, Tag, Layers2 } from 'lucide-react';

export const DetailHeaderDemo = () => {
  const metadata = [
    [
      { icon: Calendar, label: 'Date', value: <span className="text-sm px-3 py-2">Vendredi 21 mars 2025 à 20:00</span> },
      { icon: Users, label: 'Assignées', value: <span className="text-sm px-3 py-2 text-zinc-400">—</span> },
    ],
    [
      { icon: MapPin, label: 'Lieu', value: <span className="text-sm px-3 py-2">Le Transbordeur, Lyon</span> },
      { icon: Tag, label: 'Tags', value: <span className="text-sm px-3 py-2 text-zinc-400">—</span> },
    ],
  ];

  const [demoTags, setDemoTags] = useState<string[]>(['Électro', 'Soirée']);
  const tagsSection = (
    <TagMultiSelect
      value={demoTags}
      onChange={setDemoTags}
      placeholder="Ajouter une étiquette..."
    />
  );

  return (
    <div className="space-y-10 p-4">
      {/* Introduction */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">SectionHeader</h3>
        <p className="text-sm text-zinc-500 max-w-2xl">
          En-tête unifié pour sections et pages détail : mode simple (icon + title), avec actions, ou avec métadonnées.
        </p>
      </div>

      {/* Exemple complet */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Mode détail (titre + métadonnées + tags)</h4>
        <Card>
          <CardContent className="pt-6">
            <SectionHeader
              title="Soirée Electro 2025"
              icon={<Calendar size={28} />}
              metadata={metadata}
              tags={tagsSection}
            />
          </CardContent>
        </Card>
      </div>

      {/* Exemple sans tags */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Mode détail sans tags</h4>
        <Card>
          <CardContent className="pt-6">
            <SectionHeader
              title="Produit XYZ"
              icon={<MapPin size={28} />}
              metadata={[
                [
                  { icon: MapPin, label: 'Lieu', value: <span className="text-sm px-3 py-2">Entrepôt A</span> },
                  { icon: Users, label: 'Responsable', value: <span className="text-sm px-3 py-2">Jean Dupont</span> },
                ],
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mode simple */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Mode simple (icon + title)</h4>
        <Card>
          <CardContent className="pt-6">
            <SectionHeader icon={<Calendar size={28} />} title="Trésorerie" />
          </CardContent>
        </Card>
      </div>

      {/* Mode avec sous-titre */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Mode avec sous-titre</h4>
        <Card>
          <CardContent className="pt-6">
            <SectionHeader
              icon={<Layers2 size={28} />}
              title="Molecules"
              subtitle="Tous les composants molecules du design system avec leurs variantes, en mise en situation."
            />
          </CardContent>
        </Card>
      </div>

      {/* Mode avec actions */}
      <div className="space-y-4">
        <h4 className="text-base font-medium border-b border-border-custom pb-2">Mode avec actions</h4>
        <Card>
          <CardContent className="pt-6">
            <SectionHeader
              icon={<MapPin size={28} />}
              title="Évolution de trésorerie"
              actions={<Button variant="secondary" size="sm">Filtrer</Button>}
            />
          </CardContent>
        </Card>
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
                  <td className="py-2 pr-4 font-mono text-xs">title</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Titre (string ou ReactNode éditable)</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">icon</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Icône optionnelle</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">subtitle</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Sous-titre optionnel</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">actions</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Actions à droite</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">metadata</td>
                  <td className="py-2 pr-4">MetadataCell[][]</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Grille métadonnées (mode détail)</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">tags</td>
                  <td className="py-2 pr-4">ReactNode</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2">Section tags optionnelle</td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="py-2 pr-4 font-mono text-xs">gridColumns</td>
                  <td className="py-2 pr-4">string</td>
                  <td className="py-2 pr-4">120px 1fr 120px 1fr</td>
                  <td className="py-2">Colonnes de la grille</td>
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
{`import { SectionHeader } from '@/components/ui/molecules';
import type { MetadataCell } from '@/components/ui/molecules';`}
        </pre>
      </div>
    </div>
  );
};

export default DetailHeaderDemo;
