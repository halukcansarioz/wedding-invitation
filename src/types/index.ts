
export interface Guest {
  id: string;
  name: string;
  attendance: "Katılacağım" | "Katılamayacağım";
  phone?: string;
  personCount: string;
  side: "Gelin Tarafı" | "Damat Tarafı" | "Ortak";
  hasChild: "Evet" | "Hayır";
  songRequest?: string;
  note?: string;
  tableNumber?: string;
  has_arrived: boolean;
  createdAt?: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt?: string;
}

export interface SiteSettings {
  theme: string;
  defaultTheme: string;
  requireWishApproval: boolean;
  isPostWedding: boolean;
  visibility: {
    countdown: boolean;
    family: boolean;
    ceremony: boolean;
    schedule: boolean;
    location: boolean;
    gallery: boolean;
    rsvp: boolean;
    guests: boolean;
    wishes: boolean;
    iban: boolean;
    popupIban: boolean;
  };
}

export interface SiteData {
  invitation: Record<string, any>;
  familyInfo: Record<string, any>;
  giftRegistry: Record<string, any>;
  copy: Record<string, any>;
  settings: SiteSettings;
  messages: Record<string, string>;
  eventDetails: Array<{ label: string; time: string; location: string; description: string }>;
  scheduleItems: Array<{ time: string; title: string; description: string }>;
  storyTimeline: Array<{ date: string; title: string; description: string; image?: string }>;
}