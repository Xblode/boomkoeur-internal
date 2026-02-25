'use client';

import { useState, useEffect, useRef } from 'react';
import {
  createCommercialContact,
  updateCommercialContact,
  deleteCommercialContact,
} from '@/lib/supabase/commercial';
import { CommercialContact, ContactType, ContactStatus } from '@/types/commercial';
import type { ColumnDef } from '@/types/tableColumns';
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  Globe,
  User,
  Users,
  Plus,
} from 'lucide-react';
import { Button, IconButton, Input, Select, Skeleton, Textarea } from '@/components/ui/atoms';
import { SectionHeader, SearchInput, FilterField, EmptyState, SchemaTable } from '@/components/ui/molecules';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS = [
  { value: 'supplier' as ContactType, label: 'Fournisseur' },
  { value: 'contact' as ContactType, label: 'Contact' },
  { value: 'partner' as ContactType, label: 'Partenaire' },
];

const STATUS_OPTIONS = [
  { value: 'lead' as ContactStatus, label: 'Lead' },
  { value: 'active' as ContactStatus, label: 'Actif' },
  { value: 'inactive' as ContactStatus, label: 'Inactif' },
];

type EditableDetailProps = {
  icon: React.ReactNode;
  contact: CommercialContact;
  field: string;
  editingCell: { id: string; field: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onStartEdit: (id: string, field: string, value: string) => void;
  onSave: (id: string, field: string) => void;
  onCancelEdit: () => void;
  renderDisplay: (v: string) => React.ReactNode;
  placeholder?: string;
  textarea?: boolean;
  className?: string;
};

function EditableDetail({
  icon,
  contact,
  field,
  editingCell,
  editValue,
  setEditValue,
  inputRef,
  onStartEdit,
  onSave,
  onCancelEdit,
  renderDisplay,
  placeholder,
  textarea,
  className,
}: EditableDetailProps) {
  const value = (contact as Record<string, unknown>)[field] as string | undefined;
  const isEditing = editingCell?.id === contact.id && editingCell?.field === field;
  const display = renderDisplay(value || '');

  if (!display && !isEditing) {
    return (
      <div
        className={cn('flex items-start gap-2 cursor-text group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]', className)}
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(contact.id, field, value || '');
        }}
      >
        {icon}
        <span className="text-zinc-400 italic text-sm">{placeholder || field}</span>
        <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
      </div>
    );
  }

  if (isEditing) {
    const inputProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEditValue(e.target.value),
      onBlur: () => onSave(contact.id, field),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !textarea) onSave(contact.id, field);
        if (e.key === 'Escape') onCancelEdit();
      },
      className: 'flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm',
      placeholder,
    };
    return (
      <div className={cn('flex items-start gap-2', className)} onClick={(e) => e.stopPropagation()}>
        {icon}
        {textarea ? (
          <Textarea ref={inputRef as React.RefObject<HTMLTextAreaElement>} {...inputProps} rows={3} className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0" />
        ) : (
          <Input ref={inputRef as React.RefObject<HTMLInputElement>} {...inputProps} className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0" />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2 cursor-text group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]', className)}
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit(contact.id, field, value || '');
      }}
    >
      {icon}
      {display}
      <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0" />
    </div>
  );
}

type EditableAddressProps = {
  contact: CommercialContact;
  editingCell: { id: string; field: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  onStartEdit: (id: string, field: string, value: string) => void;
  onSaveAddress: (id: string, addr: { street?: string; city?: string; postal_code?: string; country?: string }) => void;
  onCancelEdit: () => void;
  formatAddress: (addr?: { street?: string; city?: string; postal_code?: string; country?: string }) => string | null;
};

function EditableAddress({
  contact,
  editingCell,
  editValue,
  setEditValue,
  inputRef,
  onStartEdit,
  onSaveAddress,
  onCancelEdit,
  formatAddress,
}: EditableAddressProps) {
  const addr = contact.address;
  const formatted = formatAddress(addr);
  const isEditing = editingCell?.id === contact.id && editingCell?.field === 'address';

  const parseAddress = (s: string) => {
    const parts = s.split(',').map((p) => p.trim());
    const street = parts[0] || '';
    const cityPart = parts[1] || '';
    const country = parts[2] || '';
    const [postal_code, ...cityWords] = cityPart.split(/\s+/);
    const city = cityWords.join(' ') || '';
    return { street: street || undefined, postal_code: postal_code || undefined, city: city || undefined, country: country || undefined };
  };

  const handleSave = () => {
    const parsed = parseAddress(editValue.trim());
    onSaveAddress(contact.id, parsed);
    onCancelEdit();
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2 md:col-span-2" onClick={(e) => e.stopPropagation()}>
        <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement | null>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancelEdit();
          }}
          className="flex-1 min-w-0 bg-transparent outline-none py-0.5 text-sm border-0 focus-visible:ring-0"
          placeholder="Rue, code postal ville, pays"
        />
      </div>
    );
  }

  if (formatted) {
    return (
      <div
        className="flex items-start gap-2 md:col-span-2 cursor-pointer group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]"
        onClick={(e) => {
          e.stopPropagation();
          onStartEdit(contact.id, 'address', formatted);
        }}
      >
        <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
        <span>{formatted}</span>
        <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 md:col-span-2 cursor-pointer group/edit px-2 py-1 -mx-2 -my-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-h-[28px]"
      onClick={(e) => {
        e.stopPropagation();
        onStartEdit(contact.id, 'address', '');
      }}
    >
      <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
      <span className="text-zinc-400 italic text-sm">Adresse</span>
      <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/edit:opacity-100 shrink-0 mt-0.5" />
    </div>
  );
}

