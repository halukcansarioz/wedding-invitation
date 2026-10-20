export type AttendanceStatus = 'attending' | 'declined' | 'Katılacağım' | 'Katılamayacağım';

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  attendance: AttendanceStatus | string;
  personCount?: string | number;
  side?: string;
  hasChild?: string;
  tableNumber?: string | number;
  songRequest?: string;
  note?: string;
  has_arrived?: boolean;
  createdAt?: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  audioUrl?: string | null;
  audio_url?: string | null;
  created_at?: string;
}

export interface PaymentRecord {
  id: string;
  guest_name: string;
  amount: number | string;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | string;
  stripe_session_id?: string;
  note?: string;
  created_at: string;
}

export interface EventDetailItem {
  label: string;
  time: string;
  location: string;
  description: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
}

export interface StoryTimelineItem {
  date: string;
  title: string;
  description: string;
  image?: string;
}

export interface SiteVisibility {
  countdown?: boolean;
  family?: boolean;
  story?: boolean;
  ceremony?: boolean;
  schedule?: boolean;
  location?: boolean;
  gallery?: boolean;
  rsvp?: boolean;
  wishes?: boolean;
  guests?: boolean;
  iban?: boolean;
  popupIban?: boolean;
  creditCard?: boolean;
  [key: string]: boolean | undefined;
}

export interface SiteSettings {
  theme: string;
  defaultTheme?: string;
  requireWishApproval?: boolean;
  isPostWedding?: boolean;
  tableCount?: number;
  seatsPerTable?: number;
  visibility: SiteVisibility;
}

export interface InvitationInfo {
  bride: string;
  groom: string;
  dateText: string;
  timeText: string;
  weddingDate: string;
  rsvpDeadline?: string;
  whatsappNumber?: string;
  venue: string;
  address: string;
  mapLink?: string;
  shareLink?: string;
  message?: string;
  heroImage?: string;
  heroVideo?: string | null;
  musicFile?: string | null;
  musicName?: string;
  gallery?: string[];
}

export interface SiteData {
  invitation: InvitationInfo;
  settings: SiteSettings;
  copy: Record<string, string>;
  familyInfo: {
    brideFamilyTitle?: string;
    brideFamilyName?: string;
    groomFamilyTitle?: string;
    groomFamilyName?: string;
    text?: string;
  };
  eventDetails: EventDetailItem[];
  scheduleItems: ScheduleItem[];
  storyTimeline: StoryTimelineItem[];
  giftRegistry: {
    title?: string;
    receiver?: string;
    bankName?: string;
    iban?: string;
    description?: string;
  };
  messages: {
    guestGreeting?: string;
    whatsappShareMessage?: string;
    rsvpWhatsappMessage?: string;
  };
}

export const isAttendingGuest = (attendance?: string | boolean | null): boolean => {
  if (typeof attendance === "boolean") return attendance;
  if (!attendance) return false;
  const val = String(attendance).trim().toLowerCase();
  return val === "katılacağım" || val === "attending" || val === "yes" || val === "true";
};

export const isDeclinedGuest = (attendance?: string | boolean | null): boolean => {
  if (typeof attendance === "boolean") return !attendance;
  if (!attendance) return false;
  const val = String(attendance).trim().toLowerCase();
  return val === "katılamayacağım" || val === "declined" || val === "not attending" || val === "no" || val === "false";
};