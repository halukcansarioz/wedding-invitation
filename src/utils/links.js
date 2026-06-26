import { getCurrentShareLink } from "../constants/siteData";

export const createGoogleCalendarLink = (siteData, coupleName) => {
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

export const formatMessageTemplate = (template, values) => {
  return String(template || "")
    .replaceAll("{couple}", values.couple || "")
    .replaceAll("{link}", values.link || "")
    .replaceAll("{guest}", values.guest || "");
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

export const getQrImageUrl = (link) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(link)}`;

export const isAdminRouteActive = () => {
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

export const getAdminRedirectUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${window.location.pathname}?admin=1&reset=1`;
};
