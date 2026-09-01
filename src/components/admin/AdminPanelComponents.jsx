import React from "react";
import { useTranslation } from "react-i18next";
import { 
  GeneralTab, ThemeTab, GalleryTab, GuestsAdminPanel, WishesAdminPanel, PersonalLinkPanel,
  VisibilityTab, SecurityTab, MessagesTab, CopyTab, FamilyTab, CeremonyTab, ScheduleTab, 
  QrTab, DataTab, GiftTab, StoryTab
} from "./tabs";

export function AdminPanelContent(props) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en") || false;
  const { activeAdminTab } = props;

  switch (activeAdminTab) {
    case "general": return <GeneralTab {...props} isEn={isEn} />;
    case "theme": return <ThemeTab {...props} isEn={isEn} />;
    case "gallery": return <GalleryTab {...props} isEn={isEn} />;
    case "guests": return <GuestsAdminPanel {...props} />;
    case "wishes": return <WishesAdminPanel {...props} isEn={isEn} />;
    case "personalLink": return <PersonalLinkPanel {...props} />;
    case "visibility": return <VisibilityTab {...props} isEn={isEn} />;
    case "security": return <SecurityTab {...props} isEn={isEn} />;
    case "messages": return <MessagesTab {...props} isEn={isEn} />;
    case "copy": return <CopyTab {...props} isEn={isEn} />;
    case "family": return <FamilyTab {...props} isEn={isEn} />;
    case "ceremony": return <CeremonyTab {...props} isEn={isEn} />;
    case "schedule": return <ScheduleTab {...props} isEn={isEn} />;
    case "qr": return <QrTab {...props} isEn={isEn} />;
    case "data": return <DataTab {...props} isEn={isEn} />;
    case "gift": return <GiftTab {...props} isEn={isEn} />;
    case "story": return <StoryTab {...props} isEn={isEn} />; 
    default: return null;
  }
}