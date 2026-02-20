export interface ShotgunArtist {
  id: number;
  name: string;
  slug: string;
  avatar: string;
  url: string;
}

export interface ShotgunGenre {
  name: string;
}

export interface ShotgunGeolocation {
  street: string;
  latitude: number;
  longitude: number;
  city: string;
  cityId: number;
  zipCode: string;
  country: string;
  countryIsoCode: string;
  countryId: number;
}

export interface ShotgunSubcategory {
  id: number;
  name: string;
  start_time: string | null;
}

export interface ShotgunDeal {
  name: string;
  product_id: number;
  description: string;
  quantity: number;
  target: string;
  subcategory_id: number;
  subcategory: ShotgunSubcategory;
  visiblity: string;
  sales_channel: string;
  price: number;
  organizer_fees: number;
  user_fees: number;
}

export interface ShotgunOrganizer {
  name: string;
  slug: string;
}

export interface ShotgunEvent {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  slug: string;
  timezone: string;
  artists: ShotgunArtist[];
  genres: ShotgunGenre[];
  leftTicketsCount: number;
  description: string;
  coverUrl: string;
  coverThumbnailUrl: string;
  trailerUrl: string;
  url: string;
  addressVisibility: 'public' | 'secret' | 'private';
  geolocation: ShotgunGeolocation;
  publishedAt: string | null;
  launchedAt: string | null;
  cancelledAt: string | null;
  organizer: ShotgunOrganizer;
  deals: ShotgunDeal[];
  typeOfPlace: string;
}

export interface ShotgunEventsResponse {
  data: ShotgunEvent[];
}

export type TicketStatus =
  | 'valid'
  | 'resold'
  | 'refunded'
  | 'canceled'
  | 'payment_plan_pending'
  | 'pending_approval'
  | 'rejected';

export interface ShotgunTicketSeating {
  id: string;
  type: 'Booth' | 'GeneralAdmissionArea' | 'Seat' | 'Table';
  entrance: string | null;
  section: string | null;
  row: string | null;
  seat: string;
}

export interface ShotgunTicket {
  ticket_id: number;
  ticket_scan_code: string;
  ticket_scanned_at: string | null;
  ticket_updated_at: string;
  ticket_canceled_at: string | null;
  ticket_status: TicketStatus;
  ticket_seating: ShotgunTicketSeating | null;
  user_id: number | null;
  deal_id: number;
  deal_sub_category: string | null;
  deal_title: string;
  deal_channel: string;
  deal_visibilities: string[];
  deal_price: number;
  deal_service_fee: number;
  deal_user_service_fee: number;
  deal_producer_cost: number;
  deal_vat_rate: number;
  order_id: number;
  currency: 'eur' | 'usd' | 'brl';
  payment_method: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  ordered_at: string;
  event_id: number;
  event_start_time: string;
  event_end_time: string;
  event_created_at: string;
  event_published_at: string | null;
  event_launched_at: string | null;
  event_canceled_at: string | null;
  contact_id: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_first_name: string | null;
  contact_last_name: string | null;
  contact_gender: 'female' | 'male' | 'other' | null;
  contact_company_name: string | null;
  contact_birthday: string | null;
  contact_newsletter_optin: boolean | null;
  contact_country: string | null;
  contact_postal_code: string | null;
  contact_locality: string | null;
}

export interface ShotgunTicketsPagination {
  next: string | null;
}

export interface ShotgunTicketsParams {
  organizer_id: number;
  event_id?: number;
  include_cohosted_events?: boolean;
}

export interface ShotgunTicketsResponse {
  params: ShotgunTicketsParams;
  pagination: ShotgunTicketsPagination;
  data: ShotgunTicket[];
}
