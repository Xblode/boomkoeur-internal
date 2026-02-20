import { Meeting, MeetingInput, AgendaItem, AgendaItemInput, MeetingStats, MeetingFilters } from '@/types/meeting';
import { mockMeetings } from '@/lib/mocks/meetings';

/**
 * Service de gestion des réunions
 * Simule des appels API avec localStorage
 */
class MeetingService {
  private readonly MEETINGS_KEY = 'meetings';

  /**
   * Récupère toutes les réunions
   */
  async getMeetings(): Promise<Meeting[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem(this.MEETINGS_KEY);
        if (stored) {
          const meetings = JSON.parse(stored);
          // Convert date strings back to Date objects
          const parsed = meetings.map((m: any) => ({
            ...m,
            date: new Date(m.date),
            created_at: new Date(m.created_at),
            updated_at: new Date(m.updated_at),
            minutes: {
              ...m.minutes,
              createdAt: m.minutes.createdAt ? new Date(m.minutes.createdAt) : undefined,
              updatedAt: m.minutes.updatedAt ? new Date(m.minutes.updatedAt) : undefined,
            },
          }));
          resolve(parsed);
        } else {
          localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(mockMeetings));
          resolve(mockMeetings);
        }
      }, 300);
    });
  }

  /**
   * Récupère une réunion par ID
   */
  async getMeetingById(id: string): Promise<Meeting | null> {
    const meetings = await this.getMeetings();
    return meetings.find(m => m.id === id) || null;
  }

  /**
   * Filtre les réunions
   */
  async getFilteredMeetings(filters: MeetingFilters): Promise<Meeting[]> {
    const meetings = await this.getMeetings();
    
    return meetings.filter(meeting => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch = 
          meeting.title.toLowerCase().includes(search) ||
          meeting.participants.some(p => p.toLowerCase().includes(search)) ||
          meeting.location?.toLowerCase().includes(search);
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && meeting.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && meeting.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && meeting.date > filters.dateTo) {
        return false;
      }

      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date desc
  }

  /**
   * Crée une nouvelle réunion
   */
  async createMeeting(input: MeetingInput): Promise<Meeting> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const meetings = await this.getMeetings();
        const newMeeting: Meeting = {
          ...input,
          id: `meeting-${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        const updated = [...meetings, newMeeting];
        localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(updated));
        resolve(newMeeting);
      }, 300);
    });
  }

  /**
   * Met à jour une réunion
   */
  async updateMeeting(id: string, input: Partial<MeetingInput>): Promise<Meeting | null> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const meetings = await this.getMeetings();
        const index = meetings.findIndex(m => m.id === id);
        
        if (index === -1) {
          resolve(null);
          return;
        }

        const updated = meetings.map(meeting => 
          meeting.id === id
            ? { ...meeting, ...input, updated_at: new Date() }
            : meeting
        );

        localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(updated));
        resolve(updated[index]);
      }, 300);
    });
  }

  /**
   * Supprime une réunion
   */
  async deleteMeeting(id: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const meetings = await this.getMeetings();
        const filtered = meetings.filter(m => m.id !== id);
        
        if (filtered.length === meetings.length) {
          resolve(false);
          return;
        }

        localStorage.setItem(this.MEETINGS_KEY, JSON.stringify(filtered));
        resolve(true);
      }, 300);
    });
  }

  /**
   * Ajoute un point à l'ordre du jour
   */
  async addAgendaItem(meetingId: string, item: AgendaItemInput): Promise<AgendaItem> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const newItem: AgendaItem = {
      ...item,
      id: `agenda-${Date.now()}`,
    };

    const updatedAgenda = [...meeting.agenda, newItem];
    await this.updateMeeting(meetingId, { agenda: updatedAgenda });

    return newItem;
  }

  /**
   * Met à jour un point d'ordre du jour
   */
  async updateAgendaItem(meetingId: string, itemId: string, updates: Partial<AgendaItem>): Promise<boolean> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) return false;

    const updatedAgenda = meeting.agenda.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    await this.updateMeeting(meetingId, { agenda: updatedAgenda });
    return true;
  }

  /**
   * Supprime un point d'ordre du jour
   */
  async deleteAgendaItem(meetingId: string, itemId: string): Promise<boolean> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) return false;

    const updatedAgenda = meeting.agenda.filter(item => item.id !== itemId);
    await this.updateMeeting(meetingId, { agenda: updatedAgenda });
    return true;
  }

  /**
   * Sauvegarde le compte-rendu
   */
  async saveMinutes(meetingId: string, freeText: string, agendaItemNotes?: Record<string, string>): Promise<boolean> {
    const meeting = await this.getMeetingById(meetingId);
    if (!meeting) return false;

    const updatedMinutes = {
      freeText,
      createdAt: meeting.minutes.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Update agenda item notes if provided
    let updatedAgenda = meeting.agenda;
    if (agendaItemNotes) {
      updatedAgenda = meeting.agenda.map(item => ({
        ...item,
        notes: agendaItemNotes[item.id] !== undefined ? agendaItemNotes[item.id] : item.notes,
      }));
    }

    await this.updateMeeting(meetingId, { 
      minutes: updatedMinutes,
      agenda: updatedAgenda,
    });

    return true;
  }

  /**
   * Calcule les statistiques
   */
  async getStats(): Promise<MeetingStats> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const meetings = await this.getMeetings();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const upcomingMeetings = meetings.filter(m => m.status === 'upcoming' && m.date >= now);
        const completedMeetings = meetings.filter(m => m.status === 'completed');
        const meetingsThisMonth = meetings.filter(m => 
          m.date >= startOfMonth && m.date <= endOfMonth
        );

        // Calculate average duration
        const totalDuration = meetings.reduce((sum, meeting) => {
          const [startH, startM] = meeting.startTime.split(':').map(Number);
          const [endH, endM] = meeting.endTime.split(':').map(Number);
          const duration = (endH * 60 + endM) - (startH * 60 + startM);
          return sum + duration;
        }, 0);
        const averageDuration = meetings.length > 0 ? Math.round(totalDuration / meetings.length) : 0;

        // Find next meeting
        const sortedUpcoming = upcomingMeetings.sort((a, b) => a.date.getTime() - b.date.getTime());
        const nextMeeting = sortedUpcoming[0];

        // Calculate minutes completion rate
        const meetingsWithMinutes = completedMeetings.filter(m => 
          m.minutes.freeText && m.minutes.freeText.length > 0
        );
        const minutesCompletionRate = completedMeetings.length > 0
          ? Math.round((meetingsWithMinutes.length / completedMeetings.length) * 100)
          : 0;

        const stats: MeetingStats = {
          total_meetings: meetings.length,
          upcoming_meetings: upcomingMeetings.length,
          completed_meetings: completedMeetings.length,
          meetings_this_month: meetingsThisMonth.length,
          average_duration: averageDuration,
          next_meeting_date: nextMeeting?.date,
          minutes_completion_rate: minutesCompletionRate,
        };

        resolve(stats);
      }, 200);
    });
  }
}

export const meetingService = new MeetingService();
