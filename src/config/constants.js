export const DEFAULT_SHARE_LINK = "https://wedding-invitation-halook.vercel.app/";
export const DEFAULT_WEDDING_MUSIC_FILE = "/music/river-flows-in-you.mp3?v=20260628";
export const DEFAULT_WEDDING_MUSIC_NAME = "Yiruma – River Flows in You";

export const THEME_FAVICON_COLORS = {
  rose: { bg: "#fff5f8", circle: "#f8d7e2", petal: "#cf7c9a", stroke: "#9f4f68", center: "#fff1b8" },
  sage: { bg: "#f5f8f5", circle: "#d7ebd7", petal: "#8cb38c", stroke: "#597359", center: "#fff1b8" },
  gold: { bg: "#fdfbf7", circle: "#f3e9d2", petal: "#d4b872", stroke: "#9c8346", center: "#fff1b8" },
  burgundy: { bg: "#fcf5f6", circle: "#ebccd2", petal: "#a3495d", stroke: "#702838", center: "#fff1b8" },
  lavanta: { bg: "#f9f7fc", circle: "#e6dcf2", petal: "#9b7cbf", stroke: "#664b8a", center: "#fff1b8" },
  minimal: { bg: "#ffffff", circle: "#f0f0f0", petal: "#b3b3b3", stroke: "#737373", center: "#ffffff" },
  dark: { bg: "#2a2a2a", circle: "#404040", petal: "#8c8c8c", stroke: "#bfbfbf", center: "#404040" },
};

export const DEFAULT_SITE_DATA = {
  invitation: {
    bride: "Handenur",
    groom: "Haluk Can",
    dateText: "07 Ağustos 2027",
    timeText: "19:00",
    weddingDate: "2027-07-07T19:00:00",
    rsvpDeadline: "2027-07-01", 
    venue: "Fenerbahçe Orduevi Plaj Düğün Salonu",
    address: "Kadıköy / İstanbul",
    mapLink: "https://maps.app.goo.gl/qSDZRfkyqyNGj8kEA",
    shareLink: DEFAULT_SHARE_LINK,
    whatsappNumber: "905394933614",
    introImage: "/images/themes/lavanta/8.jpg",
    heroImage: "/images/themes/lavanta/annie-spratt-NrflUuJJK0I-unsplash.jpg",
    musicFile: DEFAULT_WEDDING_MUSIC_FILE,
    musicName: DEFAULT_WEDDING_MUSIC_NAME,
    gallery: [
      "/images/themes/lavanta/antony-bec-nD9tEn63suc-unsplash.jpg",
      "/images/themes/lavanta/christina-w0dZXqq5cPI-unsplash.jpg",
      "/images/themes/lavanta/dimitri-iakymuk-mCR10j_B6sM-unsplash.jpg",
      "/images/themes/lavanta/joyce-toh-3PdHzNqMYbA-unsplash.jpg",
    ],
    message: "Hayatımızın en özel gününde mutluluğumuzu sizinle paylaşmak istiyoruz. Bu güzel başlangıçta sizleri de aramızda görmekten onur duyarız.",
  },
  familyInfo: {
    brideFamilyTitle: "Gelin Ailesi",
    brideFamilyName: "Çeltik Ailesi",
    groomFamilyTitle: "Damat Ailesi",
    groomFamilyName: "Sarıöz Ailesi",
    text: "Ailelerimizin de katılımıyla bu özel günümüzde sizleri aramızda görmekten mutluluk duyarız.",
  },
  giftRegistry: {
    title: "Hediye & Takı Gönderimi",
    description: "Bu mutlu günümüzde yanımızda olamayan veya uzaktan katkıda bulunmak isteyen misafirlerimiz için hesap bilgilerimiz:",
    receiver: "Haluk Can Sarıöz",
    iban: "TR00 0000 0000 0000 0000 0000 00",
    bankName: "Ziraat / Garanti Bankası"
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
    giftButton: "Hediye & Takı Gönder",
    declineTitle: "Çok Üzüldük!",
    declineMessage: "Düğünümüzde aramızda olamayacağınız için üzgünüz. Güzel dileklerinizi Anı Defteri üzerinden bizimle paylaşabilir ya da dilerseniz hediye/takı ekranından katkıda bulunabilirsiniz.",
    deadlineTitle: "LCV Bildirim Süresi Doldu",
    deadlineText: "Katılım bildirimleri için belirlenen son tarih dolmuştur. Masa ve ikram planlamalarımız tamamlandığı için form ziyarete kapatılmıştır. Acil bir değişiklik veya sorunuz için aşağıdaki WhatsApp butonunu kullanabilirsiniz."
  },
  eventDetails: [
    {
      label: "Nikah Töreni",
      time: "19:00",
      location: "Fenerbahçe Orduevi Plaj Düğün Salonu",
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
    theme: "lavanta",
    defaultTheme: "lavanta",
    requireWishApproval: true,
    visibility: {
      countdown: true,
      family: true,
      ceremony: true,
      schedule: true,
      location: true,
      gallery: true,
      rsvp: true,
      guests: true,
      wishes: true,
    },
  },
  messages: {
    whatsappShareMessage: "{couple} düğün davetiyesi 💍\n{link}",
    rsvpWhatsappMessage: "Merhaba, {couple} düğün davetiyenizi aldım. Katılım durumumu bildirmek istiyorum.",
    guestGreeting: "Sevgili {guest}, bu özel günümüzde sizi de aramızda görmekten mutluluk duyarız."
  },
};

export const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
export const ADMIN_SESSION_LAST_ACTIVE_KEY = "wedding-admin-last-active";
export const ADMIN_ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];
export const NOTE_MAX_LENGTH = 160;
export const WISH_MAX_LENGTH = 220;
export const SITE_DATA_KEY = "wedding-site-data";

