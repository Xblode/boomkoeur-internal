'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, X, Copy } from 'lucide-react';
import { SocialPost, PostBrainstorming, InstagramPostType } from '@/types/communication';
import { Button, Badge, IconButton } from '@/components/ui/atoms';
import { StepBrainstorming } from './StepBrainstorming';
import { StepContent } from './StepContent';
import { InstagramPostPreview, InstagramStoryPreview } from '../Previews';

type WizardStep = 'brainstorming' | 'content' | 'preview';

interface PostCreationWizardProps {
  campaignId: string;
  initialData?: SocialPost;
  onSave?: (post: Partial<SocialPost>) => void;
  onCancel?: () => void;
}

// ...

export const PostCreationWizard: React.FC<PostCreationWizardProps> = ({
  campaignId,
  initialData,
  onSave,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialData ? 'content' : 'brainstorming');
  
  const [postData, setPostData] = useState<Partial<SocialPost>>({
    campaignId,
    platform: 'instagram',
    status: 'brainstorming',
    media: [],
    caption: '',
    hashtags: [],
    taggedUsers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialData
  });

  const [brainstormingData, setBrainstormingData] = useState<Partial<PostBrainstorming>>(
    initialData?.brainstorming || {}
  );

  useEffect(() => {
    if (initialData) {
      setPostData({
        ...initialData,
        campaignId // Ensure campaignId is preserved
      });
      setBrainstormingData(initialData.brainstorming || {});
      setCurrentStep('content'); // Si on édite, on va direct au contenu
    }
  }, [initialData, campaignId]);

  const steps: { id: WizardStep; label: string; description: string }[] = [
    {
      id: 'brainstorming',
      label: 'Brainstorming',
      description: 'Idéation et planification',
    },
    {
      id: 'content',
      label: 'Contenu',
      description: 'Médias et textes',
    },
    {
      id: 'preview',
      label: 'Prévisualisation',
      description: 'Aperçu final',
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const canGoNext = () => {
    if (currentStep === 'brainstorming') {
      return (
        brainstormingData.objective &&
        brainstormingData.format &&
        brainstormingData.brief
      );
    }
    // Médias et caption ne sont plus obligatoires
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'brainstorming') {
      // Transférer les données du brainstorming dans le post et sauvegarder
      const postWithBrainstorming = {
        ...postData,
        type: brainstormingData.format as InstagramPostType,
        brainstorming: brainstormingData as PostBrainstorming,
        status: 'brainstorming' as const,
        updatedAt: new Date(),
      };
      setPostData(postWithBrainstorming);
      
      // Sauvegarder le post après le brainstorming
      onSave?.(postWithBrainstorming);
      
      setCurrentStep('content');
    } else if (currentStep === 'content') {
      setCurrentStep('preview');
    }
  };

  const handleBack = () => {
    if (currentStep === 'content') {
      setCurrentStep('brainstorming');
    } else if (currentStep === 'preview') {
      setCurrentStep('content');
    }
  };

  const handleSave = () => {
    const finalPost: Partial<SocialPost> = {
      ...postData,
      status: 'created',
      updatedAt: new Date(),
    };
    onSave?.(finalPost);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // Vous pourriez ajouter une notification toast ici
  };

  return (
    <div className="h-full flex flex-col bg-card-bg">
      {/* Header */}
      <div className="border-b border-border-custom px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? 'Modifier le post' : 'Créer un post'}
          </h2>
          <IconButton
            icon={<X size={24} />}
            ariaLabel="Annuler"
            variant="ghost"
            size="lg"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentStepIndex === index
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50'
                    : currentStepIndex > index
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50'
                    : 'border-2 border-zinc-300 dark:border-zinc-700 text-muted-foreground'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStepIndex === index
                      ? 'bg-blue-500 text-white'
                      : currentStepIndex > index
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-zinc-400 dark:border-zinc-600 text-muted-foreground'
                  }`}
                >
                  {currentStepIndex > index ? <Check size={14} /> : index + 1}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold">{step.label}</div>
                  <div className="text-xs opacity-75">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-border-custom mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full p-6">
          {currentStep === 'brainstorming' && (
            <StepBrainstorming
              data={brainstormingData}
              onChange={setBrainstormingData}
            />
          )}

          {currentStep === 'content' && (
            <StepContent data={postData} onChange={setPostData} />
          )}

          {currentStep === 'preview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Colonne gauche - Contenu copiable */}
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1">
                    📝 Contenu du post
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Cliquez sur les boutons pour copier rapidement le contenu
                  </p>
                </div>

                {/* Légende */}
                {postData.caption && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Légende</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyText(postData.caption || '')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                      {postData.caption}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {postData.hashtags && postData.hashtags.length > 0 && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Hashtags</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyText(postData.hashtags?.map(h => `#${h}`).join(' ') || '')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {postData.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personnes taguées */}
                {postData.taggedUsers && postData.taggedUsers.length > 0 && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">Personnes taguées</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyText(postData.taggedUsers?.join(', ') || '')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copier
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {postData.taggedUsers.map((user, index) => (
                        <Badge key={index} variant="secondary">
                          {user}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autres infos */}
                {(postData.location || postData.collaboration) && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 space-y-2">
                    {postData.location && (
                      <div className="text-sm">
                        <span className="font-semibold">Lieu :</span> {postData.location}
                      </div>
                    )}
                    {postData.collaboration && (
                      <div className="text-sm">
                        <span className="font-semibold">Collaboration :</span> {postData.collaboration}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colonne droite - Prévisualisation en mode nuit */}
              <div className="flex flex-col items-center justify-center bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                <div className="w-full max-w-md">
                  {postData.type === 'story' ? (
                    <InstagramStoryPreview post={postData as SocialPost} />
                  ) : (
                    <InstagramPostPreview post={postData as SocialPost} />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border-custom px-6 py-4 flex items-center justify-between bg-muted/20">
        <div>
          {currentStep !== 'brainstorming' && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={16} className="mr-2" />
              Retour
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>

          {currentStep === 'preview' ? (
            <Button variant="primary" onClick={handleSave}>
              <Check size={16} className="mr-2" />
              Sauvegarder le post
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Suivant
              <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
