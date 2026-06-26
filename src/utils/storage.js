import { DEFAULT_ADMIN_PASSWORD, ADMIN_PASSWORD_KEY, SITE_DATA_KEY, DEFAULT_SITE_DATA } from "../constants/siteData";

export const mergeSiteData = (storedData) => {
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

export const loadStoredList = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

export const loadStoredSiteData = () => {
  try {
    return mergeSiteData(JSON.parse(localStorage.getItem(SITE_DATA_KEY)));
  } catch {
    return mergeSiteData(null);
  }
};

export const getStoredAdminPassword = () => {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;

  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
};
