/**
 * Service Organisations - Supabase
 * CRUD organisations + membres + invitations
 */

import { supabase } from './client';
import type { Organisation, OrganisationInput, OrgMember, OrgInvite, OrgRole } from '@/types/organisation';
import type { AssociationRole } from '@/types/associationStatuts';

// --- DB types ---
interface DbOrg {
  id: string;
  name: string;
  description: string | null;
  type: string;
  slug: string;
  logo: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  google_calendar_id?: string | null;
  legal_siege?: string | null;
  legal_rna?: string | null;
  legal_siret?: string | null;
  legal_activite_principale?: string | null;
  legal_categorie_juridique?: string | null;
  legal_slogan?: string | null;
  legal_tranche_effectif?: string | null;
  legal_tranche_effectif_annee?: number | null;
  legal_categorie_entreprise?: string | null;
  legal_categorie_entreprise_annee?: number | null;
  doc_joafe_url?: string | null;
  doc_joafe_name?: string | null;
  doc_liste_dirigeants_url?: string | null;
  doc_liste_dirigeants_name?: string | null;
  doc_recepisse_cr_url?: string | null;
  doc_recepisse_cr_name?: string | null;
}

interface DbOrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
}

interface DbOrgInvite {
  id: string;
  org_id: string;
  token: string;
  expires_at: string;
  max_uses: number;
  used_count: number;
  created_by: string;
  created_at: string;
}

// --- Mappers ---
function mapDbOrg(row: DbOrg): Organisation {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    type: row.type as Organisation['type'],
    slug: row.slug,
    logo: row.logo ?? undefined,
    createdBy: row.created_by,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
    googleCalendarId: row.google_calendar_id ?? undefined,
    legalSiege: row.legal_siege ?? undefined,
    legalRna: row.legal_rna ?? undefined,
    legalSiret: row.legal_siret ?? undefined,
    legalActivitePrincipale: row.legal_activite_principale ?? undefined,
    legalCategorieJuridique: row.legal_categorie_juridique ?? undefined,
    legalSlogan: row.legal_slogan ?? undefined,
    legalTrancheEffectif: row.legal_tranche_effectif ?? undefined,
    legalTrancheEffectifAnnee: row.legal_tranche_effectif_annee ?? undefined,
    legalCategorieEntreprise: row.legal_categorie_entreprise ?? undefined,
    legalCategorieEntrepriseAnnee: row.legal_categorie_entreprise_annee ?? undefined,
    docJoafeUrl: row.doc_joafe_url ?? undefined,
    docJoafeName: row.doc_joafe_name ?? undefined,
    docListeDirigeantsUrl: row.doc_liste_dirigeants_url ?? undefined,
    docListeDirigeantsName: row.doc_liste_dirigeants_name ?? undefined,
    docRecepisseCrUrl: row.doc_recepisse_cr_url ?? undefined,
    docRecepisseCrName: row.doc_recepisse_cr_name ?? undefined,
  };
}

function mapDbInvite(row: DbOrgInvite): OrgInvite {
  return {
    id: row.id,
    orgId: row.org_id,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    maxUses: row.max_uses,
    usedCount: row.used_count,
    createdBy: row.created_by,
    created_at: new Date(row.created_at),
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Organisations ---

/** Récupère les organisations de l'utilisateur. Passe userId pour éviter un appel getUser() redondant. */
export async function getUserOrganisations(userId?: string): Promise<Organisation[]> {
  let uid = userId;
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');
    uid = user.id;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', uid)
    .single();

  if (profile?.is_super_admin) {
    const { data, error } = await supabase
      .from('organisations')
      .select('*')
      .order('name');
    if (error) throw error;
    return (data ?? []).map(mapDbOrg);
  }

  const { data: members, error: membersErr } = await supabase
    .from('organisation_members')
    .select('org_id')
    .eq('user_id', uid);

  if (membersErr) throw membersErr;
  if (!members?.length) return [];

  const orgIds = members.map((m) => m.org_id);
  const { data, error } = await supabase
    .from('organisations')
    .select('*')
    .in('id', orgIds)
    .order('name');

  if (error) throw error;
  return (data ?? []).map(mapDbOrg);
}

export async function getOrganisationById(id: string): Promise<Organisation | null> {
  const { data, error } = await supabase
    .from('organisations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data ? mapDbOrg(data) : null;
}

export async function createOrganisation(input: OrganisationInput): Promise<Organisation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Utilise la fonction RPC SECURITY DEFINER pour eviter les problemes RLS
  // (session/auth.uid() parfois non transmis correctement au premier insert)
  const { data: org, error } = await supabase
    .rpc('create_organisation', {
      p_name: input.name.trim(),
      p_description: input.description?.trim() || null,
      p_type: input.type,
    });

  if (error) throw error;
  if (!org) throw new Error('Erreur lors de la création');

  return mapDbOrg(org);
}

export async function updateOrganisation(
  id: string,
  input: Partial<
    Pick<OrganisationInput, 'name' | 'description' | 'type'> & {
      logo?: string;
      googleCalendarId?: string | null;
      legalActivitePrincipale?: string | null;
      legalCategorieJuridique?: string | null;
      legalSlogan?: string | null;
      legalTrancheEffectif?: string | null;
      legalTrancheEffectifAnnee?: number | null;
      legalCategorieEntreprise?: string | null;
      legalCategorieEntrepriseAnnee?: number | null;
      docJoafeUrl?: string | null;
      docJoafeName?: string | null;
      docListeDirigeantsUrl?: string | null;
      docListeDirigeantsName?: string | null;
      docRecepisseCrUrl?: string | null;
      docRecepisseCrName?: string | null;
    }
  >
): Promise<Organisation | null> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.description !== undefined) payload.description = input.description?.trim() ?? null;
  if (input.type !== undefined) payload.type = input.type;
  if (input.logo !== undefined) payload.logo = input.logo;
  if (input.googleCalendarId !== undefined) payload.google_calendar_id = input.googleCalendarId?.trim() || null;
  if (input.legalActivitePrincipale !== undefined) payload.legal_activite_principale = input.legalActivitePrincipale?.trim() || null;
  if (input.legalCategorieJuridique !== undefined) payload.legal_categorie_juridique = input.legalCategorieJuridique?.trim() || null;
  if (input.legalSlogan !== undefined) payload.legal_slogan = input.legalSlogan?.trim() || null;
  if (input.legalTrancheEffectif !== undefined) payload.legal_tranche_effectif = input.legalTrancheEffectif?.trim() || null;
  if (input.legalTrancheEffectifAnnee !== undefined) payload.legal_tranche_effectif_annee = input.legalTrancheEffectifAnnee ?? null;
  if (input.legalCategorieEntreprise !== undefined) payload.legal_categorie_entreprise = input.legalCategorieEntreprise?.trim() || null;
  if (input.legalCategorieEntrepriseAnnee !== undefined) payload.legal_categorie_entreprise_annee = input.legalCategorieEntrepriseAnnee ?? null;
  if (input.docJoafeUrl !== undefined) payload.doc_joafe_url = input.docJoafeUrl?.trim() || null;
  if (input.docJoafeName !== undefined) payload.doc_joafe_name = input.docJoafeName?.trim() || null;
  if (input.docListeDirigeantsUrl !== undefined) payload.doc_liste_dirigeants_url = input.docListeDirigeantsUrl?.trim() || null;
  if (input.docListeDirigeantsName !== undefined) payload.doc_liste_dirigeants_name = input.docListeDirigeantsName?.trim() || null;
  if (input.docRecepisseCrUrl !== undefined) payload.doc_recepisse_cr_url = input.docRecepisseCrUrl?.trim() || null;
  if (input.docRecepisseCrName !== undefined) payload.doc_recepisse_cr_name = input.docRecepisseCrName?.trim() || null;

  const { data, error } = await supabase
    .from('organisations')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data ? mapDbOrg(data) : null;
}

