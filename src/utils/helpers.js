import {
  THEME_FAVICON_COLORS,
  DEFAULT_SHARE_LINK,
  DEFAULT_WEDDING_MUSIC_FILE,
  DEFAULT_WEDDING_MUSIC_NAME,
  DEFAULT_SITE_DATA,
  MAX_IMAGE_DIMENSION,
  IMAGE_QUALITY,
  MAX_AUDIO_FILE_SIZE,
  SITE_DATA_KEY,
  DEFAULT_ADMIN_PASSWORD,
  ADMIN_PASSWORD_KEY,
  ADMIN_SESSION_LAST_ACTIVE_KEY,
  ADMIN_SESSION_TIMEOUT_MS
} from "../config/constants";

export const getFaviconUrl = (theme) => {
  const colors = THEME_FAVICON_COLORS[theme] || THEME_FAVICON_COLORS.rose;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="17" fill="${colors.bg}"/><circle cx="32" cy="32" r="21" fill="${colors.circle}" opacity="0.72"/><g fill="${colors.petal}" stroke="${colors.stroke}" stroke-width="2" stroke-linejoin="round"><path d="M32 31c-7-9-15-10-18-5-3 6 2 12 13 11-7 9-5 17 1 19 7 1 11-5 8-16 10 5 18 2 18-5 0-6-7-9-17-4 7-9 6-17 0-19-6-1-10 6-5 19Z"/></g><circle cx="32" cy="32" r="6" fill="${colors.center}" stroke="${colors.stroke}" stroke-width="2"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
};

export const getCurrentShareLink = () => DEFAULT_SHARE_LINK;

export const fixShareLink = (data) => {
  if (!data?.invitation) return data;
  const currentLink = String(data.invitation.shareLink || "").trim();
  const isLocalhostLink = currentLink.includes("localhost") || currentLink.includes("127.0.0.1") || currentLink === "";
  return { ...data, invitation: { ...data.invitation, shareLink: isLocalhostLink ? DEFAULT_SHARE_LINK : currentLink } };
};

export const applyDefaultWeddingMusic = (data) => {
  if (!data?.invitation) return data;
  return { ...data, invitation: { ...data.invitation, musicFile: DEFAULT_WEDDING_MUSIC_FILE, musicName: DEFAULT_WEDDING_MUSIC_NAME } };
};

export const mergeSiteData = (storedData) => {
  const stored = storedData && typeof storedData === "object" ? storedData : {};
  return {
    invitation: { ...DEFAULT_SITE_DATA.invitation, ...(stored.invitation || {}), gallery: Array.isArray(stored.invitation?.gallery) ? stored.invitation.gallery : DEFAULT_SITE_DATA.invitation.gallery },
    familyInfo: { ...DEFAULT_SITE_DATA.familyInfo, ...(stored.familyInfo || {}) },
    copy: { ...DEFAULT_SITE_DATA.copy, ...(stored.copy || {}) },
    eventDetails: Array.isArray(stored.eventDetails) && stored.eventDetails.length > 0 ? stored.eventDetails : DEFAULT_SITE_DATA.eventDetails,
    scheduleItems: Array.isArray(stored.scheduleItems) && stored.scheduleItems.length > 0 ? stored.scheduleItems : DEFAULT_SITE_DATA.scheduleItems,
    settings: { ...DEFAULT_SITE_DATA.settings, ...(stored.settings || {}), visibility: { ...(DEFAULT_SITE_DATA.settings.visibility || {}), ...(stored.settings?.visibility || {}) } },
    messages: { ...DEFAULT_SITE_DATA.messages, ...(stored.messages || {}) },
  };
};

export const normalizeSiteData = (data) => applyDefaultWeddingMusic(fixShareLink(mergeSiteData(data)));

export const loadStoredList = (key) => {
  try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
};

export const loadStoredSiteData = () => {
  try { return normalizeSiteData(JSON.parse(localStorage.getItem(SITE_DATA_KEY))); } catch { return normalizeSiteData(null); }
};

export const getStoredAdminPassword = () => {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
};

export const createGoogleCalendarLink = (siteData, coupleName) => {
  const start = new Date(siteData.invitation.weddingDate);
  if (Number.isNaN(start.getTime())) return "#";
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");
  const title = encodeURIComponent(`${coupleName} Düğünü`);
  const details = encodeURIComponent(siteData.invitation.message);
  const location = encodeURIComponent(`${siteData.invitation.venue}, ${siteData.invitation.address}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(start)}/${formatDate(end)}&details=${details}&location=${location}`;
};

export const downloadIcsCalendar = (invitation) => {
  const start = new Date(invitation.weddingDate);
  if (Number.isNaN(start.getTime())) return;
  
  // Düğün süresini ortalama 4 saat olarak hesaplıyoruz
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);

  const formatDate = (date) => date.toISOString().replace(/-|:|\.\d+/g, "");
  const now = formatDate(new Date());
  const dtStart = formatDate(start);
  const dtEnd = formatDate(end);

  const coupleName = `${invitation.bride} & ${invitation.groom}`;
  const title = `${coupleName} Düğünü`;
  const description = invitation.message || "";
  const location = `${invitation.venue}, ${invitation.address}`;

  // Standart iCalendar (.ics) formatı
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Biz Evleniyoruz//Dugun Davetiyesi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${invitation.bride}_${invitation.groom}_Dugun.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const handleAddToCalendar = (invitation, googleCalendarLink) => {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
  // Apple cihazlarını (iPhone, iPad, iPod, macOS) tespit ediyoruz
  const isApple = /iPad|iPhone|iPod|Macintosh|Mac OS X/i.test(userAgent);

  if (isApple) {
    // Apple cihazıysa iCalendar (.ics) indirir ve Apple Takvim açılır
    downloadIcsCalendar(invitation);
  } else {
    // Android veya PC ise Google Takvim linkini yeni sekmede açar
    window.open(googleCalendarLink, "_blank", "noopener,noreferrer");
  }
};

