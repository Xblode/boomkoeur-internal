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