export async function deleteOrganisation(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('organisations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// --- Membres ---

export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from('organisation_members')
    .select('*, profiles(first_name, last_name, email, avatar)')
    .eq('org_id', orgId)
    .order('joined_at');

  if (error) throw error;

  return (data ?? []).map((row: DbOrgMember & { profiles: { first_name: string; last_name: string; email: string; avatar: string | null } }) => ({
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    role: row.role as OrgRole,
    associationRole: ((row as unknown as Record<string, unknown>).association_role as AssociationRole | undefined) ?? undefined,
    joinedAt: new Date(row.joined_at),
    profile: {
      firstName: row.profiles?.first_name ?? '',
      lastName: row.profiles?.last_name ?? '',
      email: row.profiles?.email ?? '',
      avatar: row.profiles?.avatar ?? undefined,
    },
  }));
}

export async function updateMemberRole(orgId: string, userId: string, role: OrgRole): Promise<void> {
  const { error } = await supabase
    .from('organisation_members')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('organisation_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function leaveOrganisation(orgId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await removeMember(orgId, user.id);
}

// --- Invitations ---

export async function createInviteLink(orgId: string, expiresInHours = 72): Promise<OrgInvite> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('organisation_invites')
    .insert({
      org_id: orgId,
      expires_at: expiresAt,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbInvite(data);
}

export async function getInviteByToken(token: string): Promise<(OrgInvite & { orgName: string }) | null> {
  const { data, error } = await supabase
    .from('organisation_invites')
    .select('*, organisations(name)')
    .eq('token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;

  return {
    ...mapDbInvite(data),
    orgName: (data as unknown as { organisations: { name: string } }).organisations?.name ?? '',
  };
}

export async function joinByInvite(token: string): Promise<Organisation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const invite = await getInviteByToken(token);
  if (!invite) throw new Error('Invitation introuvable');
  if (new Date(invite.expiresAt) < new Date()) throw new Error('Invitation expirée');
  if (invite.usedCount >= invite.maxUses) throw new Error('Invitation déjà utilisée');

  const { data: existingMember } = await supabase
    .from('organisation_members')
    .select('id')
    .eq('org_id', invite.orgId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingMember) throw new Error('Vous êtes déjà membre de cette organisation');

  const { error: memberErr } = await supabase
    .from('organisation_members')
    .insert({
      org_id: invite.orgId,
      user_id: user.id,
      role: 'membre',
    });

  if (memberErr) throw memberErr;

  await supabase
    .from('organisation_invites')
    .update({ used_count: invite.usedCount + 1 })
    .eq('id', invite.id);

  const org = await getOrganisationById(invite.orgId);
  if (!org) throw new Error('Organisation introuvable');
  return org;
}

/** Récupère le rôle de l'utilisateur dans une org. Passe userId pour éviter un appel getUser() redondant. */
export async function getUserRoleInOrg(orgId: string, userId?: string): Promise<OrgRole | null> {
  let uid = userId;
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    uid = user.id;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', uid)
    .single();

  if (profile?.is_super_admin) return 'admin';

  const { data, error } = await supabase
    .from('organisation_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', uid)
    .single();

  if (error || !data) return null;
  return data.role as OrgRole;
}
