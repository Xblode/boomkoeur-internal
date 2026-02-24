'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import {
  createCommercialContact,
  updateCommercialContact,
  deleteCommercialContact,
} from '@/lib/supabase/commercial';
import { CommercialContact, ContactType, ContactStatus } from '@/types/commercial';
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Globe,
  User,
  Users,
} from 'lucide-react';
import { Button, IconButton, Input, Select, Skeleton, Textarea } from '@/components/ui/atoms';
import { SectionHeader, SearchInput, FilterField, EmptyState } from '@/components/ui/molecules';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/atoms';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: 'supplier', label: 'Fournisseur' },
  { value: 'contact', label: 'Contact' },
  { value: 'partner', label: 'Partenaire' },
];

const STATUS_OPTIONS: { value: ContactStatus; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
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
  const [typePopoverOpen, setTypePopoverOpen] = useState<string | null>(null);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<string | null>(null);
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
    const contact = contacts.find((c) => c.id === id);
    if (!contact) return;
    try {
      const updated = await updateCommercialContact(id, { [field]: value });
      if (updated) {
        await onRefetch();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
    setEditingCell(null);
    setTypePopoverOpen(null);
    setStatusPopoverOpen(null);
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

      {/* Table */}
      <div className="bg-white dark:bg-card-bg rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="w-8 px-2 py-2.5" />
                <th className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">Nom</th>
                <th className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">Type</th>
                <th className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">Statut</th>
                <th className="px-4 py-2.5 font-medium text-zinc-500 dark:text-zinc-400">Contact</th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredContacts.map((contact) => {
                const isExpanded = expandedId === contact.id;
                const isEditingName = editingCell?.id === contact.id && editingCell?.field === 'name';

                return (
                  <Fragment key={contact.id}>
                    <tr
                      className={cn(
                        'group/row transition-colors cursor-pointer',
                        isExpanded && 'bg-zinc-50 dark:bg-zinc-800/50'
                      )}
                      onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                    >
                      <td className="px-2 py-2.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <ChevronRight
                          size={16}
                          className={cn(
                            'text-zinc-400 transition-transform',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </td>
                      <td className="p-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group/cell" onClick={(e) => e.stopPropagation()}>
                        {isEditingName ? (
                          <Input
                            ref={inputRef as React.RefObject<HTMLInputElement | null>}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(contact.id, 'name')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(contact.id, 'name');
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="block w-full min-h-[44px] py-2.5 px-4 bg-transparent outline-none text-sm font-medium border-0 focus-visible:ring-0"
                            placeholder="Nom"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-between gap-2 min-w-0 w-full min-h-[44px] py-2.5 px-4 cursor-text hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(contact.id, 'name', contact.name);
                            }}
                          >
                            <span className={cn(
                              'font-medium truncate',
                              !contact.name && 'text-zinc-400 italic'
                            )}>
                              {contact.name || 'Vide'}
                            </span>
                            <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 shrink-0" />
                          </div>
                        )}
                      </td>
                      <td className="p-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group/cell" onClick={(e) => e.stopPropagation()}>
                        <Popover open={typePopoverOpen === contact.id} onOpenChange={(o) => setTypePopoverOpen(o ? contact.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex items-center justify-between gap-2 w-full min-h-[44px] py-2.5 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left cursor-pointer rounded-none h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTypePopoverOpen(contact.id);
                              }}
                            >
                              <span className={cn(
                                'text-xs font-medium py-0.5 rounded-full',
                                contact.type === 'supplier' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
                                contact.type === 'contact' && 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
                                contact.type === 'partner' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              )}>
                                {getTypeLabel(contact.type)}
                              </span>
                              <ChevronDown size={12} className="text-zinc-400 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1" align="start">
                            {TYPE_OPTIONS.map((opt) => (
                              <Button
                                key={opt.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateField(contact.id, 'type', opt.value)}
                                className={cn(
                                  'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                                  contact.type === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                                )}
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="p-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group/cell" onClick={(e) => e.stopPropagation()}>
                        <Popover open={statusPopoverOpen === contact.id} onOpenChange={(o) => setStatusPopoverOpen(o ? contact.id : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex items-center justify-between gap-2 w-full min-h-[44px] py-2.5 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left cursor-pointer rounded-none h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusPopoverOpen(contact.id);
                              }}
                            >
                              <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                                {getStatusLabel(contact.status)}
                              </span>
                              <ChevronDown size={12} className="text-zinc-400 shrink-0" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-1" align="start">
                            {STATUS_OPTIONS.map((opt) => (
                              <Button
                                key={opt.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateField(contact.id, 'status', opt.value)}
                                className={cn(
                                  'w-full justify-start px-3 py-1.5 rounded-md text-sm',
                                  contact.status === opt.value && 'bg-zinc-100 dark:bg-zinc-800'
                                )}
                              >
                                {opt.label}
                              </Button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="p-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group/cell" onClick={(e) => e.stopPropagation()}>
                        {(editingCell?.id === contact.id && editingCell?.field === 'email') ? (
                          <Input
                            ref={inputRef as React.RefObject<HTMLInputElement | null>}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(contact.id, 'email')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(contact.id, 'email');
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="block w-full min-h-[44px] py-2.5 px-4 bg-transparent outline-none text-sm border-0 focus-visible:ring-0"
                            placeholder="Email"
                          />
                        ) : (
                          <div
                            className="flex items-center justify-between gap-2 min-w-0 w-full min-h-[44px] py-2.5 px-4 cursor-text hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(contact.id, 'email', contact.email || '');
                            }}
                          >
                            <span className={cn(
                              'truncate text-zinc-500 dark:text-zinc-400',
                              !contact.email && !contact.phone && !contact.mobile && 'italic'
                            )}>
                              {contact.email || contact.phone || contact.mobile || '—'}
                            </span>
                            <Pencil size={12} className="text-zinc-400 opacity-0 group-hover/cell:opacity-100 shrink-0" />
                          </div>
                        )}
                      </td>
                      <td className="p-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 group/delete" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          icon={<Trash2 size={14} />}
                          ariaLabel="Supprimer"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteContact(contact.id, e)}
                          className="flex items-center justify-center w-full min-h-[44px] py-2.5 px-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover/delete:opacity-100 transition-opacity"
                          title="Supprimer"
                        />
                      </td>
                    </tr>

                    {/* Expanded row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="bg-zinc-50/80 dark:bg-zinc-900/50"
                        >
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              {/* Email */}
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
                              {/* Téléphone */}
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
                              {/* Mobile */}
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
                              {/* Site web */}
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
                              {/* Personne de contact */}
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
                              {/* Poste */}
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
                              {/* Société */}
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
                              {/* Adresse */}
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
                              {/* Notes */}
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
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                );
              })}

              {/* Empty state / Add row */}
              <tr
                className="border-t border-dashed border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 cursor-pointer transition-colors"
                onClick={handleAddContact}
              >
                <td className="p-0" />
                <td colSpan={4} className="p-0">
                  <div className="flex items-center gap-2 min-h-[44px] py-2.5 px-4 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                    <Plus size={16} />
                    <span className="text-sm font-medium">Ajouter un contact</span>
                  </div>
                </td>
                <td className="p-0" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
