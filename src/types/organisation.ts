export type OrgType = 'association' | 'entreprise' | 'collectif' | 'autre';
export type OrgRole = 'fondateur' | 'admin' | 'membre' | 'invite';

export type Organisation = {
  id: string;
  name: string;
  description?: string;
  type: OrgType;
  slug: string;
  logo?: string;
  createdBy: string;
  created_at: Date;
  updated_at: Date;
  /** ID du calendrier Google à synchroniser (primary ou ID partagé). Null = désactivé. */
  googleCalendarId?: string | null;
  /** Infos légales (source: statuts en vigueur, lecture seule) */
  legalSiege?: string | null;
  legalRna?: string | null;
  legalSiret?: string | null;
  /** Infos légales complémentaires (éditables) */
  legalActivitePrincipale?: string | null;
  legalCategorieJuridique?: string | null;
  legalSlogan?: string | null;
  legalTrancheEffectif?: string | null;
  legalTrancheEffectifAnnee?: number | null;
  legalCategorieEntreprise?: string | null;
  legalCategorieEntrepriseAnnee?: number | null;
  /** Documents officiels de l'État (sélectionnés via Google Drive) */
  docJoafeUrl?: string | null;
  docJoafeName?: string | null;
  docListeDirigeantsUrl?: string | null;
  docListeDirigeantsName?: string | null;
  docRecepisseCrUrl?: string | null;
  docRecepisseCrName?: string | null;
};

export type OrganisationInput = {
  name: string;
  description?: string;
  type: OrgType;
};

export type OrgMember = {
  id: string;
  orgId: string;
  userId: string;
  role: OrgRole;
  associationRole?: import('./associationStatuts').AssociationRole;
  joinedAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
};

export type OrgInvite = {
  id: string;
  orgId: string;
  token: string;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
  createdBy: string;
  created_at: Date;
};
