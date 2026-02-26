/**
 * Service Commercial - Supabase
 * Remplace lib/services/CommercialService (localStorage) pour le module Commercial/CRM
 */

import { supabase } from './client';
import { getActiveOrgId } from './activeOrg';
import type {
  CommercialContact,
  ContactNote,
  CommercialContactInput,
  ContactNoteInput,
  CommercialStats,
} from '@/types/commercial';

// --- Types DB (snake_case) ---
interface DbContact {
  id: string;
  type: string;
  status: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  website: string | null;
  address: unknown;
  contact_person: string | null;
  position: string | null;
  linked_product_ids: unknown;
  linked_order_ids: unknown;
  linked_invoice_ids: unknown;
  notes: string | null;
  tags: unknown;
  last_contact_at: string | null;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

interface DbNote {
  id: string;
  contact_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// --- Mappers ---
function mapDbContactToContact(row: DbContact): CommercialContact {
  const address = row.address as Record<string, string> | null;
  return {
    id: row.id,
    type: row.type as CommercialContact['type'],
    status: row.status as CommercialContact['status'],
    name: row.name ?? '',
    company: row.company ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    mobile: row.mobile ?? undefined,
    website: row.website ?? undefined,
    address: address && Object.keys(address).length > 0 ? address : undefined,
    contact_person: row.contact_person ?? undefined,
    position: row.position ?? undefined,
    linked_product_ids: Array.isArray(row.linked_product_ids) ? row.linked_product_ids as string[] : [],
    linked_order_ids: Array.isArray(row.linked_order_ids) ? row.linked_order_ids as string[] : [],
    linked_invoice_ids: Array.isArray(row.linked_invoice_ids) ? row.linked_invoice_ids as string[] : [],
    notes: row.notes ?? undefined,
    tags: Array.isArray(row.tags) ? row.tags as string[] : [],
    last_contact_at: row.last_contact_at ?? undefined,
    is_favorite: row.is_favorite ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapDbNoteToNote(row: DbNote): ContactNote {
  return {
    id: row.id,
    contact_id: row.contact_id,
    content: row.content,
    created_by: row.created_by ?? 'Utilisateur',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Payload complet pour create (tous les champs requis) */
function contactToDbPayloadFull(input: Partial<CommercialContactInput> | Partial<CommercialContact>): Record<string, unknown> {
  return {
    type: input.type ?? 'contact',
    status: input.status ?? 'lead',
    name: input.name ?? '',
    company: input.company ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    mobile: input.mobile ?? null,
    website: input.website ?? null,
    address: input.address ?? {},
    contact_person: input.contact_person ?? null,
    position: input.position ?? null,
    linked_product_ids: input.linked_product_ids ?? [],
    linked_order_ids: input.linked_order_ids ?? [],
    linked_invoice_ids: input.linked_invoice_ids ?? [],
    notes: input.notes ?? null,
    tags: input.tags ?? [],
    last_contact_at: input.last_contact_at ?? null,
    is_favorite: input.is_favorite ?? false,
    updated_at: new Date().toISOString(),
  };
}

/** Payload partiel pour update (uniquement les champs fournis) */
function contactToDbPayloadPartial(updates: Partial<CommercialContactInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const keys = ['type', 'status', 'name', 'company', 'email', 'phone', 'mobile', 'website', 'address', 'contact_person', 'position', 'linked_product_ids', 'linked_order_ids', 'linked_invoice_ids', 'notes', 'tags', 'last_contact_at', 'is_favorite'] as const;
  for (const key of keys) {
    if (key in updates) {
      const v = updates[key];
      payload[key] = v ?? (key === 'address' ? {} : ['linked_product_ids', 'linked_order_ids', 'linked_invoice_ids', 'tags'].includes(key) ? [] : null);
    }
  }
  return payload;
}

// --- API Contacts ---

export async function getCommercialContacts(orgId?: string | null): Promise<CommercialContact[]> {
  const resolvedOrgId = orgId ?? getActiveOrgId();
  if (!resolvedOrgId) return [];
  const query = supabase
    .from('commercial_contacts')
    .select('*')
    .eq('org_id', resolvedOrgId)
    .order('name', { ascending: true });
  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((row: DbContact) => mapDbContactToContact(row));
}

export async function getCommercialContactById(id: string): Promise<CommercialContact | null> {
  const { data, error } = await supabase
    .from('commercial_contacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return mapDbContactToContact(data as DbContact);
}

export async function createCommercialContact(input: CommercialContactInput): Promise<CommercialContact> {
  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id ?? null;

  const payload = contactToDbPayloadFull(input);
  const { data: inserted, error } = await supabase
    .from('commercial_contacts')
    .insert({
      ...payload,
      created_by: createdBy,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbContactToContact(inserted as DbContact);
}

export async function updateCommercialContact(
  id: string,
  updates: Partial<CommercialContactInput>
): Promise<CommercialContact | null> {
  const payload = contactToDbPayloadPartial(updates);
  const { data, error } = await supabase
    .from('commercial_contacts')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return mapDbContactToContact(data as DbContact);
}

export async function deleteCommercialContact(id: string): Promise<boolean> {
  const { error } = await supabase.from('commercial_contacts').delete().eq('id', id);
  return !error;
}

// --- API Notes ---

export async function getContactNotes(contactId: string): Promise<ContactNote[]> {
  const orgId = getActiveOrgId();
  let query = supabase.from('contact_notes').select('*').eq('contact_id', contactId);
  if (orgId) query = query.eq('org_id', orgId);
  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((row: DbNote) => mapDbNoteToNote(row));
}

export async function addContactNote(input: ContactNoteInput): Promise<ContactNote> {
  const { data: { user } } = await supabase.auth.getUser();
  const createdBy = user?.id ?? null;

  const { data: inserted, error } = await supabase
    .from('contact_notes')
    .insert({
      contact_id: input.contact_id,
      content: input.content,
      created_by: createdBy,
      org_id: getActiveOrgId(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbNoteToNote(inserted as DbNote);
}

export async function deleteContactNote(noteId: string): Promise<boolean> {
  const { error } = await supabase.from('contact_notes').delete().eq('id', noteId);
  return !error;
}

// --- Stats ---

export async function getCommercialStats(): Promise<CommercialStats> {
  const contacts = await getCommercialContacts();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    total_contacts: contacts.length,
    active_contacts: contacts.filter((c) => c.status === 'active').length,
    new_leads: contacts.filter((c) => c.status === 'lead').length,
    contacts_by_type: {
      supplier: contacts.filter((c) => c.type === 'supplier').length,
      contact: contacts.filter((c) => c.type === 'contact').length,
      partner: contacts.filter((c) => c.type === 'partner').length,
      lieu: contacts.filter((c) => c.type === 'lieu').length,
    },
    contacts_by_status: {
      active: contacts.filter((c) => c.status === 'active').length,
      inactive: contacts.filter((c) => c.status === 'inactive').length,
      lead: contacts.filter((c) => c.status === 'lead').length,
    },
    recent_activity_count: contacts.filter(
      (c) => c.last_contact_at && new Date(c.last_contact_at) >= sevenDaysAgo
    ).length,
  };
}
