/**
 * Service Supabase - Statuts d'association
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type {
  AssociationStatut,
  StatutContent,
  StatutProposal,
  StatutSignature,
  StatutStatus,
  ProposalStatus,
} from '@/types/associationStatuts';
import type { AssociationRole } from '@/types/associationStatuts';

// ---------------------------------------------------------------------------
// DB row types
// ---------------------------------------------------------------------------

interface DbStatut {
  id: string;
  org_id: string;
  version_number: number;
  adopted_at: string | null;
  content: unknown;
  status: string;
  meeting_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface DbProposal {
  id: string;
  org_id: string;
  proposed_by: string;
  title: string;
  description: string | null;
  content: unknown;
  status: string;
  created_at: string;
  updated_at: string;
}

interface DbSignature {
  id: string;
  statut_version_id: string;
  user_id: string;
  signed_at: string | null;
  external_signature_id: string | null;
  external_provider: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function mapStatut(row: DbStatut): AssociationStatut {
  return {
    id: row.id,
    orgId: row.org_id,
    versionNumber: row.version_number,
    adoptedAt: row.adopted_at ? new Date(row.adopted_at) : undefined,
    content: (row.content ?? { sections: [] }) as StatutContent,
    status: row.status as StatutStatus,
    meetingId: row.meeting_id ?? undefined,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapProposal(row: DbProposal): StatutProposal {
  return {
    id: row.id,
    orgId: row.org_id,
    proposedBy: row.proposed_by,
    title: row.title,
    description: row.description ?? undefined,
    content: (row.content ?? {}) as Partial<StatutContent>,
    status: row.status as ProposalStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapSignature(row: DbSignature): StatutSignature {
  return {
    id: row.id,
    statutVersionId: row.statut_version_id,
    userId: row.user_id,
    signedAt: row.signed_at ? new Date(row.signed_at) : undefined,
    externalSignatureId: row.external_signature_id ?? undefined,
    externalProvider: row.external_provider as StatutSignature['externalProvider'],
    createdAt: new Date(row.created_at),
  };
}

// ---------------------------------------------------------------------------
// Statuts CRUD
// ---------------------------------------------------------------------------

export async function getStatuts(orgId?: string | null): Promise<AssociationStatut[]> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) return [];
  const { data, error } = await supabase
    .from('association_statuts')
    .select('*')
    .eq('org_id', oid)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: DbStatut) => mapStatut(r));
}

export async function getStatutInForce(orgId?: string | null): Promise<AssociationStatut | null> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) return null;
  const { data, error } = await supabase
    .from('association_statuts')
    .select('*')
    .eq('org_id', oid)
    .eq('status', 'in_force')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapStatut(data as DbStatut) : null;
}

export async function getDraftStatut(orgId?: string | null): Promise<AssociationStatut | null> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) return null;
  const { data, error } = await supabase
    .from('association_statuts')
    .select('*')
    .eq('org_id', oid)
    .eq('status', 'draft')
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapStatut(data as DbStatut) : null;
}

export async function getStatutById(id: string): Promise<AssociationStatut | null> {
  const { data, error } = await supabase
    .from('association_statuts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return mapStatut(data as DbStatut);
}

export async function createStatut(
  content: StatutContent,
  status: StatutStatus = 'draft',
): Promise<AssociationStatut> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const existing = await getStatuts(orgId);
  const nextVersion = existing.length > 0 ? Math.max(...existing.map((s) => s.versionNumber)) + 1 : 1;

  const { data, error } = await supabase
    .from('association_statuts')
    .insert({
      org_id: orgId,
      version_number: nextVersion,
      content,
      status,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return mapStatut(data as DbStatut);
}

export async function updateStatut(
  id: string,
  updates: Partial<Pick<AssociationStatut, 'content' | 'status' | 'adoptedAt' | 'meetingId'>>,
): Promise<AssociationStatut | null> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.adoptedAt !== undefined) payload.adopted_at = updates.adoptedAt instanceof Date ? updates.adoptedAt.toISOString() : updates.adoptedAt;
  if (updates.meetingId !== undefined) payload.meeting_id = updates.meetingId;

  const { data, error } = await supabase
    .from('association_statuts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return mapStatut(data as DbStatut);
}

/**
 * Validate a statut version: set to in_force, archive previous, update legal info on org.
 * @param adoptedAt - Date d'adoption (optionnelle, défaut: aujourd'hui)
 */
