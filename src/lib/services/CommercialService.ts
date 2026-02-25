import { CommercialContact, ContactNote, CommercialContactInput, ContactNoteInput, CommercialStats, CommercialFilters } from '@/types/commercial';
import { mockCommercialContacts, mockContactNotes } from '@/lib/mocks/commercial';

/**
 * Service de gestion des contacts commerciaux (CRM)
 * Simule des appels API avec localStorage
 */
class CommercialService {
  private readonly CONTACTS_KEY = 'commercial_contacts';
  private readonly NOTES_KEY = 'contact_notes';

  /**
   * Récupère tous les contacts
   */
  async getContacts(): Promise<CommercialContact[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(this.CONTACTS_KEY);
        if (stored) {
          resolve(JSON.parse(stored));
        } else {
          localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(mockCommercialContacts));
          resolve(mockCommercialContacts);
        }
      }, 300);
    });
  }

  /**
   * Récupère un contact par ID
   */
  async getContactById(id: string): Promise<CommercialContact | null> {
    const contacts = await this.getContacts();
    return contacts.find(c => c.id === id) || null;
  }

  /**
   * Filtre les contacts selon les critères
   */
  async getFilteredContacts(filters: CommercialFilters): Promise<CommercialContact[]> {
    const contacts = await this.getContacts();
    
    return contacts.filter(contact => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          contact.name.toLowerCase().includes(search) ||
          contact.company?.toLowerCase().includes(search) ||
          contact.email?.toLowerCase().includes(search) ||
          contact.contact_person?.toLowerCase().includes(search);
        
        if (!matchesSearch) return false;
      }

      // Type filter
      if (filters.type !== 'all' && contact.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && contact.status !== filters.status) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => contact.tags.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });
  }

  /**
   * Crée un nouveau contact
   */
  async createContact(input: CommercialContactInput): Promise<CommercialContact> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const contacts = await this.getContacts();
        const newContact: CommercialContact = {
          ...input,
          id: `contact-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        const updated = [...contacts, newContact];
        localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(updated));
        resolve(newContact);
      }, 300);
    });
  }

  /**
   * Met à jour un contact existant
   */
  async updateContact(id: string, input: Partial<CommercialContactInput>): Promise<CommercialContact | null> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const contacts = await this.getContacts();
        const index = contacts.findIndex(c => c.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }

        const updated = contacts.map(contact => 
          contact.id === id
            ? { ...contact, ...input, updated_at: new Date().toISOString() }
            : contact
        );

        localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(updated));
        resolve(updated[index]);
      }, 300);
    });
  }

  /**
   * Supprime un contact
   */
  async deleteContact(id: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const contacts = await this.getContacts();
        const filtered = contacts.filter(c => c.id !== id);
        
        if (filtered.length === contacts.length) {
          resolve(false);
          return;
        }

        localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 300);
    });
  }

  /**
   * Récupère les notes d'un contact
   */
  async getContactNotes(contactId: string): Promise<ContactNote[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(this.NOTES_KEY);
        let allNotes: ContactNote[];
        
        if (stored) {
          allNotes = JSON.parse(stored);
        } else {
          localStorage.setItem(this.NOTES_KEY, JSON.stringify(mockContactNotes));
          allNotes = mockContactNotes;
        }

        const contactNotes = allNotes.filter(note => note.contact_id === contactId);
        resolve(contactNotes.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }, 200);
    });
  }

  /**
   * Ajoute une note à un contact
   */
  async addContactNote(input: ContactNoteInput): Promise<ContactNote> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const stored = localStorage.getItem(this.NOTES_KEY);
        const allNotes: ContactNote[] = stored ? JSON.parse(stored) : mockContactNotes;
        
        const newNote: ContactNote = {
          ...input,
          id: `note-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updated = [...allNotes, newNote];
        localStorage.setItem(this.NOTES_KEY, JSON.stringify(updated));
        resolve(newNote);
      }, 200);
    });
  }

  /**
   * Supprime une note
   */
  async deleteContactNote(noteId: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(this.NOTES_KEY);
        const allNotes: ContactNote[] = stored ? JSON.parse(stored) : mockContactNotes;
        
        const filtered = allNotes.filter(note => note.id !== noteId);
        
        if (filtered.length === allNotes.length) {
          resolve(false);
          return;
        }

        localStorage.setItem(this.NOTES_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 200);
    });
  }

  /**
   * Calcule les statistiques du CRM
   */
  async getStats(): Promise<CommercialStats> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const contacts = await this.getContacts();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const stats: CommercialStats = {
          total_contacts: contacts.length,
          active_contacts: contacts.filter(c => c.status === 'active').length,
          new_leads: contacts.filter(c => c.status === 'lead').length,
          contacts_by_type: {
            supplier: contacts.filter(c => c.type === 'supplier').length,
            contact: contacts.filter(c => c.type === 'contact').length,
            partner: contacts.filter(c => c.type === 'partner').length,
            lieu: contacts.filter(c => c.type === 'lieu').length,
          },
          contacts_by_status: {
            active: contacts.filter(c => c.status === 'active').length,
            inactive: contacts.filter(c => c.status === 'inactive').length,
            lead: contacts.filter(c => c.status === 'lead').length,
          },
          recent_activity_count: contacts.filter(c => 
            c.last_contact_at && new Date(c.last_contact_at) >= sevenDaysAgo
          ).length,
        };

        resolve(stats);
      }, 200);
    });
  }
}

export const commercialService = new CommercialService();
