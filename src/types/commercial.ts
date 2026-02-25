// Types pour le module Commercial/CRM

// Type de contact
export type ContactType = 'supplier' | 'contact' | 'partner';

// Statut du contact
export type ContactStatus = 'active' | 'inactive' | 'lead';

// Note associée à un contact
export type ContactNote = {
  id: string;
  contact_id: string;
  content: string;
  created_by: string; // User who created the note
  created_at: Date | string;
  updated_at: Date | string;
};

// Contact commercial (unifié pour fournisseurs, contacts, partenaires)
export type CommercialContact = {
  id: string;
  type: ContactType;
  status: ContactStatus;
  
  // Informations principales
  name: string; // Nom de la personne ou de l'entreprise
  company?: string; // Nom de l'entreprise (si contact est une personne)
  
  // Informations de contact
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  
  // Adresse
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  
  // Informations commerciales
  contact_person?: string; // Personne de contact principale
  position?: string; // Poste/Fonction
  
  // Relations
  linked_product_ids: string[]; // Produits fournis (pour suppliers)
  linked_order_ids: string[]; // Commandes associées
  linked_invoice_ids: string[]; // Factures associées (finance)
  
  // Notes et historique
  notes?: string; // Notes générales
  tags: string[]; // Tags pour catégorisation
  
  // Métadonnées
  is_favorite?: boolean; // Favori (affiché en premier dans la liste)
  created_at: Date | string;
  updated_at: Date | string;
  last_contact_at?: Date | string; // Dernier échange
};

// Filtres pour la liste des contacts
export type CommercialFilters = {
  search: string; // Recherche par nom, email, entreprise
  type: ContactType | 'all';
  status: ContactStatus | 'all';
  tags: string[];
};

// Stats pour le dashboard
export type CommercialStats = {
  total_contacts: number;
  active_contacts: number;
  new_leads: number;
  contacts_by_type: Record<ContactType, number>;
  contacts_by_status: Record<ContactStatus, number>;
  recent_activity_count: number; // Nombre de contacts récents (7 derniers jours)
};

// Inputs pour création (sans champs auto-générés)
export type CommercialContactInput = Omit<CommercialContact, 'id' | 'created_at' | 'updated_at'>;
export type ContactNoteInput = Omit<ContactNote, 'id' | 'created_at' | 'updated_at'>;