export async function validateStatut(id: string, adoptedAt?: Date): Promise<AssociationStatut | null> {
  const statut = await getStatutById(id);
  if (!statut) return null;

  const currentInForce = await getStatutInForce(statut.orgId);
  if (currentInForce && currentInForce.id !== id) {
    await updateStatut(currentInForce.id, { status: 'archived' });
  }

  const adoptionDate = adoptedAt ?? new Date();
  const updated = await updateStatut(id, {
    status: 'in_force',
    adoptedAt: adoptionDate,
  });

  if (updated?.content) {
    await supabase
      .from('organisations')
      .update({
        legal_siege: updated.content.legalSiege ?? null,
        legal_rna: updated.content.legalRna ?? null,
        legal_siret: updated.content.legalSiret ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', statut.orgId);
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Proposals CRUD
// ---------------------------------------------------------------------------

export async function getProposals(orgId?: string | null): Promise<StatutProposal[]> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) return [];
  const { data, error } = await supabase
    .from('association_statut_proposals')
    .select('*')
    .eq('org_id', oid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: DbProposal) => mapProposal(r));
}

export async function createProposal(
  title: string,
  description: string,
  content: Partial<StatutContent>,
): Promise<StatutProposal> {
  const orgId = getActiveOrgId();
  if (!orgId) throw new Error('Aucune organisation active');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('association_statut_proposals')
    .insert({
      org_id: orgId,
      proposed_by: user.id,
      title,
      description,
      content,
    })
    .select()
    .single();
  if (error) throw error;
  return mapProposal(data as DbProposal);
}

export async function updateProposalStatus(id: string, status: ProposalStatus): Promise<void> {
  const { error } = await supabase
    .from('association_statut_proposals')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Signatures CRUD
// ---------------------------------------------------------------------------

export async function getSignatures(statutVersionId: string): Promise<StatutSignature[]> {
  const { data, error } = await supabase
    .from('association_statut_signatures')
    .select('*')
    .eq('statut_version_id', statutVersionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: DbSignature) => mapSignature(r));
}

export async function createSignatureRequest(statutVersionId: string, userIds: string[]): Promise<void> {
  const rows = userIds.map((uid) => ({
    statut_version_id: statutVersionId,
    user_id: uid,
  }));
  const { error } = await supabase
    .from('association_statut_signatures')
    .upsert(rows, { onConflict: 'statut_version_id,user_id' });
  if (error) throw error;
}

export async function signStatut(signatureId: string, externalId?: string, provider?: string): Promise<void> {
  const payload: Record<string, unknown> = { signed_at: new Date().toISOString() };
  if (externalId) payload.external_signature_id = externalId;
  if (provider) payload.external_provider = provider;
  const { error } = await supabase
    .from('association_statut_signatures')
    .update(payload)
    .eq('id', signatureId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Association Role helpers
// ---------------------------------------------------------------------------

export async function getAssociationRole(orgId: string, userId: string): Promise<AssociationRole | null> {
  const { data, error } = await supabase
    .from('organisation_members')
    .select('association_role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  return (data.association_role ?? 'membre') as AssociationRole;
}

export async function updateAssociationRole(orgId: string, userId: string, role: AssociationRole): Promise<void> {
  const { error } = await supabase
    .from('organisation_members')
    .update({ association_role: role, updated_at: new Date().toISOString() })
    .eq('org_id', orgId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function getSignableMembers(orgId: string): Promise<{ userId: string; name: string; associationRole: AssociationRole }[]> {
  const { data, error } = await supabase
    .from('organisation_members')
    .select('user_id, association_role, profiles!inner(first_name, last_name)')
    .eq('org_id', orgId)
    .not('association_role', 'eq', 'benevole');

  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as Record<string, unknown> | null;
    return {
      userId: row.user_id as string,
      name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim(),
      associationRole: (row.association_role ?? 'membre') as AssociationRole,
    };
  });
}
