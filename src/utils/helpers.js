import { DEFAULT_SITE_DATA, SITE_DATA_KEY, THEME_FAVICON_COLORS } from "../config/constants";

export const getFaviconUrl = (theme = "lavanta") => {
  const colors = THEME_FAVICON_COLORS[theme] || THEME_FAVICON_COLORS.lavanta;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="${colors.bg}"/>
    <circle cx="32" cy="32" r="22" fill="${colors.circle}"/>
    <circle cx="32" cy="20" r="10" fill="${colors.petal}" stroke="${colors.stroke}" stroke-width="1.5"/>
    <circle cx="44" cy="32" r="10" fill="${colors.petal}" stroke="${colors.stroke}" stroke-width="1.5"/>
    <circle cx="32" cy="44" r="10" fill="${colors.petal}" stroke="${colors.stroke}" stroke-width="1.5"/>
    <circle cx="20" cy="32" r="10" fill="${colors.petal}" stroke="${colors.stroke}" stroke-width="1.5"/>
    <circle cx="32" cy="32" r="8" fill="${colors.center}" stroke="${colors.stroke}" stroke-width="1.5"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const normalizeSiteData = (raw) => {
  if (!raw) return DEFAULT_SITE_DATA;
  return {
    ...DEFAULT_SITE_DATA,
    ...raw,
    invitation: { ...DEFAULT_SITE_DATA.invitation, ...(raw.invitation || {}) },
    familyInfo: { ...DEFAULT_SITE_DATA.familyInfo, ...(raw.familyInfo || {}) },
    giftRegistry: { ...DEFAULT_SITE_DATA.giftRegistry, ...(raw.giftRegistry || {}) },
    copy: { ...DEFAULT_SITE_DATA.copy, ...(raw.copy || {}) },
    settings: {
      ...DEFAULT_SITE_DATA.settings,
      ...(raw.settings || {}),
      visibility: {
        ...DEFAULT_SITE_DATA.settings.visibility,
        ...(raw.settings?.visibility || {}),
      },
    },
    messages: { ...DEFAULT_SITE_DATA.messages, ...(raw.messages || {}) },
    eventDetails: Array.isArray(raw.eventDetails) && raw.eventDetails.length > 0 ? raw.eventDetails : DEFAULT_SITE_DATA.eventDetails,
    scheduleItems: Array.isArray(raw.scheduleItems) && raw.scheduleItems.length > 0 ? raw.scheduleItems : DEFAULT_SITE_DATA.scheduleItems,
    storyTimeline: Array.isArray(raw.storyTimeline) && raw.storyTimeline.length > 0 ? raw.storyTimeline : DEFAULT_SITE_DATA.storyTimeline,
  };
};

export const loadStoredSiteData = () => {
  if (typeof window === "undefined") return DEFAULT_SITE_DATA;
  try {
    const local = localStorage.getItem(SITE_DATA_KEY);
    return local ? normalizeSiteData(JSON.parse(local)) : DEFAULT_SITE_DATA;
  } catch {
    return DEFAULT_SITE_DATA;
  }
};

export const getCurrentShareLink = () => {
  if (typeof window === "undefined") return DEFAULT_SITE_DATA.invitation.shareLink;
  return `${window.location.origin}${window.location.pathname}`;
};

export const getGuestNameFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (params.get("guest") || params.get("davetli") || "").trim();
};

export const getTableFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return (params.get("table") || params.get("masa") || "").trim();
};

export const buildPersonalLink = (baseLink, guestName, tableNumber = "") => {
  const cleanLink = (baseLink || "").split("?")[0].replace(/\/$/, "");
  const nameParam = encodeURIComponent((guestName || "").trim());
  let url = `${cleanLink}/?guest=${nameParam}`;
  if (tableNumber) {
    url += `&table=${encodeURIComponent(String(tableNumber).trim())}`;
  }
  return url;
};

export const getQrImageUrl = (url) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url || "")}`;
};

export const formatMessageTemplate = (template, variables = {}) => {
  let str = template || "";
  Object.keys(variables).forEach((key) => {
    str = str.replaceAll(`{${key}}`, variables[key] || "");
  });
  return str;
};

export const createGoogleCalendarLink = (siteData, coupleName) => {
  const inv = siteData.invitation;
  const start = (inv.weddingDate || "2027-07-07T19:00:00").replace(/[-:]/g, "").split(".")[0];
  const end = (inv.weddingDate || "2027-07-07T19:00:00").replace(/[-:]/g, "").split(".")[0];
  const title = encodeURIComponent(`${coupleName} | Düğün`);
  const details = encodeURIComponent(inv.message || "");
  const location = encodeURIComponent(`${inv.venue}, ${inv.address}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
};

export const handleAddToCalendar = (invitation, googleLink) => {
  if (googleLink) {
    window.open(googleLink, "_blank", "noopener,noreferrer");
  }
};

export const getNavigationLinks = (invitation) => {
  const query = encodeURIComponent(`${invitation?.venue || ""} ${invitation?.address || ""}`);
  return {
    google: invitation?.mapLink || `https://www.google.com/maps/search/?api=1&query=${query}`,
    apple: `https://maps.apple.com/?q=${query}`,
    yandex: `https://yandex.com.tr/harita/?text=${query}`,
    waze: `https://waze.com/ul?q=${query}&navigate=yes`,
  };
};

