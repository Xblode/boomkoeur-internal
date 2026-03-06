/**
 * Service Supabase - Règlement intérieur de l'association
 * Modifiable uniquement dans l'espace Présidence. Pas d'AG ni signatures.
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type { ReglementInterieur, ReglementInterieurContent } from '@/types/reglementInterieur';

interface DbReglement {
  id: string;
  org_id: string;
  content: unknown;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

function mapReglement(row: DbReglement): ReglementInterieur {
  return {
    id: row.id,
    orgId: row.org_id,
    content: (row.content ?? { sections: [] }) as ReglementInterieurContent,
    updatedBy: row.updated_by ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function getReglementInterieur(orgId?: string | null): Promise<ReglementInterieur | null> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) return null;

  const { data, error } = await supabase
    .from('association_reglement_interieur')
    .select('*')
    .eq('org_id', oid)
    .maybeSingle();

  if (error) throw error;
  return data ? mapReglement(data as DbReglement) : null;
}

export async function upsertReglementInterieur(
  content: ReglementInterieurContent,
  orgId?: string | null,
): Promise<ReglementInterieur> {
  const oid = orgId ?? getActiveOrgId();
  if (!oid) throw new Error('Aucune organisation active');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('association_reglement_interieur')
    .upsert(
      {
        org_id: oid,
        content,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'org_id',
        ignoreDuplicates: false,
      },
    )
    .select()
    .single();

  if (error) throw error;
  return mapReglement(data as DbReglement);
}
