// Types pour le module Statuts d'association

export type AssociationRole =
  | 'president'
  | 'secretaire'
  | 'tresorier'
  | 'vice_tresorier'
  | 'dir_strategique'
  | 'dir_marketing'
  | 'dir_artistique'
  | 'dir_logistique'
  | 'dir_commerciale'
  | 'dj'
  | 'membre'
  | 'benevole';

export const ASSOCIATION_ROLE_OPTIONS: { value: AssociationRole; label: string }[] = [
  { value: 'president', label: 'Président' },
  { value: 'secretaire', label: 'Secrétaire' },
  { value: 'tresorier', label: 'Trésorier' },
  { value: 'vice_tresorier', label: 'Vice-Trésorier' },
  { value: 'dir_strategique', label: 'Dir. Stratégique' },
  { value: 'dir_marketing', label: 'Dir. Marketing' },
  { value: 'dir_artistique', label: 'Dir. Artistique' },
  { value: 'dir_logistique', label: 'Dir. Logistique' },
  { value: 'dir_commerciale', label: 'Dir. Commerciale' },
  { value: 'dj', label: 'DJ' },
  { value: 'membre', label: 'Membre' },
  { value: 'benevole', label: 'Bénévole' },
];

export const ASSOCIATION_ROLE_LABELS: Record<AssociationRole, string> = {
  president: 'Président',
  secretaire: 'Secrétaire',
  tresorier: 'Trésorier',
  vice_tresorier: 'Vice-Trésorier',
  dir_strategique: 'Dir. Stratégique',
  dir_marketing: 'Dir. Marketing',
  dir_artistique: 'Dir. Artistique',
  dir_logistique: 'Dir. Logistique',
  dir_commerciale: 'Dir. Commerciale',
  dj: 'DJ',
  membre: 'Membre',
  benevole: 'Bénévole',
};

/** Rôles pouvant signer les statuts (pas invité ni bénévole) */
export const SIGNABLE_ROLES: AssociationRole[] = [
  'president', 'secretaire', 'tresorier', 'vice_tresorier',
  'dir_strategique', 'dir_marketing', 'dir_artistique',
  'dir_logistique', 'dir_commerciale', 'dj', 'membre',
];

export type StatutStatus = 'draft' | 'pending_vote' | 'pending_signatures' | 'in_force' | 'archived';

export type MeetingType = 'standard' | 'assemblee_generale';

export interface StatutArticle {
  id: string;
  title: string;
  body: string;
}

export interface StatutSection {
  id: string;
  title: string;
  articles: StatutArticle[];
}

/** Structure du contenu des statuts (loi 1901) */
export interface StatutContent {
  sections: StatutSection[];
  legalSiege?: string;
  legalRna?: string;
  legalSiret?: string;
}

/** Version d'un statut en BDD */
export interface AssociationStatut {
  id: string;
  orgId: string;
  versionNumber: number;
  adoptedAt?: Date;
  content: StatutContent;
  status: StatutStatus;
  meetingId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProposalStatus = 'pending' | 'merged' | 'rejected';

export interface StatutProposal {
  id: string;
  orgId: string;
  proposedBy: string;
  proposedByName?: string;
  title: string;
  description?: string;
  content: Partial<StatutContent>;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatutSignature {
  id: string;
  statutVersionId: string;
  userId: string;
  userName?: string;
  signedAt?: Date;
  externalSignatureId?: string;
  externalProvider?: 'yousign' | 'docusign';
  createdAt: Date;
}

/** Default content template for loi 1901 statuts */
export const DEFAULT_STATUT_CONTENT: StatutContent = {
  sections: [
    {
      id: 'titre-1',
      title: 'Titre I - Formation et objet de l\'association',
      articles: [
        { id: 'art-1', title: 'Article 1 - Dénomination', body: '' },
        { id: 'art-2', title: 'Article 2 - Objet', body: '' },
        { id: 'art-3', title: 'Article 3 - Siège social', body: '' },
        { id: 'art-4', title: 'Article 4 - Durée', body: '' },
      ],
    },
    {
      id: 'titre-2',
      title: 'Titre II - Composition de l\'association',
      articles: [
        { id: 'art-5', title: 'Article 5 - Membres', body: '' },
        { id: 'art-6', title: 'Article 6 - Admission', body: '' },
        { id: 'art-7', title: 'Article 7 - Radiation', body: '' },
      ],
    },
    {
      id: 'titre-3',
      title: 'Titre III - Administration et fonctionnement',
      articles: [
        { id: 'art-8', title: 'Article 8 - Assemblée générale ordinaire', body: '' },
        { id: 'art-9', title: 'Article 9 - Assemblée générale extraordinaire', body: '' },
        { id: 'art-10', title: 'Article 10 - Bureau', body: '' },
        { id: 'art-11', title: 'Article 11 - Réunion du bureau', body: '' },
      ],
    },
    {
      id: 'titre-4',
      title: 'Titre IV - Ressources',
      articles: [
        { id: 'art-12', title: 'Article 12 - Ressources', body: '' },
      ],
    },
    {
      id: 'titre-5',
      title: 'Titre V - Modification des statuts et dissolution',
      articles: [
        { id: 'art-13', title: 'Article 13 - Modification des statuts', body: '' },
        { id: 'art-14', title: 'Article 14 - Dissolution', body: '' },
      ],
    },
  ],
};