export const readImageFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("image/")) { reject(new Error("Lütfen geçerli bir görsel dosyası seçin.")); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const originalDataUrl = reader.result;
      if (file.type === "image/svg+xml") { resolve(originalDataUrl); return; }
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(1, MAX_IMAGE_DIMENSION / image.naturalWidth, MAX_IMAGE_DIMENSION / image.naturalHeight);
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

export const readAudioFileAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith("audio/")) { reject(new Error("Lütfen geçerli bir müzik dosyası seçin.")); return; }
    if (file.size > MAX_AUDIO_FILE_SIZE) { reject(new Error("Müzik dosyası çok büyük. Lütfen 4 MB altında bir MP3/M4A dosyası seçin.")); return; }
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result, name: file.name || "Yüklenen müzik" });
    reader.onerror = () => reject(new Error("Müzik dosyası okunamadı."));
    reader.readAsDataURL(file);
  });
};

export const formatMessageTemplate = (template, values) => {
  return String(template || "").replaceAll("{couple}", values.couple || "").replaceAll("{link}", values.link || "").replaceAll("{guest}", values.guest || "");
};

export const normalizeText = (value) => String(value || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const downloadTextFile = (filename, content, mimeType = "text/plain;charset=utf-8") => {
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

export const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
export const createCsv = (headers, rows) => {
  const lines = [headers.map(csvEscape).join(";")];
  rows.forEach((row) => lines.push(headers.map((header) => csvEscape(row[header])).join(";")));
  return `\ufeff${lines.join("\n")}`;
};

export const excelEscape = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export const createExcelTable = (title, headers, rows) => {
  const headerCells = headers.map((header) => `<th>${excelEscape(header)}</th>`).join("");
  const bodyRows = rows.map((row) => `<tr>${headers.map((header) => `<td>${excelEscape(row[header])}</td>`).join("")}</tr>`).join("");
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8" /><style>table { border-collapse: collapse; font-family: Arial, sans-serif; } th { background: #f3d7df; font-weight: 700; } th, td { border: 1px solid #9f4f68; padding: 8px 10px; }</style></head><body><h2>${excelEscape(title)}</h2><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
};

export const getGuestNameFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("guest") || params.get("davetli") || "";
};

export const buildPersonalLink = (baseLink, guestName) => {
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

export const getQrImageUrl = (link) => `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(link)}`;

export const isAdminRouteActive = () => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash || "";
  return hash === "#admin" || params.get("admin") === "1" || params.get("type") === "recovery" || hash.includes("type=recovery") || hash.includes("access_token=");
};

export const getAdminRedirectUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}?admin=1&reset=1`;
};

export const touchAdminSession = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_LAST_ACTIVE_KEY, String(Date.now()));
};

export const clearAdminSessionTimestamp = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_LAST_ACTIVE_KEY);
};

export const isAdminSessionFresh = () => {
  if (typeof window === "undefined") return false;
  const lastActive = Number(localStorage.getItem(ADMIN_SESSION_LAST_ACTIVE_KEY) || 0);
  if (!lastActive) return false;
  return Date.now() - lastActive < ADMIN_SESSION_TIMEOUT_MS;
};

export const dbGuestToUi = (guest) => ({
  id: guest.id, name: guest.name || "", phone: guest.phone || "", attendance: guest.attendance || "Katılacağım",
  personCount: String(guest.person_count ?? guest.personCount ?? "1"), side: guest.side || "Gelin Tarafı",
  hasChild: guest.has_child ?? guest.hasChild ?? "Hayır", note: guest.note || "", createdAt: guest.created_at || guest.createdAt || "",
});

export const uiGuestToDb = (guest) => ({
  name: guest.name || "", phone: guest.phone || "", attendance: guest.attendance || "Katılacağım",
  person_count: String(guest.personCount ?? guest.person_count ?? "1"), side: guest.side || "Gelin Tarafı",
  has_child: guest.hasChild ?? guest.has_child ?? "Hayır", note: guest.note || "",
});

export const dbWishToUi = (wish) => ({
  id: wish.id, name: wish.name || "", message: wish.message || "", approved: wish.approved !== false, createdAt: wish.created_at || wish.createdAt || "",
});

export const uiWishToDb = (wish) => ({
  name: wish.name || "", message: wish.message || "", approved: wish.approved !== false,
});