export const normalizeText = (text = "") => {
  return text.toLocaleLowerCase("tr-TR").trim();
};

export const downloadTextFile = (filename, content, mimeType = "text/plain") => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const createCsv = (items, type = "guests", isEn = false) => {
  if (!items || items.length === 0) return "";
  let headers = [];
  let rows = [];

  if (type === "guests") {
    headers = isEn 
      ? ["Name", "Attendance", "Phone", "Person Count", "Side", "With Children", "Song Request", "Note"]
      : ["Ad Soyad", "Katılım", "Telefon", "Kişi Sayısı", "Taraf", "Çocuk", "Müzik İsteği", "Not"];
    rows = items.map(g => [
      `"${g.name || ""}"`,
      `"${g.attendance || ""}"`,
      `"${g.phone || ""}"`,
      `"${g.personCount || 1}"`,
      `"${g.side || ""}"`,
      `"${g.hasChild || ""}"`,
      `"${g.songRequest || ""}"`,
      `"${(g.note || "").replace(/"/g, '""')}"`
    ]);
  } else {
    headers = isEn ? ["Name", "Message", "Status"] : ["Ad Soyad", "Mesaj", "Durum"];
    rows = items.map(w => [
      `"${w.name || ""}"`,
      `"${(w.message || "").replace(/"/g, '""')}"`,
      `"${w.approved ? (isEn ? "Published" : "Yayında") : (isEn ? "Pending" : "Onay Bekliyor")}"`
    ]);
  }

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
};

export const createExcelTable = (items, type = "guests", isEn = false) => {
  const csvContent = createCsv(items, type, isEn);
  const rows = csvContent.split("\n").map(r => r.split(","));
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body><table border="1">`;
  rows.forEach((row, i) => {
    html += "<tr>";
    row.forEach(cell => {
      const clean = cell.replace(/^"|"$/g, "");
      html += i === 0 ? `<th style="background:#f4f4f4;">${clean}</th>` : `<td>${clean}</td>`;
    });
    html += "</tr>";
  });
  html += "</table></body></html>";
  return html;
};

export const uiGuestToDb = (g) => ({
  name: g.name,
  attendance: g.attendance,
  phone: g.phone || null,
  person_count: g.personCount ? Number(g.personCount) : 1,
  side: g.side || "Gelin Tarafı",
  has_child: g.hasChild || "Hayır",
  song_request: g.songRequest || null,
  note: g.note || null,
});

export const dbGuestToUi = (g) => ({
  id: g.id,
  name: g.name,
  attendance: g.attendance,
  phone: g.phone || "",
  personCount: String(g.person_count || 1),
  side: g.side || "Gelin Tarafı",
  hasChild: g.has_child || "Hayır",
  songRequest: g.song_request || "",
  note: g.note || "",
  createdAt: g.created_at,
});

export const uiWishToDb = (w) => ({
  name: w.name,
  message: w.message,
  approved: w.approved ?? true,
});

export const dbWishToUi = (w) => ({
  id: w.id,
  name: w.name,
  message: w.message,
  approved: w.approved,
  createdAt: w.created_at,
});

export const touchAdminSession = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wedding-admin-last-active", String(Date.now()));
  }
};

export const clearAdminSessionTimestamp = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wedding-admin-last-active");
  }
};

export const isAdminSessionFresh = () => {
  if (typeof window === "undefined") return false;
  const lastActive = localStorage.getItem("wedding-admin-last-active");
  if (!lastActive) return false;
  return Date.now() - Number(lastActive) < 30 * 60 * 1000;
};

export const getAdminRedirectUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/admin`;
};

/**
 * Harici paket gerektirmeyen saf JS / Canvas Gül Yaprağı & Konfeti Efekti
 */
export const triggerConfetti = () => {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // 1. Sitede o an seçili olan aktif temayı 'html' etiketinden alıyoruz
  const activeTheme = document.documentElement.dataset.theme || "lavanta";
  
  // 2. Constants dosyasındaki ilgili temanın renk paletini buluyoruz
  const themeColors = THEME_FAVICON_COLORS[activeTheme] || THEME_FAVICON_COLORS.lavanta;
  
  // 3. Kendi özel renkleriniz yerine, aktif temanın renklerini diziye atıyoruz
  const colors = [
    themeColors.petal, 
    themeColors.stroke, 
    themeColors.circle, 
    themeColors.center, 
    themeColors.bg
  ];

  const particles = Array.from({ length: 65 }).map(() => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 80,
    y: canvas.height / 2 + (Math.random() - 0.5) * 80,
    vx: (Math.random() - 0.5) * 16,
    vy: (Math.random() - 1.2) * 14 - 3,
    size: Math.random() * 10 + 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    opacity: 1,
    isPetal: Math.random() > 0.4
  }));

  let animationFrame;
  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Yerçekimi
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.009;

      if (p.opacity > 0) {
        activeParticles++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;

        if (p.isPetal) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.6, Math.PI / 4, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  render();
};