'use client';

import React, { useState } from 'react';
import { Upload, Plus, X, Music } from 'lucide-react';
import { Input, Textarea, Label, Button, Badge, IconButton, Select } from '@/components/ui/atoms';
import { SocialPost, PostMusic, StoryInteractive } from '@/types/communication';

interface StepContentProps {
  data: Partial<SocialPost>;
  onChange: (data: Partial<SocialPost>) => void;
}

/**
 * Étape 2 : Contenu du post
 * Remplissage des médias, caption, hashtags, etc.
 */
export const StepContent: React.FC<StepContentProps> = ({ data, onChange }) => {
  const [newHashtag, setNewHashtag] = useState('');
  const [newTaggedUser, setNewTaggedUser] = useState('');
  const [newCollaborator, setNewCollaborator] = useState('');

  const handleAddHashtag = () => {
    const hashtag = newHashtag.replace('#', '').trim();
    const current = data.hashtags || [];
    if (hashtag && !current.includes(hashtag)) {
      onChange({ ...data, hashtags: [...current, hashtag] });
      setNewHashtag('');
    }
  };

  const handleRemoveHashtag = (index: number) => {
    const current = data.hashtags || [];
    onChange({ ...data, hashtags: current.filter((_, i) => i !== index) });
  };

  const handleAddTaggedUser = () => {
    const user = newTaggedUser.trim();
    const current = data.taggedUsers || [];
    if (user && !current.includes(user)) {
      onChange({ ...data, taggedUsers: [...current, user] });
      setNewTaggedUser('');
    }
  };

  const handleRemoveTaggedUser = (index: number) => {
    const current = data.taggedUsers || [];
    onChange({ ...data, taggedUsers: current.filter((_, i) => i !== index) });
  };

  const handleAddCollaborator = () => {
    const collaborator = newCollaborator.trim();
    const current = data.collaboration ? [data.collaboration] : [];
    if (collaborator) {
      onChange({ ...data, collaboration: collaborator });
      setNewCollaborator('');
    }
  };

  const showMusicField =
    data.type === 'reel' || data.type === 'story';
  const showStoryInteractive = data.type === 'story';

  return (
    <div className="space-y-6">
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 dark:text-green-400 mb-1">
          ✏️ Phase de Création
        </h3>
        <p className="text-xs text-green-700 dark:text-green-300">
          Remplissez le contenu au fur et à mesure. Vous pourrez toujours revenir modifier.
        </p>
      </div>

      {/* Upload Médias */}
      <div>
        <Label htmlFor="media">
          Médias {data.type === 'carousel' ? '(plusieurs)' : ''}
        </Label>
        <div className="mt-2">
          {/* Placeholder pour l'upload - À remplacer par un vrai composant d'upload */}
          <div className="border-2 border-dashed border-border-custom rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
            <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-foreground mb-1">
              Cliquez pour uploader ou glissez-déposez
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou MP4 (max. 10MB)
            </p>
          </div>

          {/* Preview des médias uploadés */}
          {data.media && data.media.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {data.media.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover rounded bg-muted"
                  />
                  <IconButton
                    icon={<X size={12} />}
                    ariaLabel="Supprimer"
                    variant="destructive"
                    size="xs"
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                    onClick={() => {
                      const newMedia = [...data.media!];
                      newMedia.splice(index, 1);
                      onChange({ ...data, media: newMedia });
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Caption */}
      <div>
        <Label htmlFor="caption">
          Légende / Caption
        </Label>
        <Textarea
          id="caption"
          placeholder="Écrivez votre légende ici...&#10;&#10;💡 Astuce : Utilisez des emojis et sauts de ligne pour une meilleure lisibilité"
          value={data.caption || ''}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          rows={6}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Caractères: {data.caption?.length || 0} / 2200
        </p>
      </div>

      {/* Hashtags */}
      <div>
        <Label>Hashtags</Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            placeholder="Ajouter un hashtag et appuyer sur Entrée..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
            fullWidth
          />
          <Button type="button" variant="outline" onClick={handleAddHashtag}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.hashtags?.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              #{tag}
              <IconButton
                icon={<X className="h-3 w-3" />}
                ariaLabel="Retirer"
                variant="ghost"
                size="xs"
                type="button"
                onClick={() => handleRemoveHashtag(index)}
                className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-0.5"
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Personnes taguées */}
      <div>
        <Label>Personnes taguées</Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newTaggedUser}
            onChange={(e) => setNewTaggedUser(e.target.value)}
            placeholder="Ajouter une personne et appuyer sur Entrée..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTaggedUser())}
            fullWidth
          />
          <Button type="button" variant="outline" onClick={handleAddTaggedUser}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.taggedUsers?.map((user, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {user}
              <IconButton
                icon={<X className="h-3 w-3" />}
                ariaLabel="Retirer"
                variant="ghost"
                size="xs"
                type="button"
                onClick={() => handleRemoveTaggedUser(index)}
                className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-0.5"
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Collaboration */}
      <div>
        <Label>Collaboration</Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={newCollaborator}
            onChange={(e) => setNewCollaborator(e.target.value)}
            placeholder="Nom du partenaire ou collaborateur"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCollaborator())}
            fullWidth
          />
          <Button type="button" variant="outline" onClick={handleAddCollaborator}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {data.collaboration && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1 pr-1">
              {data.collaboration}
              <IconButton
                icon={<X className="h-3 w-3" />}
                ariaLabel="Retirer"
                variant="ghost"
                size="xs"
                type="button"
                onClick={() => onChange({ ...data, collaboration: undefined })}
                className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded p-0.5"
              />
            </Badge>
          </div>
        )}
      </div>

      {/* Lieu */}
      <div>
        <Label htmlFor="location">Lieu</Label>
        <Input
          id="location"
          placeholder="Ex: Paris, France"
          value={data.location || ''}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
        />
      </div>

      {/* Musique (pour Reel et Story) */}
      {showMusicField && (
        <div className="border border-border-custom rounded-lg p-4 bg-muted/20">
          <div className="flex items-center gap-2 mb-3">
            <Music size={20} className="text-foreground" />
            <Label className="mb-0">Musique</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="musicTitle">Titre</Label>
              <Input
                id="musicTitle"
                placeholder="Titre de la musique"
                value={data.music?.title || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    music: { ...(data.music || {}), title: e.target.value } as PostMusic,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="musicArtist">Artiste</Label>
              <Input
                id="musicArtist"
                placeholder="Nom de l'artiste"
                value={data.music?.artist || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    music: { ...(data.music || {}), artist: e.target.value } as PostMusic,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactivité Story */}
      {showStoryInteractive && (
        <div className="border border-purple-200 dark:border-purple-900/50 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/10">
          <Label htmlFor="storyType" className="text-purple-900 dark:text-purple-300">Élément interactif</Label>
          <Select
            id="storyType"
            className="w-full px-3 py-2 mt-2"
            value={data.storyInteractive?.type || ''}
            onChange={(e) => {
              const type = e.target.value as StoryInteractive['type'];
              onChange({
                ...data,
                storyInteractive: type ? { type, data: {} } : undefined,
              });
            }}
            options={[
              { value: '', label: 'Aucun' },
              { value: 'poll', label: 'Sondage' },
              { value: 'question', label: 'Question' },
              { value: 'link', label: 'Lien' },
              { value: 'countdown', label: 'Compte à rebours' },
              { value: 'quiz', label: 'Quiz' },
            ]}
          />

          {data.storyInteractive && (
            <div className="mt-3">
              <Label htmlFor="storyQuestion" className="text-purple-900 dark:text-purple-300">Question / Texte</Label>
              <Input
                id="storyQuestion"
                placeholder="Votre question ou texte"
                value={data.storyInteractive.data.question || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    storyInteractive: {
                      ...data.storyInteractive!,
                      data: {
                        ...data.storyInteractive!.data,
                        question: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Date de publication */}
      <div>
        <Label htmlFor="scheduledDate">Date de publication prévue</Label>
        <Input
          id="scheduledDate"
          type="datetime-local"
          value={
            data.scheduledDate
              ? new Date(data.scheduledDate).toISOString().slice(0, 16)
              : ''
          }
          onChange={(e) =>
            onChange({
              ...data,
              scheduledDate: e.target.value ? new Date(e.target.value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
};
