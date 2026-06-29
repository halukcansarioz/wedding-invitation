import { useEffect, useRef, useState } from "react";
import "./styles/index.css";
import { supabase } from "./supabaseClient";

const DEFAULT_SHARE_LINK = "https://wedding-invitation-halook.vercel.app/";
const DEFAULT_WEDDING_MUSIC_FILE = "/music/river-flows-in-you.mp3?v=20260628";
const DEFAULT_WEDDING_MUSIC_NAME = "Yiruma – River Flows in You";

const FLOWER_FAVICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="17" fill="#fff5f8"/>
  <circle cx="32" cy="32" r="21" fill="#f8d7e2" opacity="0.72"/>
  <g fill="#cf7c9a" stroke="#9f4f68" stroke-width="2" stroke-linejoin="round">
    <path d="M32 31c-7-9-15-10-18-5-3 6 2 12 13 11-7 9-5 17 1 19 7 1 11-5 8-16 10 5 18 2 18-5 0-6-7-9-17-4 7-9 6-17 0-19-6-1-10 6-5 19Z"/>
  </g>
  <circle cx="32" cy="32" r="6" fill="#fff1b8" stroke="#9f4f68" stroke-width="2"/>
</svg>`;

const FLOWER_FAVICON_URL = `data:image/svg+xml,${encodeURIComponent(FLOWER_FAVICON_SVG)}`;

const getCurrentShareLink = () => {
  return DEFAULT_SHARE_LINK;
};

const fixShareLink = (data) => {
  if (!data?.invitation) return data;

  const currentLink = String(data.invitation.shareLink || "").trim();

  const isLocalhostLink =
    currentLink.includes("localhost") ||
    currentLink.includes("127.0.0.1") ||
    currentLink === "";

  return {
    ...data,
    invitation: {
      ...data.invitation,
      shareLink: isLocalhostLink ? DEFAULT_SHARE_LINK : currentLink,
    },
  };
};

const applyDefaultWeddingMusic = (data) => {
  if (!data?.invitation) return data;

  // Eski müzik localStorage veya Supabase içinde kayıtlı kaldıysa bile
  // davetiyede her zaman yeni varsayılan müzik çalsın.
  return {
    ...data,
    invitation: {
      ...data.invitation,
      musicFile: DEFAULT_WEDDING_MUSIC_FILE,
      musicName: DEFAULT_WEDDING_MUSIC_NAME,
    },
  };
};

const DEFAULT_SITE_DATA = {
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
    whatsappNumber: "905394933614",
    introImage: "https://unsplash.com/photos/4AX70fujoxg/download?force=true&w=3840",
    heroImage: "https://unsplash.com/photos/IxKTpb8XKH0/download?force=true&w=3840",
    musicFile: DEFAULT_WEDDING_MUSIC_FILE,
    musicName: DEFAULT_WEDDING_MUSIC_NAME,
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

const DEFAULT_ADMIN_PASSWORD = "1234";
const ADMIN_PASSWORD_KEY = "wedding-admin-password";
const ADMIN_SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 dakika
const ADMIN_SESSION_LAST_ACTIVE_KEY = "wedding-admin-last-active";
const ADMIN_ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "scroll", "touchstart"];

const touchAdminSession = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_LAST_ACTIVE_KEY, String(Date.now()));
};

const clearAdminSessionTimestamp = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_LAST_ACTIVE_KEY);
};

const isAdminSessionFresh = () => {
  if (typeof window === "undefined") return false;

  const lastActive = Number(localStorage.getItem(ADMIN_SESSION_LAST_ACTIVE_KEY) || 0);

  if (!lastActive) return false;

  return Date.now() - lastActive < ADMIN_SESSION_TIMEOUT_MS;
};

const NOTE_MAX_LENGTH = 160;
const WISH_MAX_LENGTH = 220;
const SITE_DATA_KEY = "wedding-site-data";
const GUESTS_KEY = "wedding-guests";
const WISHES_KEY = "wedding-wishes";
const THEMES = [
  { label: "Pembe Romantik", value: "rose" },
  { label: "Yeşil Kır Düğünü", value: "sage" },
  { label: "Altın Krem", value: "gold" },
  { label: "Bordo", value: "burgundy" },
  { label: "Minimal Beyaz", value: "minimal" },
  { label: "Koyu Tema", value: "dark" },
];
const MAX_IMAGE_DIMENSION = 1400;
const IMAGE_QUALITY = 0.78;
const MAX_AUDIO_FILE_SIZE = 3.8 * 1024 * 1024;

const INITIAL_GUEST_FORM = {
  name: "",
  phone: "",
  attendance: "Katılacağım",
  personCount: "1",
  side: "Gelin Tarafı",
  hasChild: "Hayır",
  note: "",
};

const INITIAL_WISH_FORM = {
  name: "",
  message: "",
};

const ATTENDANCE_OPTIONS = [
  { label: "Katılacağım", value: "Katılacağım" },
  { label: "Katılamayacağım", value: "Katılamayacağım" },
];

const PERSON_COUNT_OPTIONS = [
  { label: "1 Kişi", value: "1" },
  { label: "2 Kişi", value: "2" },
  { label: "3 Kişi", value: "3" },
  { label: "4 Kişi", value: "4" },
];

const SIDE_OPTIONS = [
  { label: "Gelin Tarafı", value: "Gelin Tarafı" },
  { label: "Damat Tarafı", value: "Damat Tarafı" },
  { label: "Ortak", value: "Ortak" },
];

const CHILD_OPTIONS = [
  { label: "Çocuk Yok", value: "Hayır" },
  { label: "Çocuk Var", value: "Evet" },
];

const mergeSiteData = (storedData) => {
  const stored = storedData && typeof storedData === "object" ? storedData : {};

  return {
    invitation: {
      ...DEFAULT_SITE_DATA.invitation,
      ...(stored.invitation || {}),
      gallery:
        Array.isArray(stored.invitation?.gallery) && stored.invitation.gallery.length > 0
          ? stored.invitation.gallery
          : DEFAULT_SITE_DATA.invitation.gallery,
    },
    familyInfo: {
      ...DEFAULT_SITE_DATA.familyInfo,
      ...(stored.familyInfo || {}),
    },
    copy: {
      ...DEFAULT_SITE_DATA.copy,
      ...(stored.copy || {}),
    },
    eventDetails:
      Array.isArray(stored.eventDetails) && stored.eventDetails.length > 0
        ? stored.eventDetails
        : DEFAULT_SITE_DATA.eventDetails,
    scheduleItems:
      Array.isArray(stored.scheduleItems) && stored.scheduleItems.length > 0
        ? stored.scheduleItems
        : DEFAULT_SITE_DATA.scheduleItems,
    settings: {
      ...DEFAULT_SITE_DATA.settings,
      ...(stored.settings || {}),
    },
    messages: {
      ...DEFAULT_SITE_DATA.messages,
      ...(stored.messages || {}),
    },
  };
};

const normalizeSiteData = (data) => applyDefaultWeddingMusic(fixShareLink(mergeSiteData(data)));


const loadStoredList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const loadStoredSiteData = () => {
  try {
    return normalizeSiteData(JSON.parse(localStorage.getItem(SITE_DATA_KEY)));
  } catch {
    return normalizeSiteData(null);
  }
};

const getStoredAdminPassword = () => {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;

  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
};

const createGoogleCalendarLink = (siteData, coupleName) => {
  const start = new Date(siteData.invitation.weddingDate);

  if (Number.isNaN(start.getTime())) {
    return "#";
  }

  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");

  const title = encodeURIComponent(`${coupleName} Düğünü`);
  const details = encodeURIComponent(siteData.invitation.message);
  const location = encodeURIComponent(`${siteData.invitation.venue}, ${siteData.invitation.address}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(
    start
  )}/${formatDate(end)}&details=${details}&location=${location}`;
};

const readImageFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) {
      reject(new Error("Lütfen geçerli bir görsel dosyası seçin."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const originalDataUrl = reader.result;

      if (file.type === "image/svg+xml") {
        resolve(originalDataUrl);
        return;
      }

      const image = new Image();

      image.onload = () => {
        const ratio = Math.min(
          1,
          MAX_IMAGE_DIMENSION / image.naturalWidth,
          MAX_IMAGE_DIMENSION / image.naturalHeight
        );

        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        context.fillStyle = "#fffafb";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };

      image.onerror = () => resolve(originalDataUrl);
      image.src = originalDataUrl;
    };

    reader.onerror = () => reject(new Error("Görsel okunamadı."));
    reader.readAsDataURL(file);
  });
};

const readAudioFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("audio/")) {
      reject(new Error("Lütfen geçerli bir müzik dosyası seçin."));
      return;
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      reject(new Error("Müzik dosyası çok büyük. Lütfen 4 MB altında bir MP3/M4A dosyası seçin."));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        dataUrl: reader.result,
        name: file.name || "Yüklenen müzik",
      });
    };

    reader.onerror = () => reject(new Error("Müzik dosyası okunamadı."));
    reader.readAsDataURL(file);
  });
};

const formatMessageTemplate = (template, values) => {
  return String(template || "")
    .replaceAll("{couple}", values.couple || "")
    .replaceAll("{link}", values.link || "")
    .replaceAll("{guest}", values.guest || "");
};

const normalizeText = (value) =>
  String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const downloadTextFile = (filename, content, mimeType = "text/plain;charset=utf-8") => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const createCsv = (headers, rows) => {
  const lines = [headers.map(csvEscape).join(";")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => csvEscape(row[header])).join(";"));
  });
  return `\ufeff${lines.join("\n")}`;
};

const excelEscape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const createExcelTable = (title, headers, rows) => {
  const headerCells = headers.map((header) => `<th>${excelEscape(header)}</th>`).join("");
  const bodyRows = rows
    .map((row) => `<tr>${headers.map((header) => `<td>${excelEscape(row[header])}</td>`).join("")}</tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; }
    th { background: #f3d7df; font-weight: 700; }
    th, td { border: 1px solid #9f4f68; padding: 8px 10px; }
  </style>
</head>
<body>
  <h2>${excelEscape(title)}</h2>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
</body>
</html>`;
};

const getGuestNameFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("guest") || params.get("davetli") || "";
};

const buildPersonalLink = (baseLink, guestName) => {
  if (!guestName.trim()) return baseLink;

  try {
    const url = new URL(baseLink || getCurrentShareLink());
    url.searchParams.set("guest", guestName.trim());
    return url.toString();
  } catch {
    const separator = baseLink.includes("?") ? "&" : "?";
    return `${baseLink}${separator}guest=${encodeURIComponent(guestName.trim())}`;
  }
};

const getQrImageUrl = (link) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(link)}`;

const isAdminRouteActive = () => {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";

  return (
    hash === "#admin" ||
    params.get("admin") === "1" ||
    params.get("type") === "recovery" ||
    hash.includes("type=recovery") ||
    hash.includes("access_token=")
  );
};

const getAdminRedirectUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}?admin=1&reset=1`;
};

const getSupabaseUrl = () =>
  String(import.meta.env?.VITE_SUPABASE_URL || "").trim().replace(/\/$/, "");

const getSupabaseKey = () =>
  String(
    import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env?.VITE_SUPABASE_ANON_KEY ||
      ""
  ).trim();

const getSupabaseSetupMessage = () => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return "Supabase bağlantısı eksik. .env.local içinde VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerleri olmalı. Dosyayı değiştirdikten sonra npm run dev sunucusunu kapatıp yeniden aç.";
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return "Supabase URL hatalı görünüyor. Dashboard linki değil, Project Settings > API kısmındaki Project URL kullanılmalı. Örnek: https://abcxyz.supabase.co";
  }

  return "Supabase bağlantısı kurulamadı. Project URL / anon key değerlerini, internet bağlantını ve Supabase projesinin aktif olduğunu kontrol et.";
};

const getReadableAuthError = (error) => {
  const message = String(error?.message || error?.name || "").toLocaleLowerCase("tr-TR");
  const code = String(error?.code || error?.status || "").toLocaleLowerCase("tr-TR");

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed") ||
    message.includes("fetcherror") ||
    error?.name === "AuthRetryableFetchError"
  ) {
    return getSupabaseSetupMessage();
  }

  if (message.includes("invalid login") || message.includes("invalid credentials")) {
    return "E-posta veya şifre hatalı. 1234 artık geçerli değil; Supabase Authentication > Users bölümünde oluşturduğun admin e-posta/şifresiyle giriş yapmalısın. Kullanıcıyı manuel oluşturduysan Confirm edilmiş olduğundan emin ol.";
  }

  if (message.includes("email not confirmed") || message.includes("not confirmed")) {
    return "Bu e-posta henüz doğrulanmamış. Supabase Authentication > Users bölümünden kullanıcıyı Confirm et veya e-posta doğrulamasını tamamla.";
  }

  if (message.includes("email rate limit") || message.includes("rate limit") || code === "429") {
    return "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar dene.";
  }

  if (message.includes("redirect") || message.includes("url")) {
    return "Şifre sıfırlama yönlendirme adresi kabul edilmedi. Supabase > Authentication > URL Configuration bölümüne localhost ve canlı site adresini eklemelisin.";
  }

  return error?.message || "İşlem tamamlanamadı. Supabase ayarlarını kontrol et.";
};

const isSupabaseReady = () => Boolean(getSupabaseUrl() && getSupabaseKey());

const loadSettingsFromDatabase = async () => {
  if (!isSupabaseReady()) return null;

  const { data, error } = await supabase
    .from("invitation_settings")
    .select("content")
    .eq("id", "main")
    .single();

  if (error) {
    console.error("Ayarlar Supabase'den alınamadı:", error);
    return null;
  }

  return normalizeSiteData(data?.content || null);
};

const saveSettingsToDatabase = async (settings) => {
  if (!isSupabaseReady()) {
    throw new Error("Supabase ayarları eksik. .env.local dosyasını kontrol et.");
  }

  const { error } = await supabase
    .from("invitation_settings")
    .upsert(
      {
        id: "main",
        content: settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) {
    throw error;
  }
};

const dbGuestToUi = (guest) => ({
  id: guest.id,
  name: guest.name || "",
  phone: guest.phone || "",
  attendance: guest.attendance || "Katılacağım",
  personCount: String(guest.person_count ?? guest.personCount ?? "1"),
  side: guest.side || "Gelin Tarafı",
  hasChild: guest.has_child ?? guest.hasChild ?? "Hayır",
  note: guest.note || "",
  createdAt: guest.created_at || guest.createdAt || "",
});

const uiGuestToDb = (guest) => ({
  name: guest.name || "",
  phone: guest.phone || "",
  attendance: guest.attendance || "Katılacağım",
  person_count: String(guest.personCount ?? guest.person_count ?? "1"),
  side: guest.side || "Gelin Tarafı",
  has_child: guest.hasChild ?? guest.has_child ?? "Hayır",
  note: guest.note || "",
});

const dbWishToUi = (wish) => ({
  id: wish.id,
  name: wish.name || "",
  message: wish.message || "",
  approved: wish.approved !== false,
  createdAt: wish.created_at || wish.createdAt || "",
});

const uiWishToDb = (wish) => ({
  name: wish.name || "",
  message: wish.message || "",
  approved: wish.approved !== false,
});

const loadPublishedWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Yayındaki anı defteri mesajları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbWishToUi);
};

const loadGuestsFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Katılım kayıtları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbGuestToUi);
};

const loadAllWishesFromDatabase = async () => {
  if (!isSupabaseReady()) return [];

  const { data, error } = await supabase
    .from("wishes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Anı defteri mesajları alınamadı:", error);
    return [];
  }

  return (data || []).map(dbWishToUi);
};

const uploadMediaFile = async (file, folder = "media") => {
  if (!file) return null;

  if (!isSupabaseReady()) {
    throw new Error("Supabase ayarları eksik. Dosya yüklemek için .env.local dosyasını kontrol et.");
  }

  const fileExt = file.name.split(".").pop() || "file";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const fileName = `${folder}/${Date.now()}-${safeName || "upload"}.${fileExt}`;

  const { error } = await supabase.storage
    .from("wedding-media")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    const message = String(error.message || "").toLocaleLowerCase("tr-TR");

    if (message.includes("bucket") || message.includes("not found")) {
      throw new Error("Görsel/müzik yüklenemedi. Supabase Storage içinde wedding-media adlı public bucket oluşturmalısın.");
    }

    if (message.includes("row-level security") || message.includes("policy") || message.includes("permission")) {
      throw new Error("Görsel/müzik yüklenemedi. wedding-media Storage bucket için authenticated upload/update/delete policy eksik görünüyor.");
    }

    throw error;
  }

  const { data } = supabase.storage.from("wedding-media").getPublicUrl(fileName);
  return data.publicUrl;
};

function OptionGroup({ value, options, onChange, disabled = false }) {
  return (
    <div className={disabled ? "option-group disabled" : "option-group"}>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          disabled={disabled}
          className={String(value) === String(option.value) ? "option-button active" : "option-button"}
          onClick={() => {
            if (disabled) return;
            onChange(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function AdminField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function AdminTextarea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function AdminDropdown({ value, options, onChange, placeholder = "Seçiniz" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );

  useEffect(() => {
    if (!isOpen) return;

    const closeDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, [isOpen]);

  return (
    <div className={`admin-custom-select ${isOpen ? "open" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        className="admin-custom-select-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className="admin-custom-select-arrow">⌄</span>
      </button>

      {isOpen && (
        <div className="admin-custom-select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={
                String(option.value) === String(value)
                  ? "admin-custom-select-option selected"
                  : "admin-custom-select-option"
              }
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSelect({ label, value, options, onChange }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <AdminDropdown value={value} options={options} onChange={onChange} />
    </label>
  );
}

function AdminCheckbox({ label, checked, onChange }) {
  return (
    <label className="admin-check-field">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}


function AppModal({ modal, onInputChange, onConfirm, onCancel }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!modal || modal.type !== "prompt") return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select?.();
    }, 60);

    return () => window.clearTimeout(focusTimer);
  }, [modal]);

  if (!modal) return null;

  const isPrompt = modal.type === "prompt";
  const showCancel = modal.type === "confirm" || isPrompt;
  const messageLines = String(modal.message || "").split("\n");

  return (
    <div
      className={`app-modal-backdrop app-modal-${modal.tone || "info"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && modal.closeOnBackdrop !== false) {
          onCancel();
        }
      }}
    >
      <form
        className="app-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(isPrompt ? modal.inputValue || "" : true);
        }}
      >
        <div className="app-modal-content">
          <h3 id="app-modal-title">{modal.title || "Bilgi"}</h3>
          {messageLines.map((line, index) => (
            <p key={`${line}-${index}`}>{line}</p>
          ))}

          {isPrompt && (
            modal.multiline ? (
              <textarea
                ref={inputRef}
                className="app-modal-input app-modal-textarea"
                value={modal.inputValue || ""}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={modal.placeholder || ""}
              />
            ) : (
              <input
                ref={inputRef}
                className="app-modal-input"
                value={modal.inputValue || ""}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder={modal.placeholder || ""}
              />
            )
          )}
        </div>

        <div className="app-modal-actions">
          {showCancel && (
            <button type="button" className="secondary-button app-modal-cancel" onClick={onCancel}>
              {modal.cancelText || "Vazgeç"}
            </button>
          )}
          <button type="submit" className={modal.tone === "danger" ? "main-button app-modal-danger-button" : "main-button"}>
            {modal.confirmText || "Tamam"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminImageField({ label, value, onFileSelect, onClear }) {
  return (
    <div className="admin-image-field admin-field-wide">
      <div className="admin-image-header">
        <span>{label}</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            Görseli Kaldır
          </button>
        )}
      </div>

      {value ? (
        <img className="admin-image-preview" src={value} alt={`${label} önizleme`} />
      ) : (
        <div className="admin-image-empty">Henüz görsel seçilmedi.</div>
      )}

      <label className="admin-upload-button">
        Bilgisayardan Görsel Seç
        <input type="file" accept="image/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        Görsel otomatik küçültülür ve bu tarayıcıda saklanır. Büyük fotoğraf yüklerken kaydettikten sonra kontrol et.
      </small>
    </div>
  );
}

function AdminMusicField({ value, fileName, onFileSelect, onClear }) {
  return (
    <div className="admin-music-field admin-field-wide">
      <div className="admin-image-header">
        <span>Davetiyede çalacak müzik</span>
        {value && (
          <button type="button" className="secondary-button small-admin-button" onClick={onClear}>
            Müziği Kaldır
          </button>
        )}
      </div>

      {value ? (
        <div className="admin-music-preview">
          <strong>{fileName || "Yüklenen müzik"}</strong>
          <audio controls src={value}></audio>
        </div>
      ) : (
        <div className="admin-image-empty">
          Henüz özel müzik seçilmedi. Müzik seçmezsen varsayılan evlilik müziği çalar.
        </div>
      )}

      <label className="admin-upload-button">
        Bilgisayardan Müzik Seç
        <input type="file" accept="audio/*" onChange={(e) => { onFileSelect(e); e.target.value = ""; }} />
      </label>
      <small>
        MP3/M4A gibi kısa ve 4 MB altı bir dosya seç. Kaydettikten sonra davetiyede bu müzik çalar.
      </small>
    </div>
  );
}

function AdminSection({ title, children }) {
  return (
    <div className="admin-editor-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function App() {
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const musicIntervalRef = useRef(null);
  const musicGainRef = useRef(null);
  const modalResolverRef = useRef(null);

  const [siteData, setSiteData] = useState(() => loadStoredSiteData());
  const [adminDraft, setAdminDraft] = useState(() => loadStoredSiteData());
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false); // ZARF ANİMASYONU İÇİN EKLENDİ
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [guestForm, setGuestForm] = useState(INITIAL_GUEST_FORM);
  const [wishForm, setWishForm] = useState(INITIAL_WISH_FORM);
  const [guests, setGuests] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [isAdminPage, setIsAdminPage] = useState(() => isAdminRouteActive());
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryPasswordAgain, setRecoveryPasswordAgain] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoginNotice, setAdminLoginNotice] = useState("");
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");
  const [adminNewPasswordAgain, setAdminNewPasswordAgain] = useState("");
  const [adminPasswordMessage, setAdminPasswordMessage] = useState("");
  const [adminSaveMessage, setAdminSaveMessage] = useState("");
  const [activeAdminTab, setActiveAdminTab] = useState("general");
  const [adminGuestSearch, setAdminGuestSearch] = useState("");
  const [adminGuestAttendanceFilter, setAdminGuestAttendanceFilter] = useState("all");
  const [adminGuestSideFilter, setAdminGuestSideFilter] = useState("all");
  const [adminGuestChildFilter, setAdminGuestChildFilter] = useState("all");
  const [adminWishSearch, setAdminWishSearch] = useState("");
  const [adminWishStatusFilter, setAdminWishStatusFilter] = useState("all");
  const [personalLinkName, setPersonalLinkName] = useState("");
  const [dataImportText, setDataImportText] = useState("");
  const [appModal, setAppModal] = useState(null);

  const invitation = siteData.invitation;
  const familyInfo = siteData.familyInfo;
  const copy = siteData.copy;
  const settings = siteData.settings;
  const messages = siteData.messages;
  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const personalGuestName = getGuestNameFromUrl();
  const isAttending = guestForm.attendance === "Katılacağım";

  useEffect(() => {
    document.documentElement.lang = "tr";

    if (!document.querySelector("meta[charset]")) {
      const meta = document.createElement("meta");
      meta.setAttribute("charset", "UTF-8");
      document.head.prepend(meta);
    }

    const favicon =
      document.querySelector("link[rel='icon'], link[rel='shortcut icon']") ||
      document.createElement("link");

    favicon.setAttribute("rel", "icon");
    favicon.setAttribute("type", "image/svg+xml");
    favicon.setAttribute("href", FLOWER_FAVICON_URL);

    if (!favicon.parentNode) {
      document.head.appendChild(favicon);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme || "rose";
  }, [settings.theme]);

  useEffect(() => {
    const syncAdminPage = () => {
      const adminRouteActive = isAdminRouteActive();

      setIsAdminPage(adminRouteActive);

      if (!adminRouteActive) {
        setAdminPassword("");
        setAdminError("");
        setAdminLoginNotice("");
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
        setForgotPasswordMessage("");
        setIsPasswordRecovery(false);
        setRecoveryPassword("");
        setRecoveryPasswordAgain("");
        setRecoveryMessage("");
        setAdminCurrentPassword("");
        setAdminNewPassword("");
        setAdminNewPasswordAgain("");
        setAdminPasswordMessage("");
        setAdminSaveMessage("");
      }
    };

    syncAdminPage();
    window.addEventListener("hashchange", syncAdminPage);
    window.addEventListener("popstate", syncAdminPage);
    return () => {
      window.removeEventListener("hashchange", syncAdminPage);
      window.removeEventListener("popstate", syncAdminPage);
    };
  }, []);

  useEffect(() => {
    if (!isSupabaseReady()) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        const recoveryRouteActive =
          typeof window !== "undefined" &&
          (window.location.search.includes("reset=1") ||
            window.location.search.includes("type=recovery") ||
            window.location.hash.includes("type=recovery") ||
            window.location.hash.includes("access_token="));

        if (!recoveryRouteActive) return;

        setIsAdminPage(true);
        setIsPasswordRecovery(true);
        setShowForgotPassword(false);
        setAdminError("");
        setForgotPasswordMessage("");
        setAdminUser(session?.user || null);
        setAdminEmail(session?.user?.email || adminEmail);
        setIsAdminUnlocked(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [adminEmail]);

  useEffect(() => {
    const loadSessionForAdmin = async () => {
      if (!isAdminPage || !isSupabaseReady()) return;

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const recoveryRouteActive =
          isAdminRouteActive() &&
          typeof window !== "undefined" &&
          (window.location.hash.includes("type=recovery") ||
            window.location.hash.includes("access_token=") ||
            searchParams.get("type") === "recovery" ||
            searchParams.get("reset") === "1" ||
            searchParams.has("code"));

        if (searchParams.has("code")) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            searchParams.get("code")
          );

          if (exchangeError && recoveryRouteActive) {
            setIsPasswordRecovery(true);
            setRecoveryMessage(getReadableAuthError(exchangeError));
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setAdminError(getReadableAuthError(error));
          return;
        }

        if (recoveryRouteActive) {
          setIsPasswordRecovery(true);
          setShowForgotPassword(false);
          setAdminError("");

          if (data.session?.user) {
            setAdminUser(data.session.user);
            setAdminEmail(data.session.user.email || "");
          }

          return;
        }

        const sessionUser = data.session?.user;

        if (!sessionUser) {
          clearAdminSessionTimestamp();
          setAdminUser(null);
          setIsAdminUnlocked(false);
          setIsPasswordRecovery(false);
          setShowForgotPassword(false);
          setAdminPassword("");
          setAdminError("");
          setAdminLoginNotice("Admin paneline girmek için giriş yapmalısın.");
          return;
        }

        if (!isAdminSessionFresh()) {
          await supabase.auth.signOut();
          clearAdminSessionTimestamp();
          setAdminUser(null);
          setIsAdminUnlocked(false);
          setIsPasswordRecovery(false);
          setShowForgotPassword(false);
          setAdminPassword("");
          setAdminError("");
          setAdminLoginNotice("Güvenlik için oturum süren doldu. Lütfen tekrar giriş yap.");
          return;
        }

        touchAdminSession();
        setAdminUser(sessionUser);
        setAdminEmail(sessionUser.email || adminEmail);
        setIsAdminUnlocked(true);
        setIsPasswordRecovery(false);
        setShowForgotPassword(false);
        setAdminPassword("");
        setAdminError("");
        setAdminLoginNotice("Oturumun devam ediyor. Yeniden giriş yapmana gerek yok.");

        const [databaseSettings, adminGuests, adminWishes] = await Promise.all([
          loadSettingsFromDatabase(),
          loadGuestsFromDatabase(),
          loadAllWishesFromDatabase(),
        ]);

        if (databaseSettings) {
          const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);

          setSiteData(normalizedDatabaseSettings);
          setAdminDraft(normalizedDatabaseSettings);
        }

        setGuests(adminGuests);
        setWishes(adminWishes);
      } catch (error) {
        console.error("Supabase oturumu kontrol edilemedi:", error);
        setAdminError(getReadableAuthError(error));
      }
    };

    loadSessionForAdmin();
  }, [isAdminPage, adminEmail]);

  useEffect(() => {
    if (!isAdminPage || !isAdminUnlocked) return undefined;

    const markActivity = () => touchAdminSession();

    const checkSessionTimeout = async () => {
      if (isAdminSessionFresh()) return;

      try {
        if (isSupabaseReady()) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Admin oturumu kapatılamadı:", error);
      }

      clearAdminSessionTimestamp();
      setAdminUser(null);
      setIsAdminUnlocked(false);
      setActiveAdminTab("general");
      setAdminPassword("");
      setAdminError("");
      setAdminSaveMessage("");
      setAdminPasswordMessage("");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      setForgotPasswordMessage("");
      setAdminLoginNotice("Oturum süren doldu. Güvenlik için tekrar giriş yapmalısın.");
    };

    markActivity();
    ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActivity, { passive: true });
    });

    const timeoutCheckInterval = window.setInterval(checkSessionTimeout, 60 * 1000);

    return () => {
      ADMIN_ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActivity);
      });
      window.clearInterval(timeoutCheckInterval);
    };
  }, [isAdminPage, isAdminUnlocked]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (musicIntervalRef.current) {
        clearTimeout(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }

      if (musicGainRef.current) {
        musicGainRef.current.disconnect();
        musicGainRef.current = null;
      }

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const attendingGuests = guests.filter((guest) => guest.attendance === "Katılacağım");
  const totalPersonCount = attendingGuests.reduce(
    (total, guest) => total + Number(guest.personCount || 1),
    0
  );
  const notAttendingCount = guests.filter(
    (guest) => guest.attendance === "Katılamayacağım"
  ).length;
  const childGuestCount = attendingGuests.filter((guest) => guest.hasChild === "Evet").length;
  const brideSideCount = attendingGuests.filter((guest) => guest.side === "Gelin Tarafı").length;
  const groomSideCount = attendingGuests.filter((guest) => guest.side === "Damat Tarafı").length;

  const approvedWishes = wishes.filter((wish) => wish.approved !== false);
  const currentShareLink = invitation.shareLink || getCurrentShareLink();
  const guestGreeting = personalGuestName
    ? formatMessageTemplate(messages.guestGreeting, { guest: personalGuestName, couple: coupleName, link: currentShareLink })
    : "";
  const shareText = encodeURIComponent(
    formatMessageTemplate(messages.whatsappShareMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })
  );
  const rsvpWhatsappText = encodeURIComponent(
    formatMessageTemplate(messages.rsvpWhatsappMessage, { couple: coupleName, link: currentShareLink, guest: personalGuestName })
  );
  const personalGuestLink = buildPersonalLink(currentShareLink, personalLinkName);
  const qrImageUrl = getQrImageUrl(currentShareLink);
  const googleCalendarLink = createGoogleCalendarLink(siteData, coupleName);

  useEffect(() => {
    [invitation.introImage, invitation.heroImage, ...invitation.gallery]
      .filter(Boolean)
      .forEach((src) => {
        const img = new Image();
        img.src = src;
      });
  }, [invitation.introImage, invitation.heroImage, invitation.gallery]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.load();
  }, [invitation.musicFile]);

  useEffect(() => {
    const loadInitialData = async () => {
      const databaseSettings = await loadSettingsFromDatabase();

      if (databaseSettings) {
        const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);

        setSiteData(normalizedDatabaseSettings);
        setAdminDraft(normalizedDatabaseSettings);
      }

      const publishedWishes = await loadPublishedWishesFromDatabase();
      setWishes(publishedWishes);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const targetDate = new Date(invitation.weddingDate);

    const updateCountdown = () => {
      const diff = targetDate - new Date();

      if (Number.isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [invitation.weddingDate]);

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (musicIntervalRef.current) {
      clearTimeout(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }

    if (musicGainRef.current) {
      musicGainRef.current.disconnect();
      musicGainRef.current = null;
    }

    setIsMusicPlaying(false);
  };

  const startGeneratedMusic = async () => {
    if (musicIntervalRef.current) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
      throw new Error("Bu tarayıcı Web Audio API desteklemiyor.");
    }

    const audioContext = audioContextRef.current || new AudioContext();

    audioContextRef.current = audioContext;
    await audioContext.resume();

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.06, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
    musicGainRef.current = masterGain;

    /*
      Varsayılan evlilik müziği tarzı yumuşak melodi.
      MP3 dosyası seçilmezse bu çalar.
    */
    const weddingMelody = [
      { frequency: 523.25, duration: 0.55 }, // C5
      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 783.99, duration: 0.85 }, // G5
      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 698.46, duration: 0.55 }, // F5
      { frequency: 783.99, duration: 1.05 }, // G5

      { frequency: 523.25, duration: 0.55 }, // C5
      { frequency: 587.33, duration: 0.55 }, // D5
      { frequency: 659.25, duration: 0.85 }, // E5
      { frequency: 587.33, duration: 0.55 }, // D5
      { frequency: 523.25, duration: 1.05 }, // C5

      { frequency: 659.25, duration: 0.55 }, // E5
      { frequency: 783.99, duration: 0.55 }, // G5
      { frequency: 880.0, duration: 0.85 },  // A5
      { frequency: 783.99, duration: 0.55 }, // G5
      { frequency: 659.25, duration: 1.1 },  // E5

      { frequency: 523.25, duration: 0.6 },  // C5
      { frequency: 659.25, duration: 0.6 },  // E5
      { frequency: 783.99, duration: 1.25 }, // G5
    ];

    let noteIndex = 0;

    const playNote = () => {
      if (!musicGainRef.current) return;

      const note = weddingMelody[noteIndex % weddingMelody.length];
      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.duration);

      oscillator.connect(gain);
      gain.connect(masterGain);

      oscillator.start(now);
      oscillator.stop(now + note.duration + 0.05);

      noteIndex += 1;

      musicIntervalRef.current = window.setTimeout(
        playNote,
        note.duration * 1000 + 90
      );
    };

    playNote();
  };

  const startMusic = async () => {
    try {
      if (invitation.musicFile && audioRef.current) {
        if (musicIntervalRef.current) {
          clearTimeout(musicIntervalRef.current);
          musicIntervalRef.current = null;
        }

        if (musicGainRef.current) {
          musicGainRef.current.disconnect();
          musicGainRef.current = null;
        }

        try {
          audioRef.current.volume = 0.15;
          await audioRef.current.play();
          setIsMusicPlaying(true);
          return;
        } catch (audioError) {
          console.log("Müzik dosyası çalınamadı, yedek melodi deneniyor:", audioError);

          if (invitation.musicFile !== DEFAULT_WEDDING_MUSIC_FILE) {
            throw audioError;
          }
        }
      }

      await startGeneratedMusic();
      setIsMusicPlaying(true);
    } catch (error) {
      setIsMusicPlaying(false);
      console.log("Müzik başlatılamadı:", error);
    }
  };

  const openInvitation = () => {
    setIsOpening(true); 
    
    startMusic().catch((err) => console.log("Müzik başlatılamadı:", err));

    // Animasyonun tüm adımlarının (yukarı çıkma ve büyüme) bitmesini bekle
    setTimeout(() => {
      setOpened(true);
    }, 2100); 
  };


  const toggleMusic = async () => {
    if (isMusicPlaying) {
      stopMusic();
    } else {
      await startMusic();
    }
  };

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setGuestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWishChange = (e) => {
    const { name, value } = e.target;
    setWishForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateAttendance = (attendance) => {
    setGuestForm((prev) => ({
      ...prev,
      attendance,
      personCount: attendance === "Katılacağım" ? "1" : "0",
      side: attendance === "Katılacağım" ? "Gelin Tarafı" : "-",
      hasChild: attendance === "Katılacağım" ? prev.hasChild : "Hayır",
    }));
  };

  const resolveAppModal = (result) => {
    const resolver = modalResolverRef.current;
    modalResolverRef.current = null;
    setAppModal(null);

    if (resolver) {
      resolver(result);
    }
  };

  const openAppModal = (config) => {
    return new Promise((resolve) => {
      modalResolverRef.current = resolve;
      setAppModal({ tone: "info", closeOnBackdrop: false, ...config });
    });
  };

  const showAppAlert = async (message, options = {}) => {
    await openAppModal({
      type: "alert",
      title: options.title || "Bilgi",
      message,
      tone: options.tone || "info",
      icon: options.icon,
      confirmText: options.confirmText || "Tamam",
    });
    return true;
  };

  const showAppConfirm = async (message, options = {}) => {
    return Boolean(
      await openAppModal({
        type: "confirm",
        title: options.title || "Onay gerekiyor",
        message,
        tone: options.tone || "warning",
        icon: options.icon || "?",
        confirmText: options.confirmText || "Evet",
        cancelText: options.cancelText || "Vazgeç",
      })
    );
  };

  const showAppPrompt = async (label, defaultValue = "", options = {}) => {
    return openAppModal({
      type: "prompt",
      title: options.title || "Bilgi düzenle",
      message: label,
      inputValue: defaultValue,
      placeholder: options.placeholder || label,
      multiline: Boolean(options.multiline),
      tone: options.tone || "info",
      icon: options.icon || "✎",
      confirmText: options.confirmText || "Kaydet",
      cancelText: options.cancelText || "Vazgeç",
    });
  };

  const submitGuest = async (e) => {
    e.preventDefault();

    if (!guestForm.name.trim()) {
      await showAppAlert("Lütfen ad soyad gir.", { title: "Eksik bilgi", tone: "warning", icon: "!" });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: "Supabase bağlantısı eksik", tone: "danger", icon: "!" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("guests")
        .insert(uiGuestToDb(guestForm))
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      setGuests((prev) => [
        data ? dbGuestToUi(data) : { id: `local-${Date.now()}`, ...guestForm },
        ...prev,
      ]);

      setGuestForm(INITIAL_GUEST_FORM);
      await showAppAlert("Katılım bildirimin kaydedildi.", { title: "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Katılım kaydedilemedi:", error);
      await showAppAlert(
        `Katılım bildirimi kaydedilemedi. Supabase guests tablosu insert/select RLS policy'lerini kontrol et. Detay: ${error?.message || "Bilinmeyen hata"}`,
        { title: "Kayıt hatası", tone: "danger", icon: "!" }
      );
    }
  };

  const submitWish = async (e) => {
    e.preventDefault();

    if (!wishForm.name.trim() || !wishForm.message.trim()) {
      await showAppAlert("Lütfen isim ve mesaj gir.", { title: "Eksik bilgi", tone: "warning", icon: "!" });
      return;
    }

    if (!isSupabaseReady()) {
      await showAppAlert(getSupabaseSetupMessage(), { title: "Supabase bağlantısı eksik", tone: "danger", icon: "!" });
      return;
    }

    const shouldPublishNow = !settings.requireWishApproval;

    try {
      const { data, error } = await supabase
        .from("wishes")
        .insert({
          name: wishForm.name.trim(),
          message: wishForm.message.trim(),
          approved: shouldPublishNow,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (shouldPublishNow) {
        setWishes((prev) => [
          data ? dbWishToUi(data) : { id: `local-${Date.now()}`, ...wishForm, approved: true },
          ...prev,
        ]);
      }

      setWishForm(INITIAL_WISH_FORM);
      await showAppAlert(settings.requireWishApproval ? "Güzel dileğin admin onayına gönderildi." : "Güzel dileğin kaydedildi.", { title: settings.requireWishApproval ? "Onaya gönderildi" : "Kaydedildi", tone: "success", icon: "✓" });
    } catch (error) {
      console.error("Mesaj kaydedilemedi:", error);
      await showAppAlert(
        `Mesaj kaydedilemedi. Supabase wishes tablosu insert/select RLS policy'lerini kontrol et. Detay: ${error?.message || "Bilinmeyen hata"}`,
        { title: "Kayıt hatası", tone: "danger", icon: "!" }
      );
    }
  };

  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(currentShareLink);
      await showAppAlert("Davetiye linki kopyalandı.", { title: "Kopyalandı", tone: "success", icon: "✓" });
    } catch {
      await showAppAlert("Link kopyalanamadı.", { title: "Kopyalama hatası", tone: "danger", icon: "!" });
    }
  };

  const copyAdminLink = async (linkToCopy, successMessage = "Link kopyalandı.") => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setAdminSaveMessage(successMessage);
    } catch {
      setAdminSaveMessage("Link kopyalanamadı.");
    }
  };

  const submitAdminPassword = async (e) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoginNotice("");
    setAdminAuthLoading(true);

    try {
      if (!isSupabaseReady()) {
        setAdminError(getSupabaseSetupMessage());
        return;
      }

      if (!adminEmail.trim() || !adminPassword.trim()) {
        setAdminError("Lütfen admin e-posta ve şifresini gir.");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });

      if (error) {
        console.error("Admin girişi başarısız:", error);
        setAdminError(getReadableAuthError(error));
        return;
      }

      touchAdminSession();
      setAdminUser(data.user);
      setIsAdminUnlocked(true);
      setActiveAdminTab("general");
      setIsPasswordRecovery(false);
      setShowForgotPassword(false);
      setForgotPasswordMessage("");
      setAdminPassword("");

      const [databaseSettings, adminGuests, adminWishes] = await Promise.all([
        loadSettingsFromDatabase(),
        loadGuestsFromDatabase(),
        loadAllWishesFromDatabase(),
      ]);

      if (databaseSettings) {
        const normalizedDatabaseSettings = normalizeSiteData(databaseSettings);

        setSiteData(normalizedDatabaseSettings);
        setAdminDraft(normalizedDatabaseSettings);
      } else {
        setAdminDraft(normalizeSiteData(siteData));
      }

      setGuests(adminGuests);
      setWishes(adminWishes);
    } catch (error) {
      console.error("Admin girişinde bağlantı hatası:", error);
      setAdminError(getReadableAuthError(error));
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setAdminError("");
    setForgotPasswordLoading(true);

    try {
      if (!isSupabaseReady()) {
        setForgotPasswordMessage(getSupabaseSetupMessage());
        return;
      }

      const email = (forgotPasswordEmail || adminEmail).trim();

      if (!email) {
        setForgotPasswordMessage("Şifre sıfırlama linki için admin e-postanı yazmalısın.");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAdminRedirectUrl(),
      });

      if (error) {
        console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
        setForgotPasswordMessage(getReadableAuthError(error));
        return;
      }

      setForgotPasswordMessage(
        `Şifre sıfırlama linki ${email} adresine gönderildi. Link çalışmazsa Supabase > Authentication > URL Configuration bölümüne şu adresi ekle: ${getAdminRedirectUrl()}`
      );
    } catch (error) {
      console.error("Şifre sıfırlama bağlantı hatası:", error);
      setForgotPasswordMessage(getReadableAuthError(error));
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const completePasswordRecovery = async (e) => {
    e.preventDefault();
    setRecoveryMessage("");
    setRecoveryLoading(true);

    try {
      if (recoveryPassword.trim().length < 6) {
        setRecoveryMessage("Yeni şifre en az 6 karakter olmalı.");
        return;
      }

      if (recoveryPassword !== recoveryPasswordAgain) {
        setRecoveryMessage("Yeni şifreler aynı değil.");
        return;
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setRecoveryMessage(getReadableAuthError(exchangeError));
            return;
          }
        }
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setRecoveryMessage(getReadableAuthError(sessionError));
        return;
      }

      if (!sessionData.session?.user) {
        setRecoveryMessage("Şifre sıfırlama oturumu bulunamadı. Linkin süresi dolmuş olabilir; tekrar 'Şifremi unuttum' linki gönder.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: recoveryPassword,
      });

      if (error) {
        console.error("Şifre sıfırlama tamamlanamadı:", error);
        setRecoveryMessage(getReadableAuthError(error));
        return;
      }

      const recoveredEmail = sessionData.session.user?.email || adminEmail;
      const { error: signOutError } = await supabase.auth.signOut();
      clearAdminSessionTimestamp();

      if (signOutError) {
        console.error("Şifre sıfırlandı ama oturum kapatılamadı:", signOutError);
      }

      setRecoveryPassword("");
      setRecoveryPasswordAgain("");
      setRecoveryMessage("");
      setIsPasswordRecovery(false);
      setShowForgotPassword(false);
      setAdminUser(null);
      setAdminEmail(recoveredEmail);
      setAdminPassword("");
      setIsAdminUnlocked(false);
      setAdminLoginNotice(
        "Şifren güncellendi. Güvenlik için oturum kapatıldı; yeni şifrenle tekrar giriş yap."
      );

      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `${window.location.pathname}?admin=1`);
      }
    } catch (error) {
      console.error("Şifre sıfırlama bağlantı hatası:", error);
      setRecoveryMessage(getReadableAuthError(error));
    } finally {
      setRecoveryLoading(false);
    }
  };

  const changeAdminPassword = async (e) => {
    e.preventDefault();
    setAdminPasswordMessage("");

    const email = adminUser?.email || adminEmail;

    if (!email) {
      setAdminPasswordMessage("Admin e-posta bilgisi bulunamadı. Çıkış yapıp tekrar giriş yap.");
      return;
    }

    if (!adminCurrentPassword.trim()) {
      setAdminPasswordMessage("Mevcut şifreyi yazmalısın.");
      return;
    }

    if (adminNewPassword.trim().length < 6) {
      setAdminPasswordMessage("Yeni şifre en az 6 karakter olmalı.");
      return;
    }

    if (adminNewPassword !== adminNewPasswordAgain) {
      setAdminPasswordMessage("Yeni şifreler aynı değil.");
      return;
    }

    const { error: reLoginError } = await supabase.auth.signInWithPassword({
      email,
      password: adminCurrentPassword,
    });

    if (reLoginError) {
      console.error("Mevcut şifre doğrulanamadı:", reLoginError);
      setAdminPasswordMessage(getReadableAuthError(reLoginError));
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: adminNewPassword,
    });

    if (error) {
      console.error("Admin şifresi güncellenemedi:", error);
      setAdminPasswordMessage(getReadableAuthError(error));
      return;
    }

    const { error: signOutError } = await supabase.auth.signOut();
    clearAdminSessionTimestamp();

    if (signOutError) {
      console.error("Şifre değişti ama oturum kapatılamadı:", signOutError);
      setAdminPasswordMessage(
        "Şifre güncellendi fakat oturum otomatik kapatılamadı. Lütfen sayfayı yenileyip yeni şifrenle giriş yap."
      );
      return;
    }

    setAdminCurrentPassword("");
    setAdminNewPassword("");
    setAdminNewPasswordAgain("");
    setAdminPassword("");
    clearAdminSessionTimestamp();
    setAdminUser(null);
    setIsAdminUnlocked(false);
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setAdminPasswordMessage("");
    setAdminSaveMessage("");
    setAdminError("");
    setAdminLoginNotice("Admin şifresi güncellendi. Güvenlik için oturum kapatıldı. Yeni şifrenle tekrar giriş yapmalısın.");
  };

  const logoutAdmin = async () => {
    const confirmed = await showAppConfirm("Admin panelden çıkış yapmak istiyor musun?", { title: "Çıkış yap", confirmText: "Çıkış Yap", tone: "warning" });
    if (!confirmed) return;

    try {
      if (isSupabaseReady()) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Admin çıkışı yapılamadı:", error);
          setAdminSaveMessage(getReadableAuthError(error));
          return;
        }
      }
    } catch (error) {
      console.error("Admin çıkışı bağlantı hatası:", error);
      setAdminSaveMessage(getReadableAuthError(error));
      return;
    }

    clearAdminSessionTimestamp();
    setAdminUser(null);
    setIsAdminUnlocked(false);
    setActiveAdminTab("general");
    setAdminPassword("");
    setAdminError("");
    setAdminSaveMessage("");
    setAdminPasswordMessage("");
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setAdminLoginNotice("Çıkış yapıldı. Admin paneline girmek için tekrar giriş yapmalısın.");
  };

  const updateDraftObject = (group, key, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };


  const updateDraftImage = async (group, key, file) => {
    try {
      if (!file) return;
      const url = await uploadMediaFile(file, "images");
      updateDraftObject(group, key, url);
      setAdminSaveMessage("Görsel Supabase Storage'a yüklendi. Canlı sayfaya yansıtmak için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Görsel yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Görsel yüklenemedi.");
    }
  };

  const clearDraftImage = (group, key) => {
    updateDraftObject(group, key, "");
    setAdminSaveMessage("Görsel kaldırıldı. Canlı sayfaya yansıtmak için kaydet.");
  };

  const updateDraftMusic = async (file) => {
    try {
      if (!file) return;
      const url = await uploadMediaFile(file, "music");
      setAdminDraft((prev) => ({
        ...prev,
        invitation: {
          ...prev.invitation,
          musicFile: url,
          musicName: file.name || "Yüklenen müzik",
        },
      }));
      setAdminSaveMessage("Müzik Supabase Storage'a yüklendi. Canlı sayfada çalması için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Müzik yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Müzik yüklenemedi.");
    }
  };

  const clearDraftMusic = () => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        musicFile: DEFAULT_WEDDING_MUSIC_FILE,
        musicName: DEFAULT_WEDDING_MUSIC_NAME,
      },
    }));
    setAdminSaveMessage(
      "Özel müzik kaldırıldı. Varsayılan evlilik müziği kullanılacak. Canlı sayfaya yansıtmak için kaydet."
    );
  };

  const updateDraftArrayItem = (arrayKey, index, key, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: prev[arrayKey].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addDraftArrayItem = (arrayKey, item) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: [...prev[arrayKey], item],
    }));
  };

  const removeDraftArrayItem = (arrayKey, index) => {
    setAdminDraft((prev) => ({
      ...prev,
      [arrayKey]: prev[arrayKey].filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const updateGalleryItem = (index, value) => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: prev.invitation.gallery.map((image, imageIndex) =>
          imageIndex === index ? value : image
        ),
      },
    }));
  };


  const updateGalleryImageFile = async (index, file) => {
    try {
      if (!file) return;
      const url = await uploadMediaFile(file, "gallery");
      updateGalleryItem(index, url);
      setAdminSaveMessage("Galeri görseli Supabase Storage'a yüklendi. Canlı sayfada görünmesi için Değişiklikleri Kaydet butonuna bas.");
    } catch (error) {
      console.error("Galeri görseli yüklenemedi:", error);
      setAdminSaveMessage(error.message || "Galeri görseli yüklenemedi.");
    }
  };

  const addGalleryItem = () => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: [...prev.invitation.gallery, ""],
      },
    }));
  };

  const removeGalleryItem = (index) => {
    setAdminDraft((prev) => ({
      ...prev,
      invitation: {
        ...prev.invitation,
        gallery: prev.invitation.gallery.filter((_, imageIndex) => imageIndex !== index),
      },
    }));
  };

  const saveSiteContent = async () => {
    const cleanedData = normalizeSiteData({
      ...adminDraft,
      invitation: {
        ...adminDraft.invitation,
        gallery: adminDraft.invitation.gallery.map((image) => String(image || "").trim()).filter(Boolean),
      },
    });

    try {
      await saveSettingsToDatabase(cleanedData);
      setSiteData(cleanedData);
      setAdminDraft(cleanedData);
      setAdminSaveMessage("Davetiyedeki yazılar, bilgiler ve görseller Supabase'e kaydedildi.");
      setTimeout(() => setAdminSaveMessage(""), 3000);
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Değişiklikler kaydedilemedi. Detay: ${error?.message || "Supabase ayarlarını ve admin yetkisini kontrol et."}`);
    }
  };

  const resetSiteContent = async () => {
    const confirmed = await showAppConfirm("Davetiyedeki düzenlenebilir alanlar varsayılan hale dönsün mü?", { title: "Varsayılana döndür", confirmText: "Döndür", tone: "warning" });
    if (!confirmed) return;

    const defaultData = normalizeSiteData(null);

    try {
      await saveSettingsToDatabase(defaultData);
      setSiteData(defaultData);
      setAdminDraft(defaultData);
      setAdminSaveMessage("Davetiyedeki içerikler varsayılan hale getirildi.");
    } catch (error) {
      console.error("Varsayılan ayarlar kaydedilemedi:", error);
      setAdminSaveMessage(`Varsayılan ayarlar kaydedilemedi. Detay: ${error?.message || "Supabase hatası"}`);
    }
  };

  const clearGuests = async () => {
    const confirmed = await showAppConfirm("Tüm katılım kayıtları silinsin mi?", { title: "Katılım kayıtlarını sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("guests").delete().not("id", "is", null);

    if (error) {
      console.error("Katılım kayıtları silinemedi:", error);
      setAdminSaveMessage("Katılım kayıtları silinemedi.");
      return;
    }

    setGuests([]);
  };

  const clearWishes = async () => {
    const confirmed = await showAppConfirm("Tüm anı defteri mesajları silinsin mi?", { title: "Anı defterini temizle", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("wishes").delete().not("id", "is", null);

    if (error) {
      console.error("Anı defteri mesajları silinemedi:", error);
      setAdminSaveMessage("Anı defteri mesajları silinemedi.");
      return;
    }

    setWishes([]);
  };

  const deleteGuest = async (guestId) => {
    const confirmed = await showAppConfirm("Bu katılım kaydı silinsin mi?", { title: "Kaydı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("guests").delete().eq("id", guestId);

    if (error) {
      console.error("Katılım kaydı silinemedi:", error);
      setAdminSaveMessage("Katılım kaydı silinemedi.");
      return;
    }

    setGuests((prev) => prev.filter((guest) => guest.id !== guestId));
  };

  const editGuest = async (guestId) => {
    const guest = guests.find((item) => item.id === guestId);
    if (!guest) return;

    const name = await showAppPrompt("Ad Soyad", guest.name || "", { title: "Katılım kaydını düzenle" });
    if (name === null) return;
    const phone = await showAppPrompt("Telefon", guest.phone || "", { title: "Katılım kaydını düzenle" });
    if (phone === null) return;
    const attendance = await showAppPrompt("Katılım durumu", guest.attendance || "Katılacağım", { title: "Katılım kaydını düzenle" });
    if (attendance === null) return;
    const personCount = await showAppPrompt("Kişi sayısı", guest.personCount || "1", { title: "Katılım kaydını düzenle" });
    if (personCount === null) return;
    const side = await showAppPrompt("Taraf", guest.side || "Gelin Tarafı", { title: "Katılım kaydını düzenle" });
    if (side === null) return;
    const hasChild = await showAppPrompt("Çocuk var mı? Evet/Hayır", guest.hasChild || "Hayır", { title: "Katılım kaydını düzenle" });
    if (hasChild === null) return;
    const note = await showAppPrompt("Not", guest.note || "", { title: "Katılım kaydını düzenle", multiline: true });
    if (note === null) return;

    const nextGuest = { ...guest, name, phone, attendance, personCount, side, hasChild, note };
    const { error } = await supabase
      .from("guests")
      .update(uiGuestToDb(nextGuest))
      .eq("id", guestId);

    if (error) {
      console.error("Katılım kaydı güncellenemedi:", error);
      setAdminSaveMessage("Katılım kaydı güncellenemedi.");
      return;
    }

    setGuests((prev) => prev.map((item) => (item.id === guestId ? nextGuest : item)));
  };

  const deleteWish = async (wishId) => {
    const confirmed = await showAppConfirm("Bu anı defteri mesajı silinsin mi?", { title: "Mesajı sil", confirmText: "Sil", tone: "danger", icon: "!" });
    if (!confirmed) return;

    const { error } = await supabase.from("wishes").delete().eq("id", wishId);

    if (error) {
      console.error("Anı defteri mesajı silinemedi:", error);
      setAdminSaveMessage("Anı defteri mesajı silinemedi.");
      return;
    }

    setWishes((prev) => prev.filter((wish) => wish.id !== wishId));
  };

  const editWish = async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;

    const name = await showAppPrompt("Ad Soyad", wish.name || "", { title: "Anı defteri mesajını düzenle" });
    if (name === null) return;
    const message = await showAppPrompt("Mesaj", wish.message || "", { title: "Anı defteri mesajını düzenle", multiline: true });
    if (message === null) return;

    const nextWish = { ...wish, name, message };
    const { error } = await supabase
      .from("wishes")
      .update(uiWishToDb(nextWish))
      .eq("id", wishId);

    if (error) {
      console.error("Anı defteri mesajı güncellenemedi:", error);
      setAdminSaveMessage("Anı defteri mesajı güncellenemedi.");
      return;
    }

    setWishes((prev) => prev.map((item) => (item.id === wishId ? nextWish : item)));
  };

  const toggleWishApproval = async (wishId) => {
    const wish = wishes.find((item) => item.id === wishId);
    if (!wish) return;

    const nextApproved = wish.approved === false;
    const { error } = await supabase
      .from("wishes")
      .update({ approved: nextApproved })
      .eq("id", wishId);

    if (error) {
      console.error("Mesaj onay durumu değiştirilemedi:", error);
      setAdminSaveMessage("Mesaj onay durumu değiştirilemedi.");
      return;
    }

    setWishes((prev) =>
      prev.map((item) => (item.id === wishId ? { ...item, approved: nextApproved } : item))
    );
  };

  const getGuestExportData = () => {
    const headers = ["Ad Soyad", "Telefon", "Katılım Durumu", "Kişi Sayısı", "Taraf", "Çocuk", "Not"];
    const rows = guests.map((guest) => ({
      "Ad Soyad": guest.name || "",
      "Telefon": guest.phone || "",
      "Katılım Durumu": guest.attendance || "",
      "Kişi Sayısı": guest.personCount || "",
      "Taraf": guest.side || "",
      "Çocuk": guest.hasChild || "Hayır",
      "Not": guest.note || "",
    }));
    return { headers, rows };
  };

  const getWishExportData = () => {
    const headers = ["Ad Soyad", "Mesaj", "Durum"];
    const rows = wishes.map((wish) => ({
      "Ad Soyad": wish.name || "",
      "Mesaj": wish.message || "",
      "Durum": wish.approved === false ? "Onay Bekliyor" : "Yayında",
    }));
    return { headers, rows };
  };

  const exportGuestsCsv = () => {
    const { headers, rows } = getGuestExportData();
    downloadTextFile("katilim-listesi.csv", createCsv(headers, rows), "text/csv;charset=utf-8");
  };

  const exportGuestsExcel = () => {
    const { headers, rows } = getGuestExportData();
    downloadTextFile(
      "katilim-listesi.xls",
      createExcelTable("Katılım Listesi", headers, rows),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const exportWishesCsv = () => {
    const { headers, rows } = getWishExportData();
    downloadTextFile("ani-defteri.csv", createCsv(headers, rows), "text/csv;charset=utf-8");
  };

  const exportWishesExcel = () => {
    const { headers, rows } = getWishExportData();
    downloadTextFile(
      "ani-defteri.xls",
      createExcelTable("Anı Defteri Mesajları", headers, rows),
      "application/vnd.ms-excel;charset=utf-8"
    );
  };

  const exportAllDataJson = () => {
    const data = {
      siteData,
      guests,
      wishes,
      exportedAt: new Date().toISOString(),
    };
    downloadTextFile("dugun-davetiyesi-yedek.json", JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  };

  const importAllDataJson = async () => {
    try {
      const parsed = JSON.parse(dataImportText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("JSON içeriği geçerli bir yedek nesnesi değil.");
      }

      if (parsed.siteData) {
        const nextSiteData = mergeSiteData(parsed.siteData);
        await saveSettingsToDatabase(nextSiteData);
        setSiteData(nextSiteData);
        setAdminDraft(nextSiteData);
      }

      if (Array.isArray(parsed.guests)) {
        const deleteResult = await supabase.from("guests").delete().not("id", "is", null);
        if (deleteResult.error) throw deleteResult.error;

        const guestRows = parsed.guests.map(uiGuestToDb);
        if (guestRows.length > 0) {
          const insertResult = await supabase.from("guests").insert(guestRows);
          if (insertResult.error) throw insertResult.error;
        }
        setGuests(await loadGuestsFromDatabase());
      }

      if (Array.isArray(parsed.wishes)) {
        const deleteResult = await supabase.from("wishes").delete().not("id", "is", null);
        if (deleteResult.error) throw deleteResult.error;

        const wishRows = parsed.wishes.map(uiWishToDb);
        if (wishRows.length > 0) {
          const insertResult = await supabase.from("wishes").insert(wishRows);
          if (insertResult.error) throw insertResult.error;
        }
        setWishes(await loadAllWishesFromDatabase());
      }

      setDataImportText("");
      setAdminSaveMessage("Yedek başarıyla Supabase'e aktarıldı.");
    } catch (error) {
      console.error("Yedek içe aktarılamadı:", error);
      setAdminSaveMessage(`Yedek içe aktarılamadı. Detay: ${error?.message || "JSON formatını ve Supabase yetkilerini kontrol et."}`);
    }
  };

  const downloadQrCode = async () => {
    try {
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error("QR kod indirilemedi.");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dugun-davetiye-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("QR kod indirilemedi:", error);
      window.open(qrImageUrl, "_blank", "noopener,noreferrer");
      setAdminSaveMessage("QR kod yeni sekmede açıldı. Görsele sağ tıklayıp kaydedebilirsin.");
    }
  };

  const closeAdminPage = () => {
    setIsAdminPage(false);
    setIsAdminUnlocked(false);
    setAdminPassword("");
    setAdminError("");
    setAdminLoginNotice("");
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("");
    setIsPasswordRecovery(false);
    setRecoveryPassword("");
    setRecoveryPasswordAgain("");
    setRecoveryMessage("");
    setAdminSaveMessage("");
    setOpened(true);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("admin");
      url.searchParams.delete("reset");
      url.searchParams.delete("type");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  };

  const openAdminTab = (tabId) => {
    setActiveAdminTab(tabId);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        document.querySelector(".admin-main-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 40);
    }
  };

  const renderAdminPage = () => {
    const adminTabs = [
      { id: "general", label: "Genel Bilgiler", description: "İsim, tarih, mekan, linkler" },
      { id: "theme", label: "Tema", description: "Renk teması ve anı defteri onayı" },
      { id: "security", label: "Admin Şifresi", description: "Panel giriş şifresini değiştir" },
      { id: "messages", label: "WhatsApp Mesajları", description: "Paylaşım, katılım ve özel davetli metinleri" },
      { id: "copy", label: "Başlıklar", description: "Sayfadaki yazı ve başlıklar" },
      { id: "family", label: "Aile Bilgileri", description: "Gelin ve damat aileleri" },
      { id: "ceremony", label: "Nikah / Düğün", description: "Nikah ve eğlence ayrımı" },
      { id: "schedule", label: "Düğün Takvimi", description: "Saat saat akış" },
      { id: "gallery", label: "Görsel / Müzik", description: "Ana ekran görselleri, galeri ve müzik" },
      { id: "guests", label: "Katılım Formu Kayıtları", description: "Ad, telefon, kişi, çocuk ve not bilgileri" },
      { id: "wishes", label: "Anı Defteri Formu", description: "Ad soyad ve mesaj kayıtları" },
      { id: "qr", label: "QR Kod", description: "Davetiye QR kodu ve genel paylaşım linki" },
      { id: "personalLink", label: "Özel Link", description: "Davetliye özel isimli link oluşturma" },
      { id: "data", label: "Veri Yedeği", description: "Excel / CSV ve JSON yedek alma" },
    ];

    const activeTabInfo = adminTabs.find((tab) => tab.id === activeAdminTab) || adminTabs[0];
    const filteredGuests = guests.filter((guest) => {
      const searchMatch = normalizeText(`${guest.name} ${guest.phone} ${guest.note} ${guest.side}`).includes(normalizeText(adminGuestSearch));
      const attendanceMatch = adminGuestAttendanceFilter === "all" || guest.attendance === adminGuestAttendanceFilter;
      const sideMatch = adminGuestSideFilter === "all" || guest.side === adminGuestSideFilter;
      const childMatch = adminGuestChildFilter === "all" || (guest.hasChild || "Hayır") === adminGuestChildFilter;
      return searchMatch && attendanceMatch && sideMatch && childMatch;
    });
    const filteredWishes = wishes.filter((wish) => {
      const searchMatch = normalizeText(`${wish.name} ${wish.message}`).includes(normalizeText(adminWishSearch));
      const isApproved = wish.approved !== false;
      const statusMatch =
        adminWishStatusFilter === "all" ||
        (adminWishStatusFilter === "approved" && isApproved) ||
        (adminWishStatusFilter === "pending" && !isApproved);
      return searchMatch && statusMatch;
    });

    const renderAdminActivePanel = () => {
      switch (activeAdminTab) {
        case "general":
          return (
            <AdminSection title="Genel Davetiye Bilgileri">
              <div className="admin-edit-grid">
                <AdminField label="Gelin adı" value={adminDraft.invitation.bride} onChange={(value) => updateDraftObject("invitation", "bride", value)} />
                <AdminField label="Damat adı" value={adminDraft.invitation.groom} onChange={(value) => updateDraftObject("invitation", "groom", value)} />
                <AdminField label="Görünen tarih" value={adminDraft.invitation.dateText} onChange={(value) => updateDraftObject("invitation", "dateText", value)} />
                <AdminField label="Saat" value={adminDraft.invitation.timeText} onChange={(value) => updateDraftObject("invitation", "timeText", value)} />
                <AdminField label="Geri sayım tarihi" value={adminDraft.invitation.weddingDate} onChange={(value) => updateDraftObject("invitation", "weddingDate", value)} placeholder="2026-09-12T19:00:00" />
                <AdminField label="WhatsApp numarası" value={adminDraft.invitation.whatsappNumber} onChange={(value) => updateDraftObject("invitation", "whatsappNumber", value)} />
                <AdminField label="Mekan adı" value={adminDraft.invitation.venue} onChange={(value) => updateDraftObject("invitation", "venue", value)} />
                <AdminField label="Adres" value={adminDraft.invitation.address} onChange={(value) => updateDraftObject("invitation", "address", value)} />
                <AdminField label="Harita linki" value={adminDraft.invitation.mapLink} onChange={(value) => updateDraftObject("invitation", "mapLink", value)} />
                <AdminField label="Paylaşım linki" value={adminDraft.invitation.shareLink} onChange={(value) => updateDraftObject("invitation", "shareLink", value)} placeholder={getCurrentShareLink()} />
                <AdminTextarea label="Ana davet metni" value={adminDraft.invitation.message} onChange={(value) => updateDraftObject("invitation", "message", value)} />
              </div>
            </AdminSection>
          );

        case "theme":
          return (
            <AdminSection title="Tema ve Yayın Ayarları">
              <p className="admin-help-text">
                Tema değiştiğinde butonlar, kartlar, yazı renkleri, arka planlar ve ana görsellerin üzerindeki renk katmanı aynı temaya göre değişir. Koyu tema da buradan seçilebilir.
              </p>

              <div className="theme-picker-grid">
                {THEMES.map((theme) => (
                  <button
                    type="button"
                    key={theme.value}
                    className={adminDraft.settings.theme === theme.value ? "theme-option-card active" : "theme-option-card"}
                    data-theme-preview={theme.value}
                    onClick={() => updateDraftObject("settings", "theme", theme.value)}
                  >
                    <span className="theme-swatch" aria-hidden="true"></span>
                    <strong>{theme.label}</strong>
                    <small>{adminDraft.settings.theme === theme.value ? "Seçili tema" : "Bu temayı kullan"}</small>
                  </button>
                ))}
              </div>

              <div className="admin-theme-check-row">
                <AdminCheckbox
                  label="Anı defteri mesajları admin onayından sonra yayınlansın"
                  checked={adminDraft.settings.requireWishApproval}
                  onChange={(value) => updateDraftObject("settings", "requireWishApproval", value)}
                />
              </div>
            </AdminSection>
          );

        case "security":
          return (
            <AdminSection title="Admin Panel Şifresi">
              <p className="admin-help-text">
                Admin panel Supabase Auth ile korunur. Buradan giriş yaptığın admin kullanıcısının şifresini güncellersin. Şifre değişince güvenlik için oturum kapatılır ve yeni şifreyle tekrar giriş yapılır.
              </p>

              <form className="admin-password-form" onSubmit={changeAdminPassword}>
                <div className="admin-edit-grid">
                  <AdminField
                    label="Mevcut şifre"
                    type="password"
                    value={adminCurrentPassword}
                    onChange={setAdminCurrentPassword}
                    placeholder="Mevcut admin şifresi"
                  />
                  <AdminField
                    label="Yeni şifre"
                    type="password"
                    value={adminNewPassword}
                    onChange={setAdminNewPassword}
                    placeholder="Yeni şifre"
                  />
                  <AdminField
                    label="Yeni şifre tekrar"
                    type="password"
                    value={adminNewPasswordAgain}
                    onChange={setAdminNewPasswordAgain}
                    placeholder="Yeni şifreyi tekrar yaz"
                  />
                </div>

                <div className="admin-password-actions">
                  <button type="submit" className="main-button">Şifreyi Güncelle</button>
                  {adminPasswordMessage && <span className="admin-password-message">{adminPasswordMessage}</span>}
                </div>
              </form>
            </AdminSection>
          );

        case "messages":
          return (
            <AdminSection title="WhatsApp ve Özel Davetli Mesajları">
              <p className="admin-help-text">
                Kullanabileceğin değişkenler: {"{couple}"} çift adını, {"{link}"} davetiye linkini, {"{guest}"} özel davetli adını yazar.
              </p>
              <div className="admin-edit-grid">
                <AdminTextarea label="WhatsApp paylaşım mesajı" value={adminDraft.messages.whatsappShareMessage} onChange={(value) => updateDraftObject("messages", "whatsappShareMessage", value)} />
                <AdminTextarea label="WhatsApp katılım bildirimi mesajı" value={adminDraft.messages.rsvpWhatsappMessage} onChange={(value) => updateDraftObject("messages", "rsvpWhatsappMessage", value)} />
                <AdminTextarea label="Kişiye özel davetli karşılama metni" value={adminDraft.messages.guestGreeting} onChange={(value) => updateDraftObject("messages", "guestGreeting", value)} />
              </div>
            </AdminSection>
          );

        case "copy":
          return (
            <AdminSection title="Sayfadaki Başlık ve Açıklamalar">
              <div className="admin-edit-grid">
                {Object.entries(adminDraft.copy).map(([key, value]) => (
                  key.toLowerCase().includes("text") || key.toLowerCase().includes("description") ? (
                    <AdminTextarea key={key} label={key} value={value} onChange={(nextValue) => updateDraftObject("copy", key, nextValue)} />
                  ) : (
                    <AdminField key={key} label={key} value={value} onChange={(nextValue) => updateDraftObject("copy", key, nextValue)} />
                  )
                ))}
              </div>
            </AdminSection>
          );

        case "family":
          return (
            <AdminSection title="Aile Bilgileri">
              <div className="admin-edit-grid">
                <AdminField label="Gelin ailesi başlığı" value={adminDraft.familyInfo.brideFamilyTitle} onChange={(value) => updateDraftObject("familyInfo", "brideFamilyTitle", value)} />
                <AdminField label="Gelin ailesi adı" value={adminDraft.familyInfo.brideFamilyName} onChange={(value) => updateDraftObject("familyInfo", "brideFamilyName", value)} />
                <AdminField label="Damat ailesi başlığı" value={adminDraft.familyInfo.groomFamilyTitle} onChange={(value) => updateDraftObject("familyInfo", "groomFamilyTitle", value)} />
                <AdminField label="Damat ailesi adı" value={adminDraft.familyInfo.groomFamilyName} onChange={(value) => updateDraftObject("familyInfo", "groomFamilyName", value)} />
                <AdminTextarea label="Aile açıklaması" value={adminDraft.familyInfo.text} onChange={(value) => updateDraftObject("familyInfo", "text", value)} />
              </div>
            </AdminSection>
          );

        case "ceremony":
          return (
            <AdminSection title="Nikah / Düğün Ayrımı">
              <div className="admin-repeat-list">
                {adminDraft.eventDetails.map((event, index) => (
                  <div className="admin-repeat-item" key={`event-${index}`}>
                    <div className="admin-repeat-title">
                      <strong>Etkinlik {index + 1}</strong>
                      <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("eventDetails", index)}>
                        Sil
                      </button>
                    </div>
                    <div className="admin-edit-grid">
                      <AdminField label="Başlık" value={event.label} onChange={(value) => updateDraftArrayItem("eventDetails", index, "label", value)} />
                      <AdminField label="Saat" value={event.time} onChange={(value) => updateDraftArrayItem("eventDetails", index, "time", value)} />
                      <AdminField label="Yer" value={event.location} onChange={(value) => updateDraftArrayItem("eventDetails", index, "location", value)} />
                      <AdminTextarea label="Açıklama" value={event.description} onChange={(value) => updateDraftArrayItem("eventDetails", index, "description", value)} />
                    </div>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("eventDetails", { label: "Yeni Etkinlik", time: "", location: "", description: "" })}>
                  Yeni Etkinlik Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "schedule":
          return (
            <AdminSection title="Düğün Takvimi / Akış">
              <div className="admin-repeat-list">
                {adminDraft.scheduleItems.map((item, index) => (
                  <div className="admin-repeat-item" key={`schedule-${index}`}>
                    <div className="admin-repeat-title">
                      <strong>Akış {index + 1}</strong>
                      <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeDraftArrayItem("scheduleItems", index)}>
                        Sil
                      </button>
                    </div>
                    <div className="admin-edit-grid">
                      <AdminField label="Saat" value={item.time} onChange={(value) => updateDraftArrayItem("scheduleItems", index, "time", value)} />
                      <AdminField label="Başlık" value={item.title} onChange={(value) => updateDraftArrayItem("scheduleItems", index, "title", value)} />
                      <AdminTextarea label="Açıklama" value={item.description} onChange={(value) => updateDraftArrayItem("scheduleItems", index, "description", value)} />
                    </div>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={() => addDraftArrayItem("scheduleItems", { time: "", title: "Yeni Akış", description: "" })}>
                  Yeni Akış Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "gallery":
          return (
            <AdminSection title="Görsel Yönetimi">
              <div className="admin-edit-grid">
                <AdminImageField
                  label="Açılış ekranı resmi"
                  value={adminDraft.invitation.introImage}
                  onFileSelect={(e) => updateDraftImage("invitation", "introImage", e.target.files?.[0])}
                  onClear={() => clearDraftImage("invitation", "introImage")}
                />
                <AdminImageField
                  label="Ana ekran büyük resmi"
                  value={adminDraft.invitation.heroImage}
                  onFileSelect={(e) => updateDraftImage("invitation", "heroImage", e.target.files?.[0])}
                  onClear={() => clearDraftImage("invitation", "heroImage")}
                />
                <AdminMusicField
                  value={adminDraft.invitation.musicFile}
                  fileName={adminDraft.invitation.musicName}
                  onFileSelect={(e) => updateDraftMusic(e.target.files?.[0])}
                  onClear={clearDraftMusic}
                />
              </div>

              <div className="admin-repeat-list admin-gallery-list">
                {adminDraft.invitation.gallery.map((image, index) => (
                  <div className="admin-gallery-upload-row" key={`gallery-${index}`}>
                    <AdminImageField
                      label={`Galeri ${index + 1}`}
                      value={image}
                      onFileSelect={(e) => updateGalleryImageFile(index, e.target.files?.[0])}
                      onClear={() => updateGalleryItem(index, "")}
                    />
                    <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => removeGalleryItem(index)}>
                      Galeriden Sil
                    </button>
                  </div>
                ))}
                <button type="button" className="secondary-button admin-add-button" onClick={addGalleryItem}>
                  Yeni Görsel Alanı Ekle
                </button>
              </div>
            </AdminSection>
          );

        case "guests":
          return (
            <AdminSection title="Katılım Formu Kayıtları">
              <div className="admin-stats admin-stats-inside">
                <div><strong>{guests.length}</strong><span>Toplam Yanıt</span></div>
                <div><strong>{totalPersonCount}</strong><span>Katılacak Kişi</span></div>
                <div><strong>{notAttendingCount}</strong><span>Katılamayacak</span></div>
                <div><strong>{childGuestCount}</strong><span>Çocuklu Yanıt</span></div>
                <div><strong>{brideSideCount}</strong><span>Gelin Tarafı</span></div>
                <div><strong>{groomSideCount}</strong><span>Damat Tarafı</span></div>
              </div>

              <div className="admin-toolbar">
                <input value={adminGuestSearch} onChange={(e) => setAdminGuestSearch(e.target.value)} placeholder="Kayıtlarda ara" />
                <AdminDropdown
                  value={adminGuestAttendanceFilter}
                  onChange={setAdminGuestAttendanceFilter}
                  options={[
                    { value: "all", label: "Tüm katılımlar" },
                    { value: "Katılacağım", label: "Katılacağım" },
                    { value: "Katılamayacağım", label: "Katılamayacağım" },
                  ]}
                />
                <AdminDropdown
                  value={adminGuestSideFilter}
                  onChange={setAdminGuestSideFilter}
                  options={[
                    { value: "all", label: "Tüm taraflar" },
                    { value: "Gelin Tarafı", label: "Gelin Tarafı" },
                    { value: "Damat Tarafı", label: "Damat Tarafı" },
                    { value: "Ortak", label: "Ortak" },
                  ]}
                />
                <AdminDropdown
                  value={adminGuestChildFilter}
                  onChange={setAdminGuestChildFilter}
                  options={[
                    { value: "all", label: "Çocuk filtresi" },
                    { value: "Evet", label: "Çocuk Var" },
                    { value: "Hayır", label: "Çocuk Yok" },
                  ]}
                />
                <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
              </div>

              <div className="admin-list admin-list-full">
                {filteredGuests.length === 0 ? (
                  <p className="empty-text">Bu filtreye uygun kayıt yok.</p>
                ) : (
                  filteredGuests.map((guest) => (
                    <div className="admin-row" key={guest.id}>
                      <strong>{guest.name}</strong>
                      <span>{guest.attendance} · {guest.personCount} kişi · {guest.side}</span>
                      <span>Telefon: {guest.phone || "-"}</span>
                      <span>Çocuk: {guest.hasChild || "Hayır"}</span>
                      {guest.note && <em>Not: {guest.note}</em>}
                      <div className="admin-row-actions">
                        <button type="button" className="secondary-button small-admin-button" onClick={() => editGuest(guest.id)}>Düzenle</button>
                        <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteGuest(guest.id)}>Sil</button>
                      </div>
                    </div>
                  ))
                )}
                <button type="button" className="secondary-button danger-button" onClick={clearGuests}>
                  Katılım Kayıtlarını Temizle
                </button>
              </div>
            </AdminSection>
          );

        case "wishes":
          return (
            <AdminSection title="Anı Defteri Formu Mesajları">
              <div className="admin-toolbar">
                <input value={adminWishSearch} onChange={(e) => setAdminWishSearch(e.target.value)} placeholder="Mesajlarda ara" />
                <AdminDropdown
                  value={adminWishStatusFilter}
                  onChange={setAdminWishStatusFilter}
                  options={[
                    { value: "all", label: "Tüm mesajlar" },
                    { value: "approved", label: "Yayında" },
                    { value: "pending", label: "Onay bekliyor" },
                  ]}
                />
                <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
                <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
              </div>

              <div className="admin-list admin-list-full">
                {filteredWishes.length === 0 ? (
                  <p className="empty-text">Bu filtreye uygun mesaj yok.</p>
                ) : (
                  filteredWishes.map((wish) => (
                    <div className="admin-row" key={wish.id}>
                      <strong>{wish.name}</strong>
                      <span>Durum: {wish.approved === false ? "Onay bekliyor" : "Yayında"}</span>
                      <em>{wish.message}</em>
                      <div className="admin-row-actions">
                        <button type="button" className="secondary-button small-admin-button" onClick={() => toggleWishApproval(wish.id)}>
                          {wish.approved === false ? "Onayla" : "Yayından Kaldır"}
                        </button>
                        <button type="button" className="secondary-button small-admin-button" onClick={() => editWish(wish.id)}>Düzenle</button>
                        <button type="button" className="secondary-button danger-button small-admin-button" onClick={() => deleteWish(wish.id)}>Sil</button>
                      </div>
                    </div>
                  ))
                )}
                <button type="button" className="secondary-button danger-button" onClick={clearWishes}>
                  Mesajları Temizle
                </button>
              </div>
            </AdminSection>
          );

        case "qr":
          return (
            <AdminSection title="QR Kod">
              <p className="admin-help-text">
                Bu bölüm sadece genel davetiye QR kodu içindir. Davetliye özel isimli link oluşturmak için sol menüden “Özel Link” bölümünü aç.
              </p>

              <div className="admin-qr-panel qr-only-panel">
                <div>
                  <span>Genel Davetiye QR Kodu</span>
                  <img src={qrImageUrl} alt="Davetiye QR kodu" />
                  <div className="admin-qr-actions">
                    <button type="button" className="secondary-button" onClick={downloadQrCode}>QR Kodu İndir</button>
                    <button type="button" className="secondary-button" onClick={() => copyAdminLink(currentShareLink, "Davetiye linki kopyalandı.")}>Linki Kopyala</button>
                  </div>
                </div>
                <div className="admin-link-preview-box">
                  <span>QR kodun açacağı link</span>
                  <input value={currentShareLink} readOnly />
                  <small>Bu link genel davetiye linkidir; davetli adı içermez.</small>
                </div>
              </div>
            </AdminSection>
          );

        case "personalLink":
          return (
            <AdminSection title="Kişiye Özel Davetli Linki">
              <p className="admin-help-text">
                Buradan davetliye özel link oluşturabilirsin. Link açıldığında ana sayfada davetli adına özel karşılama metni gösterilir.
              </p>

              <div className="admin-personal-link-box personal-link-standalone">
                <AdminField label="Davetli adı" value={personalLinkName} onChange={setPersonalLinkName} placeholder="Örn. Ahmet Yılmaz" />
                <input value={personalGuestLink} readOnly />
                <button type="button" className="secondary-button" onClick={() => copyAdminLink(personalGuestLink, "Kişiye özel link kopyalandı.")}>Özel Linki Kopyala</button>
              </div>
            </AdminSection>
          );

        case "data":
          return (
            <AdminSection title="Veri İndirme ve Yedekleme">
              <p className="admin-help-text">
                Katılım ve anı defteri kayıtlarını Excel veya CSV olarak indirebilirsin. JSON yedek ise tüm davetiye ayarlarını, kayıtları ve görsel/müzik verilerini saklar.
              </p>

              <div className="admin-export-grid">
                <div className="admin-export-card">
                  <strong>Katılım Formu</strong>
                  <span>Ad, telefon, katılım, kişi sayısı, taraf, çocuk ve not bilgileri.</span>
                  <div className="admin-export-actions">
                    <button type="button" className="secondary-button" onClick={exportGuestsExcel}>Excel İndir</button>
                    <button type="button" className="secondary-button" onClick={exportGuestsCsv}>CSV İndir</button>
                  </div>
                </div>

                <div className="admin-export-card">
                  <strong>Anı Defteri</strong>
                  <span>İsim, mesaj ve yayın/onay durumları.</span>
                  <div className="admin-export-actions">
                    <button type="button" className="secondary-button" onClick={exportWishesExcel}>Excel İndir</button>
                    <button type="button" className="secondary-button" onClick={exportWishesCsv}>CSV İndir</button>
                  </div>
                </div>

                <div className="admin-export-card">
                  <strong>Tüm Davetiye Yedeği</strong>
                  <span>Davetiye içerikleri, tema, görseller, müzik, kayıtlar ve mesajlar.</span>
                  <button type="button" className="main-button" onClick={exportAllDataJson}>Tüm Veriyi JSON İndir</button>
                </div>
              </div>

              <div className="admin-import-box">
                <AdminTextarea label="JSON yedeğini buraya yapıştır" value={dataImportText} onChange={setDataImportText} placeholder="Yedek JSON içeriği" />
                <button type="button" className="secondary-button" onClick={importAllDataJson}>JSON Yedeğini Geri Yükle</button>
              </div>
            </AdminSection>
          );

        default:
          return null;
      }
    };

    return (
      <main className="admin-page">
        <section className="card admin-card admin-page-card admin-shell-card">
          <div className="admin-page-header">
            <button type="button" className="secondary-button admin-back-button" onClick={closeAdminPage}>
              Davetiyeye Dön
            </button>

            <p className="section-label">Yönetim</p>
            <h2>Admin Panel</h2>
            <p>
              Sol taraftan düzenlemek istediğiniz bölümü seçebilirsiniz. Böylece sayfanın en altındaki bölümlere tek tek kaydırmadan ulaşabilirsiniz.
            </p>
          </div>

          {!isAdminUnlocked ? (
            isPasswordRecovery ? (
              <form className="admin-login admin-recovery-form" onSubmit={completePasswordRecovery}>
                <p className="admin-login-note">
                  Şifre sıfırlama linki açıldı. Yeni admin şifreni belirle.
                </p>
                <input
                  type="password"
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder="Yeni şifre"
                />
                <input
                  type="password"
                  value={recoveryPasswordAgain}
                  onChange={(e) => setRecoveryPasswordAgain(e.target.value)}
                  placeholder="Yeni şifre tekrar"
                />
                <button className="main-button" type="submit" disabled={recoveryLoading}>
                  {recoveryLoading ? "Kaydediliyor..." : "Yeni Şifreyi Kaydet"}
                </button>
                {recoveryMessage && <span className="admin-login-message">{recoveryMessage}</span>}
              </form>
            ) : showForgotPassword ? (
              <form className="admin-login admin-forgot-form" onSubmit={sendPasswordResetEmail}>
                <p className="admin-login-note">
                  Admin e-postanı yaz. Supabase sana şifre sıfırlama linki gönderecek.
                </p>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="Admin e-posta"
                />
                <button className="main-button" type="submit" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
                </button>
                <button
                  type="button"
                  className="admin-link-button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordMessage("");
                  }}
                >
                  Giriş ekranına dön
                </button>
                {forgotPasswordMessage && <span className="admin-login-message">{forgotPasswordMessage}</span>}
              </form>
            ) : (
              <form className="admin-login" onSubmit={submitAdminPassword}>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Admin e-posta"
                />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Admin şifresi"
                />
                <button className="main-button" type="submit" disabled={adminAuthLoading}>
                  {adminAuthLoading ? "Giriş kontrol ediliyor..." : "Giriş Yap"}
                </button>
                <button
                  type="button"
                  className="admin-link-button"
                  onClick={() => {
                    setForgotPasswordEmail(adminEmail);
                    setShowForgotPassword(true);
                    setAdminError("");
                    setAdminLoginNotice("");
                  }}
                >
                  Şifremi unuttum
                </button>
                {adminLoginNotice && <span className="admin-login-message success">{adminLoginNotice}</span>}
                {adminError && <span className="admin-login-message error">{adminError}</span>}
                <small className="admin-login-note">
                  Not: Bu sistem Supabase Auth kullanır. Eski 1234 şifresiyle değil, Supabase Authentication &gt; Users bölümündeki admin e-posta/şifresiyle giriş yapılır. Failed to fetch görürsen .env.local içindeki Supabase URL / anon key değerlerini ve sunucuyu yeniden başlattığını kontrol et.
                </small>
              </form>
            )
          ) : (
            <div className="admin-layout">
              <aside className="admin-sidebar" aria-label="Admin bölüm menüsü">
                <div className="admin-sidebar-title">
                  <span>Bölümler</span>
                  <small>Düzenlemek istediğin alanı seç</small>
                </div>

                <div className="admin-sidebar-menu">
                  {adminTabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      className={activeAdminTab === tab.id ? "admin-nav-button active" : "admin-nav-button"}
                      onClick={() => openAdminTab(tab.id)}
                    >
                      <span>{tab.label}</span>
                      <small>{tab.description}</small>
                    </button>
                  ))}
                </div>
              </aside>

              <div className="admin-main-panel">
                <div className="admin-actions-sticky">
                  <div className="admin-current-section">
                    <strong>{activeTabInfo.label}</strong>
                    <span>{activeTabInfo.description}</span>
                  </div>
                  <button type="button" className="main-button" onClick={saveSiteContent}>
                    Değişiklikleri Kaydet
                  </button>
                  <button type="button" className="secondary-button" onClick={resetSiteContent}>
                    Varsayılana Döndür
                  </button>
                  <button type="button" className="secondary-button admin-logout-button" onClick={logoutAdmin}>
                    Çıkış Yap
                  </button>
                  {adminSaveMessage && <span className="admin-save-message">{adminSaveMessage}</span>}
                </div>

                <div className="admin-editor admin-editor-single">
                  {renderAdminActivePanel()}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    );
  };

  return (
    <div
      className="app"
      lang="tr"
      data-theme={settings.theme || "rose"}
      style={{
        "--intro-image": `url(${invitation.introImage})`,
        "--hero-image": `url(${invitation.heroImage})`,
      }}
    >
      <audio
        key={invitation.musicFile}
        ref={audioRef}
        src={invitation.musicFile || ""}
        loop
        preload="auto"
        onPlay={() => setIsMusicPlaying(true)}
        onPause={() => setIsMusicPlaying(false)}
        onEnded={() => setIsMusicPlaying(false)}
      />
      <AppModal
        modal={appModal}
        onInputChange={(value) => setAppModal((prev) => (prev ? { ...prev, inputValue: value } : prev))}
        onConfirm={(value) => resolveAppModal(value)}
        onCancel={() => resolveAppModal(appModal?.type === "prompt" ? null : false)}
      />

      {isAdminPage ? (
        renderAdminPage()
      ) : !opened ? (
            <section className={`intro-page ${isOpening ? "opening" : ""}`}>
            <div className="petal-layer" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, index) => (
              <span key={index}></span>
            ))}
          </div>

          <div className="ribbon ribbon-left"></div>
          <div className="ribbon ribbon-right"></div>

          {/* ZARF KONTEYNERİ */}
          <div className="envelope-container">
            <div className="envelope-back"></div>

            {/* Davetiye Kartımız (Zarfın içinde) */}
            <div className="intro-card">
              <div className="leaf-mark" aria-hidden="true"></div>
              <p className="intro-small">{copy.introLabel}</p>

              <h1 className="couple-title">
                <span>{invitation.bride}</span>
                <em>&</em>
                <span>{invitation.groom}</span>
              </h1>

              <p className="intro-text">{copy.introText}</p>
              {guestGreeting && <p className="guest-greeting">{guestGreeting}</p>}
            </div>

            <div className="envelope-front"></div>
            <div className="envelope-flap"></div>

            <button className="envelope-seal" onClick={openInvitation}>
              {copy.openButton}
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="floating-actions">
            <a className="share-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
              Paylaş
            </a>

            <button
              type="button"
              className={`music-toggle-button ${isMusicPlaying ? "music-on" : "music-off"}`}
              onClick={toggleMusic}
              aria-pressed={isMusicPlaying}
              aria-label={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
              title={isMusicPlaying ? "Müziği Kapat" : "Müziği Aç"}
            >
              <svg viewBox="0 0 24 24" width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 9V15H8L13 19V5L8 9H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />

                {isMusicPlaying ? (
                  <>
                    <path d="M16 9C17 10 17 14 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18.5 7C21 10 21 14 18.5 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <path d="M17 9L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M21 9L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <main className="invitation-page">
            <section className="hero-section">
              <div className="hero-content">
                <p className="small-title">{copy.heroLabel}</p>

                <h1 className="couple-title">
                  <span>{invitation.bride}</span>
                  <em>&</em>
                  <span>{invitation.groom}</span>
                </h1>

                <p className="hero-date">{invitation.dateText}</p>
                <p className="hero-time">Saat {invitation.timeText}</p>
                {guestGreeting && <p className="hero-guest-greeting">{guestGreeting}</p>}
              </div>
            </section>

            <section className="countdown-section">
              <p className="section-label">{copy.countdownLabel}</p>
              <h2>{copy.countdownTitle}</h2>

              <div className="countdown-grid">
                <div className="count-box countdown-animated"><strong>{timeLeft.days}</strong><span>Gün</span></div>
                <div className="count-box countdown-animated"><strong>{timeLeft.hours}</strong><span>Saat</span></div>
                <div className="count-box countdown-animated"><strong>{timeLeft.minutes}</strong><span>Dakika</span></div>
                <div className="count-box countdown-animated"><strong>{timeLeft.seconds}</strong><span>Saniye</span></div>
              </div>
            </section>

            <section className="card invitation-card">
              <p className="section-label">{copy.invitationLabel}</p>
              <h2>{copy.invitationTitle}</h2>
              <p>{invitation.message}</p>
            </section>

            <section className="card family-card">
              <p className="section-label">{copy.familyLabel}</p>
              <h2>{copy.familyTitle}</h2>
              <p>{familyInfo.text}</p>

              <div className="family-grid">
                <div>
                  <span>{familyInfo.brideFamilyTitle}</span>
                  <strong>{familyInfo.brideFamilyName}</strong>
                </div>
                <div>
                  <span>{familyInfo.groomFamilyTitle}</span>
                  <strong>{familyInfo.groomFamilyName}</strong>
                </div>
              </div>
            </section>

            <section className="card ceremony-card">
              <p className="section-label">{copy.ceremonyLabel}</p>
              <h2>{copy.ceremonyTitle}</h2>

              <div className="ceremony-grid">
                {siteData.eventDetails.map((event, index) => (
                  <div className="ceremony-item" key={`${event.label}-${index}`}>
                    <span>{event.label}</span>
                    <strong>{event.time}</strong>
                    <p>{event.description}</p>
                    <em>{event.location}</em>
                  </div>
                ))}
              </div>
            </section>

            <section className="card schedule-card">
              <p className="section-label">{copy.scheduleLabel}</p>
              <h2>{invitation.dateText}</h2>

              <div className="schedule-list">
                {siteData.scheduleItems.map((item, index) => (
                  <div className="schedule-item" key={`${item.time}-${index}`}>
                    <strong>{item.time}</strong>
                    <div>
                      <span>{item.title}</span>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <p className="section-label">{copy.locationLabel}</p>
              <h2>{copy.locationTitle}</h2>

              <div className="info-list">
                <div className="info-row"><span>Tarih</span><strong>{invitation.dateText}</strong></div>
                <div className="info-row"><span>Saat</span><strong>{invitation.timeText}</strong></div>
                <div className="info-row"><span>Yer</span><strong>{invitation.venue}</strong></div>
                <div className="info-row"><span>Adres</span><strong>{invitation.address}</strong></div>
              </div>

              <div className="mini-map">
                <iframe
                  title="Düğün Konumu"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${invitation.venue} ${invitation.address}`)}&z=15&output=embed`}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="button-group">
                <a className="main-button" href={invitation.mapLink} target="_blank" rel="noreferrer">Konuma Git</a>
                <a className="secondary-button" href={googleCalendarLink} target="_blank" rel="noreferrer">Takvime Ekle</a>
              </div>
            </section>

            <section className="card">
              <p className="section-label">{copy.galleryLabel}</p>
              <h2>{copy.galleryTitle}</h2>

              <div className="gallery-grid">
                {invitation.gallery.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Galeri ${index + 1}`} loading="lazy" />
                ))}
              </div>
            </section>

            <section className="card rsvp-card">
              <p className="section-label">{copy.rsvpLabel}</p>
              <h2>{copy.rsvpTitle}</h2>
              <p>{copy.rsvpText}</p>

              <form className="rsvp-form" onSubmit={submitGuest}>
                <input name="name" value={guestForm.name} onChange={handleGuestChange} placeholder="Ad Soyad" />
                <input name="phone" type="tel" value={guestForm.phone} onChange={handleGuestChange} placeholder="Telefon Numaranız" maxLength="20" />

                <OptionGroup value={guestForm.attendance} options={ATTENDANCE_OPTIONS} onChange={updateAttendance} />
                <OptionGroup disabled={!isAttending} value={guestForm.personCount} options={PERSON_COUNT_OPTIONS} onChange={(personCount) => setGuestForm((prev) => ({ ...prev, personCount }))} />
                <OptionGroup disabled={!isAttending} value={guestForm.side} options={SIDE_OPTIONS} onChange={(side) => setGuestForm((prev) => ({ ...prev, side }))} />
                <OptionGroup disabled={!isAttending} value={guestForm.hasChild} options={CHILD_OPTIONS} onChange={(hasChild) => setGuestForm((prev) => ({ ...prev, hasChild }))} />

                <div className="field-with-counter">
                  <textarea name="note" value={guestForm.note} onChange={handleGuestChange} placeholder="Notunuz" maxLength={NOTE_MAX_LENGTH}></textarea>
                  <span>{guestForm.note.length}/{NOTE_MAX_LENGTH}</span>
                </div>

                <button type="submit" className="main-button form-button">Katılımı Gönder</button>
              </form>

              <a className="secondary-button whatsapp-button" href={`https://wa.me/${invitation.whatsappNumber}?text=${rsvpWhatsappText}`} target="_blank" rel="noreferrer">
                WhatsApp ile Bildir
              </a>
            </section>

            <section className="card">
              <p className="section-label">{copy.guestsLabel}</p>
              <h2>{copy.guestsTitle}</h2>

              <div className="guest-stats">
                <div><strong>{guests.length}</strong><span>Toplam Yanıt</span></div>
                <div><strong>{totalPersonCount}</strong><span>Katılacak Kişi</span></div>
                <div><strong>{notAttendingCount}</strong><span>Katılamayacak</span></div>
              </div>

              <div className="guest-list">
                {guests.length === 0 ? (
                  <p className="empty-text">Henüz katılım bildirimi yok.</p>
                ) : (
                  guests.slice(0, 6).map((guest) => (
                    <div className="guest-item" key={guest.id}>
                      <div>
                        <strong>{guest.name}</strong>
                        <span>{guest.side} · {guest.personCount} kişi · Çocuk: {guest.hasChild || "Hayır"}</span>
                        {guest.phone && <small>{guest.phone}</small>}
                      </div>
                      <em>{guest.attendance}</em>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card">
              <p className="section-label">{copy.wishesLabel}</p>
              <h2>{copy.wishesTitle}</h2>

              <form className="wish-form" onSubmit={submitWish}>
                <input name="name" value={wishForm.name} onChange={handleWishChange} placeholder="Ad Soyad" />

                <div className="field-with-counter">
                  <textarea name="message" value={wishForm.message} onChange={handleWishChange} placeholder="Mesajınız" maxLength={WISH_MAX_LENGTH}></textarea>
                  <span>{wishForm.message.length}/{WISH_MAX_LENGTH}</span>
                </div>

                <button type="submit" className="main-button form-button">Mesajı Gönder</button>
              </form>

              <div className="wish-list">
                {approvedWishes.length === 0 ? (
                  <p className="empty-text">Henüz güzel dilek yok.</p>
                ) : (
                  approvedWishes.slice(0, 4).map((wish) => (
                    <div className="wish-item" key={wish.id}>
                      <p>“{wish.message}”</p>
                      <strong>{wish.name}</strong>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card">
              <p className="section-label">{copy.shareLabel}</p>
              <h2>{copy.shareTitle}</h2>
              <p>{copy.shareDescription}</p>

              <div className="qr-public-card">
                <img src={qrImageUrl} alt="Davetiye QR kodu" loading="lazy" />
                <span>QR kod ile hızlıca paylaşabilirsiniz.</span>
              </div>

              <div className="button-group">
                <a className="main-button" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">WhatsApp ile Paylaş</a>
                <button className="secondary-button" onClick={copyInvitationLink}>Linki Kopyala</button>
              </div>
            </section>

            <footer className="footer">
              <p>{coupleName}</p>
              <span>{invitation.dateText}</span>
              <small>{copy.thanksText}</small>
              <small>{copy.footerSmall}</small>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
