'use client';

import React from 'react';
import { Input, Textarea, Select, Label } from '@/components/ui/atoms';
import { PostBrainstorming, InstagramPostType } from '@/types/communication';

interface StepBrainstormingProps {
  data: Partial<PostBrainstorming>;
  onChange: (data: Partial<PostBrainstorming>) => void;
}

/**
 * Étape 1 : Brainstorming du post
 * Phase de conception et planification
 */
export const StepBrainstorming: React.FC<StepBrainstormingProps> = ({
  data,
  onChange,
}) => {
  const formatOptions: { value: InstagramPostType; label: string }[] = [
    { value: 'post', label: 'Post (Photo unique)' },
    { value: 'carousel', label: 'Carrousel (Plusieurs photos)' },
    { value: 'reel', label: 'Reel (Vidéo)' },
    { value: 'story', label: 'Story' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1">
          💡 Phase de Brainstorming
        </h3>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Définissez les grandes lignes de votre post. Vous pourrez affiner le contenu dans l'étape suivante.
        </p>
      </div>

      {/* Objectif */}
      <div>
        <Label htmlFor="objective" required>
          Objectif du post
        </Label>
        <Input
          id="objective"
          placeholder="Ex: Annoncer l'événement du 27 février"
          value={data.objective || ''}
          onChange={(e) => onChange({ ...data, objective: e.target.value })}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Quel est le but principal de ce post ?
        </p>
      </div>

      {/* Format */}
      <div>
        <Label htmlFor="format" required>
          Format pressenti
        </Label>
        <Select
          id="format"
          value={data.format || ''}
          onChange={(e) =>
            onChange({ ...data, format: e.target.value as InstagramPostType })
          }
        >
          <option value="">Sélectionner un format</option>
          {formatOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Public cible */}
      <div>
        <Label htmlFor="targetAudience">Public cible</Label>
        <Input
          id="targetAudience"
          placeholder="Ex: Fans de techno, 20-35 ans"
          value={data.targetAudience || ''}
          onChange={(e) =>
            onChange({ ...data, targetAudience: e.target.value })
          }
        />
      </div>

      {/* Date approximative */}
      <div>
        <Label htmlFor="estimatedDate">Date de publication approximative</Label>
        <Input
          id="estimatedDate"
          type="date"
          value={
            data.estimatedDate
              ? new Date(data.estimatedDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) =>
            onChange({
              ...data,
              estimatedDate: e.target.value ? new Date(e.target.value) : undefined,
            })
          }
        />
      </div>

      {/* Mini brief */}
      <div>
        <Label htmlFor="brief" required>
          Mini brief
        </Label>
        <Textarea
          id="brief"
          placeholder="Décrivez votre idée dans les grandes lignes...&#10;&#10;Ex: Visuel impactant avec la date et le line-up principal. Ambiance sombre et énergique. Utiliser les couleurs de la marque."
          value={data.brief || ''}
          onChange={(e) => onChange({ ...data, brief: e.target.value })}
          rows={6}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Notes, idées, direction créative, éléments à inclure, etc.
        </p>
      </div>
    </div>
  );
};
