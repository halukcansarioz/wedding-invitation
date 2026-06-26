export const getCurrentShareLink = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
};

export const DEFAULT_SITE_DATA = {
  invitation: {
    bride: "Handenur",
    groom: "Haluk Can",
    dateText: "12 Eylül 2026",
    timeText: "19:00",
    weddingDate: "2026-09-12T19:00:00",
    venue: "Kır Bahçesi Düğün Alanı",
    address: "Gebze / Kocaeli",
    mapLink: "https://www.google.com/maps",
    shareLink: getCurrentShareLink(),
    whatsappNumber: "905551112233",
    introImage: "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
    heroImage: "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
    musicFile: "",
    musicName: "Tarayıcı melodisi",
    gallery: [
      "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
      "https://unsplash.com/photos/BQZo2Hc76p0/download?force=true&w=3840",
      "https://unsplash.com/photos/fJzmPe-a0eU/download?force=true&w=3840",
      "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
    ],
    message:
      "Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.",
  },
  familyInfo: {
    brideFamilyTitle: "Gelin Ailesi",
    brideFamilyName: "Çeltik Ailesi",
    groomFamilyTitle: "Damat Ailesi",
    groomFamilyName: "Sarıöz Ailesi",
    text: "Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.",
  },
  copy: {
    introLabel: "Düğün Davetiyesi",
    introText: "Sevgiyle başlayan hikayemizin en özel gününe davetlisiniz.",
    openButton: "Daveti Aç",
    heroLabel: "Biz Evleniyoruz",
    countdownLabel: "Geri Sayım",
    countdownTitle: "Düğünümüze Kalan Süre",
    invitationLabel: "Davet",
    invitationTitle: "Mutluluğumuza Ortak Olur Musunuz?",
    familyLabel: "Ailelerimiz",
    familyTitle: "Ailelerimizin Katılımıyla",
    ceremonyLabel: "Nikah ve Düğün",
    ceremonyTitle: "Günün Detayları",
    scheduleLabel: "Düğün Takvimi",
    locationLabel: "Tarih ve Konum",
    locationTitle: "Düğün Bilgileri",
    galleryLabel: "Fotoğraflar",
    galleryTitle: "Kır Düğünü Atmosferi",
    rsvpLabel: "Katılım",
    rsvpTitle: "Katılım Bildirimi",
    rsvpText: "Katılıp katılamayacağınızı bildirerek planlamamıza yardımcı olabilirsiniz.",
    guestsLabel: "Misafirler",
    guestsTitle: "Misafir Listesi",
    wishesLabel: "Anı Defteri",
    wishesTitle: "Güzel Dilekleriniz",
    shareLabel: "Paylaş",
    shareTitle: "Davetiyeyi Paylaş",
    shareDescription: "Davetiyemizi sevdiklerinizle paylaşabilirsiniz.",
    thanksText: "Bu özel günümüzde yanımızda olmanız bizim için en güzel hediye.",
    footerSmall: "Made with love",
  },
  eventDetails: [
    {
      label: "Nikah Töreni",
      time: "19:00",
      location: "Kır Bahçesi Düğün Alanı",
      description: "Mutluluğumuza ilk imzayı atacağımız özel an.",
    },
    {
      label: "Düğün & Eğlence",
      time: "20:00",
      location: "Kır Bahçesi Düğün Alanı",
      description: "Yemek, kutlama ve eğlence ile devam edecek güzel akşam.",
    },
  ],
  scheduleItems: [
    { time: "18:30", title: "Misafir Karşılama", description: "Davetlilerimizin alana gelişi ve karşılama." },
    { time: "19:00", title: "Nikah Töreni", description: "Nikah merasimimiz başlar." },
    { time: "20:00", title: "Yemek ve Kutlama", description: "Yemek ikramı ve kutlama bölümü." },
    { time: "21:00", title: "Eğlence", description: "Müzik ve eğlence ile geceye devam." },
  ],
  settings: {
    theme: "rose",
    requireWishApproval: true,
  },
  messages: {
    whatsappShareMessage: "{couple} düğün davetiyesi 💍\n{link}",
    rsvpWhatsappMessage: "Merhaba, {couple} düğün davetiyenizi aldım. Katılım durumumu bildirmek istiyorum.",
    guestGreeting: "Sevgili {guest}, bu özel günümüzde sizi de aramızda görmekten mutluluk duyarız.",
  },
};

export const DEFAULT_ADMIN_PASSWORD = "1234";
export const ADMIN_PASSWORD_KEY = "wedding-admin-password";
export const NOTE_MAX_LENGTH = 160;
export const WISH_MAX_LENGTH = 220;
export const SITE_DATA_KEY = "wedding-site-data";
export const GUESTS_KEY = "wedding-guests";
export const WISHES_KEY = "wedding-wishes";
export const THEMES = [
  { label: "Pembe Romantik", value: "rose" },
  { label: "Yeşil Kır Düğünü", value: "sage" },
  { label: "Altın Krem", value: "gold" },
  { label: "Bordo", value: "burgundy" },
  { label: "Minimal Beyaz", value: "minimal" },
  { label: "Koyu Tema", value: "dark" },
];
export const MAX_IMAGE_DIMENSION = 1400;
export const IMAGE_QUALITY = 0.78;
export const MAX_AUDIO_FILE_SIZE = 3.8 * 1024 * 1024;

export const INITIAL_GUEST_FORM = {
  name: "",
  phone: "",
  attendance: "Katılacağım",
  personCount: "1",
  side: "Gelin Tarafı",
  hasChild: "Hayır",
  note: "",
};

export const INITIAL_WISH_FORM = {
  name: "",
  message: "",
};

export const ATTENDANCE_OPTIONS = [
  { label: "Katılacağım", value: "Katılacağım" },
  { label: "Katılamayacağım", value: "Katılamayacağım" },
];

export const PERSON_COUNT_OPTIONS = [
  { label: "1 Kişi", value: "1" },
  { label: "2 Kişi", value: "2" },
  { label: "3 Kişi", value: "3" },
  { label: "4 Kişi", value: "4" },
];

export const SIDE_OPTIONS = [
  { label: "Gelin Tarafı", value: "Gelin Tarafı" },
  { label: "Damat Tarafı", value: "Damat Tarafı" },
  { label: "Ortak", value: "Ortak" },
];

export const CHILD_OPTIONS = [
  { label: "Çocuk Yok", value: "Hayır" },
  { label: "Çocuk Var", value: "Evet" },
];