interface CommercialListProps {
  contacts: CommercialContact[];
  isLoading: boolean;
  onRefetch: () => void | Promise<void>;
}

export default function CommercialList({ contacts, isLoading, onRefetch }: CommercialListProps) {
  const [filteredContacts, setFilteredContacts] = useState<CommercialContact[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all');

  useEffect(() => {
    let filtered = [...contacts];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.company?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.contact_person?.toLowerCase().includes(s)
      );
    }
    if (typeFilter !== 'all') filtered = filtered.filter((c) => c.type === typeFilter);
    if (statusFilter !== 'all') filtered = filtered.filter((c) => c.status === statusFilter);
    setFilteredContacts(filtered);
  }, [contacts, searchTerm, typeFilter, statusFilter]);

  const handleAddContact = async () => {
    try {
      const newContact = await createCommercialContact({
        name: '',
        type: 'contact',
        status: 'lead',
        tags: [],
        linked_product_ids: [],
        linked_order_ids: [],
        linked_invoice_ids: [],
      });
      await onRefetch();
      setExpandedId(newContact.id);
      setEditingCell({ id: newContact.id, field: 'name' });
      setEditValue('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleUpdateField = async (
    id: string,
    field: string,
    value: string | ContactType | ContactStatus | { street?: string; city?: string; postal_code?: string; country?: string }
  ) => {
    try {
      const updated = await updateCommercialContact(id, { [field]: value });
      if (updated) await onRefetch();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
    setEditingCell(null);
  };

  const handleDeleteContact = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const contact = contacts.find((c) => c.id === id);
    if (!contact || !confirm(`Supprimer "${contact.name || 'ce contact'}" ?`)) return;
    try {
      await deleteCommercialContact(id);
      await onRefetch();
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEdit = (id: string, field: string) => {
    if (editingCell?.id === id && editingCell?.field === field) {
      handleUpdateField(id, field, editValue.trim());
    }
    setEditingCell(null);
  };

  const getTypeLabel = (type: ContactType) => TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
  const getStatusLabel = (status: ContactStatus) => STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  const formatAddress = (addr?: { street?: string; city?: string; postal_code?: string; country?: string }) => {
    if (!addr) return null;
    const parts = [addr.street, addr.postal_code, addr.city, addr.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  };

  const columns: ColumnDef<CommercialContact>[] = [
    { key: 'expand', type: 'expand' },
    {
      key: 'name',
      type: 'text',
      label: 'Nom',
      getValue: (c) => c.name,
      onChange: (c, v) => handleUpdateField(c.id, 'name', v),
      editable: true,
      placeholder: 'Nom',
    },
    {
      key: 'type',
      type: 'select',
      label: 'Type',
      options: TYPE_OPTIONS,
      getValue: (c) => c.type,
      onChange: (c, v) => handleUpdateField(c.id, 'type', v as ContactType),
      badge: true,
      getBadgeVariant: (v) => v as 'supplier' | 'contact' | 'partner',
    },
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      options: STATUS_OPTIONS,
      getValue: (c) => c.status,
      onChange: (c, v) => handleUpdateField(c.id, 'status', v as ContactStatus),
    },
    {
      key: 'contact',
      type: 'text',
      label: 'Contact',
      getValue: (c) => c.email || c.phone || c.mobile || '',
      onChange: (c, v) => handleUpdateField(c.id, 'email', v),
      editable: true,
      placeholder: 'Email',
    },
    {
      key: 'actions',
      type: 'actions',
      render: (contact) => (
        <IconButton
          icon={<Trash2 size={14} />}
          ariaLabel="Supprimer"
          variant="ghost"
          size="sm"
          onClick={(e) => handleDeleteContact(contact.id, e)}
          className="flex items-center justify-center w-full min-h-8 px-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/row:opacity-100 transition-opacity"
          title="Supprimer"
        />
      ),
    },
  ];

  const expandContent = (contact: CommercialContact) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
      <EditableDetail
        icon={<Mail size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="email"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`mailto:${v}`} className="text-blue-600 dark:text-blue-400 hover:underline">{v}</a> : null}
        placeholder="Email"
      />
      <EditableDetail
        icon={<Phone size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="phone"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`tel:${v}`} className="hover:underline">{v}</a> : null}
        placeholder="Téléphone"
      />
      <EditableDetail
        icon={<Phone size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="mobile"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={`tel:${v}`} className="hover:underline">{v}</a> : null}
        placeholder="Mobile"
      />
      <EditableDetail
        icon={<Globe size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="website"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <a href={v.startsWith('http') ? v : `https://${v}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">{v}</a> : null}
        placeholder="Site web"
      />
      <EditableDetail
        icon={<User size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="contact_person"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <span>{v}</span> : null}
        placeholder="Personne de contact"
      />
      <EditableDetail
        icon={<User size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="position"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <span>{v}</span> : null}
        placeholder="Poste"
      />
      <EditableDetail
        icon={<Building2 size={14} className="text-zinc-400 shrink-0" />}
        contact={contact}
        field="company"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => (v && v !== contact.name) ? <span>{v}</span> : null}
        placeholder="Société"
      />
      <EditableAddress
        contact={contact}
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSaveAddress={(id, addr) => handleUpdateField(id, 'address', addr)}
        onCancelEdit={() => setEditingCell(null)}
        formatAddress={formatAddress}
      />
      <EditableDetail
        icon={null}
        contact={contact}
        field="notes"
        editingCell={editingCell}
        editValue={editValue}
        setEditValue={setEditValue}
        inputRef={inputRef}
        onStartEdit={startEdit}
        onSave={saveEdit}
        onCancelEdit={() => setEditingCell(null)}
        renderDisplay={(v) => v ? <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{v}</p> : null}
        placeholder="Notes"
        textarea
        className="md:col-span-2 lg:col-span-3"
      />
      {(!contact.email && !contact.phone && !contact.mobile && !contact.website && !contact.contact_person && !contact.position && !formatAddress(contact.address) && !contact.notes) && (
        <p className="text-zinc-400 italic md:col-span-2">Cliquez sur un champ pour l&apos;éditer</p>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="w-full space-y-4">
        <SectionHeader
          icon={<Users size={28} />}
          title="Commercial"
          subtitle="Gérez vos contacts, partenaires et fournisseurs"
          actions={
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Plus size={14} className="mr-1.5" />
              Nouveau contact
            </Button>
          }
        />
        <EmptyState
          icon={Users}
          title="Aucun contact"
          description="Créez votre premier contact pour commencer."
          action={
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Plus size={14} className="mr-1.5" />
              Nouveau contact
            </Button>
          }
          variant="full"
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <SectionHeader
        icon={<Users size={28} />}
        title="Commercial"
        subtitle="Gérez vos contacts, partenaires et fournisseurs"
        actions={
            <Button variant="primary" size="sm" onClick={handleAddContact}>
              <Plus size={14} className="mr-1.5" />
              Nouveau contact
            </Button>
        }
        filters={
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchInput
              label="Recherche"
              placeholder="Nom, société, email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <FilterField label="Type">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ContactType | 'all')}
                options={[
                  { value: 'all', label: 'Tous les types' },
                  ...TYPE_OPTIONS,
                ]}
              />
            </FilterField>
            <FilterField label="Statut">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ContactStatus | 'all')}
                options={[
                  { value: 'all', label: 'Tous les statuts' },
                  ...STATUS_OPTIONS,
                ]}
              />
            </FilterField>
          </div>
        }
      />

      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
        {filteredContacts.length !== contacts.length && ` sur ${contacts.length}`}
      </div>

      <SchemaTable<CommercialContact>
        data={filteredContacts}
        columns={columns}
        expandContent={expandContent}
        addRowLabel="Ajouter un contact"
        onAddRow={handleAddContact}
        expandedId={expandedId}
        onExpandedChange={setExpandedId}
        variant="bordered"
        initialEditCell={
          editingCell?.field === 'name'
            ? { id: editingCell.id, key: editingCell.field }
            : undefined
        }
      />
    </div>
  );
}