export const THEMES = [
  { label: "Pembe Romantik", value: "rose" },
  { label: "Yeşil Kır Düğünü", value: "sage" },
  { label: "Altın Krem", value: "gold" },
  { label: "Bordo", value: "burgundy" },
  { label: "Lavanta", value: "lavanta" },
  { label: "Minimal Beyaz", value: "minimal" },
  { label: "Koyu Tema", value: "dark" },
];

export const THEME_DEFAULT_IMAGES = {
  rose: {
    introImage: "/images/themes/rose/1.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Rose.mp4", 
    gallery: [
      "/images/themes/rose/anton-mislawsky-d-eWwb40Bdg-unsplash.jpg",
      "/images/themes/rose/brigitte-tohm-buUFEtmNnjc-unsplash.jpg",
      "/images/themes/rose/sergey-semin-3gpzjLWHb0I-unsplash.jpg",
      "/images/themes/rose/thomas-curryer-UDfxsawmiKk-unsplash.jpg",
    ],
  },
  sage: {
    introImage: "/images/themes/sage/3.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Sage.mp4", 
    gallery: [
      "/images/themes/sage/amith-nair-l4OzvWgMEkw-unsplash.jpg",
      "/images/themes/sage/lawrence-kayku-ZVKr8wADhpc-unsplash.jpg",
      "/images/themes/sage/matthew-PmFCYjRqHN8-unsplash.jpg",
      "/images/themes/sage/silvia-mara-Hi69z0dFLjA-unsplash.jpg",
    ],
  },
  gold: {
    introImage: "/images/themes/gold/5.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Gold.mp4", 
    gallery: [
      "/images/themes/gold/akhmad-jazuli-UO17MJcba-w-unsplash.jpg",
      "/images/themes/gold/american-heritage-chocolate-Bkm6wO6pHOY-unsplash.jpg",
      "/images/themes/gold/charlotte-cowell-cHzTNuMAIJs-unsplash.jpg",
      "/images/themes/gold/thlt-lcx-R5d7yOCkPJU-unsplash.jpg",
    ],
  },
  burgundy: {
    introImage: "/images/themes/burgundy/7.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Burgundy.mp4",
    gallery: [
      "/images/themes/burgundy/balint-henter-5F6ZgBbXnxo-unsplash.jpg",
      "/images/themes/burgundy/joanna-kosinska-xHDOokMbumY-unsplash.jpg",
      "/images/themes/burgundy/11.jpg",
      "/images/themes/burgundy/6.jpg",
    ],
  },
  lavanta: {
    introImage: "/images/themes/lavanta/8.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Lavanta.mp4",
    gallery: [
      "/images/themes/lavanta/antony-bec-nD9tEn63suc-unsplash.jpg",
      "/images/themes/lavanta/christina-w0dZXqq5cPI-unsplash.jpg",
      "/images/themes/lavanta/dimitri-iakymuk-mCR10j_B6sM-unsplash.jpg",
      "/images/themes/lavanta/joyce-toh-3PdHzNqMYbA-unsplash.jpg",
    ],
  },
  minimal: {
    introImage: "/images/themes/minimal/9.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Minimal.mp4",
    gallery: [
      "/images/themes/minimal/kerri-shaver-E41FJBN09wc-unsplash.jpg",
      "/images/themes/minimal/kerri-shaver-oDV14167o1o-unsplash.jpg",
      "/images/themes/minimal/max-letek-_zH2qqQ1dHA-unsplash.jpg",
      "/images/themes/minimal/micah-sammie-chaffin-ECZeV9L7Pc4-unsplash.jpg",
    ],
  },
  dark: {
    introImage: "/images/themes/dark/10.jpg",
    heroVideo: "https://duschqflahimxgbokyuc.supabase.co/storage/v1/object/public/wedding-media/media/Dark.mp4",
    gallery: [
      "/images/themes/dark/christina-fxsznsmRnFI-unsplash.jpg",
      "/images/themes/dark/christina-o7yMtvuc8_0-unsplash.jpg",
      "/images/themes/dark/13.jpg",
      "/images/themes/dark/mike-marrah-1kCJYMKROiU-unsplash.jpg",
    ],
  },
};

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